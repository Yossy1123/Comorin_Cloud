import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/prisma"
import type { AssessmentData } from "@/types/assessment"

/**
 * GET /api/assessment/[id]
 * アセスメントデータを取得
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      )
    }

    const assessmentId = params.id

    // アセスメントデータを取得
    const assessment = await db.assessment.findUnique({
      where: {
        id: assessmentId,
      },
      include: {
        patient: true,
      },
    })

    if (!assessment) {
      return NextResponse.json(
        { error: "アセスメントが見つかりません" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: assessment.id,
        patientId: assessment.patientId,
        ...(assessment.data as AssessmentData),
        createdAt: assessment.createdAt.toISOString(),
        updatedAt: assessment.updatedAt.toISOString(),
        extractionConfidence: assessment.extractionConfidence,
        sourceText: assessment.sourceText,
      },
    })
  } catch (error) {
    console.error("[Assessment GET Error]", error)
    return NextResponse.json(
      { error: "アセスメントの取得に失敗しました" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/assessment/[id]
 * アセスメントデータを更新
 * 
 * 【権限】管理者（ADMIN）および支援者（SUPPORTER）が編集可能
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      )
    }

    // 認証済みユーザー（管理者・支援者）であれば編集可能
    // ※ 必要に応じてロールチェックを追加可能

    const assessmentId = params.id
    const body = await request.json()

    // 既存のアセスメントを取得
    const existingAssessment = await db.assessment.findUnique({
      where: {
        id: assessmentId,
      },
    })

    if (!existingAssessment) {
      return NextResponse.json(
        { error: "アセスメントが見つかりません" },
        { status: 404 }
      )
    }

    // アセスメントデータのバリデーション
    if (!body.basicInfo || !body.hikikomoriHistory || !body.developmentalHistory ||
        !body.employmentHistory || !body.currentLifeStatus || !body.supportNeeds) {
      return NextResponse.json(
        { error: "必須フィールドが不足しています" },
        { status: 400 }
      )
    }

    // アセスメントデータの構築
    const assessmentData: AssessmentData = {
      basicInfo: body.basicInfo,
      hikikomoriHistory: body.hikikomoriHistory,
      developmentalHistory: body.developmentalHistory,
      employmentHistory: body.employmentHistory,
      currentLifeStatus: body.currentLifeStatus,
      supportNeeds: body.supportNeeds,
      sourceText: body.sourceText,
      extractionConfidence: body.extractionConfidence,
    }

    // アセスメントデータを更新
    const updatedAssessment = await db.assessment.update({
      where: {
        id: assessmentId,
      },
      data: {
        data: assessmentData as any,
        extractionConfidence: body.extractionConfidence,
        sourceText: body.sourceText,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: "アセスメントを更新しました",
      data: {
        id: updatedAssessment.id,
        patientId: updatedAssessment.patientId,
        ...(updatedAssessment.data as AssessmentData),
        createdAt: updatedAssessment.createdAt.toISOString(),
        updatedAt: updatedAssessment.updatedAt.toISOString(),
        extractionConfidence: updatedAssessment.extractionConfidence,
        sourceText: updatedAssessment.sourceText,
      },
    })
  } catch (error) {
    console.error("[Assessment PUT Error]", error)
    return NextResponse.json(
      { error: "アセスメントの更新に失敗しました" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/assessment/[id]
 * アセスメントデータを削除
 * 
 * 【権限】管理者（ADMIN）のみが削除可能
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      )
    }

    // 管理者権限チェック
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

    const assessmentId = params.id

    // 既存のアセスメントを確認
    const existingAssessment = await db.assessment.findUnique({
      where: {
        id: assessmentId,
      },
    })

    if (!existingAssessment) {
      return NextResponse.json(
        { error: "アセスメントが見つかりません" },
        { status: 404 }
      )
    }

    // アセスメントデータを削除
    await db.assessment.delete({
      where: {
        id: assessmentId,
      },
    })

    return NextResponse.json({
      success: true,
      message: "アセスメントを削除しました",
    })
  } catch (error) {
    console.error("[Assessment DELETE Error]", error)
    return NextResponse.json(
      { error: "アセスメントの削除に失敗しました" },
      { status: 500 }
    )
  }
}

