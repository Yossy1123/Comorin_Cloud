"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Heart,
  Activity,
  Moon,
  MessageSquare,
  Users,
  ClipboardCheck,
  ArrowRight,
} from "lucide-react"
import type { DailyReport } from "@/lib/daily-report"
import { maskPersonalNames } from "@/lib/name-masking"

interface DailyReportViewProps {
  report: DailyReport
}

export function DailyReportView({ report }: DailyReportViewProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "良好":
        return "text-green-600"
      case "要注意":
        return "text-red-600"
      case "普通":
      case "安定":
        return "text-blue-600"
      default:
        return "text-gray-600"
    }
  }

  const getStatusBadge = (status: string): "default" | "secondary" | "destructive" => {
    switch (status) {
      case "良好":
        return "secondary"
      case "要注意":
        return "destructive"
      default:
        return "default"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">ID: {report.patientId} の日報</CardTitle>
              <CardDescription className="text-base mt-1">
                記録日: {new Date(report.reportDate).toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  weekday: "long",
                })}
              </CardDescription>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">総合評価</div>
              <div className="flex items-center gap-2">
                <div className="text-4xl font-bold text-primary">{report.overallRating}</div>
                <div className="text-xl text-muted-foreground">/5</div>
              </div>
              <Progress value={report.overallRating * 20} className="mt-2 w-24" />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Comprehensive Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            総合評価
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">本日の状態</div>
              <div className={`text-xl font-bold ${getStatusColor(report.comprehensiveAssessment.todayStatus)}`}>
                {report.comprehensiveAssessment.todayStatus}
              </div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">精神状態</div>
              <div className="text-lg font-semibold">{report.comprehensiveAssessment.mentalState}</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">身体状態</div>
              <div className="text-lg font-semibold">{report.comprehensiveAssessment.physicalState}</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">社会的関与</div>
              <div className="text-lg font-semibold">{report.comprehensiveAssessment.socialEngagement}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversation Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            会話情報
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">本日の会話セッション:</div>
            <Badge variant={report.conversationSummary.hasConversation ? "secondary" : "default"}>
              {report.conversationSummary.hasConversation ? "実施済み" : "未実施"}
            </Badge>
            {report.conversationSummary.hasConversation && (
              <>
                <div className="text-sm text-muted-foreground ml-4">感情状態:</div>
                <Badge>{report.conversationSummary.emotionalState}</Badge>
              </>
            )}
          </div>

          {report.conversationSummary.hasConversation && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-500" />
                  ポジティブな点
                </h4>
                {report.conversationSummary.positivePoints.length > 0 ? (
                  <ul className="space-y-1 text-sm">
                    {report.conversationSummary.positivePoints.map((point, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-600 dark:text-green-500 mt-1">•</span>
                        <span>{maskPersonalNames(point)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">特記事項なし</p>
                )}
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
                  懸念事項
                </h4>
                {report.conversationSummary.concerns.length > 0 ? (
                  <ul className="space-y-1 text-sm">
                    {report.conversationSummary.concerns.map((concern, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-yellow-600 dark:text-yellow-500 mt-1">•</span>
                        <span>{maskPersonalNames(concern)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">特記事項なし</p>
                )}
              </div>
            </div>
          )}

          {report.conversationSummary.keyTopics.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2">主なトピック:</h4>
              <div className="flex flex-wrap gap-2">
                {report.conversationSummary.keyTopics.map((topic, index) => (
                  <Badge key={index} variant="outline">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vital Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            バイタルデータ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Moon className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">睡眠データ</h4>
              </div>
              <div className="pl-8 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">睡眠時間:</span>
                  <span className="font-semibold">{report.vitalSummary.sleepData.totalHours}時間</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">睡眠スコア:</span>
                  <div className="flex items-center gap-2">
                    <Progress value={report.vitalSummary.sleepData.sleepScore} className="w-24" />
                    <span className="font-semibold">{report.vitalSummary.sleepData.sleepScore}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">睡眠の質:</span>
                  <Badge variant={getStatusBadge(report.vitalSummary.sleepData.quality)}>
                    {report.vitalSummary.sleepData.quality}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">活動データ</h4>
              </div>
              <div className="pl-8 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">歩数:</span>
                  <span className="font-semibold">{report.vitalSummary.activityData.steps.toLocaleString()}歩</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">活動時間:</span>
                  <span className="font-semibold">{report.vitalSummary.activityData.activeMinutes}分</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">活動レベル:</span>
                  <Badge variant={getStatusBadge(report.vitalSummary.activityData.activityLevel)}>
                    {report.vitalSummary.activityData.activityLevel}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <Alert className="mt-4">
            <Heart className="h-4 w-4" />
            <AlertDescription>
              <strong>総合的なコンディション:</strong> {report.vitalSummary.overallCondition}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Support Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            支援活動
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold mb-2">実施した支援:</h4>
            <ul className="space-y-2">
              {report.supportActions.actionsTaken.map((action, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>{maskPersonalNames(action)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">当事者の反応</div>
              <div className="font-semibold">{maskPersonalNames(report.supportActions.patientResponse)}</div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">効果の評価</div>
              <div className="font-semibold">{maskPersonalNames(report.supportActions.effectivenessLevel)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Noteworthy Observations */}
      {report.noteworthyObservations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              特記事項
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {report.noteworthyObservations.map((observation, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span className="text-sm">{maskPersonalNames(observation)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            次回への申し送り・今後の方針
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {report.nextSteps.map((step, index) => (
              <li key={index} className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                <span className="text-sm">{maskPersonalNames(step)}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Supporter Notes */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">支援者所見</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{maskPersonalNames(report.supporterNotes)}</p>
        </CardContent>
      </Card>
    </div>
  )
}

