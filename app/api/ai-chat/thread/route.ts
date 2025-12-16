/**
 * AI Chat Thread API
 * 会話スレッドの作成・取得・削除
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createThread, getUserThreads, deleteThread, getThread } from "@/lib/thread-utils";
import { CreateThreadRequest } from "@/types/ai-chat";

/**
 * GET /api/ai-chat/thread
 * ユーザーのThread一覧を取得
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

    const { searchParams } = new URL(request.url);
    const threadId = searchParams.get("threadId");

    if (threadId) {
      // 特定のThreadを取得
      const thread = await getThread(threadId, userId);
      return NextResponse.json({ thread });
    } else {
      // 全Thread一覧を取得
      const threads = await getUserThreads(userId);
      return NextResponse.json({ threads });
    }
  } catch (error) {
    console.error("Thread取得エラー:", error);
    return NextResponse.json(
      { error: "Threadの取得に失敗しました" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ai-chat/thread
 * 新規Threadを作成
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    const body = await request.json() as CreateThreadRequest;
    const { assistantId, patientId, title } = body;

    if (!assistantId) {
      return NextResponse.json(
        { error: "assistantIdは必須です" },
        { status: 400 }
      );
    }

    const thread = await createThread({
      assistantId,
      userId,
      patientId,
      title,
    });
    
    return NextResponse.json({ thread }, { status: 201 });
  } catch (error) {
    console.error("Thread作成エラー:", error);
    return NextResponse.json(
      { error: "Threadの作成に失敗しました" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ai-chat/thread
 * Threadを削除
 */
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const threadId = searchParams.get("threadId");

    if (!threadId) {
      return NextResponse.json(
        { error: "threadIdは必須です" },
        { status: 400 }
      );
    }

    await deleteThread(threadId, userId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Thread削除エラー:", error);
    return NextResponse.json(
      { error: "Threadの削除に失敗しました" },
      { status: 500 }
    );
  }
}
