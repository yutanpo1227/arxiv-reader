import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const papers = await prisma.paper.findMany({
      orderBy: {
        publishedAt: 'desc'
      }
    })
    return NextResponse.json(papers)
  } catch (error) {
    console.error('Failed to fetch papers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch papers' },
      { status: 500 }
    )
  }
} 