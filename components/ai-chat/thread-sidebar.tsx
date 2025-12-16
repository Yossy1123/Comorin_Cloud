"use client";

/**
 * Thread Sidebar - チャットスレッド一覧サイドバー
 */

import { AiChatThread } from "@/types/ai-chat";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquarePlus, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

interface ThreadSidebarProps {
  threads: AiChatThread[];
  currentThreadId: string | null;
  onSelectThread: (thread: AiChatThread) => void;
  onNewThread: () => void;
  onDeleteThread: (threadId: string) => void;
}

export function ThreadSidebar({
  threads,
  currentThreadId,
  onSelectThread,
  onNewThread,
  onDeleteThread,
}: ThreadSidebarProps) {
  return (
    <div className="w-80 border-r flex flex-col">
      {/* ヘッダー */}
      <div className="p-4 border-b">
        <Button onClick={onNewThread} className="w-full" size="sm">
          <MessageSquarePlus className="h-4 w-4 mr-2" />
          新しいチャット
        </Button>
      </div>

      {/* Thread一覧 */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {threads.length === 0 ? (
            <div className="text-center text-muted-foreground py-8 text-sm">
              チャット履歴がありません
            </div>
          ) : (
            threads.map((thread) => (
              <ThreadItem
                key={thread.id}
                thread={thread}
                isActive={thread.id === currentThreadId}
                onSelect={() => onSelectThread(thread)}
                onDelete={() => onDeleteThread(thread.id)}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

interface ThreadItemProps {
  thread: AiChatThread;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

function ThreadItem({ thread, isActive, onSelect, onDelete }: ThreadItemProps) {
  return (
    <div
      className={`group relative rounded-lg p-3 cursor-pointer transition-colors ${
        isActive
          ? "bg-primary/10 border border-primary/20"
          : "hover:bg-muted"
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">
            {thread.title || "新しいチャット"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(thread.updatedAt), {
              addSuffix: true,
              locale: ja,
            })}
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

