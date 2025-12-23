/**
 * ユーザーロール取得API
 * 現在のユーザーのロールを返す
 */

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-utils";

export async function GET() {
  try {
    console.log("🔍 [Role API] ユーザーロール取得開始");
    
    const user = await getCurrentUser();

    if (!user) {
      console.log("❌ [Role API] ユーザーが見つかりません");
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    console.log("✅ [Role API] ユーザー情報取得成功:", {
      email: user.email,
      role: user.role,
      id: user.id,
    });

    return NextResponse.json({
      role: user.role,
      email: user.email,
      displayName: user.displayName,
    });
  } catch (error) {
    // 詳細なエラーログを出力
    console.error("❌ [Role API] エラー発生:");
    console.error("❌ [Role API] エラーメッセージ:", error instanceof Error ? error.message : String(error));
    console.error("❌ [Role API] エラースタック:", error instanceof Error ? error.stack : "スタックなし");
    console.error("❌ [Role API] エラー詳細:", JSON.stringify(error, null, 2));
    
    return NextResponse.json(
      { 
        error: "ユーザーロールの取得に失敗しました",
        details: error instanceof Error ? error.message : String(error),
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    );
  }
}



