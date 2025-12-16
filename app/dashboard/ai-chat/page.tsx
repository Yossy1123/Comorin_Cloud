/**
 * AI Chat Page - OpenAI Vector Storesを用いたチャット機能
 */

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ChatInterface } from "@/components/ai-chat/chat-interface";
import { getUserThreads } from "@/lib/thread-utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUpload } from "@/components/ai-chat/file-upload";

export default async function AiChatPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  // ユーザーのThread一覧を取得
  const threads = await getUserThreads(userId);

  return (
    <div className="container mx-auto p-6 h-[calc(100vh-4rem)]">
      <div className="flex flex-col h-full">
        {/* ヘッダー */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">AI チャット</h1>
          <p className="text-muted-foreground mt-2">
            OpenAI Vector Storesを活用した対話型支援アシスタント
          </p>
        </div>

        {/* タブ */}
        <Tabs defaultValue="chat" className="flex-1 flex flex-col">
          <TabsList className="mb-4">
            <TabsTrigger value="chat">チャット</TabsTrigger>
            <TabsTrigger value="files">ファイル管理</TabsTrigger>
          </TabsList>

          {/* チャットタブ */}
          <TabsContent value="chat" className="flex-1 mt-0">
            <div className="border rounded-lg h-full">
              <ChatInterface initialThreads={threads} />
            </div>
          </TabsContent>

          {/* ファイル管理タブ */}
          <TabsContent value="files" className="flex-1 mt-0">
            <div className="max-w-2xl mx-auto py-8">
              <FileUpload />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
