import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { state } = await req.json()
    const paper = await prisma.paper.update({
      where: { id: (await params).id },
      data: { favorite: state }
    })
    return NextResponse.json(paper)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Failed to update favorite state' },
      { status: 500 }
    )
  }
} 