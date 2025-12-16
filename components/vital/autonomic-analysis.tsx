"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { analyzeAutonomicNervousSystem, type AutonomicAnalysisResult } from "@/lib/mock-vital"
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react"
import { mockPatients } from "@/lib/mock-patients"

interface AutonomicAnalysisProps {
  selectedPatientId?: string
  hidePatientSelector?: boolean
}

export function AutonomicAnalysis({ selectedPatientId: propPatientId, hidePatientSelector = false }: AutonomicAnalysisProps = {}) {
  const [internalPatientId, setInternalPatientId] = useState("")
  const [analysis, setAnalysis] = useState<AutonomicAnalysisResult | null>(null)

  // propsからpatientIdが渡されている場合はそれを使用、なければ内部stateを使用
  const selectedPatient = propPatientId || internalPatientId

  const handlePatientChange = async (patientId: string) => {
    setInternalPatientId(patientId)
    const result = await analyzeAutonomicNervousSystem(patientId)
    setAnalysis(result)
  }

  // propPatientIdが変更された時に自動的にデータを取得
  React.useEffect(() => {
    if (propPatientId) {
      const fetchData = async () => {
        const result = await analyzeAutonomicNervousSystem(propPatientId)
        setAnalysis(result)
      }
      fetchData()
    }
  }, [propPatientId])

  const chartData = analysis
    ? [
        { name: "交感神経", value: analysis.sympathetic, fill: "#ef4444" },
        { name: "副交感神経", value: analysis.parasympathetic, fill: "#3b82f6" },
      ]
    : []

  return (
    <div className="space-y-6">
      {!hidePatientSelector && (
        <Card>
          <CardHeader>
            <CardTitle>自律神経解析</CardTitle>
            <CardDescription>フーリエ変換による脈拍データの周波数解析</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedPatient} onValueChange={handlePatientChange}>
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
          </CardContent>
        </Card>
      )}

      {analysis && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>自律神経バランス</CardTitle>
                <CardDescription>交感神経と副交感神経の活動比率</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#888" />
                    <YAxis stroke="#888" domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a1a",
                        border: "1px solid #333",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>バランス評価</CardTitle>
                <CardDescription>自律神経の状態評価</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">交感神経活動</span>
                    <span className="text-sm text-muted-foreground">{analysis.sympathetic}%</span>
                  </div>
                  <Progress value={analysis.sympathetic} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">ストレス・活動時に優位</p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">副交感神経活動</span>
                    <span className="text-sm text-muted-foreground">{analysis.parasympathetic}%</span>
                  </div>
                  <Progress value={analysis.parasympathetic} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">リラックス・休息時に優位</p>
                </div>
                <div className="pt-4 border-t border-border">
                  <Badge
                    variant={
                      analysis.balanceStatus === "良好"
                        ? "secondary"
                        : analysis.balanceStatus === "要注意"
                          ? "default"
                          : "destructive"
                    }
                    className="text-base px-4 py-1"
                  >
                    {analysis.balanceStatus}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>周波数解析結果</CardTitle>
              <CardDescription>脈拍データのフーリエ変換による詳細分析</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">LF成分 (低周波)</p>
                  <p className="text-2xl font-bold">{analysis.lfComponent}</p>
                  <p className="text-xs text-muted-foreground mt-1">交感神経・副交感神経</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">HF成分 (高周波)</p>
                  <p className="text-2xl font-bold">{analysis.hfComponent}</p>
                  <p className="text-xs text-muted-foreground mt-1">副交感神経</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">LF/HF比</p>
                  <p className="text-2xl font-bold">{analysis.lfHfRatio}</p>
                  <p className="text-xs text-muted-foreground mt-1">バランス指標</p>
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>解析結果の解釈:</strong> {analysis.interpretation}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>推奨アプローチ</CardTitle>
              <CardDescription>自律神経の状態に基づく支援提案</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    {recommendation.includes("改善") || recommendation.includes("良好") ? (
                      <TrendingUp className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    )}
                    <p className="text-sm">{recommendation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ストレス指標の推移</CardTitle>
              <CardDescription>過去7日間のストレスレベル変化</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analysis.stressTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="day" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a1a",
                      border: "1px solid #333",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="stress" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}

      {!selectedPatient && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>当事者を選択して自律神経解析を表示してください</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
