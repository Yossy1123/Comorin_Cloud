"use client";

/**
 * AI Chat Interface - メインチャットUI
 */

import { useState, useEffect } from "react";
import { MessageList } from "./message-list";
import { MessageInput } from "./message-input";
import { ThreadSidebar } from "./thread-sidebar";
import { AiChatMessage, AiChatThread } from "@/types/ai-chat";
import { Button } from "@/components/ui/button";
import { PanelLeftClose, PanelLeft } from "lucide-react";

interface ChatInterfaceProps {
  initialThreads?: AiChatThread[];
}

export function ChatInterface({ initialThreads = [] }: ChatInterfaceProps) {
  const [threads, setThreads] = useState<AiChatThread[]>(initialThreads);
  const [currentThread, setCurrentThread] = useState<AiChatThread | null>(null);
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Thread選択時にメッセージを読み込む
  useEffect(() => {
    if (currentThread) {
      loadMessages(currentThread.id);
    }
  }, [currentThread]);

  // メッセージ読み込み
  async function loadMessages(threadId: string) {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/ai-chat/message?threadId=${threadId}`);
      if (!response.ok) throw new Error("メッセージの取得に失敗しました");
      
      const data = await response.json();
      setMessages(data.messages);
    } catch (error) {
      console.error("メッセージ読み込みエラー:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // 新規Thread作成
  async function createNewThread() {
    try {
      // まずAssistantを取得
      const assistantRes = await fetch("/api/ai-chat/assistant");
      if (!assistantRes.ok) throw new Error("Assistantの取得に失敗しました");
      
      const { assistant } = await assistantRes.json();

      // 新規Thread作成
      const threadRes = await fetch("/api/ai-chat/thread", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assistantId: assistant.id,
          title: "新しいチャット",
        }),
      });

      if (!threadRes.ok) throw new Error("Threadの作成に失敗しました");
      
      const { thread } = await threadRes.json();
      
      setThreads((prev) => [thread, ...prev]);
      setCurrentThread(thread);
      setMessages([]);
    } catch (error) {
      console.error("Thread作成エラー:", error);
    }
  }

  // メッセージ送信
  async function handleSendMessage(content: string) {
    if (!currentThread) {
      // Threadがない場合は作成
      await createNewThread();
      return;
    }

    // ユーザーメッセージを即座に表示
    const userMessage: AiChatMessage = {
      id: `temp-${Date.now()}`,
      threadId: currentThread.id,
      role: "user",
      content,
      openaiMessageId: null,
      createdAt: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai-chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId: currentThread.id,
          content,
        }),
      });

      if (!response.ok) throw new Error("メッセージの送信に失敗しました");

      // ストリーミングレスポンスを処理
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      let assistantContent = "";
      const assistantMessage: AiChatMessage = {
        id: `temp-assistant-${Date.now()}`,
        threadId: currentThread.id,
        role: "assistant",
        content: "",
        openaiMessageId: null,
        createdAt: new Date(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value);
          const lines = text.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === "text") {
                assistantContent += data.content;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessage.id
                      ? { ...msg, content: assistantContent }
                      : msg
                  )
                );
              } else if (data.type === "done") {
                // 完了
                setIsLoading(false);
              } else if (data.type === "error") {
                console.error("ストリーミングエラー:", data.error);
                setIsLoading(false);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("メッセージ送信エラー:", error);
      setIsLoading(false);
    }
  }

  // Thread削除
  async function handleDeleteThread(threadId: string) {
    try {
      const response = await fetch(`/api/ai-chat/thread?threadId=${threadId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Threadの削除に失敗しました");
      
      setThreads((prev) => prev.filter((t) => t.id !== threadId));
      
      if (currentThread?.id === threadId) {
        setCurrentThread(null);
        setMessages([]);
      }
    } catch (error) {
      console.error("Thread削除エラー:", error);
    }
  }

  return (
    <div className="flex h-full">
      {/* サイドバー */}
      {isSidebarOpen && (
        <ThreadSidebar
          threads={threads}
          currentThreadId={currentThread?.id || null}
          onSelectThread={(thread) => setCurrentThread(thread)}
          onNewThread={createNewThread}
          onDeleteThread={handleDeleteThread}
        />
      )}

      {/* メインチャット領域 */}
      <div className="flex flex-1 flex-col">
        {/* ヘッダー */}
        <div className="border-b p-4 flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
          </Button>
          <h2 className="text-lg font-semibold">
            {currentThread?.title || "AI チャット"}
          </h2>
        </div>

        {/* メッセージリスト */}
        <div className="flex-1 overflow-hidden">
          <MessageList messages={messages} isLoading={isLoading} />
        </div>

        {/* メッセージ入力 */}
        <div className="border-t p-4">
          <MessageInput
            onSend={handleSendMessage}
            disabled={isLoading}
            placeholder={
              currentThread
                ? "メッセージを入力..."
                : "新しいチャットを開始するにはメッセージを入力してください"
            }
          />
        </div>
      </div>
    </div>
  );
}
