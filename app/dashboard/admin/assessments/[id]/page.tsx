/**
 * アセスメント詳細・編集ページ
 * アセスメントの表示と編集を行う
 * 
 * 【権限】管理者（ADMIN）および支援者（SUPPORTER）が閲覧・編集可能
 */

"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { AssessmentEditor } from "@/components/assessment/assessment-editor"
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react"
import type { AssessmentData } from "@/types/assessment"

export default function AssessmentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const assessmentId = params.id as string
  const { isLoaded, userId } = useAuth()
  const [assessment, setAssessment] = useState<AssessmentData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 認証チェック：ログインしていなければダッシュボードにリダイレクト
  useEffect(() => {
    if (isLoaded && !userId) {
      router.push("/dashboard")
    }
  }, [isLoaded, userId, router])

  useEffect(() => {
    async function fetchAssessment() {
      if (!assessmentId) return

      try {
        const response = await fetch(`/api/assessment/${assessmentId}`)
        if (!response.ok) {
          throw new Error("アセスメントの取得に失敗しました")
        }

        const result = await response.json()
        if (result.success && result.data) {
          setAssessment(result.data)
        } else {
          throw new Error("アセスメントデータが見つかりません")
        }
      } catch (err) {
        console.error("アセスメント取得エラー:", err)
        setError(err instanceof Error ? err.message : "エラーが発生しました")
      } finally {
        setIsLoading(false)
      }
    }

    if (userId) {
      fetchAssessment()
    }
  }, [assessmentId, userId])

  const handleSave = (updatedData: AssessmentData) => {
    setAssessment(updatedData)
  }

  const handleBack = () => {
    router.push("/dashboard/admin/assessments")
  }

  // ローディング中または未認証の場合は何も表示しない
  if (!isLoaded || !userId) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          戻る
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">アセスメント詳細</h1>
          <p className="text-muted-foreground mt-1">
            アセスメント情報の確認と編集を行います
          </p>
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* ローディング表示 */}
      {isLoading ? (
        <div className="space-y-6">
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">アセスメントを読み込んでいます...</p>
              </div>
            </CardContent>
          </Card>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-48 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : assessment ? (
        <AssessmentEditor 
          data={assessment} 
          onSave={handleSave}
          onCancel={handleBack}
        />
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>アセスメントデータが見つかりません</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

