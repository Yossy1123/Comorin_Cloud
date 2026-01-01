/**
 * アセスメントアップロードAPI
 * 管理者がアセスメントデータをアップロードするためのエンドポイント
 */

import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/prisma"
import type { AssessmentData } from "@/types/assessment"

export async function POST(request: Request) {
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

    // リクエストボディを取得
    const body = await request.json()
    const { patientId, data, sourceText, extractionConfidence } = body as {
      patientId: string
      data: AssessmentData
      sourceText?: string
      extractionConfidence?: number
    }

    // バリデーション
    if (!patientId || !data) {
      return NextResponse.json(
        { error: "patientIdとdataは必須です" },
        { status: 400 }
      )
    }

    // 当事者が存在するか確認
    const patient = await db.patient.findUnique({
      where: { id: patientId },
    })

    if (!patient) {
      return NextResponse.json(
        { error: "指定された当事者が見つかりません" },
        { status: 404 }
      )
    }

    // アセスメントデータを保存
    const assessment = await db.assessment.create({
      data: {
        patientId,
        data: data as any, // Prisma JsonValue型
        uploadedBy: userId,
        sourceText,
        extractionConfidence,
      },
      include: {
        patient: {
          select: {
            anonymousId: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      assessment: {
        id: assessment.id,
        patientId: assessment.patientId,
        patientAnonymousId: assessment.patient.anonymousId,
        createdAt: assessment.createdAt,
        uploadedBy: assessment.uploadedBy,
      },
    })
  } catch (error) {
    console.error("アセスメントアップロードエラー:", error)
    return NextResponse.json(
      { error: "アセスメントのアップロードに失敗しました" },
      { status: 500 }
    )
  }
}






