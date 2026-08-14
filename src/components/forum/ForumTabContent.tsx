
import React from "react";
import { ForumThread, ForumPostCard } from "./ForumPostCard";

interface ForumTabContentProps {
  threads: ForumThread[];
  category?: string;
  onLike: (threadId: string) => void;
  onShare: (threadId: string) => void;
  onDelete?: (threadId: string) => void;
}

export const ForumTabContent: React.FC<ForumTabContentProps> = ({ 
  threads, 
  category, 
  onLike,
  onShare,
  onDelete
}) => {
  const filteredThreads = category && category !== 'all' 
    ? threads.filter(thread => thread.category === category)
    : threads;

  return (
    <div className="space-y-4">
      {filteredThreads.length > 0 ? (
        filteredThreads.map((thread) => (
          <ForumPostCard 
            key={thread.id} 
            thread={thread} 
            onLike={onLike} 
            onShare={onShare}
            onDelete={onDelete}
          />
        ))
      ) : (
        <p className="text-center text-gray-500 py-10">
          {category !== 'all' 
            ? "Δεν υπάρχουν συζητήσεις σε αυτή την κατηγορία" 
            : "Δεν υπάρχουν συζητήσεις"}
        </p>
      )}
    </div>
  );
};
