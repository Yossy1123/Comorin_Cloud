/**
 * 管理者専用：ユーザー一覧取得API
 */

import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";

/**
 * GET /api/admin/users
 * 全ユーザーの一覧を取得（管理者のみ）
 */
export async function GET() {
  try {
    // 管理者権限チェック
    await requireAdmin();

    // 全ユーザーを取得
    const users = await db.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("ユーザー一覧取得エラー:", error);
    
    if (error instanceof Error && error.message === "管理者権限が必要です") {
      return NextResponse.json(
        { error: "管理者権限が必要です" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "ユーザー一覧の取得に失敗しました" },
      { status: 500 }
    );
  }
}





