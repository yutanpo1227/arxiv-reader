import { NextResponse } from "next/server";
import { translateText } from "@/lib/translate";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { record, type } = await req.json();

    if (type !== "INSERT") {
      return NextResponse.json({ message: "Ignored non-insert event" });
    }
    try {
      const [titleJa, abstractJa] = await Promise.all([
        translateText(record.title),
        translateText(record.abstract),
      ]);
      await prisma.paper.update({
        where: { id: record.id },
        data: {
          titleJa: titleJa,
          abstractJa: abstractJa,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Translation completed",
      });
    } catch (error) {
      console.error("Translation error:", error);
      return NextResponse.json(
        { error: "Translation failed" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
