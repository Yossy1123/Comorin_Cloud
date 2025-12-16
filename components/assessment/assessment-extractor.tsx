"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2, FileText, AlertCircle, CheckCircle, Upload } from "lucide-react"
import { generateMockAssessment } from "@/lib/assessment-mock"
import type { AssessmentData, ExtractionResult } from "@/types/assessment"

interface AssessmentExtractorProps {
  onExtracted?: (data: AssessmentData) => void
}

export function AssessmentExtractor({ onExtracted }: AssessmentExtractorProps) {
  const [inputText, setInputText] = useState("")
  const [isExtracting, setIsExtracting] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    data?: AssessmentData
    error?: string
    warnings?: string[]
  } | null>(null)

  const handleExtract = async () => {
    if (!inputText.trim()) {
      setResult({
        success: false,
        error: "テキストを入力してください",
      })
      return
    }

    setIsExtracting(true)
    setResult(null)

    try {
      // API経由でアセスメント抽出を実行
      const response = await fetch("/api/assessment/extract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputText }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "抽出中にエラーが発生しました")
      }

      const extractionResult: ExtractionResult = await response.json()
      setResult(extractionResult)

      if (extractionResult.success && extractionResult.data && onExtracted) {
        onExtracted(extractionResult.data)
      }
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "抽出中にエラーが発生しました",
      })
    } finally {
      setIsExtracting(false)
    }
  }

  const handleUseMockData = () => {
    const mockData = generateMockAssessment()
    setResult({
      success: true,
      data: mockData,
      warnings: [],
    })
    if (onExtracted) {
      onExtracted(mockData)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setInputText(text)
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>テキストデータの入力</CardTitle>
          <CardDescription>
            会話記録やメモからアセスメント情報を抽出します
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label htmlFor="file-upload" className="cursor-pointer">
                <Button variant="outline" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    ファイルをアップロード
                  </span>
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  accept=".txt,.md"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <Button variant="outline" onClick={handleUseMockData}>
                サンプルデータを使用
              </Button>
            </div>
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="会話記録やメモのテキストをここに貼り付けてください...&#10;&#10;例：&#10;対象者ID：25-001（25歳・男性）&#10;相談経路：保健所からの紹介&#10;ひきこもり期間：約3年6ヶ月（2022年3月から）&#10;きっかけ：就職活動の失敗、対人関係のストレス&#10;現在の状況：昼夜逆転、月1-2回深夜のコンビニに外出..."
              rows={12}
              className="font-mono text-sm"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{inputText.length} 文字</span>
              {inputText.length > 0 && inputText.length < 100 && (
                <span className="text-yellow-500">※ より詳細なテキストを入力すると精度が向上します</span>
              )}
            </div>
          </div>

          <Button onClick={handleExtract} disabled={!inputText.trim() || isExtracting} className="w-full gap-2">
            {isExtracting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                抽出中...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                アセスメント情報を抽出
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* 抽出中のローディング表示 */}
      {isExtracting && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="text-center space-y-2">
                <p className="font-semibold">AI解析を実行中...</p>
                <p className="text-sm text-muted-foreground">
                  テキストからアセスメント情報を抽出しています
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 抽出結果の表示 */}
      {result && !isExtracting && (
        <Card className={result.success ? "border-green-500/50" : "border-red-500/50"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.success ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  抽出完了
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  抽出失敗
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.success && result.data && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">抽出精度</span>
                    <Badge variant={result.data.extractionConfidence >= 70 ? "default" : "secondary"}>
                      {result.data.extractionConfidence}%
                    </Badge>
                  </div>
                  <Progress value={result.data.extractionConfidence} />
                  {result.data.extractionConfidence < 50 && (
                    <p className="text-sm text-yellow-500">
                      ※ 抽出精度が低いため、入力テキストをより詳細にすることをお勧めします
                    </p>
                  )}
                </div>

                {result.warnings && result.warnings.length > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-semibold mb-2">以下の情報が抽出できませんでした：</div>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {result.warnings.map((warning, index) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                <Alert className="bg-green-500/10 border-green-500/50">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertDescription>
                    <strong>抽出成功：</strong> 
                    下の「分析結果」タブでアセスメントシートの詳細を確認できます
                  </AlertDescription>
                </Alert>
              </>
            )}

            {!result.success && result.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>エラー：</strong> {result.error}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

