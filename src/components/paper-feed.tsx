"use client"

import { useState, useEffect } from "react"
import { Home, Heart, Search, MessageSquare, ExternalLink, ChevronUp, ChevronDown } from "lucide-react"
import PaperCard from "./paper-card"
import FavoritesList from "./favorites-list"
import type { Paper } from "@/types/paper"
import { fetchPapers, toggleFavorite, updateMemo, markAsRead } from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

type Tab = "home" | "favorites" | "search"

export default function PaperFeed() {
  const [papers, setPapers] = useState<Paper[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>("home")
  const [showMemo, setShowMemo] = useState(false)
  const [memo, setMemo] = useState("")
  const [favoriteActionFeedback, setFavoriteActionFeedback] = useState(false)

  useEffect(() => {
    const loadPapers = async () => {
      try {
        const data = await fetchPapers()
        const filteredPapers = data.filter(paper => {
          if (!paper.isRead) return true;
          
          const oneDayAgo = new Date();
          oneDayAgo.setDate(oneDayAgo.getDate() - 1);
          return new Date(paper.createdAt) > oneDayAgo;
        });
        
        setPapers(filteredPapers)
        setLoading(false)
      } catch (error) {
        console.error("論文の読み込みに失敗しました:", error)
        setLoading(false)
      }
    }

    loadPapers()
  }, [])

  useEffect(() => {
    if (papers.length > 0) {
      setMemo(papers[currentIndex].memo || "")
    }
  }, [currentIndex, papers])

  // 論文表示時に既読にマーク
  useEffect(() => {
    if (papers.length > 0 && !papers[currentIndex].isRead) {
      const markCurrentPaperAsRead = async () => {
        try {
          await markAsRead(papers[currentIndex].id);
          updatePaper(papers[currentIndex].id, { isRead: true });
        } catch (error) {
          console.error("既読状態の更新に失敗しました:", error);
        }
      };
      
      markCurrentPaperAsRead();
    }
  }, [currentIndex, papers]);

  const updatePaper = (paperId: string, updates: Partial<Paper>) => {
    setPapers((currentPapers) =>
      currentPapers.map((paper) => (paper.id === paperId ? { ...paper, ...updates } : paper)),
    )
  }

  const handleMemoSave = async () => {
    try {
      const paper = papers[currentIndex]
      await updateMemo(paper.id, memo)
      updatePaper(paper.id, { memo })
      setShowMemo(false)
    } catch (error) {
      console.error("メモの保存に失敗しました:", error)
    }
  }

  const handleFavoriteToggle = async () => {
    try {
      const paper = papers[currentIndex]
      const newState = !paper.favorite
      await toggleFavorite(paper.id, newState)
      updatePaper(paper.id, { favorite: newState })
      
      setFavoriteActionFeedback(true)
      setTimeout(() => setFavoriteActionFeedback(false), 1000)
    } catch (error) {
      console.error("お気に入り状態の更新に失敗しました:", error)
    }
  }

  const handlePrevPaper = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleNextPaper = () => {
    if (currentIndex < papers.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-900">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-zinc-300 dark:border-zinc-600 border-t-zinc-900 dark:border-t-zinc-200"></div>
      </div>
    )
  }

  if (papers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-900">
        <p className="text-xl text-zinc-900 dark:text-zinc-100">論文が見つかりませんでした。</p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-900">
      <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 flex items-center justify-center overflow-y-auto"
                >
                  {papers.length > 0 && (
                    <div className="flex relative w-full h-full items-center justify-center">
                      <PaperCard paper={papers[currentIndex]} key={papers[currentIndex].id} />
                      {/* 進行状況インジケーター */}
                      <div className="fixed top-6 right-6 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-600 dark:text-zinc-300 opacity-80">
                        {currentIndex + 1} / {papers.length}
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}

          {activeTab === "favorites" && (
            <motion.div
              key="favorites"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 overflow-y-auto"
            >
              <FavoritesList papers={papers.filter((paper) => paper.favorite)} onUpdatePaper={updatePaper} />
            </motion.div>
          )}

          {activeTab === "search" && (
            <motion.div
              key="search"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <p className="text-zinc-500 dark:text-zinc-400">検索機能は準備中です</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showMemo && (
        <div className="fixed inset-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm z-50 flex flex-col justify-center items-center p-6">
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
            <h3 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">メモを追加</h3>
            <Textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="この論文についてメモを残す..."
              className="min-h-[200px] mb-4 text-zinc-900 dark:text-zinc-100"
              onFocus={(e) => {
                // フォーカス時に現在のスクロール位置を保持
                e.currentTarget.style.position = 'fixed';
                e.currentTarget.style.position = '';
              }}
              data-no-auto-focus="true"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setMemo(papers[currentIndex].memo || "")
                  setShowMemo(false)
                }}
              >
                キャンセル
              </Button>
              <Button 
                onClick={handleMemoSave} 
              >
                保存
              </Button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "home" && papers.length > 0 && (
        <>
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-3 z-40">
            <button
              onClick={handleFavoriteToggle}
              className="w-12 h-12 flex items-center justify-center bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
            >
              <Heart
                className={`w-5 h-5 ${
                  papers[currentIndex].favorite ? "fill-rose-500 text-rose-500" : "text-zinc-600 dark:text-zinc-400"
                }`}
              />
            </button>

            <button
              onClick={() => setShowMemo(true)}
              className="w-12 h-12 flex items-center justify-center bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
            >
              <MessageSquare className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
            </button>

            <a
              href={papers[currentIndex].pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 flex items-center justify-center bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
            >
              <ExternalLink className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
            </a>
          </div>

          {/* 論文移動ボタン */}
          <div className="fixed bottom-20 right-4 flex flex-col gap-2 z-40">
            <button
              onClick={handlePrevPaper}
              disabled={currentIndex === 0}
              className="w-12 h-12 flex items-center justify-center bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="前の論文"
            >
              <ChevronUp className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
            </button>
            <button
              onClick={handleNextPaper}
              disabled={currentIndex === papers.length - 1}
              className="w-12 h-12 flex items-center justify-center bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="次の論文"
            >
              <ChevronDown className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
            </button>
          </div>
        </>
      )}

      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 px-4 z-40">
        <div className="h-full max-w-lg mx-auto flex items-center justify-around">
          <button
            onClick={() => setActiveTab("home")}
            className={`flex flex-col items-center justify-center gap-1 ${
              activeTab === "home" ? "text-zinc-900 dark:text-white" : "text-zinc-500 dark:text-zinc-400"
            }`}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs">ホーム</span>
          </button>
          <button
            onClick={() => setActiveTab("search")}
            className={`flex flex-col items-center justify-center gap-1 ${
              activeTab === "search" ? "text-zinc-900 dark:text-white" : "text-zinc-500 dark:text-zinc-400"
            }`}
          >
            <Search className="w-6 h-6" />
            <span className="text-xs">検索</span>
          </button>
          <button
            onClick={() => setActiveTab("favorites")}
            className={`flex flex-col items-center justify-center gap-1 ${
              activeTab === "favorites" ? "text-zinc-900 dark:text-white" : "text-zinc-500 dark:text-zinc-400"
            }`}
          >
            <Heart className="w-6 h-6" />
            <span className="text-xs">いいね</span>
          </button>
        </div>
      </nav>

      {favoriteActionFeedback && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-zinc-100 dark:bg-zinc-800 shadow-lg backdrop-blur-sm px-4 py-2 rounded-lg z-50 text-sm font-medium"
        >
          {papers[currentIndex].favorite ? "お気に入りに追加しました" : "お気に入りから削除しました"}
        </motion.div>
      )}
    </div>
  )
}

