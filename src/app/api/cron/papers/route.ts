import { NextResponse } from 'next/server'
import axios from 'axios'
import { parseString } from 'xml2js'
import { promisify } from 'util'
import { subDays, startOfDay, endOfDay } from 'date-fns'
import { prisma } from '@/lib/prisma'

export const maxDuration = 60
const parseXmlString = promisify(parseString)

interface ArxivResponse {
  feed: {
    entry?: {
      id: string[];
      title: string[];
      summary: string[];
      author: { name: string[] }[];
      published: string[];
      category: { $: { term: string } }[];
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
        categories: entry.category.map((cat: any) => cat.$.term)
      })
    }

    let responseObj;

    try {
      const results = [];
      
      for (const paper of papersToCreate) {
        try {
          results.push(await prisma.paper.create({
            data: paper
          }));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
          if (e.code === 'P2002') {
            console.log(`Paper already exists: ${paper.arxivId}`);
          } else {
            console.error(`Error creating paper: ${paper.arxivId}`, e);
          }
        }
      }

      responseObj = {
        success: true,
        message: `Processed ${results.length} papers (${papersToCreate.length} total)`
      };
    } catch (error) {
      console.error('Database transaction error:', error)
      responseObj = { 
        error: 'Database transaction failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      await prisma.$disconnect();
    }

    return NextResponse.json(responseObj, 
      responseObj.error ? { status: 500 } : { status: 200 }
    );
  } catch (error) {
    console.error('Error processing papers:', error)
    
    await prisma.$disconnect();
    
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 