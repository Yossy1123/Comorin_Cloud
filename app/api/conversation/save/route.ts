/**
 * 会話データ保存API
 * 音声データやメモからテキスト化された会話内容をデータベースに保存
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-utils";

interface SaveConversationRequest {
  patientId: string;
  transcript: string;
  analysis?: {
    emotion: string;
    stressLevel: string;
    keywords: string[];
    recommendation: string;
  };
  audioUrl?: string;
  imageUrls?: string[];
  duration?: number;
}

/**
 * POST /api/conversation/save
 * 会話データをデータベースに保存
 */
export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    const body = await request.json() as SaveConversationRequest;
    const { patientId, transcript, analysis, audioUrl, imageUrls, duration } = body;

    // バリデーション
    if (!patientId || !transcript) {
      return NextResponse.json(
        { error: "patientIdとtranscriptは必須です" },
        { status: 400 }
      );
    }

    // 当事者の存在確認
    // patientIdがUUID形式かanonymousId形式かを判定
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(patientId);
    
    let patient;
    if (isUUID) {
      // UUIDの場合、idで検索
      patient = await db.patient.findUnique({
        where: { id: patientId },
      });
    } else {
      // anonymousIdの場合、anonymousIdで検索
      patient = await db.patient.findUnique({
        where: { anonymousId: patientId },
      });
    }

    if (!patient) {
      return NextResponse.json(
        { error: "指定された当事者が見つかりません" },
        { status: 404 }
      );
    }

    // 会話データを保存（patient.idを使用）
    const conversation = await db.conversation.create({
      data: {
        patientId: patient.id,
        transcript,
        audioUrl: audioUrl || null,
        imageUrls: imageUrls || null,
        duration: duration || null,
        sentiment: analysis ? {
          emotion: analysis.emotion,
          stressLevel: analysis.stressLevel,
        } : null,
        keywords: analysis?.keywords || null,
        recordedAt: new Date(),
        supporterId: currentUser.id,
      },
      include: {
        patient: {
          select: {
            anonymousId: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      conversation: {
        id: conversation.id,
        patientId: conversation.patient.anonymousId,
        recordedAt: conversation.recordedAt,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("会話データ保存エラー:", error);
    return NextResponse.json(
      { error: "会話データの保存に失敗しました" },
      { status: 500 }
    );
  }
}

