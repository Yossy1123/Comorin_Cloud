/**
 * 管理者専用：全会話データ取得API
 * 全ユーザーのアップロードデータを取得
 */

import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";

/**
 * GET /api/admin/conversations
 * 全ユーザーの会話データを取得（管理者のみ）
 */
export async function GET() {
  try {
    // 管理者権限チェック
    await requireAdmin();

    // 全会話データを取得
    const conversations = await db.conversation.findMany({
      orderBy: {
        recordedAt: "desc",
      },
      include: {
        patient: {
          select: {
            id: true,
            anonymousId: true,
          },
        },
      },
    });

    // 支援者情報を取得
    const supporterIds = [...new Set(conversations.map((c) => c.supporterId).filter(Boolean))];
    const supporters = await db.user.findMany({
      where: {
        id: {
          in: supporterIds as string[],
        },
      },
      select: {
        id: true,
        email: true,
        displayName: true,
      },
    });

    const supporterMap = new Map(supporters.map((s) => [s.id, s]));

    // レスポンスデータの整形
    const formattedConversations = conversations.map((conversation) => {
      const supporter = conversation.supporterId
        ? supporterMap.get(conversation.supporterId)
        : null;

      return {
        id: conversation.id,
        patientId: conversation.patientId,
        patientAnonymousId: conversation.patient.anonymousId,
        transcript: conversation.transcript,
        recordedAt: conversation.recordedAt,
        createdAt: conversation.createdAt,
        supporterId: conversation.supporterId,
        supporterEmail: supporter?.email || null,
        supporterName: supporter?.displayName || null,
        sentiment: conversation.sentiment,
        keywords: conversation.keywords,
        audioUrl: conversation.audioUrl,
        imageUrls: conversation.imageUrls as string[] | null,
        duration: conversation.duration,
      };
    });

    return NextResponse.json({ conversations: formattedConversations });
  } catch (error) {
    console.error("会話データ取得エラー:", error);

    if (error instanceof Error && error.message === "管理者権限が必要です") {
      return NextResponse.json(
        { error: "管理者権限が必要です" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "会話データの取得に失敗しました" },
      { status: 500 }
    );
  }
}

