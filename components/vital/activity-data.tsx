"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { getActivityData, type ActivityDataRecord } from "@/lib/mock-vital"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { Footprints, Flame, TrendingUp, Target, User } from "lucide-react"
import { mockPatients, getDefaultPatientId } from "@/lib/mock-patients"

interface ActivityDataProps {
  selectedPatientId?: string
  hidePatientSelector?: boolean
}

export function ActivityData({ selectedPatientId: propPatientId, hidePatientSelector = false }: ActivityDataProps = {}) {
  const [internalPatientId, setInternalPatientId] = useState<string>(getDefaultPatientId())
  const [activityData, setActivityData] = useState<ActivityDataRecord | null>(null)
  const [loading, setLoading] = useState(true)

  // propsからpatientIdが渡されている場合はそれを使用、なければ内部stateを使用
  const selectedPatientId = propPatientId || internalPatientId

  useEffect(() => {
    if (selectedPatientId) {
      loadActivityData()
    }
  }, [selectedPatientId])

  const loadActivityData = async () => {
    setLoading(true)
    const data = await getActivityData(selectedPatientId)
    setActivityData(data)
    setLoading(false)
  }

  if (loading || !activityData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">データを読み込んでいます...</div>
      </div>
    )
  }

  const stepsProgress = (activityData.today.steps / activityData.today.stepsGoal) * 100
  const caloriesProgress = (activityData.today.calories / activityData.today.caloriesGoal) * 100
  const activeMinutesProgress = (activityData.today.activeMinutes / activityData.today.activeMinutesGoal) * 100

  return (
    <div className="space-y-6">
      {/* 当事者選択 */}
      {!hidePatientSelector && (
        <Card>
          <CardHeader>
            <CardTitle>分析対象の選択</CardTitle>
            <CardDescription>当事者ごとの活動量データを表示します</CardDescription>
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
                <span>ID: {selectedPatientId} の活動データを表示中</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">歩数</CardTitle>
            <Footprints className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activityData.today.steps.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">目標: {activityData.today.stepsGoal.toLocaleString()}歩</p>
            <Progress value={stepsProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">消費カロリー</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activityData.today.calories}</div>
            <p className="text-xs text-muted-foreground">目標: {activityData.today.caloriesGoal} kcal</p>
            <Progress value={caloriesProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活動時間</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activityData.today.activeMinutes}分</div>
            <p className="text-xs text-muted-foreground">目標: {activityData.today.activeMinutesGoal}分</p>
            <Progress value={activeMinutesProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">移動距離</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activityData.today.distance.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">km</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Steps Trend */}
      <Card>
        <CardHeader>
          <CardTitle>週間歩数推移</CardTitle>
          <CardDescription>ID: {selectedPatientId} の過去7日間の歩数データ</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={activityData.weeklySteps}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="steps" stroke="hsl(var(--primary))" strokeWidth={2} name="歩数" />
              <Line
                type="monotone"
                dataKey="goal"
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="5 5"
                name="目標"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Activity Intensity Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>活動強度分布</CardTitle>
          <CardDescription>ID: {selectedPatientId} の今日の活動強度別の時間配分</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={activityData.intensityDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="intensity" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="minutes" fill="hsl(var(--primary))" name="時間(分)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Activity Insights */}
      <Card>
        <CardHeader>
          <CardTitle>活動分析</CardTitle>
          <CardDescription>ID: {selectedPatientId} の活動データに基づく推奨事項</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={activityData.activityLevel === "高" ? "default" : "secondary"}>
                活動レベル: {activityData.activityLevel}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{activityData.interpretation}</p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold">推奨アプローチ</h4>
            <ul className="space-y-2">
              {activityData.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-primary mt-1">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
