import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { isRead } = await req.json()
    const paper = await prisma.paper.update({
      where: { id: (await params).id },
      data: { isRead }
    })
    return NextResponse.json(paper)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update read state' },
      { status: 500 }
    )
  }
} 