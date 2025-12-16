"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, TrendingUp, Users, Clock, Heart, Brain } from "lucide-react"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export function DashboardOverview() {
  const stats = [
    {
      title: "担当当事者数",
      value: "12",
      description: "前月比 +2名",
      icon: Users,
      trend: "up",
    },
    {
      title: "今週の会話セッション",
      value: "24",
      description: "平均 2回/日",
      icon: Activity,
      trend: "up",
    },
    {
      title: "平均支援継続期間",
      value: "8.5ヶ月",
      description: "目標: 6ヶ月以内",
      icon: Clock,
      trend: "down",
    },
    {
      title: "支援効果スコア",
      value: "78%",
      description: "前月比 +5%",
      icon: TrendingUp,
      trend: "up",
    },
  ]

  // Mock data for charts
  const weeklyActivityData = [
    { day: "月", sessions: 3, vitals: 12 },
    { day: "火", sessions: 4, vitals: 12 },
    { day: "水", sessions: 2, vitals: 12 },
    { day: "木", sessions: 5, vitals: 12 },
    { day: "金", sessions: 3, vitals: 12 },
    { day: "土", sessions: 2, vitals: 12 },
    { day: "日", sessions: 1, vitals: 12 },
  ]

  const supportProgressData = [
    { month: "8月", score: 45 },
    { month: "9月", score: 52 },
    { month: "10月", score: 58 },
    { month: "11月", score: 65 },
    { month: "12月", score: 72 },
    { month: "1月", score: 78 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">ダッシュボード</h2>
        <p className="text-muted-foreground mt-2">支援活動の概要と主要指標</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>週間活動状況</CardTitle>
            <CardDescription>会話セッションとバイタルデータ収集</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyActivityData}>
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
                <Bar dataKey="sessions" fill="#3b82f6" name="会話セッション" radius={[8, 8, 0, 0]} />
                <Bar dataKey="vitals" fill="#10b981" name="バイタル記録" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>支援効果の推移</CardTitle>
            <CardDescription>過去6ヶ月の総合スコア</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={supportProgressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="month" stroke="#888" />
                <YAxis stroke="#888" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #333",
                    borderRadius: "8px",
                  }}
                />
                <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>最近の活動</CardTitle>
            <CardDescription>直近の支援セッション</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 【匿名化対応】名前の代わりにIDを使用 */}
              {[
                { patientId: "25-001", time: "2時間前", status: "会話セッション完了", icon: Activity },
                { patientId: "25-002", time: "5時間前", status: "バイタルデータ更新", icon: Heart },
                { patientId: "25-003", time: "1日前", status: "AI分析完了", icon: Brain },
              ].map((activity, i) => {
                const Icon = activity.icon
                return (
                  <div key={i} className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">ID: {activity.patientId}</p>
                      <p className="text-xs text-muted-foreground">{activity.status}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>注意が必要な当事者</CardTitle>
            <CardDescription>優先的な対応が推奨されます</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 【匿名化対応】名前の代わりにIDを使用 */}
              {[
                { patientId: "25-004", reason: "ストレスレベル上昇", priority: "high" },
                { patientId: "25-005", reason: "会話頻度低下", priority: "medium" },
              ].map((alert, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted">
                  <div
                    className={`h-3 w-3 rounded-full ${alert.priority === "high" ? "bg-destructive" : "bg-yellow-500"}`}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">ID: {alert.patientId}</p>
                    <p className="text-xs text-muted-foreground">{alert.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
