"use client";

import { useState } from "react";
import type { Paper } from "@/types/paper";
import { formatDate } from "@/lib/utils";
import PaperDetailModal from "@/components/paper-detail-modal";
import { motion } from "framer-motion";

interface FavoritesListProps {
  papers: Paper[];
  onUpdatePaper: (paperId: string, updates: Partial<Paper>) => void;
}

export default function FavoritesList({
  papers: initialPapers,
  onUpdatePaper,
}: FavoritesListProps) {
  const [papers, setPapers] = useState(initialPapers);
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);

  const handlePaperUpdate = (paperId: string, updates: Partial<Paper>) => {
    onUpdatePaper(paperId, updates);

    setPapers((currentPapers) =>
      currentPapers
        .map((paper) =>
          paper.id === paperId ? { ...paper, ...updates } : paper
        )
        .filter((paper) => {
          if ("favorite" in updates) {
            return updates.favorite !== false;
          }
          return true;
        })
    );

    if ("favorite" in updates && updates.favorite === false) {
      setSelectedPaper(null);
    }
  };

  if (papers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <p className="text-lg text-zinc-500 dark:text-zinc-400 mb-2">お気に入りの論文はありません</p>
        <p className="text-sm text-zinc-400 dark:text-zinc-500">
          論文を読んでいいねボタンをタップするとここに表示されます
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-6 text-zinc-900 dark:text-zinc-100">お気に入りの論文</h2>
      
      <div className="space-y-4">
        {papers.map((paper) => (
          <motion.div
            key={paper.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="p-4 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm cursor-pointer"
            onClick={() => setSelectedPaper(paper)}
          >
            <h3 className="font-medium mb-1 line-clamp-2">
              {paper.titleJa || paper.title}
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">{formatDate(paper.publishedAt)}</p>
            <p className="text-sm line-clamp-2 text-zinc-600 dark:text-zinc-300">
              {paper.abstractJa || paper.abstract}
            </p>
          </motion.div>
        ))}
      </div>

      {selectedPaper && (
        <PaperDetailModal
          paper={selectedPaper}
          isOpen={!!selectedPaper}
          onClose={() => setSelectedPaper(null)}
          onUpdate={handlePaperUpdate}
        />
      )}
    </div>
  );
}
