/**
 * ヘルスチェックAPI
 * アプリケーションの状態と設定を確認
 */

import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function GET() {
  try {
    const checks = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      checks: {
        database: false,
        clerkKeys: false,
      },
      config: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasClerkSecretKey: !!process.env.CLERK_SECRET_KEY,
        hasClerkPublishableKey: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      }
    };

    // データベース接続チェック
    try {
      await db.$queryRaw`SELECT 1`;
      checks.checks.database = true;
      console.log("✅ [Health] データベース接続OK");
    } catch (error) {
      console.error("❌ [Health] データベース接続エラー:", error);
      checks.checks.database = false;
    }

    // Clerkキーの存在チェック
    checks.checks.clerkKeys = 
      !!process.env.CLERK_SECRET_KEY && 
      !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

    const allHealthy = Object.values(checks.checks).every(v => v === true);

    console.log("🏥 [Health] ヘルスチェック結果:", checks);

    return NextResponse.json(checks, { 
      status: allHealthy ? 200 : 503 
    });
  } catch (error) {
    console.error("❌ [Health] ヘルスチェックエラー:", error);
    return NextResponse.json(
      { 
        error: "ヘルスチェック失敗",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}





