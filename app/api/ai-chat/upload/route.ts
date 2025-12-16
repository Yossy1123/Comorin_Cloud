/**
 * AI Chat File Upload API
 * ファイルのアップロードとVector Storeへの追加
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { uploadFileToVectorStore, createVectorStore, getVectorStoreFiles } from "@/lib/vector-store-utils";
import { getOrCreateAssistant, attachVectorStore } from "@/lib/assistant-utils";

/**
 * GET /api/ai-chat/upload
 * アップロード済みファイル一覧を取得
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
    const vectorStoreId = searchParams.get("vectorStoreId");

    if (!vectorStoreId) {
      return NextResponse.json(
        { error: "vectorStoreIdは必須です" },
        { status: 400 }
      );
    }

    const files = await getVectorStoreFiles(vectorStoreId, userId);
    
    return NextResponse.json({ files });
  } catch (error) {
    console.error("ファイル一覧取得エラー:", error);
    return NextResponse.json(
      { error: "ファイル一覧の取得に失敗しました" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ai-chat/upload
 * ファイルをアップロードしてVector Storeに追加
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

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "ファイルは必須です" },
        { status: 400 }
      );
    }

    // Assistantを取得
    const assistant = await getOrCreateAssistant();
    
    // Vector Storeがなければ作成
    let vectorStoreId = assistant.vectorStoreId;
    if (!vectorStoreId) {
      const vectorStore = await createVectorStore("ひきこもり支援 知識ベース");
      vectorStoreId = vectorStore.id;
      
      // AssistantにVector Storeを紐付け
      await attachVectorStore(assistant.id, vectorStoreId);
    }

    // ファイルをアップロード
    const uploadedFile = await uploadFileToVectorStore(file, vectorStoreId, userId);
    
    return NextResponse.json({ file: uploadedFile }, { status: 201 });
  } catch (error) {
    console.error("ファイルアップロードエラー:", error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "ファイルのアップロードに失敗しました" },
      { status: 500 }
    );
  }
}
