/**
 * OCR処理API
 * 画像ファイルから手書きテキストを抽出
 * OpenAI APIが利用できない場合はモック実装にフォールバック
 */

import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { mockOCRProcessing } from "@/lib/mock-ocr";
import { requireAuth } from "@/lib/auth-utils";

export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    await requireAuth();

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "ファイルが見つかりません" }, { status: 400 });
    }

    // ファイル形式のチェック
    const validImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validImageTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "対応していないファイル形式です。JPEG、PNG、WebPのみ対応しています。" },
        { status: 400 }
      );
    }

    // ファイルサイズのチェック（10MB制限）
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: "ファイルサイズが大きすぎます（最大10MB）" }, { status: 400 });
    }

    // モックモードのチェック
    const useMock = process.env.USE_MOCK_OCR === "true";

    let extractedText = "";
    let isMock = false;

    if (useMock) {
      // モックOCR処理
      console.log("🔧 モックOCR処理を使用しています");
      extractedText = await mockOCRProcessing(file.name);
      isMock = true;
    } else {
      try {
        // 画像をBase64に変換
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Image = buffer.toString("base64");
        const imageUrl = `data:${file.type};base64,${base64Image}`;

        // OpenAI Vision APIでOCR処理
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `この画像には面談メモや手書きのメモが含まれています。
画像内のすべてのテキストを正確に抽出してください。
以下の点に注意してください：
- 手書き文字も認識してください
- 箇条書きや段落の構造を保持してください
- 判読できない文字は[?]で示してください
- メモの内容のみを出力し、説明文は不要です`,
                },
                {
                  type: "image_url",
                  image_url: {
                    url: imageUrl,
                  },
                },
              ],
            },
          ],
          max_tokens: 2000,
        });

        extractedText = response.choices[0]?.message?.content || "";
      } catch (apiError: any) {
        // OpenAI APIエラー時はモック実装にフォールバック
        console.warn("⚠️ OpenAI APIエラー、モック実装にフォールバックします:", apiError.message);
        
        // クォータエラーの場合は特別なメッセージ
        if (apiError.status === 429 || apiError.code === "insufficient_quota") {
          console.log("💡 ヒント: .env.local に USE_MOCK_OCR=true を設定すると、常にモックモードで動作します");
        }
        
        extractedText = await mockOCRProcessing(file.name);
        isMock = true;
      }
    }

    // 画像をBase64データURLとして保存（ダウンロード用）
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");
    const imageDataUrl = `data:${file.type};base64,${base64Image}`;

    return NextResponse.json({
      success: true,
      text: extractedText,
      fileName: file.name,
      imageDataUrl, // 画像のBase64データURL
      isMock, // モック使用の有無をフロントエンドに通知
    });
  } catch (error) {
    console.error("OCR処理エラー:", error);
    return NextResponse.json(
      { error: "OCR処理中にエラーが発生しました" },
      { status: 500 }
    );
  }
}

