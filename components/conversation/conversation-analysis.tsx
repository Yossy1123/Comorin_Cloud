"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getConversationHistory } from "@/lib/mock-conversation"
import { maskPersonalNames } from "@/lib/name-masking"
import { AssessmentViewer } from "@/components/assessment/assessment-viewer"
import { generateMockAssessment } from "@/lib/assessment-mock"
import type { AssessmentData, ExtractionResult } from "@/types/assessment"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { FileText, Loader2, AlertCircle, Sparkles } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function ConversationAnalysis() {
  // 【匿名化対応】当事者リストを取得（IDのみ、重複なし）
  const patients = useMemo(() => {
    const conversations = getConversationHistory()
    const uniquePatients = Array.from(
      new Map(conversations.map((conv) => [conv.patientId, { id: conv.patientId }])).values()
    )
    return uniquePatients
  }, [])

  // デフォルトで最初の当事者を選択
  const [selectedPatientId, setSelectedPatientId] = useState<string>("")
  const [emotionData, setEmotionData] = useState<any[]>([])
  const [stressData, setStressData] = useState<any[]>([])
  
  // アセスメント関連の状態
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null)
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractionError, setExtractionError] = useState<string | null>(null)

  // 初回レンダリング時に最初の当事者を選択
  useEffect(() => {
    if (patients.length > 0 && !selectedPatientId) {
      setSelectedPatientId(patients[0].id)
    }
  }, [patients, selectedPatientId])

  useEffect(() => {
    if (!selectedPatientId) return

    const allConversations = getConversationHistory()

    // 選択された当事者でフィルタリング
    const conversations = allConversations.filter((conv) => conv.patientId === selectedPatientId)

    // Aggregate emotion data
    const emotionCounts: Record<string, number> = {}
    const stressCounts: Record<string, number> = {}

    conversations.forEach((conv) => {
      emotionCounts[conv.analysis.emotion] = (emotionCounts[conv.analysis.emotion] || 0) + 1
      stressCounts[conv.analysis.stressLevel] = (stressCounts[conv.analysis.stressLevel] || 0) + 1
    })

    setEmotionData(Object.entries(emotionCounts).map(([name, value]) => ({ name, value })))
    setStressData(Object.entries(stressCounts).map(([name, value]) => ({ name, value })))
    
    // 当事者が変更されたらアセスメントをリセット
    setAssessmentData(null)
    setExtractionError(null)
  }, [selectedPatientId])

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

  // 選択された当事者の会話数を取得
  const filteredConversations = useMemo(() => {
    if (!selectedPatientId) return []
    const allConversations = getConversationHistory()
    return allConversations.filter((conv) => conv.patientId === selectedPatientId)
  }, [selectedPatientId])


  // 会話履歴からアセスメント用のテキストを生成
  const generateAssessmentText = () => {
    const conversations = filteredConversations
    if (conversations.length === 0) return ""

    // 【匿名化対応】IDのみを使用
    let text = `対象者ID: ${selectedPatientId}\n\n`
    text += `会話記録（${conversations.length}件のセッション）:\n\n`

    conversations.forEach((conv, index) => {
      const date = new Date(conv.timestamp).toLocaleDateString("ja-JP")
      text += `【セッション${index + 1}】 ${date}\n`
      text += `感情状態: ${conv.analysis.emotion}\n`
      text += `ストレスレベル: ${conv.analysis.stressLevel}\n`
      text += `キーワード: ${conv.analysis.keywords.join(", ")}\n\n`
      // 【匿名化対応】会話内容から個人名をマスキング
      text += `会話内容:\n${maskPersonalNames(conv.transcript)}\n\n`
      text += `---\n\n`
    })

    return text
  }

  // モックデータでアセスメント生成
  const handleUseMockAssessment = () => {
    setIsExtracting(true)
    setExtractionError(null)

    // 実際のAPIを模擬するための遅延
    setTimeout(() => {
      const mockData = generateMockAssessment()
      // 【匿名化対応】IDのみを使用
      mockData.basicInfo.subjectId = selectedPatientId
      mockData.basicInfo.subjectName = undefined
      setAssessmentData(mockData)
      setIsExtracting(false)
    }, 1500)
  }

  // アセスメント抽出を実行（AI使用）
  const handleExtractAssessment = async () => {
    const text = generateAssessmentText()
    if (!text) {
      setExtractionError("会話データがありません")
      return
    }

    setIsExtracting(true)
    setExtractionError(null)

    try {
      const response = await fetch("/api/assessment/extract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "抽出中にエラーが発生しました")
      }

      const result: ExtractionResult = await response.json()

      if (result.success && result.data) {
        setAssessmentData(result.data)
      } else {
        setExtractionError(result.error || "アセスメントの抽出に失敗しました")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "抽出中にエラーが発生しました"
      setExtractionError(errorMessage)
      
      // APIエラーの場合、詳細情報を表示
      console.error("アセスメント抽出エラー:", error)
    } finally {
      setIsExtracting(false)
    }
  }

  // 当事者データがない場合の表示
  if (patients.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-12 pb-12">
            <div className="text-center text-muted-foreground">
              <p>会話データがありません</p>
              <p className="text-sm mt-2">録音タブから会話を記録してください</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 当事者選択 */}
      <Card>
        <CardHeader>
          <CardTitle>分析対象の選択</CardTitle>
          <CardDescription>当事者ごとの会話データを分析します</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>当事者を選択</Label>
            <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
              <SelectTrigger>
                <SelectValue placeholder="当事者を選択してください" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    ID: {patient.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedPatientId && (
              <p className="text-sm text-muted-foreground mt-2">
                ID: {selectedPatientId} の会話データ: {filteredConversations.length}件
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="assessment" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assessment">
            アセスメントシート
            {assessmentData && (
              <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-green-500"></span>
            )}
          </TabsTrigger>
          <TabsTrigger value="statistics">統計データ</TabsTrigger>
        </TabsList>

        <TabsContent value="assessment" className="space-y-6 mt-6">
          {!assessmentData && !isExtracting && (
            <Card>
              <CardHeader>
                <CardTitle>アセスメントシート生成</CardTitle>
                <CardDescription>
                  ID: {selectedPatientId} の会話履歴からアセスメント情報を抽出します
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    会話データ（{filteredConversations.length}件）を使用してアセスメントシートを生成します。
                  </AlertDescription>
                </Alert>

                {extractionError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <p className="font-semibold">エラーが発生しました</p>
                        <p className="text-sm">{extractionError}</p>
                        {extractionError.includes("quota") || extractionError.includes("429") ? (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-sm font-medium mb-2">💡 OpenAI APIのクォータ制限に達しています</p>
                            <p className="text-xs">代わりにモックデータでUIを確認できます ↓</p>
                          </div>
                        ) : null}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid gap-3">
                  <Button
                    onClick={handleExtractAssessment}
                    disabled={filteredConversations.length === 0}
                    className="w-full gap-2"
                    variant="default"
                  >
                    <FileText className="h-4 w-4" />
                    AI解析でアセスメント生成（OpenAI API使用）
                  </Button>

                  <Button
                    onClick={handleUseMockAssessment}
                    className="w-full gap-2"
                    variant="outline"
                  >
                    <Sparkles className="h-4 w-4" />
                    モックデータで確認（API不要）
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  ※ OpenAI APIキーが未設定の場合は、モックデータで動作確認できます
                </p>
              </CardContent>
            </Card>
          )}

          {isExtracting && (
            <Card>
              <CardContent className="py-12">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <div className="text-center space-y-2">
                    <p className="font-semibold">アセスメント生成中...</p>
                    <p className="text-sm text-muted-foreground">
                      会話データからアセスメント情報を抽出しています
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {assessmentData && !isExtracting && (
            <>
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">アセスメント生成完了</h3>
                      <p className="text-sm text-muted-foreground">
                        ID: {selectedPatientId} のアセスメントシートが生成されました
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleUseMockAssessment} variant="outline" size="sm" className="gap-2">
                        <Sparkles className="h-4 w-4" />
                        モック
                      </Button>
                      <Button onClick={handleExtractAssessment} variant="outline" size="sm" className="gap-2">
                        <FileText className="h-4 w-4" />
                        AI再生成
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <AssessmentViewer data={assessmentData} />
            </>
          )}
        </TabsContent>

        <TabsContent value="statistics" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>感情分析の統計</CardTitle>
              <CardDescription>
                ID: {selectedPatientId} の会話から検出された感情状態の分布
              </CardDescription>
            </CardHeader>
            <CardContent>
              {emotionData.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>分析データがありません</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={emotionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {emotionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ストレスレベルの分布</CardTitle>
              <CardDescription>
                ID: {selectedPatientId} の会話から推定されたストレスレベルの統計
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stressData.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>分析データがありません</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stressData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a1a",
                        border: "1px solid #333",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">会話数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{filteredConversations.length}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  ID: {selectedPatientId} のセッション
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">平均ストレスレベル</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{stressData.length > 0 ? "中" : "-"}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  ID: {selectedPatientId} の平均
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">主要な感情</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{emotionData.length > 0 ? emotionData[0].name : "-"}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  ID: {selectedPatientId} の最頻値
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
