/**
 * ユーザーロール取得API
 * 現在のユーザーのロールを返す
 */

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-utils";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      role: user.role,
      email: user.email,
      displayName: user.displayName,
    });
  } catch (error) {
    console.error("ユーザーロール取得エラー:", error);
    return NextResponse.json(
      { error: "ユーザーロールの取得に失敗しました" },
      { status: 500 }
    );
  }
}

