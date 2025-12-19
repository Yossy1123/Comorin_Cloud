/**
 * Wordファイルアップロード＆アセスメント作成API
 * 管理者がWordファイルをアップロードし、テキスト抽出→GPT分析→DB保存を行う
 */

import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/prisma"
import mammoth from "mammoth"
import { extractAssessmentFromText } from "@/lib/assessment-extraction"

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

    // FormDataを取得
    const formData = await request.formData()
    const file = formData.get("file") as File
    const patientId = formData.get("patientId") as string

    if (!file || !patientId) {
      return NextResponse.json(
        { error: "ファイルとpatientIdは必須です" },
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

    // ファイルをBufferに変換
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Wordファイルからテキストを抽出
    let extractedText: string
    try {
      const result = await mammoth.extractRawText({ buffer })
      extractedText = result.value

      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error("テキストの抽出に失敗しました")
      }
    } catch (err) {
      console.error("Wordファイル解析エラー:", err)
      return NextResponse.json(
        { error: "Wordファイルの読み込みに失敗しました" },
        { status: 400 }
      )
    }

    // GPTでアセスメントデータを抽出
    const extractionResult = await extractAssessmentFromText(extractedText)

    if (!extractionResult.success || !extractionResult.data) {
      return NextResponse.json(
        { 
          error: extractionResult.error || "アセスメントの抽出に失敗しました",
          warnings: extractionResult.warnings 
        },
        { status: 400 }
      )
    }

    // アセスメントデータをDBに保存
    const assessment = await db.assessment.create({
      data: {
        patientId,
        data: extractionResult.data as any,
        uploadedBy: userId,
        sourceText: extractedText,
        extractionConfidence: extractionResult.data.extractionConfidence,
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
        extractionConfidence: assessment.extractionConfidence,
        createdAt: assessment.createdAt,
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



