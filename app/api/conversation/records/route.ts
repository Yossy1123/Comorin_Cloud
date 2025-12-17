import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

/**
 * 面談記録一覧を取得するAPIエンドポイント
 * 利用者IDごとにグループ化して返す
 */
export async function GET() {
  try {
    // MVP検証用：認証チェックを一時的に無効化
    // const { userId } = await auth();
    // if (!userId) {
    //   return NextResponse.json(
    //     { error: "認証が必要です" },
    //     { status: 401 }
    //   );
    // }

    // 面談記録を取得（Conversationテーブル）
    const conversations = await db.conversation.findMany({
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

