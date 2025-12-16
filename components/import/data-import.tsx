"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, Activity, CheckCircle, AlertCircle, Loader2, Download } from "lucide-react"
import { processImportedData, type ImportResult } from "@/lib/mock-import"

export function DataImport() {
  const [conversationFile, setConversationFile] = useState<File | null>(null)
  const [vitalFile, setVitalFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)

  const handleConversationFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setConversationFile(e.target.files[0])
    }
  }

  const handleVitalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVitalFile(e.target.files[0])
    }
  }

  const handleImport = async () => {
    if (!conversationFile && !vitalFile) return

    setIsProcessing(true)
    const result = await processImportedData(conversationFile, vitalFile)
    setImportResult(result)
    setIsProcessing(false)
  }

  const handleReset = () => {
    setConversationFile(null)
    setVitalFile(null)
    setImportResult(null)
  }

  const downloadTemplate = (type: "conversation" | "vital") => {
    // 【匿名化対応】テンプレートからは名前を削除、匿名化IDを使用
    const templates = {
      conversation: `日付,匿名化ID,会話内容
2025-01-15,25-001,"支援者: 今日の調子はどうですか？\n当事者: まあまあです。"
2025-01-16,25-001,"支援者: 昨日より良さそうですね。\n当事者: はい、少し気分が良いです。"`,
      vital: `日付,匿名化ID,平均心拍数,歩数,睡眠時間,ストレスレベル
2025-01-15,25-001,72,3500,7.5,中
2025-01-16,25-001,68,4200,8.0,低`,
    }

    const blob = new Blob([templates[type]], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `template_${type}.csv`
    link.click()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">データインポート</h2>
        <p className="text-muted-foreground mt-2">福祉施設からの既存データをインポートして分析します</p>
      </div>

      <Tabs defaultValue="upload">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">データアップロード</TabsTrigger>
          <TabsTrigger value="history">インポート履歴</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  会話データ
                </CardTitle>
                <CardDescription>会話テキストデータをCSV形式でアップロード</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleConversationFileChange}
                    className="hidden"
                    id="conversation-file"
                  />
                  <label htmlFor="conversation-file" className="cursor-pointer">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    {conversationFile ? (
                      <div>
                        <p className="font-semibold text-foreground">{conversationFile.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {(conversationFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-semibold text-foreground">ファイルを選択</p>
                        <p className="text-sm text-muted-foreground mt-1">CSV, TXT形式に対応</p>
                      </div>
                    )}
                  </label>
                </div>
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => downloadTemplate("conversation")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  テンプレートをダウンロード
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  バイタルデータ
                </CardTitle>
                <CardDescription>バイタルデータをCSV形式でアップロード</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleVitalFileChange}
                    className="hidden"
                    id="vital-file"
                  />
                  <label htmlFor="vital-file" className="cursor-pointer">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    {vitalFile ? (
                      <div>
                        <p className="font-semibold text-foreground">{vitalFile.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">{(vitalFile.size / 1024).toFixed(2)} KB</p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-semibold text-foreground">ファイルを選択</p>
                        <p className="text-sm text-muted-foreground mt-1">CSV形式に対応</p>
                      </div>
                    )}
                  </label>
                </div>
                <Button variant="outline" className="w-full bg-transparent" onClick={() => downloadTemplate("vital")}>
                  <Download className="h-4 w-4 mr-2" />
                  テンプレートをダウンロード
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>データ形式について</CardTitle>
              <CardDescription>インポート可能なデータ形式の説明</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">会話データ (CSV/TXT)</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>必須項目: 日付、当事者ID、当事者名、会話内容</li>
                    <li>文字コード: UTF-8推奨</li>
                    <li>会話内容は改行を含む場合、ダブルクォートで囲んでください</li>
                  </ul>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">バイタルデータ (CSV)</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>必須項目: 日付、当事者ID、当事者名、平均心拍数、歩数、睡眠時間</li>
                    <li>オプション項目: ストレスレベル、活動量、その他のバイタル指標</li>
                    <li>文字コード: UTF-8推奨</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              onClick={handleImport}
              disabled={(!conversationFile && !vitalFile) || isProcessing}
              className="flex-1 gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  処理中...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  インポート実行
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleReset} disabled={isProcessing}>
              リセット
            </Button>
          </div>

          {importResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {importResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  インポート結果
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {importResult.success ? (
                  <>
                    <Alert className="border-green-500 bg-green-500/10">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <AlertDescription className="text-green-500">
                        データのインポートが正常に完了しました
                      </AlertDescription>
                    </Alert>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">処理件数</p>
                        <p className="text-2xl font-bold">{importResult.processedCount}</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">成功</p>
                        <p className="text-2xl font-bold text-green-500">{importResult.successCount}</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">エラー</p>
                        <p className="text-2xl font-bold text-red-500">{importResult.errorCount}</p>
                      </div>
                    </div>

                    {importResult.recommendations && importResult.recommendations.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3">統計的データに基づく支援方法の提案</h4>
                        <div className="space-y-2">
                          {importResult.recommendations.map((rec, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                              <Badge className="mt-0.5">{index + 1}</Badge>
                              <p className="text-sm flex-1">{rec}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{importResult.error}</AlertDescription>
                    </Alert>

                    {importResult.errors && importResult.errors.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">エラー詳細</h4>
                        <div className="space-y-1">
                          {importResult.errors.map((error, index) => (
                            <p key={index} className="text-sm text-red-500">
                              • {error}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>インポート履歴</CardTitle>
              <CardDescription>過去のデータインポート記録</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    date: "2024-01-20 14:30",
                    type: "会話データ + バイタルデータ",
                    count: 45,
                    status: "成功",
                  },
                  {
                    date: "2024-01-18 10:15",
                    type: "会話データ",
                    count: 28,
                    status: "成功",
                  },
                  {
                    date: "2024-01-15 16:45",
                    type: "バイタルデータ",
                    count: 32,
                    status: "成功",
                  },
                ].map((record, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold">{record.date}</p>
                      <p className="text-sm text-muted-foreground">{record.type}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">処理件数</p>
                        <p className="font-semibold">{record.count}件</p>
                      </div>
                      <Badge variant="secondary">{record.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
