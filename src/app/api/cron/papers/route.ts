import { NextResponse } from 'next/server'
import axios from 'axios'
import { parseString } from 'xml2js'
import { promisify } from 'util'
import { PrismaClient } from '@prisma/client'
import { subDays, startOfDay, endOfDay } from 'date-fns'

const parseXmlString = promisify(parseString)
const prisma = new PrismaClient()

// Azure Translator APIの設定
const AZURE_TRANSLATOR_ENDPOINT = process.env.AZURE_TRANSLATOR_ENDPOINT
const AZURE_TRANSLATOR_KEY = process.env.AZURE_TRANSLATOR_KEY
const AZURE_TRANSLATOR_REGION = process.env.AZURE_TRANSLATOR_REGION

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

async function translateText(text: string): Promise<string> {
  try {
    const response = await axios.post(
      `${AZURE_TRANSLATOR_ENDPOINT}/translate`,
      [{
        text: text
      }],
      {
        params: {
          'api-version': '3.0',
          'from': 'en',
          'to': 'ja'
        },
        headers: {
          'Ocp-Apim-Subscription-Key': AZURE_TRANSLATOR_KEY,
          'Ocp-Apim-Subscription-Region': AZURE_TRANSLATOR_REGION,
          'Content-Type': 'application/json'
        }
      }
    )
    return response.data[0].translations[0].text
  } catch (error) {
    console.error('Translation error:', error)
    throw error
  }
}

export async function GET(req: Request) {
  try {
    // 認証チェック
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 前日の日付範囲を取得
    const yesterday = subDays(new Date(), 1)
    const start = startOfDay(yesterday)
    const end = endOfDay(yesterday)

    // ArxivのAPIクエリを構築
    const query = `submittedDate:[${start.toISOString()} TO ${end.toISOString()}]`
    const response = await axios.get(`http://export.arxiv.org/api/query`, {
      params: {
        search_query: query,
        start: 0,
        max_results: 100,
        sortBy: 'submittedDate',
        sortOrder: 'descending'
      }
    })

    const result = await parseXmlString(response.data) as ArxivResponse
    const entries = result.feed.entry || []

    // 各論文を処理
    for (const entry of entries) {
      const titleJa = await translateText(entry.title[0])
      const abstractJa = await translateText(entry.summary[0])

      await prisma.paper.create({
        data: {
          arxivId: entry.id[0].split('/').pop(),
          title: entry.title[0],
          titleJa,
          abstract: entry.summary[0],
          abstractJa,
          authors: entry.author.map((author: any) => author.name[0]),
          publishedAt: new Date(entry.published[0]),
          pdfUrl: entry.id[0].replace('abs', 'pdf'),
          categories: entry.category.map((cat: any) => cat.$.term),
          journalRef: entry['arxiv:journal_ref']?.[0] || null
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${entries.length} papers`
    })
  } catch (error) {
    console.error('Error processing papers:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 