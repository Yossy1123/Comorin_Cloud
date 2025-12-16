/**
 * AI Chat Assistant API
 * OpenAI Assistantの作成・取得
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAssistant, getOrCreateAssistant } from "@/lib/assistant-utils";
import { CreateAssistantRequest } from "@/types/ai-chat";

/**
 * GET /api/ai-chat/assistant
 * デフォルトAssistantを取得（なければ作成）
 */
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    const assistant = await getOrCreateAssistant();
    
    return NextResponse.json({ assistant });
  } catch (error) {
    console.error("Assistant取得エラー:", error);
    return NextResponse.json(
      { error: "Assistantの取得に失敗しました" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ai-chat/assistant
 * 新規Assistantを作成
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

    const body = await request.json() as CreateAssistantRequest;
    const { name, instructions, model, vectorStoreId } = body;

    if (!name) {
      return NextResponse.json(
        { error: "nameは必須です" },
        { status: 400 }
      );
    }

    const assistant = await createAssistant({
      name,
      instructions,
      model,
      vectorStoreId,
    });
    
    return NextResponse.json({ assistant }, { status: 201 });
  } catch (error) {
    console.error("Assistant作成エラー:", error);
    return NextResponse.json(
      { error: "Assistantの作成に失敗しました" },
      { status: 500 }
    );
  }
}
