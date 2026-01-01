/**
 * 音声文字起こしAPI
 * 音声ファイルからテキストを抽出
 * OpenAI Whisper APIが利用できない場合はモック実装にフォールバック
 */

import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { mockTranscribeAudio } from "@/lib/mock-ocr";
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
    const validAudioTypes = [
      "audio/mpeg",
      "audio/mp3",
      "audio/mp4",
      "audio/x-m4a",
      "audio/wav",
      "audio/webm",
      "audio/flac",
    ];
    if (!validAudioTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "対応していないファイル形式です。MP3、M4A、WAV、WebM、FLACのみ対応しています。" },
        { status: 400 }
      );
    }

    // ファイルサイズのチェック（25MB制限 - Whisper APIの制限）
    const maxSize = 25 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: "ファイルサイズが大きすぎます（最大25MB）" }, { status: 400 });
    }

    // モックモードのチェック
    const useMock = process.env.USE_MOCK_TRANSCRIBE === "true";

    let transcribedText = "";
    let isMock = false;

    if (useMock) {
      // モック音声文字起こし処理
      console.log("🔧 モック音声文字起こし処理を使用しています");
      transcribedText = await mockTranscribeAudio(file.name);
      isMock = true;
    } else {
      try {
        // OpenAI Whisper APIで音声文字起こし
        console.log(`🎤 音声文字起こし開始: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
        
        const response = await openai.audio.transcriptions.create({
          file: file,
          model: "whisper-1",
          language: "ja", // 日本語を明示的に指定
          response_format: "text", // テキスト形式で取得
        });

        transcribedText = response as unknown as string;
        console.log("✅ 音声文字起こし完了");
      } catch (apiError: any) {
        // OpenAI APIエラー時はモック実装にフォールバック
        console.warn("⚠️ OpenAI APIエラー、モック実装にフォールバックします:", apiError.message);
        
        // クォータエラーの場合は特別なメッセージ
        if (apiError.status === 429 || apiError.code === "insufficient_quota") {
          console.log("💡 ヒント: .env.local に USE_MOCK_TRANSCRIBE=true を設定すると、常にモックモードで動作します");
        }
        
        transcribedText = await mockTranscribeAudio(file.name);
        isMock = true;
      }
    }

    return NextResponse.json({
      success: true,
      text: transcribedText,
      fileName: file.name,
      isMock, // モック使用の有無をフロントエンドに通知
    });
  } catch (error) {
    console.error("音声文字起こし処理エラー:", error);
    return NextResponse.json(
      { error: "音声文字起こし処理中にエラーが発生しました" },
      { status: 500 }
    );
  }
}

