"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { generateSupportPlan, exportSupportPlan, type SupportPlan } from "@/lib/support-plan"
import { SupportPlanView } from "./support-plan-view"
import { Loader2, Download, ClipboardList, Sparkles, Brain, AlertCircle } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { mockPatients } from "@/lib/mock-patients"

export function AnalysisEngine() {
  const [selectedPatient, setSelectedPatient] = useState("")
  const [supportPlan, setSupportPlan] = useState<SupportPlan | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [useGPT, setUseGPT] = useState(true) // GPT連携をデフォルトで有効化
  const [hasAssessment, setHasAssessment] = useState(false)
  const [isCheckingAssessment, setIsCheckingAssessment] = useState(false)

  // 当事者選択時にアセスメントの存在をチェック
  useEffect(() => {
    async function checkAssessment() {
      if (!selectedPatient) {
        setHasAssessment(false)
        return
      }

      setIsCheckingAssessment(true)
      try {
        const response = await fetch(`/api/assessment/${selectedPatient}`)
        if (response.ok) {
          const data = await response.json()
          setHasAssessment(data.hasAssessment)
        } else {
          setHasAssessment(false)
        }
      } catch (error) {
        console.error("アセスメントチェックエラー:", error)
        setHasAssessment(false)
      } finally {
        setIsCheckingAssessment(false)
      }
    }

    checkAssessment()
  }, [selectedPatient])

  const handleAnalyze = async () => {
    if (!selectedPatient) return

    // アセスメントがない場合は実行しない
    if (!hasAssessment) {
      alert("この当事者のアセスメントデータがアップロードされていません。\n管理者にアセスメントシートのアップロードを依頼してください。")
      return
    }

    setIsAnalyzing(true)
    
    // Reset previous results
    setSupportPlan(null)

    try {
      // 【匿名化対応】patientIdのみを使用（名前は使用しない）
      // GPT連携を使用するかどうかを指定
      const plan = await generateSupportPlan(selectedPatient, useGPT)
      setSupportPlan(plan)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleExport = async () => {
    if (!supportPlan || !selectedPatient) return

    setIsExporting(true)
    
    try {
      await exportSupportPlan(supportPlan, "pdf")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">データ分析</h2>
        <p className="text-muted-foreground mt-2">アセスメント情報から個別支援計画のための分析を実行します</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>分析対象の選択</CardTitle>
          <CardDescription>データ分析を実行する当事者を選択してください</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedPatient} onValueChange={setSelectedPatient}>
            <SelectTrigger>
              <SelectValue placeholder="当事者を選択してください" />
            </SelectTrigger>
            <SelectContent>
              {mockPatients.map((patient) => (
                <SelectItem key={patient.id} value={patient.id}>
                  ID: {patient.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedPatient && (
            <div className="space-y-4 pt-2">
              {/* アセスメント状態の表示 */}
              {isCheckingAssessment ? (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>アセスメントデータを確認中...</span>
                </div>
              ) : hasAssessment ? (
                <Alert className="bg-green-500/10 border-green-500/50">
                  <AlertCircle className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-green-700 dark:text-green-400">
                    アセスメントデータが登録されています。個別支援計画を生成できます。
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    この当事者のアセスメントデータがまだアップロードされていません。
                    <br />
                    管理者にアセスメントシートのアップロードを依頼してください。
                  </AlertDescription>
                </Alert>
              )}

              {/* GPT連携の切り替え */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Sparkles className={`h-5 w-5 ${useGPT ? "text-primary" : "text-muted-foreground"}`} />
                  <div>
                    <Label htmlFor="gpt-toggle" className="font-semibold">
                      AI支援計画生成（GPT連携）
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      30事例以上の支援事例を活用した最適な支援計画を提案
                    </p>
                  </div>
                </div>
                <Switch
                  id="gpt-toggle"
                  checked={useGPT}
                  onCheckedChange={setUseGPT}
                />
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !hasAssessment || isCheckingAssessment}
                variant="outline"
                className="w-full h-auto py-6 flex flex-col gap-2 hover:bg-primary/10 hover:border-primary relative disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {useGPT && hasAssessment && (
                  <span className="absolute top-2 right-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </span>
                )}
                <ClipboardList className="h-6 w-6" />
                <span className="font-semibold">
                  {hasAssessment ? "個別支援計画を生成" : "アセスメント登録待ち"}
                </span>
                {useGPT && hasAssessment && (
                  <span className="text-xs text-primary">AI推奨</span>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {isAnalyzing && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="text-center space-y-2">
                <p className="font-semibold">AI分析を実行中...</p>
                <p className="text-sm text-muted-foreground">
                  {useGPT ? (
                    <span className="flex items-center gap-2 justify-center">
                      <Sparkles className="h-4 w-4 text-primary" />
                      GPTを使用して30事例以上の支援事例から最適な支援計画を策定しています
                    </span>
                  ) : (
                    "アセスメント結果から個別支援計画を策定しています"
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {supportPlan && !isAnalyzing && (
        <>
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">分析完了</h3>
                  <p className="text-sm text-muted-foreground">個別支援計画をエクスポートできます</p>
                </div>
                <Button onClick={handleExport} disabled={isExporting} className="gap-2">
                  {isExporting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      エクスポート中...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      計画をエクスポート
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Support Plan View */}
          <SupportPlanView plan={supportPlan} />
        </>
      )}

      {!selectedPatient && !supportPlan && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>当事者を選択して個別支援計画を生成してください</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
