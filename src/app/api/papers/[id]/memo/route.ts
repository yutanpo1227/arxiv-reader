import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { memo } = await req.json()
    const paper = await prisma.paper.update({
      where: { id: (await params).id },
      data: { memo }
    })
    return NextResponse.json(paper)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Failed to update memo' },
      { status: 500 }
    )
  }
} 