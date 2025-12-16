"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { getSleepData, type SleepDataRecord } from "@/lib/mock-vital"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts"
import { Moon, Clock, TrendingUp, Zap, User } from "lucide-react"
import { mockPatients, getDefaultPatientId } from "@/lib/mock-patients"

interface SleepDataProps {
  selectedPatientId?: string
  hidePatientSelector?: boolean
}

export function SleepData({ selectedPatientId: propPatientId, hidePatientSelector = false }: SleepDataProps = {}) {
  const [internalPatientId, setInternalPatientId] = useState<string>(getDefaultPatientId())
  const [sleepData, setSleepData] = useState<SleepDataRecord | null>(null)
  const [loading, setLoading] = useState(true)

  // propsからpatientIdが渡されている場合はそれを使用、なければ内部stateを使用
  const selectedPatientId = propPatientId || internalPatientId

  useEffect(() => {
    if (selectedPatientId) {
      loadSleepData()
    }
  }, [selectedPatientId])

  const loadSleepData = async () => {
    setLoading(true)
    const data = await getSleepData(selectedPatientId)
    setSleepData(data)
    setLoading(false)
  }

  if (loading || !sleepData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">データを読み込んでいます...</div>
      </div>
    )
  }

  const sleepGoalProgress = (sleepData.lastNight.totalMinutes / (sleepData.sleepGoal * 60)) * 100

  // 睡眠ステージごとの色定義（視認性の高い色）
  const sleepStageColors: Record<string, string> = {
    覚醒: "#ef4444", // 赤（覚醒は注意が必要な状態）
    "浅い睡眠": "#3b82f6", // 青（浅い睡眠）
    "深い睡眠": "#8b5cf6", // 紫（深い睡眠）
    "レム睡眠": "#10b981", // 緑（レム睡眠）
  }

  return (
    <div className="space-y-6">
      {/* 当事者選択 */}
      {!hidePatientSelector && (
        <Card>
          <CardHeader>
            <CardTitle>分析対象の選択</CardTitle>
            <CardDescription>当事者ごとの睡眠データを表示します</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>当事者を選択</Label>
              <Select value={selectedPatientId} onValueChange={setInternalPatientId}>
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
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>ID: {selectedPatientId} の睡眠データを表示中</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Last Night Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総睡眠時間</CardTitle>
            <Moon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(sleepData.lastNight.totalMinutes / 60).toFixed(1)}時間</div>
            <p className="text-xs text-muted-foreground">目標: {sleepData.sleepGoal}時間</p>
            <Progress value={sleepGoalProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">睡眠効率</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sleepData.lastNight.efficiency}%</div>
            <p className="text-xs text-muted-foreground">
              {sleepData.lastNight.efficiency >= 85 ? "良好" : sleepData.lastNight.efficiency >= 75 ? "普通" : "要改善"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">入眠時刻</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sleepData.lastNight.bedTime}</div>
            <p className="text-xs text-muted-foreground">起床: {sleepData.lastNight.wakeTime}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">睡眠スコア</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sleepData.lastNight.sleepScore}</div>
            <p className="text-xs text-muted-foreground">100点満点</p>
          </CardContent>
        </Card>
      </div>

      {/* Sleep Stages */}
      <Card>
        <CardHeader>
          <CardTitle>睡眠ステージ分布</CardTitle>
          <CardDescription>ID: {selectedPatientId} の昨夜の睡眠段階別の時間配分</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sleepData.lastNight.stages}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="stage" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="minutes" name="時間(分)">
                {sleepData.lastNight.stages.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={sleepStageColors[entry.stage] || "#3b82f6"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Weekly Sleep Trend */}
      <Card>
        <CardHeader>
          <CardTitle>週間睡眠推移</CardTitle>
          <CardDescription>ID: {selectedPatientId} の過去7日間の睡眠時間とスコア</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sleepData.weeklySleep}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
              <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" />
              <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="hours"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                name="睡眠時間(h)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="score"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                name="スコア"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Sleep Quality Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>睡眠品質分析</CardTitle>
          <CardDescription>ID: {selectedPatientId} の睡眠データに基づく推奨事項</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={sleepData.sleepQuality === "良好" ? "default" : "secondary"}>
                睡眠品質: {sleepData.sleepQuality}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{sleepData.interpretation}</p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold">推奨アプローチ</h4>
            <ul className="space-y-2">
              {sleepData.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-primary mt-1">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm font-medium">平均入眠時間</p>
              <p className="text-2xl font-bold">{sleepData.avgBedTime}</p>
            </div>
            <div>
              <p className="text-sm font-medium">平均起床時間</p>
              <p className="text-2xl font-bold">{sleepData.avgWakeTime}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
