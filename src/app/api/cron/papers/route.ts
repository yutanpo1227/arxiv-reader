import { NextResponse } from 'next/server'
import axios from 'axios'
import { parseString } from 'xml2js'
import { promisify } from 'util'
import { PrismaClient } from '@prisma/client'
import { subDays, startOfDay, endOfDay } from 'date-fns'

const parseXmlString = promisify(parseString)
const prisma = new PrismaClient()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function safeGetJournalRef(entry: any): string | null {
  try {
    const ref = entry['arxiv:journal_ref']
    
    if (!ref || ref.length === 0) {
      return null
    }
    
    if (typeof ref[0] === 'string') {
      return ref[0]
    }
    
    console.log('Journal ref is not a string:', JSON.stringify(ref))
    return null
  } catch (error) {
    console.error('Error extracting journal ref:', error)
    return null
  }
}

interface ArxivResponse {
  feed: {
    entry?: {
      id: string[];
      title: string[];
      summary: string[];
      author: { name: string[] }[];
      published: string[];
      category: { $: { term: string } }[];
      'arxiv:journal_ref'?: string[];
    }[]
  }
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const yesterday = subDays(new Date(), 1)
    const start = startOfDay(yesterday)
    const end = endOfDay(yesterday)

    const formatDateForArxiv = (date: Date) => {
      const year = date.getUTCFullYear()
      const month = String(date.getUTCMonth() + 1).padStart(2, '0')
      const day = String(date.getUTCDate()).padStart(2, '0')
      const hour = String(date.getUTCHours()).padStart(2, '0')
      const minute = String(date.getUTCMinutes()).padStart(2, '0')
      return `${year}${month}${day}${hour}${minute}`
    }

    const query = `cat:cs.AI AND submittedDate:[${formatDateForArxiv(start)} TO ${formatDateForArxiv(end)}]`
    const response = await axios.get(`http://export.arxiv.org/api/query`, {
      params: {
        search_query: query,
        start: 0,
        max_results: 200,
        sortBy: "submittedDate",
        sortOrder: "descending",
      },
    });

    const result = await parseXmlString(response.data) as ArxivResponse
    const entries = result.feed.entry || []

    if (entries.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No papers found"
      })
    }

    const papersToCreate = []
    
    for (const entry of entries) {
      papersToCreate.push({
        arxivId: entry.id[0].split('/').pop()!,
        title: entry.title[0],
        titleJa: '',
        abstract: entry.summary[0],
        abstractJa: '',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        authors: entry.author.map((author: any) => author.name[0]),
        publishedAt: new Date(entry.published[0]),
        pdfUrl: entry.id[0].replace('abs', 'pdf'),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        categories: entry.category.map((cat: any) => cat.$.term),
        journalRef: safeGetJournalRef(entry)
      })
    }

    try {
      await prisma.$transaction(
        papersToCreate.map(paper => 
          prisma.paper.create({
            data: paper
          })
        )
      )

      return NextResponse.json({
        success: true,
        message: `Processed ${papersToCreate.length} papers`
      })
    } catch (error) {
      console.error('Database transaction error:', error)
      return NextResponse.json({ 
        error: 'Database transaction failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error processing papers:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 