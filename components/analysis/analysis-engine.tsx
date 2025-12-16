"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { integrateAndAnalyze, type IntegratedAnalysis } from "@/lib/mock-analysis"
import { generateDailyReport, exportDailyReport, type DailyReport } from "@/lib/daily-report"
import { generateSupportPlan, exportSupportPlan, type SupportPlan } from "@/lib/support-plan"
import { DailyReportView } from "./daily-report-view"
import { SupportPlanView } from "./support-plan-view"
import { Loader2, Brain, TrendingUp, AlertCircle, CheckCircle, Download, FileText, ClipboardList, FolderOpen, Sparkles } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { exportIntegratedReport } from "@/lib/mock-export"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { mockPatients } from "@/lib/mock-patients"

type AnalysisType = "daily-report" | "support-plan" | "subsidy-application" | null

export function AnalysisEngine() {
  const [selectedPatient, setSelectedPatient] = useState("")
  const [selectedAnalysisType, setSelectedAnalysisType] = useState<AnalysisType>(null)
  const [analysis, setAnalysis] = useState<IntegratedAnalysis | null>(null)
  const [dailyReport, setDailyReport] = useState<DailyReport | null>(null)
  const [supportPlan, setSupportPlan] = useState<SupportPlan | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [useGPT, setUseGPT] = useState(true) // GPT連携をデフォルトで有効化

  const handleAnalyze = async (analysisType: AnalysisType) => {
    if (!selectedPatient || !analysisType) return

    setSelectedAnalysisType(analysisType)
    setIsAnalyzing(true)
    
    // Reset previous results
    setAnalysis(null)
    setDailyReport(null)
    setSupportPlan(null)

    try {
      // 【匿名化対応】patientIdのみを使用（名前は使用しない）
      if (analysisType === "daily-report") {
        const report = await generateDailyReport(selectedPatient)
        setDailyReport(report)
      } else if (analysisType === "support-plan") {
        // GPT連携を使用するかどうかを指定
        const plan = await generateSupportPlan(selectedPatient, useGPT)
        setSupportPlan(plan)
      } else {
        // For subsidy-application, use the integrated analysis
        const result = await integrateAndAnalyze(selectedPatient)
        setAnalysis(result)
      }
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleExport = async () => {
    if ((!analysis && !dailyReport && !supportPlan) || !selectedPatient) return

    setIsExporting(true)
    
    try {
      if (selectedAnalysisType === "daily-report" && dailyReport) {
        await exportDailyReport(dailyReport, "pdf")
      } else if (selectedAnalysisType === "support-plan" && supportPlan) {
        await exportSupportPlan(supportPlan, "pdf")
      } else if (analysis) {
        // 【匿名化対応】patientIdのみを使用
        await exportIntegratedReport(analysis, selectedPatient, "pdf")
      }
    } finally {
      setIsExporting(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "低":
        return "text-green-500"
      case "中":
        return "text-yellow-500"
      case "高":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  const getSeverityBadge = (severity: string): "default" | "secondary" | "destructive" => {
    switch (severity) {
      case "低":
        return "secondary"
      case "高":
        return "destructive"
      default:
        return "default"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">データ分析</h2>
        <p className="text-muted-foreground mt-2">アセスメント情報から日報作成、個別支援計画、補助金申請のための分析を実行します</p>
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

              <p className="text-sm text-muted-foreground">分析種類を選択してください：</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button
                  onClick={() => handleAnalyze("daily-report")}
                  disabled={isAnalyzing}
                  variant="outline"
                  className="h-auto py-4 flex flex-col gap-2 hover:bg-primary/10 hover:border-primary"
                >
                  <FileText className="h-6 w-6" />
                  <span className="font-semibold">日報作成</span>
                </Button>

                <Button
                  onClick={() => handleAnalyze("support-plan")}
                  disabled={isAnalyzing}
                  variant="outline"
                  className="h-auto py-4 flex flex-col gap-2 hover:bg-primary/10 hover:border-primary relative"
                >
                  {useGPT && (
                    <span className="absolute top-2 right-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </span>
                  )}
                  <ClipboardList className="h-6 w-6" />
                  <span className="font-semibold">個別支援計画</span>
                  {useGPT && (
                    <span className="text-xs text-primary">AI推奨</span>
                  )}
                </Button>

                <Button
                  onClick={() => handleAnalyze("subsidy-application")}
                  disabled={isAnalyzing}
                  variant="outline"
                  className="h-auto py-4 flex flex-col gap-2 hover:bg-primary/10 hover:border-primary"
                >
                  <FolderOpen className="h-6 w-6" />
                  <span className="font-semibold">補助金申請</span>
                </Button>
              </div>
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
                  {selectedAnalysisType === "daily-report" && "会話データとバイタルデータから日報を作成しています"}
                  {selectedAnalysisType === "support-plan" && useGPT && (
                    <span className="flex items-center gap-2 justify-center">
                      <Sparkles className="h-4 w-4 text-primary" />
                      GPTを使用して30事例以上の支援事例から最適な支援計画を策定しています
                    </span>
                  )}
                  {selectedAnalysisType === "support-plan" && !useGPT && "アセスメント結果から個別支援計画を策定しています"}
                  {selectedAnalysisType === "subsidy-application" && "補助金申請のためのデータを分析しています"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {(analysis || dailyReport || supportPlan) && !isAnalyzing && (
        <>
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">分析完了</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedAnalysisType === "daily-report" && "日報をエクスポートできます"}
                    {selectedAnalysisType === "support-plan" && "個別支援計画をエクスポートできます"}
                    {selectedAnalysisType === "subsidy-application" && "補助金申請書類をエクスポートできます"}
                  </p>
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
                      {selectedAnalysisType === "daily-report" && "日報をエクスポート"}
                      {selectedAnalysisType === "support-plan" && "計画をエクスポート"}
                      {selectedAnalysisType === "subsidy-application" && "書類をエクスポート"}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Daily Report View */}
          {selectedAnalysisType === "daily-report" && dailyReport && <DailyReportView report={dailyReport} />}

          {/* Support Plan View */}
          {selectedAnalysisType === "support-plan" && supportPlan && <SupportPlanView plan={supportPlan} />}

          {/* Integrated Analysis View (for subsidy-application) */}
          {selectedAnalysisType === "subsidy-application" && analysis && (
          <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">総合スコア</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{analysis.overallScore}</div>
                <Progress value={analysis.overallScore} className="mt-3" />
                <p className="text-xs text-muted-foreground mt-2">100点満点</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">リスクレベル</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getSeverityColor(analysis.riskLevel)}`}>{analysis.riskLevel}</div>
                <Badge variant={getSeverityBadge(analysis.riskLevel)} className="mt-3">
                  {analysis.riskLevel === "低" && "安定"}
                  {analysis.riskLevel === "中" && "要注意"}
                  {analysis.riskLevel === "高" && "要対応"}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">支援継続期間</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{analysis.supportDuration}</div>
                <p className="text-xs text-muted-foreground mt-2">ヶ月</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">改善傾向</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {analysis.improvementTrend === "改善" ? (
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  ) : (
                    <AlertCircle className="h-8 w-8 text-yellow-500" />
                  )}
                  <span className="text-xl font-bold">{analysis.improvementTrend}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="integrated">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="integrated">統合分析</TabsTrigger>
              <TabsTrigger value="recommendations">推奨アプローチ</TabsTrigger>
              <TabsTrigger value="similar">類似事例</TabsTrigger>
            </TabsList>

            <TabsContent value="integrated" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>データソース統合</CardTitle>
                  <CardDescription>会話データとバイタルデータの相関分析</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        会話データ分析
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">感情状態:</span>
                          <Badge>{analysis.conversationInsights.emotion}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">会話頻度:</span>
                          <span className="font-medium">{analysis.conversationInsights.frequency}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">コミュニケーション:</span>
                          <span className="font-medium">{analysis.conversationInsights.communication}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        バイタルデータ分析
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">ストレスレベル:</span>
                          <Badge variant={getSeverityBadge(analysis.vitalInsights.stressLevel)}>
                            {analysis.vitalInsights.stressLevel}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">活動量:</span>
                          <span className="font-medium">{analysis.vitalInsights.activityLevel}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">睡眠状態:</span>
                          <span className="font-medium">{analysis.vitalInsights.sleepQuality}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Alert>
                    <Brain className="h-4 w-4" />
                    <AlertDescription>
                      <strong>AI統合分析:</strong> {analysis.integratedInsight}
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>心理状態の推定</CardTitle>
                  <CardDescription>会話とバイタルデータから推定される心理状態</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.psychologicalState.map((state, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="font-medium">{state.aspect}</span>
                        <div className="flex items-center gap-3">
                          <Progress value={state.score} className="w-32" />
                          <span className="text-sm font-semibold w-12 text-right">{state.score}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>個別最適化された支援アプローチ</CardTitle>
                  <CardDescription>AI分析に基づく具体的な支援提案</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysis.recommendations.map((rec, index) => (
                      <div key={index} className="border border-border rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-bold text-primary">{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">{rec.title}</h4>
                            <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{rec.category}</Badge>
                              <Badge
                                variant={
                                  rec.priority === "高"
                                    ? "destructive"
                                    : rec.priority === "中"
                                      ? "default"
                                      : "secondary"
                                }
                              >
                                優先度: {rec.priority}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>注意事項</CardTitle>
                  <CardDescription>支援時に留意すべきポイント</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analysis.cautions.map((caution, index) => (
                      <Alert key={index}>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{caution}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="similar" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>推奨支援ケース</CardTitle>
                  <CardDescription>実際の支援事例から、現在の状況に最も適した支援方法を提案します</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {analysis.recommendedCases.map((item, index) => (
                      <div key={index} className="border border-primary/20 rounded-lg p-5 bg-primary/5">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-foreground mb-1">{item.caseCard.title}</h4>
                            <p className="text-sm text-muted-foreground">{item.caseCard.source}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant="default" className="text-base px-3 py-1">
                              類似度 {item.similarity}%
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-3 mb-4">
                          <div>
                            <span className="text-sm font-semibold text-foreground">対象者:</span>
                            <p className="text-sm text-muted-foreground mt-1">{item.caseCard.targetPerson}</p>
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-foreground">背景・課題:</span>
                            <p className="text-sm text-muted-foreground mt-1">{item.caseCard.background}</p>
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-foreground">主な介入:</span>
                            <p className="text-sm text-muted-foreground mt-1">{item.caseCard.mainIntervention}</p>
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-foreground">結果・変化:</span>
                            <p className="text-sm text-foreground font-medium mt-1">{item.caseCard.results}</p>
                          </div>
                        </div>

                        <div className="space-y-3 pt-3 border-t border-border">
                          <div>
                            <span className="text-sm font-semibold text-foreground">マッチング要因:</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {item.matchingFactors.map((factor, i) => (
                                <Badge key={i} variant="secondary">
                                  {factor}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-foreground">再現可能な条件:</span>
                            <p className="text-sm text-muted-foreground mt-1">{item.caseCard.reproducibleConditions}</p>
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-foreground">リスク・注意点:</span>
                            <p className="text-sm text-yellow-600 dark:text-yellow-500 mt-1">{item.caseCard.risks}</p>
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-foreground">タグ:</span>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {item.caseCard.tags.map((tag, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>類似事例との比較</CardTitle>
                  <CardDescription>過去の支援事例から類似パターンを抽出</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysis.similarCases.map((case_, index) => (
                      <div key={index} className="border border-border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold">事例 #{case_.caseId}</h4>
                            <p className="text-sm text-muted-foreground">類似度: {case_.similarity}%</p>
                          </div>
                          <Badge variant={case_.outcome === "成功" ? "secondary" : "default"}>{case_.outcome}</Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">支援期間:</span>
                            <span className="ml-2 font-medium">{case_.duration}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">主な特徴:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {case_.characteristics.map((char, i) => (
                                <Badge key={i} variant="outline">
                                  {char}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">効果的だったアプローチ:</span>
                            <p className="mt-1 text-foreground">{case_.effectiveApproach}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>予測される支援経路</CardTitle>
                  <CardDescription>類似事例に基づく今後の見通し</CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <TrendingUp className="h-4 w-4" />
                    <AlertDescription>
                      <strong>予測:</strong> {analysis.predictedPath}
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          </>
          )}
        </>
      )}

      {!selectedPatient && !analysis && !dailyReport && !supportPlan && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>当事者を選択して分析種類を選んでください</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
