import { NextRequest, NextResponse } from "next/server"
import { extractAssessmentFromText } from "@/lib/assessment-extraction"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * アセスメント抽出API
 * POST /api/assessment/extract
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text } = body

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { success: false, error: "テキストが提供されていません" },
        { status: 400 }
      )
    }

    if (text.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "テキストが空です" },
        { status: 400 }
      )
    }

    // アセスメント抽出を実行
    const result = await extractAssessmentFromText(text)

    if (!result.success) {
      return NextResponse.json(result, { status: 500 })
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("アセスメント抽出APIエラー:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "不明なエラーが発生しました",
      },
      { status: 500 }
    )
  }
}

