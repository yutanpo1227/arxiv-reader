export interface Paper {
    id: string
    arxivId: string
    title: string
    titleJa?: string | null
    abstract: string
    abstractJa?: string | null
    authors: string[]
    publishedAt: Date
    pdfUrl: string
    categories: string[]
    journalRef?: string | null
    createdAt: Date
    updatedAt: Date
    favorite: boolean
    memo?: string | null
    isRead: boolean
} 