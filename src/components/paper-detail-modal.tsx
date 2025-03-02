"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogOverlay, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Heart, MessageSquare, ExternalLink } from "lucide-react"
import type { Paper } from "@/types/paper"
import { formatDate } from "@/lib/utils"
import { toggleFavorite, updateMemo } from "@/lib/api"
import { motion } from "framer-motion"

interface PaperDetailModalProps {
  paper: Paper
  isOpen: boolean
  onClose: () => void
  onUpdate: (paperId: string, updates: Partial<Paper>) => void
}

export default function PaperDetailModal({ paper, isOpen, onClose, onUpdate }: PaperDetailModalProps) {
  const [isJapanese, setIsJapanese] = useState(true)
  const [isFavorite, setIsFavorite] = useState(paper.favorite)
  const [memo, setMemo] = useState(paper.memo || "")
  const [isEditingMemo, setIsEditingMemo] = useState(false)

  const handleFavoriteToggle = async () => {
    try {
      const newState = !isFavorite
      await toggleFavorite(paper.id, newState)
      setIsFavorite(newState)
      onUpdate(paper.id, { favorite: newState })
    } catch (error) {
      console.error("お気に入り状態の更新に失敗しました:", error)
    }
  }

  const handleMemoSave = async () => {
    try {
      await updateMemo(paper.id, memo)
      setIsEditingMemo(false)
      onUpdate(paper.id, { memo })
    } catch (error) {
      console.error("メモの保存に失敗しました:", error)
    }
  }

  if (!isOpen) return null

  const title = isJapanese && paper.titleJa ? paper.titleJa : paper.title

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogOverlay className="fixed inset-0 z-50 bg-black/40" onClick={onClose} />
      <DialogContent className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] p-0">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-3xl max-h-[calc(100vh-8rem)] flex flex-col bg-white dark:bg-zinc-900 rounded-xl shadow-xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ヘッダー */}
          <div className="flex justify-between items-start p-6 border-b border-zinc-200 dark:border-zinc-800">
            <div className="pr-8">
              <div className="flex flex-wrap gap-2 mb-2">
                {paper.categories.map((category, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs font-medium rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                  >
                    {category}
                  </span>
                ))}
              </div>
              <h2 className="text-xl font-semibold mb-2">{title}</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {formatDate(paper.publishedAt)} · {paper.authors.join(", ")}
              </p>
            </div>
          </div>

          {/* スクロール可能なコンテンツエリア */}
          <div className="flex-1 overflow-y-auto rounded-lg">
            <div className="p-6 pb-24">
              {/* 言語切り替えボタン */}
              {((paper.titleJa && paper.abstractJa) || isJapanese) && (
                <button
                  onClick={() => setIsJapanese(!isJapanese)}
                  className="mb-4 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-sm transition-colors"
                >
                  {isJapanese ? "英語で表示" : "日本語で表示"}
                </button>
              )}
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-base leading-relaxed whitespace-pre-line">
                  {isJapanese && paper.abstractJa ? paper.abstractJa : paper.abstract}
                </p>
              </div>
              {/* メモセクション */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    メモ
                  </h3>
                  {!isEditingMemo && memo && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditingMemo(true)}>
                      編集
                    </Button>
                  )}
                </div>

                {isEditingMemo ? (
                  <div className="space-y-4">
                    <Textarea
                      value={memo}
                      onChange={(e) => setMemo(e.target.value)}
                      placeholder="この論文についてメモを残す..."
                      className="min-h-[120px]"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setMemo(paper.memo || "")
                          setIsEditingMemo(false)
                        }}
                      >
                        キャンセル
                      </Button>
                      <Button onClick={handleMemoSave}>保存</Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="min-h-[120px] p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                    onClick={() => setIsEditingMemo(true)}
                  >
                    {memo || <span className="text-zinc-400 dark:text-zinc-500">クリックしてメモを追加</span>}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* アクションバー */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white dark:from-zinc-900 to-transparent pointer-events-none rounded-lg" />
          <div className="absolute bottom-0 left-0 right-0 h-20 flex items-center justify-around px-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-t border-zinc-200 dark:border-zinc-800 rounded-lg">
            <button
              onClick={handleFavoriteToggle}
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <Heart
                className={`w-7 h-7 ${isFavorite ? "fill-rose-500 text-rose-500" : "text-zinc-600 dark:text-zinc-400"}`}
              />
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                {isFavorite ? "いいね済み" : "いいね"}
              </span>
            </button>

            <button
              onClick={() => setIsEditingMemo(true)}
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <MessageSquare className="w-7 h-7 text-zinc-600 dark:text-zinc-400" />
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">メモ</span>
            </button>

            <a
              href={paper.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <ExternalLink className="w-7 h-7 text-zinc-600 dark:text-zinc-400" />
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">PDFを開く</span>
            </a>
          </div>

          {/* メモ編集モーダル */}
          {isEditingMemo && (
            <div className="absolute inset-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm z-20 flex flex-col justify-center items-center p-6">
              <div className="w-full max-w-2xl bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
                <h3 className="text-xl font-semibold mb-4">メモを追加</h3>
                <Textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="この論文についてメモを残す..."
                  className="min-h-[200px] mb-4"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMemo(paper.memo || "")
                      setIsEditingMemo(false)
                    }}
                  >
                    キャンセル
                  </Button>
                  <Button onClick={handleMemoSave}>保存</Button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}

