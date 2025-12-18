/**
 * Clerk Webhook
 * ユーザーの作成・更新・削除を自動的にデータベースに同期
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { Role } from "@prisma/client";

// 管理者メールアドレス
const ADMIN_EMAIL = "yasutaka_yoshida@asagi.waseda.jp";

/**
 * Clerk Webhookエンドポイント
 * ユーザーイベントを処理してデータベースに反映
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const eventType = payload.type;

    console.log(`[Clerk Webhook] イベント受信: ${eventType}`);

    switch (eventType) {
      case "user.created":
        await handleUserCreated(payload.data);
        break;
      
      case "user.updated":
        await handleUserUpdated(payload.data);
        break;
      
      case "user.deleted":
        await handleUserDeleted(payload.data);
        break;
      
      default:
        console.log(`[Clerk Webhook] 未対応のイベント: ${eventType}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Clerk Webhook] エラー:", error);
    return NextResponse.json(
      { error: "Webhookの処理に失敗しました" },
      { status: 500 }
    );
  }
}

/**
 * ユーザー作成イベント処理
 */
async function handleUserCreated(userData: any) {
  const userId = userData.id;
  const email = userData.email_addresses?.[0]?.email_address;

  if (!email) {
    console.error("[Clerk Webhook] メールアドレスが見つかりません");
    return;
  }

  // 管理者かどうかを判定
  const role = email === ADMIN_EMAIL ? Role.ADMIN : Role.SUPPORTER;

  // データベースにユーザーを作成
  await db.user.create({
    data: {
      id: userId,
      email,
      role,
      emailVerified: userData.email_addresses?.[0]?.verification?.status === "verified",
      displayName: `${userData.first_name || ""} ${userData.last_name || ""}`.trim() || null,
    },
  });

  console.log(`[Clerk Webhook] ユーザー作成: ${email} (${role})`);
}

/**
 * ユーザー更新イベント処理
 */
async function handleUserUpdated(userData: any) {
  const userId = userData.id;
  const email = userData.email_addresses?.[0]?.email_address;

  if (!email) {
    console.error("[Clerk Webhook] メールアドレスが見つかりません");
    return;
  }

  // データベースのユーザーを更新
  await db.user.update({
    where: { id: userId },
    data: {
      email,
      emailVerified: userData.email_addresses?.[0]?.verification?.status === "verified",
      displayName: `${userData.first_name || ""} ${userData.last_name || ""}`.trim() || null,
      lastLoginAt: new Date(),
    },
  });

  console.log(`[Clerk Webhook] ユーザー更新: ${email}`);
}

/**
 * ユーザー削除イベント処理
 */
async function handleUserDeleted(userData: any) {
  const userId = userData.id;

  // データベースからユーザーを削除
  await db.user.delete({
    where: { id: userId },
  });

  console.log(`[Clerk Webhook] ユーザー削除: ${userId}`);
}

