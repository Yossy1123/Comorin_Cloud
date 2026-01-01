"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  User,
  FileText,
  Clock,
  Users,
  GraduationCap,
  Briefcase,
  Home,
  AlertTriangle,
  Heart,
  ClipboardList,
  CheckCircle,
  XCircle,
} from "lucide-react"
import type { AssessmentData } from "@/types/assessment"

interface AssessmentViewerProps {
  data: AssessmentData | null
}

export function AssessmentViewer({ data }: AssessmentViewerProps) {
  if (!data) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>アセスメントデータがありません</p>
          <p className="text-sm mt-2">「テキスト入力」タブからデータを抽出してください</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* メタ情報 */}
      <Card>
        <CardHeader>
          <CardTitle>抽出情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">抽出日時:</span>
            <span className="font-medium">
              {data.createdAt ? new Date(data.createdAt).toLocaleString("ja-JP") : "不明"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">抽出精度:</span>
            <Badge variant={data.extractionConfidence && data.extractionConfidence >= 70 ? "default" : "secondary"}>
              {data.extractionConfidence || 0}%
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="background" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="background">背景・経過</TabsTrigger>
          <TabsTrigger value="life">生活状況</TabsTrigger>
          <TabsTrigger value="support">支援ニーズ</TabsTrigger>
        </TabsList>

        {/* タブ1: 背景・経過 */}
        <TabsContent value="background" className="space-y-4 mt-6">
          {/* 基本情報 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                基本情報
              </CardTitle>
              <CardDescription className="text-xs">
                ※個人情報保護のため、氏名・住所・連絡先は記録していません
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <InfoItem label="年齢" value={data.basicInfo.age} />
                <InfoItem label="経済状況" value={data.basicInfo.economicStatus} />
                <InfoItem label="家族構成" value={data.basicInfo.familyStructure} fullWidth />
              </div>
              {data.basicInfo.consultationContent && (
                <>
                  <Separator />
                  <InfoItem label="相談内容" value={data.basicInfo.consultationContent} fullWidth />
                </>
              )}
            </CardContent>
          </Card>

          {/* ひきこもり歴・経緯 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                ひきこもり歴・経緯
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <InfoItem label="ひきこもり歴" value={data.hikikomoriHistory.duration} important />
                {data.hikikomoriHistory.triggerCategories && data.hikikomoriHistory.triggerCategories.length > 0 && (
                  <div className="col-span-full">
                    <div className="text-sm font-medium text-muted-foreground mb-2">きっかけ（カテゴリ）</div>
                    <div className="flex flex-wrap gap-2">
                      {data.hikikomoriHistory.triggerCategories.map((cat, idx) => (
                        <Badge key={idx} variant="secondary">{cat}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {data.hikikomoriHistory.trigger && (
                <InfoItem
                  label="きっかけ・経緯"
                  value={data.hikikomoriHistory.trigger}
                  fullWidth
                  important
                />
              )}

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">相談経験</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <InfoItem
                    label="相談歴"
                    value={data.hikikomoriHistory.hasConsultationHistory ? "有" : "無"}
                    badge={data.hikikomoriHistory.hasConsultationHistory}
                  />
                  {data.hikikomoriHistory.hasConsultationHistory && (
                    <>
                      <InfoItem label="相談先" value={data.hikikomoriHistory.consultationDestination} />
                      <InfoItem label="相談時期" value={data.hikikomoriHistory.consultationDate} />
                    </>
                  )}
                </div>
                {data.hikikomoriHistory.consultationDetails && (
                  <InfoItem
                    label="相談経緯（支援や対応など）"
                    value={data.hikikomoriHistory.consultationDetails}
                    fullWidth
                  />
                )}
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">受診・治療の経験</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <InfoItem
                    label="受診・治療経験"
                    value={data.hikikomoriHistory.hasMedicalHistory ? "有" : "無"}
                    badge={data.hikikomoriHistory.hasMedicalHistory}
                  />
                  {data.hikikomoriHistory.hasMedicalHistory && (
                    <>
                      <InfoItem label="診断名" value={data.hikikomoriHistory.diagnosis} important />
                      <InfoItem label="初診日" value={data.hikikomoriHistory.firstVisitDate} />
                      <InfoItem label="受診期間" value={data.hikikomoriHistory.treatmentPeriod} />
                      <InfoItem label="精神科以外の受診歴" value={data.hikikomoriHistory.otherMedicalHistory} fullWidth />
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 育ちのエピソード */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                育ちのエピソード
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.developmentalHistory.episodeCategories && data.developmentalHistory.episodeCategories.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">キーワード</div>
                  <div className="flex flex-wrap gap-2">
                    {data.developmentalHistory.episodeCategories.map((cat, idx) => (
                      <Badge key={idx} variant="outline">{cat}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <InfoItem label="幼少期" value={data.developmentalHistory.childhoodEpisode} fullWidth />
              <InfoItem label="小学校" value={data.developmentalHistory.elementarySchoolEpisode} fullWidth />
              <InfoItem label="中学校" value={data.developmentalHistory.juniorHighSchoolEpisode} fullWidth />
              <InfoItem label="高校" value={data.developmentalHistory.highSchoolEpisode} fullWidth />
              <InfoItem label="大学・専門学校" value={data.developmentalHistory.collegeEpisode} fullWidth />

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <InfoItem label="最終学歴" value={data.developmentalHistory.finalEducation} />
                <InfoItem label="在学状況" value={data.developmentalHistory.educationStatus} />
              </div>
            </CardContent>
          </Card>

          {/* 就労経験 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                就労経験
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.employmentHistory.employmentRecords && data.employmentHistory.employmentRecords.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">就労歴</h4>
                  <div className="space-y-3">
                    {data.employmentHistory.employmentRecords.map((record, idx) => (
                      <div key={idx} className="p-3 bg-muted rounded-lg">
                        <div className="grid gap-2 md:grid-cols-3 text-sm">
                          {record.age && <div><span className="text-muted-foreground">年齢:</span> {record.age}</div>}
                          {record.period && <div><span className="text-muted-foreground">期間:</span> {record.period}</div>}
                          {record.jobContent && <div className="md:col-span-3"><span className="text-muted-foreground">内容:</span> {record.jobContent}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data.employmentHistory.otherEmployment && data.employmentHistory.otherEmployment.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-2">その他の就労</div>
                    <div className="flex flex-wrap gap-2">
                      {data.employmentHistory.otherEmployment.map((emp, idx) => (
                        <Badge key={idx} variant="secondary">{emp}</Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {data.employmentHistory.licenses && (
                <>
                  <Separator />
                  <InfoItem label="免許・資格" value={data.employmentHistory.licenses} fullWidth />
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* タブ2: 生活状況 */}
        <TabsContent value="life" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                現在の生活状況
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-3">睡眠</h4>
                <div className="grid gap-4 md:grid-cols-3">
                  <InfoItem label="起床" value={data.currentLifeStatus.wakeUpTime} />
                  <InfoItem label="就寝" value={data.currentLifeStatus.bedTime} />
                  <InfoItem
                    label="昼夜逆転"
                    value={data.currentLifeStatus.hasDayNightReversal ? "有" : "無"}
                    badge={data.currentLifeStatus.hasDayNightReversal}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">食事</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <InfoItem label="食事回数" value={data.currentLifeStatus.mealFrequency} />
                  <InfoItem label="家族と" value={data.currentLifeStatus.mealsWithFamily} />
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">入浴</h4>
                <InfoItem label="入浴頻度" value={data.currentLifeStatus.bathingFrequency} />
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">趣味</h4>
                {data.currentLifeStatus.hobbies && data.currentLifeStatus.hobbies.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {data.currentLifeStatus.hobbies.map((hobby, idx) => (
                      <Badge key={idx} variant="secondary">{hobby}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">趣味の情報はありません</p>
                )}
                {data.currentLifeStatus.availableMoney && (
                  <div className="mt-3">
                    <InfoItem label="本人の使える金銭" value={data.currentLifeStatus.availableMoney} />
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">外出</h4>
                <InfoItem label="外出状況" value={data.currentLifeStatus.goingOutStatus} fullWidth />
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">交流</h4>
                {data.currentLifeStatus.socialInteraction && data.currentLifeStatus.socialInteraction.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {data.currentLifeStatus.socialInteraction.map((interaction, idx) => (
                      <Badge key={idx} variant="outline">{interaction}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">交流の情報はありません</p>
                )}
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">身だしなみ</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <InfoItem label="身だしなみ" value={data.currentLifeStatus.grooming} />
                  {data.currentLifeStatus.groomingDetails && (
                    <InfoItem label="詳細" value={data.currentLifeStatus.groomingDetails} />
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">生活技能</h4>
                {data.currentLifeStatus.lifeSkills && data.currentLifeStatus.lifeSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {data.currentLifeStatus.lifeSkills.map((skill, idx) => (
                      <Badge key={idx} variant="default" className="bg-green-500">{skill}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">生活技能の情報はありません</p>
                )}
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">問題行動</h4>
                {data.currentLifeStatus.problemBehaviors && data.currentLifeStatus.problemBehaviors.length > 0 ? (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {data.currentLifeStatus.problemBehaviors.map((behavior, idx) => (
                          <Badge key={idx} variant="destructive">{behavior}</Badge>
                        ))}
                      </div>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <p className="text-sm text-muted-foreground">問題行動の報告はありません</p>
                )}
              </div>

              {data.currentLifeStatus.currentSpecialNotes && (
                <>
                  <Separator />
                  <Alert>
                    <AlertDescription>
                      <strong>特記事項（現在）：</strong>
                      <p className="mt-2 whitespace-pre-wrap">{data.currentLifeStatus.currentSpecialNotes}</p>
                    </AlertDescription>
                  </Alert>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* タブ3: 支援ニーズ */}
        <TabsContent value="support" className="space-y-4 mt-6">
          {/* 本人の希望 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-blue-500" />
                本人の希望
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.supportNeeds.subjectHope ? (
                <div className="p-4 bg-blue-500/5 rounded-lg border border-blue-500/20">
                  <p className="text-sm whitespace-pre-wrap">{data.supportNeeds.subjectHope}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">本人の希望は記録されていません</p>
              )}
            </CardContent>
          </Card>

          {/* 家族の希望 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-green-500" />
                家族の希望
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.supportNeeds.familyHope ? (
                <div className="p-4 bg-green-500/5 rounded-lg border border-green-500/20">
                  <p className="text-sm whitespace-pre-wrap">{data.supportNeeds.familyHope}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">家族の希望は記録されていません</p>
              )}
            </CardContent>
          </Card>

          {/* 家族関係・特記事項 */}
          {data.supportNeeds.familyRelationshipNotes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  家族関係・特記事項
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{data.supportNeeds.familyRelationshipNotes}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 今後必要と思われる支援 */}
          {data.supportNeeds.necessarySupport && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  今後必要と思われる支援
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-sm whitespace-pre-wrap">{data.supportNeeds.necessarySupport}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ヘルパーコンポーネント

interface InfoItemProps {
  label: string
  value?: string | number
  fullWidth?: boolean
  important?: boolean
  badge?: boolean
}

function InfoItem({ label, value, fullWidth = false, important = false, badge = false }: InfoItemProps) {
  if (!value && value !== 0) return null

  return (
    <div className={fullWidth ? "col-span-full" : ""}>
      <div className="space-y-1">
        <div className="text-sm font-medium text-muted-foreground">{label}</div>
        <div className={`text-sm ${important ? "font-semibold text-foreground" : ""}`}>
          {badge ? <Badge variant="secondary">{value}</Badge> : value}
        </div>
      </div>
    </div>
  )
}
