"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { maskPersonalNames } from "@/lib/name-masking"
import { AssessmentEditor } from "@/components/assessment/assessment-editor"
import type { AssessmentData, ExtractionResult } from "@/types/assessment"
import { FileText, Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

interface ConversationAnalysisProps {
  selectedPatientId?: string
}

export function ConversationAnalysis({ selectedPatientId: propSelectedPatientId }: ConversationAnalysisProps) {
  // 親から渡された当事者IDを使用
  const [selectedPatientId, setSelectedPatientId] = useState<string>(propSelectedPatientId || "")
  
  // アセスメント関連の状態
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null)
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractionError, setExtractionError] = useState<string | null>(null)
  
  const { toast } = useToast()

  // 親から渡された当事者IDが変更されたら更新
  useEffect(() => {
    if (propSelectedPatientId) {
      setSelectedPatientId(propSelectedPatientId)
    }
  }, [propSelectedPatientId])

  useEffect(() => {
    if (!selectedPatientId) return

    // 当事者が変更されたらアセスメントをリセット
    setAssessmentData(null)
    setExtractionError(null)
  }, [selectedPatientId])

  // 会話データの状態
  const [conversations, setConversations] = useState<Array<{
    id: string;
    patientId: string;
    recordedAt: Date | string;
    transcript: string;
    analysis?: {
      emotion: string;
      stressLevel: string;
      keywords: string[];
      recommendation: string;
    };
  }>>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);

  // データベースから会話データを取得
  const fetchConversations = async () => {
    setIsLoadingConversations(true);
    try {
      const response = await fetch("/api/conversation/records");
      if (!response.ok) {
        console.error("会話データの取得に失敗しました");
        return;
      }
      const data = await response.json();
      
      // すべての会話をフラットな配列に変換
      const allConversations: Array<{
        id: string;
        patientId: string;
        recordedAt: Date | string;
        transcript: string;
        analysis?: {
          emotion: string;
          stressLevel: string;
          keywords: string[];
          recommendation: string;
        };
      }> = [];
      
      Object.values(data.records || {}).forEach((patientRecords: any) => {
        allConversations.push(...patientRecords);
      });
      
      setConversations(allConversations);
    } catch (error) {
      console.error("会話データ取得エラー:", error);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  // コンポーネントマウント時とselectedPatientIdが変更されたときにデータを取得
  useEffect(() => {
    fetchConversations();
  }, [selectedPatientId]);

  // 選択された当事者の会話数を取得
  const filteredConversations = useMemo(() => {
    if (!selectedPatientId) return []
    return conversations.filter((conv) => conv.patientId === selectedPatientId)
  }, [selectedPatientId, conversations])


  // 会話履歴からアセスメント用のテキストを生成
  const generateAssessmentText = () => {
    const allConversations = filteredConversations
    if (allConversations.length === 0) return ""

    // 最新のデータを優先的に使用するため、日付の新しい順にソート
    const sortedConversations = [...allConversations].sort((a, b) => {
      const dateA = new Date(a.recordedAt).getTime()
      const dateB = new Date(b.recordedAt).getTime()
      return dateB - dateA // 新しい順
    })

    // 最新の5件を使用（全件使用すると古いデータが含まれてしまう）
    const MAX_RECENT_CONVERSATIONS = 5
    const conversationsList = sortedConversations.slice(0, MAX_RECENT_CONVERSATIONS)

    // 【匿名化対応】IDのみを使用
    let text = `対象者ID: ${selectedPatientId}\n\n`
    text += `会話記録（最新${conversationsList.length}件のセッション / 全${allConversations.length}件）:\n\n`

    conversationsList.forEach((conv, index) => {
      const date = new Date(conv.recordedAt).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      })
      text += `【最新から${index + 1}件目】 ${date}\n`
      if (conv.analysis) {
        text += `感情状態: ${conv.analysis.emotion}\n`
        text += `ストレスレベル: ${conv.analysis.stressLevel}\n`
        text += `キーワード: ${conv.analysis.keywords.join(", ")}\n\n`
      }
      // 【匿名化対応】会話内容から個人名をマスキング
      text += `会話内容:\n${maskPersonalNames(conv.transcript)}\n\n`
      text += `---\n\n`
    })

    return text
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

  // 当事者が選択されていない場合の表示
  if (!selectedPatientId) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-12 pb-12">
            <div className="text-center text-muted-foreground">
              <p>当事者が選択されていません</p>
              <p className="text-sm mt-2">録音・記録タブから当事者を選択して会話を記録してください</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ローディング中の表示
  if (isLoadingConversations) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-12 pb-12">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="text-center space-y-2">
                <p className="font-semibold">会話データを読み込み中...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 会話データがない場合の表示
  if (filteredConversations.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>分析対象</CardTitle>
            <CardDescription>ID: {selectedPatientId} の会話データを分析します</CardDescription>
          </CardHeader>
          <CardContent className="pt-12 pb-12">
            <div className="text-center text-muted-foreground">
              <p>この当事者の会話データがありません</p>
              <p className="text-sm mt-2">録音・記録タブから会話を記録してください</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 当事者情報の表示（選択UIではなく情報表示のみ） */}
      <Card>
        <CardHeader>
          <CardTitle>分析対象</CardTitle>
          <CardDescription>
            ID: {selectedPatientId} の会話データを分析します
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">対象者ID</p>
              <p className="text-2xl font-bold text-primary">{selectedPatientId}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-right">会話データ</p>
              <p className="text-2xl font-bold text-primary text-right">{filteredConversations.length}件</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* アセスメントシート生成 */}
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
                最新の会話データ（最大5件）を優先的に使用してアセスメントシートを生成します。
                {filteredConversations.length > 5 && (
                  <span className="block mt-1 text-xs">
                    ※ 全{filteredConversations.length}件のうち、最新5件を使用します
                  </span>
                )}
              </AlertDescription>
            </Alert>

            {extractionError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-semibold">エラーが発生しました</p>
                    <p className="text-sm">{extractionError}</p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleExtractAssessment}
              disabled={filteredConversations.length === 0}
              className="w-full gap-2"
              variant="default"
            >
              <FileText className="h-4 w-4" />
              アセスメント作成
            </Button>
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
                <Button onClick={handleExtractAssessment} variant="outline" size="sm" className="gap-2">
                  <FileText className="h-4 w-4" />
                  再生成
                </Button>
              </div>
            </CardContent>
          </Card>

          <AssessmentEditor 
            data={assessmentData} 
            onSave={(updatedData) => {
              setAssessmentData(updatedData)
              toast({
                title: "保存完了",
                description: "アセスメントを更新しました",
              })
            }}
          />
        </>
      )}
    </div>
  )
}
