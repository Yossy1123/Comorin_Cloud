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
    console.error("❌ [Role API] エラー:", error);
    return NextResponse.json(
      { error: "ユーザーロールの取得に失敗しました" },
      { status: 500 }
    );
  }
}



