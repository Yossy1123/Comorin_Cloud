"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle,
  AlertCircle,
  Target,
  Users,
  TrendingUp,
  Shield,
  Calendar,
  Lightbulb,
  BookOpen,
  ClipboardCheck,
  Heart,
  Activity,
  MessageSquare,
} from "lucide-react"
import type { SupportPlan } from "@/lib/support-plan"

interface SupportPlanViewProps {
  plan: SupportPlan
}

export function SupportPlanView({ plan }: SupportPlanViewProps) {
  const getRiskBadge = (risk: string): "default" | "secondary" | "destructive" => {
    switch (risk) {
      case "低":
        return "secondary"
      case "高":
        return "destructive"
      default:
        return "default"
    }
  }

  const getTermColor = (term: string) => {
    switch (term) {
      case "短期":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "中期":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "長期":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">ID: {plan.patientId} の個別支援計画</CardTitle>
              <CardDescription className="text-base mt-1">
                計画期間: {plan.planPeriod} （策定日: {new Date(plan.planDate).toLocaleDateString("ja-JP")}）
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div className="text-right">
                <div className="text-sm text-muted-foreground">次回評価日</div>
                <div className="font-semibold">
                  {new Date(plan.nextEvaluationDate).toLocaleDateString("ja-JP")}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Assessment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            アセスメント結果
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-semibold">現在の状態:</span>
              <span className="text-lg font-bold">{plan.assessmentSummary.currentStatus}</span>
              <Badge variant={getRiskBadge(plan.assessmentSummary.riskLevel)}>
                リスクレベル: {plan.assessmentSummary.riskLevel}
              </Badge>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700/50">
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-green-700 dark:text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  強み・リソース
                </h4>
                <ul className="space-y-2 text-sm">
                  {plan.assessmentSummary.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
                      <span className="text-foreground">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700/50">
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-orange-700 dark:text-orange-400">
                  <AlertCircle className="h-4 w-4" />
                  課題・支援ニーズ
                </h4>
                <ul className="space-y-2 text-sm">
                  {plan.assessmentSummary.challenges.map((challenge, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-orange-600 dark:text-orange-400 mt-1">!</span>
                      <span className="text-foreground">{challenge}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Heart className="h-4 w-4 text-primary" />
                <h4 className="font-semibold">心理状態</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">感情:</span>
                  <Badge>{plan.assessmentSummary.psychologicalState.emotion}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ストレス:</span>
                  <span className="font-medium">{plan.assessmentSummary.psychologicalState.stressLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">意欲:</span>
                  <span className="font-medium">{plan.assessmentSummary.psychologicalState.motivation}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="h-4 w-4 text-primary" />
                <h4 className="font-semibold">身体状態</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">睡眠:</span>
                  <span className="font-medium">{plan.assessmentSummary.physicalState.sleepQuality}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">活動:</span>
                  <span className="font-medium">{plan.assessmentSummary.physicalState.activityLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">自律神経:</span>
                  <span className="font-medium">{plan.assessmentSummary.physicalState.autonomicBalance}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="h-4 w-4 text-primary" />
                <h4 className="font-semibold">社会性</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">家族関係:</span>
                  <span className="font-medium">{plan.assessmentSummary.socialState.familyRelation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">会話:</span>
                  <span className="font-medium">{plan.assessmentSummary.socialState.communicationSkill}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">外部活動:</span>
                  <span className="font-medium">{plan.assessmentSummary.socialState.externalEngagement}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support Policy */}
      <Card className="border-primary/30">
        <CardHeader className="bg-primary/5">
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            支援方針・ポイント
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div>
            <h4 className="text-sm font-semibold mb-2">基本的なアプローチ</h4>
            <p className="text-sm leading-relaxed bg-muted p-4 rounded-lg">
              {plan.supportPolicy.basicApproach}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                支援のポイント
              </h4>
              <ul className="space-y-2">
                {plan.supportPolicy.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-1">▸</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                留意点
              </h4>
              <ul className="space-y-2">
                {plan.supportPolicy.attentionPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-orange-600 mt-1">!</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            支援目標
          </CardTitle>
          <CardDescription>段階的な目標設定と具体的なアクションプラン</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {plan.goals.map((goal, index) => (
              <div key={index} className="border border-border rounded-lg p-5">
                <div className="flex items-center gap-3 mb-4">
                  <Badge className={getTermColor(goal.term)}>{goal.term}目標</Badge>
                  <span className="text-sm text-muted-foreground">{goal.period}</span>
                  <h4 className="font-bold text-lg flex-1">{goal.goal}</h4>
                </div>

                <div className="space-y-4">
                  <div>
                    <h5 className="text-sm font-semibold mb-2">具体的な取り組み</h5>
                    <ul className="space-y-2">
                      {goal.specificActions.map((action, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="text-sm font-semibold mb-2">達成基準</h5>
                    <div className="flex flex-wrap gap-2">
                      {goal.successCriteria.map((criteria, i) => (
                        <Badge key={i} variant="outline">
                          {criteria}
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

      <Tabs defaultValue="methods">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="methods">支援内容</TabsTrigger>
          <TabsTrigger value="roles">役割分担</TabsTrigger>
          <TabsTrigger value="evaluation">評価指標</TabsTrigger>
          <TabsTrigger value="cases">類似事例</TabsTrigger>
        </TabsList>

        <TabsContent value="methods" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>具体的な支援内容</CardTitle>
              <CardDescription>各支援プログラムの詳細と期待される成果</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {plan.supportMethods.map((method, index) => (
                  <div key={index} className="border-l-4 border-primary pl-4">
                    <div className="mb-3">
                      <h4 className="font-bold text-lg mb-1">{method.category}</h4>
                      <p className="text-sm text-muted-foreground">{method.approach}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-3">
                      <div className="text-sm">
                        <span className="font-semibold">頻度: </span>
                        <span>{method.frequency}</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-semibold">時間: </span>
                        <span>{method.duration}</span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <h5 className="text-sm font-semibold mb-2">実施のポイント</h5>
                      <ul className="space-y-1">
                        {method.keyPoints.map((point, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-primary/5 p-3 rounded-lg">
                      <span className="text-sm font-semibold">期待される成果: </span>
                      <span className="text-sm">{method.expectedOutcome}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                役割分担
              </CardTitle>
              <CardDescription>支援チームの構成と各担当者の責務</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {plan.roleAssignments.map((assignment, index) => (
                  <div key={index} className="border border-border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-bold">{assignment.role}</h4>
                        <p className="text-sm text-muted-foreground">{assignment.name}</p>
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold mb-2">主な責務</h5>
                      <ul className="space-y-1">
                        {assignment.responsibilities.map((resp, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <span className="text-primary mt-1">✓</span>
                            <span>{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evaluation" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                評価指標
              </CardTitle>
              <CardDescription>支援の進捗と効果を測定する指標</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {plan.evaluationMetrics.map((metric, index) => (
                  <div key={index} className="border border-border rounded-lg p-4">
                    <h4 className="font-bold mb-3">{metric.metric}</h4>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-semibold text-muted-foreground">測定方法</span>
                        <p className="mt-1">{metric.method}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-muted-foreground">評価頻度</span>
                        <p className="mt-1">{metric.frequency}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-muted-foreground">目標値</span>
                        <p className="mt-1">{metric.target}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cases" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                類似事例の参照
              </CardTitle>
              <CardDescription>過去の成功事例から学ぶ効果的なアプローチ</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {plan.similarCases.map((case_, index) => (
                  <div key={index} className="border border-primary/20 rounded-lg p-5 bg-primary/5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-bold text-lg">{case_.caseId}</h4>
                          <Badge variant="default">類似度 {case_.similarity}%</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{case_.overview}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h5 className="text-sm font-semibold mb-1">効果的だったアプローチ</h5>
                        <p className="text-sm bg-background p-3 rounded">{case_.effectiveApproach}</p>
                      </div>

                      <div>
                        <h5 className="text-sm font-semibold mb-2">本ケースへの応用ポイント</h5>
                        <ul className="space-y-1">
                          {case_.applicationPoints.map((point, i) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                              <span className="text-primary mt-1">→</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Risk Management */}
      <Card className="border-orange-200 dark:border-orange-700/50">
        <CardHeader className="bg-orange-50 dark:bg-orange-900/20">
          <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
            <Shield className="h-5 w-5" />
            リスク管理
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div>
            <h4 className="text-sm font-semibold mb-3">想定されるリスク</h4>
            <ul className="space-y-2">
              {plan.riskManagement.identifiedRisks.map((risk, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">予防的対策</h4>
            <ul className="space-y-2">
              {plan.riskManagement.preventiveMeasures.map((measure, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Shield className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{measure}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">緊急連絡先</h4>
            <ul className="space-y-2">
              {plan.riskManagement.emergencyContact.map((contact, index) => (
                <li key={index} className="text-sm bg-muted p-2 rounded">
                  {contact}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">備考・特記事項</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{plan.notes}</p>
        </CardContent>
      </Card>
    </div>
  )
}

