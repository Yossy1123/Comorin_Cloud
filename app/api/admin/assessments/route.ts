/**
 * 管理者用：全アセスメント一覧取得API
 */

import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/prisma"

export async function GET() {
  try {
    // 認証チェック
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    // 管理者チェック
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "管理者権限が必要です" },
        { status: 403 }
      )
    }

    // 全アセスメントを取得
    const assessments = await db.assessment.findMany({
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

    // レスポンス用にデータを整形
    const formattedAssessments = assessments.map((assessment) => ({
      id: assessment.id,
      patientId: assessment.patientId,
      patientAnonymousId: assessment.patient.anonymousId,
      uploadedBy: assessment.uploadedBy,
      extractionConfidence: assessment.extractionConfidence,
      createdAt: assessment.createdAt,
      updatedAt: assessment.updatedAt,
      hasSourceText: !!assessment.sourceText,
    }))

    return NextResponse.json({
      assessments: formattedAssessments,
      total: formattedAssessments.length,
    })
  } catch (error) {
    console.error("アセスメント一覧取得エラー:", error)
    return NextResponse.json(
      { error: "アセスメント一覧の取得に失敗しました" },
      { status: 500 }
    )
  }
}


