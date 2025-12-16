/**
 * AI Chat Sessions API
 * チャットセッション（Thread）一覧の取得
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserThreads } from "@/lib/thread-utils";

/**
 * GET /api/ai-chat/sessions
 * ユーザーの全セッション（Thread）一覧を取得
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    const threads = await getUserThreads(userId);
    
    // レスポンス形式を整形
    const sessions = threads.map((thread) => ({
      id: thread.id,
      title: thread.title || "新しいチャット",
      lastMessage: thread.messages[0]?.content || "",
      lastMessageAt: thread.messages[0]?.createdAt || thread.createdAt,
      createdAt: thread.createdAt,
      messageCount: thread.messages.length,
      assistantName: thread.assistant.name,
    }));
    
    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("セッション一覧取得エラー:", error);
    return NextResponse.json(
      { error: "セッション一覧の取得に失敗しました" },
      { status: 500 }
    );
  }
}
