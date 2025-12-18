import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getCurrentUser, isAdmin } from "@/lib/auth-utils";

/**
 * 面談記録一覧を取得するAPIエンドポイント
 * 利用者IDごとにグループ化して返す
 * 管理者：全ての記録を取得
 * 一般ユーザー：自分が担当する記録のみ取得
 */
export async function GET() {
  try {
    // 認証チェック
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    // 管理者かどうかを判定
    const admin = await isAdmin();

    // 面談記録を取得（Conversationテーブル）
    const conversations = await db.conversation.findMany({
      where: admin ? {} : {
        // 一般ユーザーは自分が担当する記録のみ
        supporterId: currentUser.id,
      },
      include: {
        patient: {
          select: {
            anonymousId: true,
          },
        },
      },
      orderBy: {
        recordedAt: "desc",
      },
    });

    // 利用者IDごとにグループ化
    const groupedRecords = conversations.reduce((acc, conv) => {
      const patientId = conv.patient.anonymousId;
      
      if (!acc[patientId]) {
        acc[patientId] = [];
      }
      
      acc[patientId].push({
        id: conv.id,
        patientId: patientId,
        recordedAt: conv.recordedAt,
        transcript: conv.transcript,
      });
      
      return acc;
    }, {} as Record<string, Array<{
      id: string;
      patientId: string;
      recordedAt: Date;
      transcript: string;
    }>>);

    return NextResponse.json({ records: groupedRecords });
  } catch (error) {
    console.error("面談記録取得エラー:", error);
    return NextResponse.json(
      { error: "面談記録の取得に失敗しました" },
      { status: 500 }
    );
  }
}

