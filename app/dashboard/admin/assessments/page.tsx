/**
 * 管理者専用：アセスメント管理ページ
 * アセスメントシートのアップロード・一覧表示
 */

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUserRole } from "@/hooks/use-user-role"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  ClipboardList, 
  Calendar, 
  User, 
  AlertCircle, 
  Upload,
  Loader2,
  CheckCircle,
  FileText,
} from "lucide-react"
import { extractAssessmentFromText } from "@/lib/assessment-extraction"
import type { AssessmentData } from "@/types/assessment"

interface AssessmentListItem {
  id: string
  patientId: string
  patientAnonymousId: string
  uploadedBy: string
  extractionConfidence: number | null
  createdAt: string
  updatedAt: string
  hasSourceText: boolean
}

interface Patient {
  id: string
  anonymousId: string
}

export default function AdminAssessmentsPage() {
  const router = useRouter()
  const { isAdmin, isLoading: roleLoading } = useUserRole()
  const [assessments, setAssessments] = useState<AssessmentListItem[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  
  // アップロードフォーム
  const [selectedPatientId, setSelectedPatientId] = useState("")
  const [assessmentText, setAssessmentText] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      router.push("/dashboard")
    }
  }, [isAdmin, roleLoading, router])

  useEffect(() => {
    async function fetchData() {
      try {
        // アセスメント一覧を取得
        const assessmentsResponse = await fetch("/api/admin/assessments")
        if (!assessmentsResponse.ok) {
          throw new Error("アセスメントデータの取得に失敗しました")
        }
        const assessmentsData = await assessmentsResponse.json()
        setAssessments(assessmentsData.assessments)

        // 当事者一覧を取得（アップロード用）
        const patientsResponse = await fetch("/api/admin/conversations")
        if (patientsResponse.ok) {
          const conversationsData = await patientsResponse.json()
          // ユニークな当事者リストを作成
          const uniquePatients = Array.from(
            new Map(
              conversationsData.conversations.map((c: any) => [
                c.patientId,
                {
                  id: c.patientId,
                  anonymousId: c.patientAnonymousId,
                },
              ])
            ).values()
          ) as Patient[]
          setPatients(uniquePatients)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "エラーが発生しました")
      } finally {
        setIsLoading(false)
      }
    }

    if (isAdmin) {
      fetchData()
    }
  }, [isAdmin])

  const handleUpload = async () => {
    if (!selectedPatientId || !assessmentText.trim()) {
      alert("当事者とアセスメントテキストを入力してください")
      return
    }

    setIsUploading(true)
    setUploadSuccess(false)

    try {
      // GPTでアセスメントデータを抽出
      const extractionResult = await extractAssessmentFromText(assessmentText)
      
      if (!extractionResult.success || !extractionResult.data) {
        throw new Error(extractionResult.error || "アセスメントの抽出に失敗しました")
      }

      // アセスメントデータをアップロード
      const response = await fetch("/api/assessment/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientId: selectedPatientId,
          data: extractionResult.data,
          sourceText: assessmentText,
          extractionConfidence: extractionResult.data.extractionConfidence,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "アップロードに失敗しました")
      }

      // 成功
      setUploadSuccess(true)
      
      // アセスメント一覧を再取得
      const assessmentsResponse = await fetch("/api/admin/assessments")
      if (assessmentsResponse.ok) {
        const assessmentsData = await assessmentsResponse.json()
        setAssessments(assessmentsData.assessments)
      }

      // フォームをリセット
      setTimeout(() => {
        setIsUploadDialogOpen(false)
        setSelectedPatientId("")
        setAssessmentText("")
        setUploadSuccess(false)
      }, 2000)
    } catch (err) {
      console.error("アップロードエラー:", err)
      alert(err instanceof Error ? err.message : "アップロードに失敗しました")
    } finally {
      setIsUploading(false)
    }
  }

  if (roleLoading || !isAdmin) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">アセスメント管理</h1>
          <p className="text-muted-foreground">
            当事者のアセスメントシートをアップロード・管理します
          </p>
        </div>
        
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Upload className="h-4 w-4" />
              アセスメントをアップロード
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>アセスメントシートのアップロード</DialogTitle>
            </DialogHeader>
            
            {uploadSuccess ? (
              <Alert className="bg-green-500/10 border-green-500/50">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-700 dark:text-green-400">
                  アセスメントが正常にアップロードされました
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="patient-select">対象当事者</Label>
                  <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                    <SelectTrigger id="patient-select">
                      <SelectValue placeholder="当事者を選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          ID: {patient.anonymousId}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assessment-text">アセスメントシート内容</Label>
                  <Textarea
                    id="assessment-text"
                    placeholder="アセスメントシートのテキストを貼り付けてください&#10;&#10;GPTが自動的に構造化データに変換します"
                    value={assessmentText}
                    onChange={(e) => setAssessmentText(e.target.value)}
                    rows={12}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    ※ テキスト形式のアセスメントシートを貼り付けると、AIが自動的に構造化データに変換します
                  </p>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setIsUploadDialogOpen(false)}
                    disabled={isUploading}
                  >
                    キャンセル
                  </Button>
                  <Button
                    onClick={handleUpload}
                    disabled={isUploading || !selectedPatientId || !assessmentText.trim()}
                    className="gap-2"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        処理中...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        アップロード
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 統計カード */}
      {!isLoading && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                総アセスメント数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{assessments.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                登録当事者数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {new Set(assessments.map((a) => a.patientId)).size}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                平均抽出精度
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {assessments.length > 0
                  ? Math.round(
                      assessments
                        .filter((a) => a.extractionConfidence)
                        .reduce((sum, a) => sum + (a.extractionConfidence || 0), 0) /
                        assessments.filter((a) => a.extractionConfidence).length
                    )
                  : 0}
                %
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* アセスメント一覧 */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {assessments.length} 件のアセスメント
            </p>
          </div>

          {assessments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>アセスメントがまだありません</p>
                <p className="text-sm mt-2">右上の「アップロード」ボタンから追加できます</p>
              </CardContent>
            </Card>
          ) : (
            assessments.map((assessment) => (
              <Card key={assessment.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        <ClipboardList className="h-5 w-5 text-primary" />
                        当事者: {assessment.patientAnonymousId}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(assessment.createdAt).toLocaleString("ja-JP")}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          アップロード者: {assessment.uploadedBy}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {assessment.extractionConfidence && (
                        <Badge variant={assessment.extractionConfidence >= 70 ? "default" : "secondary"}>
                          精度: {assessment.extractionConfidence}%
                        </Badge>
                      )}
                      {assessment.hasSourceText && (
                        <Badge variant="outline">
                          <FileText className="h-3 w-3 mr-1" />
                          元データあり
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/dashboard/analysis?patientId=${assessment.patientId}`)}
                    >
                      分析画面で表示
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}

