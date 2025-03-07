-- CreateTable
CREATE TABLE "Paper" (
    "id" TEXT NOT NULL,
    "arxivId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleJa" TEXT,
    "abstract" TEXT NOT NULL,
    "abstractJa" TEXT,
    "authors" TEXT[],
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "pdfUrl" TEXT NOT NULL,
    "categories" TEXT[],
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "memo" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Paper_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Paper_arxivId_key" ON "Paper"("arxivId");
