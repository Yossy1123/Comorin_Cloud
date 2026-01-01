/**
 * アセスメント取得API
 * 特定の当事者のアセスメントデータを取得するエンドポイント
 */

import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: { patientId: string } }
) {
  try {
    // 認証チェック
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    const { patientId } = params

    if (!patientId) {
      return NextResponse.json(
        { error: "patientIdが必要です" },
        { status: 400 }
      )
    }

    // 最新のアセスメントを取得
    const assessment = await db.assessment.findFirst({
      where: {
        patientId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        patient: {
          select: {
            anonymousId: true,
          },
        },
      },
    })

    if (!assessment) {
      return NextResponse.json({
        hasAssessment: false,
        assessment: null,
      })
    }

    return NextResponse.json({
      hasAssessment: true,
      assessment: {
        id: assessment.id,
        patientId: assessment.patientId,
        patientAnonymousId: assessment.patient.anonymousId,
        data: assessment.data,
        uploadedBy: assessment.uploadedBy,
        sourceText: assessment.sourceText,
        extractionConfidence: assessment.extractionConfidence,
        createdAt: assessment.createdAt,
        updatedAt: assessment.updatedAt,
      },
    })
  } catch (error) {
    console.error("アセスメント取得エラー:", error)
    return NextResponse.json(
      { error: "アセスメントの取得に失敗しました" },
      { status: 500 }
    )
  }
}


