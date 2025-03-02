"use client"

import type React from "react"

import { useState, useRef } from "react"
import type { Paper } from "@/types/paper"
import { formatDate } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface PaperCardProps {
  paper: Paper
}

export default function PaperCard({ paper }: PaperCardProps) {
  const [isJapanese, setIsJapanese] = useState(true)
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const [showLanguageIndicator, setShowLanguageIndicator] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    })
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return

    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    }

    const deltaX = touchStart.x - touchEnd.x
    const deltaY = touchStart.y - touchEnd.y

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 80) {
      setIsJapanese((prev) => !prev)
      setShowLanguageIndicator(true)
      setTimeout(() => setShowLanguageIndicator(false), 1000)
    }

    setTouchStart(null)
  }

  return (
    <div className="w-full max-w-3xl h-full flex flex-col bg-white dark:bg-zinc-900">
      <div
        className="flex-1 overflow-y-auto overscroll-none scrollbar-hide"
        ref={contentRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          WebkitOverflowScrolling: 'touch',
          scrollBehavior: 'smooth'
        }}
      >
        <div className="w-full p-6 pb-32">
          {/* 言語切り替えインジケータ */}
          <AnimatePresence>
            {showLanguageIndicator && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-zinc-100 dark:bg-zinc-800 shadow-lg backdrop-blur-sm px-4 py-2 rounded-lg z-50 text-sm font-medium"
              >
                {isJapanese ? "日本語" : "English"}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ヘッダー */}
          <motion.div
            key={`title-${isJapanese}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8 mt-4"
          >
            <h1 className="text-3xl font-semibold tracking-tight mb-4 leading-tight">
              {isJapanese && paper.titleJa ? paper.titleJa : paper.title}
            </h1>
            <div className="flex flex-wrap gap-2 mb-4">
              {paper.categories.map((category, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs font-medium rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                >
                  {category}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <time dateTime={paper.publishedAt.toISOString()}>{formatDate(paper.publishedAt)}</time>
              <span>·</span>
              <p className="line-clamp-1">{paper.authors.join(", ")}</p>
            </div>
          </motion.div>

          {/* アブストラクト */}
          <motion.div
            key={`abstract-${isJapanese}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <p className="text-base leading-relaxed text-zinc-800 dark:text-zinc-200 whitespace-pre-line mb-24">
              {isJapanese && paper.abstractJa ? paper.abstractJa : paper.abstract}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

