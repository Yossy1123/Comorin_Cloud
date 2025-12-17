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

        {/* 背景・経過（基本情報 + 相談・経過情報 + ひきこもりの経過 + 生育歴 + 学歴・就労歴） */}
        <TabsContent value="background" className="space-y-4 mt-6">
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
                <InfoItem label="記入日" value={data.basicInfo.recordDate} />
                <InfoItem label="受付日" value={data.basicInfo.receptionDate} />
                <InfoItem label="相談経路" value={data.basicInfo.consultationRoute} />
                <InfoItem label="担当者名" value={data.basicInfo.staffName} />
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">対象者情報</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <InfoItem label="性別" value={data.basicInfo.gender} />
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">相談者情報</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <InfoItem label="続柄" value={data.basicInfo.relationship} />
                  <InfoItem label="同居/非同居" value={data.basicInfo.livingTogether} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                相談・経過情報
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <InfoItem label="相談経路" value={data.consultationHistory.consultationRoute} />
                <InfoItem label="初回相談日" value={data.consultationHistory.firstConsultationDate} />
                <InfoItem
                  label="初回相談機関"
                  value={data.consultationHistory.firstConsultationOrganization}
                />
                <InfoItem
                  label="相談歴"
                  value={data.consultationHistory.hasConsultationHistory ? "有" : "無"}
                  badge={data.consultationHistory.hasConsultationHistory}
                />
              </div>
              {data.consultationHistory.consultationHistoryDetails && (
                <InfoItem
                  label="相談歴詳細"
                  value={data.consultationHistory.consultationHistoryDetails}
                  fullWidth
                />
              )}

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">受診歴</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <InfoItem
                    label="受診歴"
                    value={data.consultationHistory.hasMedicalHistory ? "有" : "無"}
                    badge={data.consultationHistory.hasMedicalHistory}
                  />
                  {data.consultationHistory.hasMedicalHistory && (
                    <>
                      <InfoItem label="診断名" value={data.consultationHistory.diagnosis} important />
                      <InfoItem label="医療機関名" value={data.consultationHistory.medicalInstitution} />
                      <InfoItem label="期間" value={data.consultationHistory.medicalPeriod} />
                    </>
                  )}
                </div>
              </div>

              {data.consultationHistory.socialResourcesUsed && (
                <>
                  <Separator />
                  <InfoItem
                    label="社会資源利用歴"
                    value={data.consultationHistory.socialResourcesUsed}
                    fullWidth
                  />
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                ひきこもりの経過
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <InfoItem label="開始時期" value={data.hikikomoriHistory.startDate} important />
                <InfoItem label="状態" value={data.hikikomoriHistory.statusType} />
                <InfoItem label="継続期間" value={data.hikikomoriHistory.currentDuration} />
                <InfoItem label="頻度" value={data.hikikomoriHistory.frequency} />
              </div>

              {data.hikikomoriHistory.trigger && (
                <InfoItem
                  label="きっかけ・経緯"
                  value={data.hikikomoriHistory.trigger}
                  fullWidth
                  important
                />
              )}

              {data.hikikomoriHistory.goingOutStatus && (
                <InfoItem label="外出状況" value={data.hikikomoriHistory.goingOutStatus} fullWidth />
              )}

              {data.hikikomoriHistory.lifeChanges && (
                <InfoItem label="生活の変化" value={data.hikikomoriHistory.lifeChanges} fullWidth />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                生育歴・家族構成
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoItem label="出生状況" value={data.developmentalHistory.birthCircumstances} fullWidth />
              <InfoItem
                label="幼少期の特徴"
                value={data.developmentalHistory.childhoodCharacteristics}
                fullWidth
              />
              <InfoItem label="家族構成" value={data.developmentalHistory.familyStructure} fullWidth />
              <InfoItem
                label="家族関係"
                value={data.developmentalHistory.familyRelationships}
                fullWidth
              />
              <InfoItem
                label="対人関係"
                value={data.developmentalHistory.interpersonalRelationships}
                fullWidth
              />
              <InfoItem
                label="養育者との関係"
                value={data.developmentalHistory.caregiverRelationship}
                fullWidth
              />
              {data.developmentalHistory.specialNotes && (
                <InfoItem label="特記事項" value={data.developmentalHistory.specialNotes} fullWidth />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                学歴・就労歴
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-3">学歴</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <InfoItem label="学歴" value={data.educationEmploymentHistory.education} fullWidth />
                  <InfoItem
                    label="不登校歴"
                    value={data.educationEmploymentHistory.hasTruancy ? "有" : "無"}
                    badge={data.educationEmploymentHistory.hasTruancy}
                  />
                </div>
                {data.educationEmploymentHistory.truancyDetails && (
                  <InfoItem
                    label="不登校詳細"
                    value={data.educationEmploymentHistory.truancyDetails}
                    fullWidth
                  />
                )}
                {data.educationEmploymentHistory.schoolEpisodes && (
                  <InfoItem
                    label="学校でのエピソード"
                    value={data.educationEmploymentHistory.schoolEpisodes}
                    fullWidth
                  />
                )}
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">就労歴</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <InfoItem
                    label="就労歴"
                    value={data.educationEmploymentHistory.hasEmploymentHistory ? "有" : "無"}
                    badge={data.educationEmploymentHistory.hasEmploymentHistory}
                  />
                  {data.educationEmploymentHistory.hasEmploymentHistory && (
                    <>
                      <InfoItem label="雇用形態" value={data.educationEmploymentHistory.employmentType} />
                      <InfoItem label="期間" value={data.educationEmploymentHistory.employmentPeriod} />
                      <InfoItem
                        label="転職回数"
                        value={
                          data.educationEmploymentHistory.jobChangeCount
                            ? `${data.educationEmploymentHistory.jobChangeCount}回`
                            : undefined
                        }
                      />
                      <InfoItem
                        label="最長勤務期間"
                        value={data.educationEmploymentHistory.longestEmploymentPeriod}
                      />
                    </>
                  )}
                </div>
                {data.educationEmploymentHistory.reasonForLeaving && (
                  <InfoItem
                    label="退職理由"
                    value={data.educationEmploymentHistory.reasonForLeaving}
                    fullWidth
                  />
                )}
                {data.educationEmploymentHistory.workplaceRelationships && (
                  <InfoItem
                    label="職場での対人関係"
                    value={data.educationEmploymentHistory.workplaceRelationships}
                    fullWidth
                  />
                )}
                {data.educationEmploymentHistory.employmentSupportHistory && (
                  <InfoItem
                    label="就労支援機関利用歴"
                    value={data.educationEmploymentHistory.employmentSupportHistory}
                    fullWidth
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ⑥ 現在の生活状況 */}
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
                  <InfoItem label="起床時刻" value={data.currentLifeStatus.wakeUpTime} />
                  <InfoItem label="就寝時刻" value={data.currentLifeStatus.bedTime} />
                  <InfoItem
                    label="昼夜逆転"
                    value={data.currentLifeStatus.hasDayNightReversal ? "有" : "無"}
                    badge={data.currentLifeStatus.hasDayNightReversal}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">食事・入浴</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <InfoItem label="食事回数" value={data.currentLifeStatus.mealFrequency} />
                  <InfoItem
                    label="家族と一緒"
                    value={data.currentLifeStatus.eatsWithFamily ? "はい" : "いいえ"}
                  />
                  <InfoItem label="食事の問題" value={data.currentLifeStatus.hasEatingIssues} />
                  <InfoItem label="入浴頻度" value={data.currentLifeStatus.bathingFrequency} />
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">趣味・外出</h4>
                <InfoItem label="趣味・興味" value={data.currentLifeStatus.hobbiesInterests} fullWidth />
                <div className="grid gap-4 md:grid-cols-2 mt-4">
                  <InfoItem label="外出頻度" value={data.currentLifeStatus.goingOutFrequency} />
                  <InfoItem label="外出範囲" value={data.currentLifeStatus.goingOutRange} />
                  <InfoItem label="外出目的" value={data.currentLifeStatus.goingOutPurpose} />
                  <InfoItem label="同行者" value={data.currentLifeStatus.companion} />
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">交流状況</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <InfoItem label="家族内交流" value={data.currentLifeStatus.familyInteraction} />
                  <InfoItem label="家族外交流" value={data.currentLifeStatus.outsideInteraction} />
                  <InfoItem label="SNS利用" value={data.currentLifeStatus.snsUsage} />
                  <InfoItem label="友人関係" value={data.currentLifeStatus.friendRelationships} />
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">生活技能・経済状況</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <InfoItem label="身だしなみ" value={data.currentLifeStatus.grooming} />
                  <InfoItem label="経済状況" value={data.currentLifeStatus.economicStatus} />
                </div>
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h5 className="font-medium mb-2 text-sm">生活技能</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <SkillBadge label="調理" hasSkill={data.currentLifeStatus.cookingSkill} />
                    <SkillBadge label="洗濯" hasSkill={data.currentLifeStatus.laundrySkill} />
                    <SkillBadge label="掃除" hasSkill={data.currentLifeStatus.cleaningSkill} />
                    <SkillBadge label="金銭管理" hasSkill={data.currentLifeStatus.moneyManagement} />
                  </div>
                </div>
                {data.currentLifeStatus.availableMoney && (
                  <InfoItem label="本人が使える金額" value={data.currentLifeStatus.availableMoney} />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                問題行動・心理的特徴
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-3">問題行動</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <BehaviorBadge
                    label="家庭内暴力"
                    present={data.behavioralPsychologicalFeatures.domesticViolence}
                  />
                  <BehaviorBadge label="暴言" present={data.behavioralPsychologicalFeatures.verbalAbuse} />
                  <BehaviorBadge
                    label="器物破損"
                    present={data.behavioralPsychologicalFeatures.propertyDamage}
                  />
                  <BehaviorBadge
                    label="強迫行為"
                    present={data.behavioralPsychologicalFeatures.compulsiveBehavior}
                  />
                  <BehaviorBadge label="自傷行為" present={data.behavioralPsychologicalFeatures.selfHarm} />
                  <BehaviorBadge
                    label="浪費"
                    present={data.behavioralPsychologicalFeatures.excessiveSpending}
                  />
                  <BehaviorBadge
                    label="依存行動"
                    present={data.behavioralPsychologicalFeatures.addictiveBehavior}
                  />
                </div>
              </div>

              {data.behavioralPsychologicalFeatures.psychologicalFeatures && (
                <>
                  <Separator />
                  <Alert>
                    <AlertDescription>
                      <strong>精神的特徴：</strong>
                      <p className="mt-2">{data.behavioralPsychologicalFeatures.psychologicalFeatures}</p>
                    </AlertDescription>
                  </Alert>
                </>
              )}

              {data.behavioralPsychologicalFeatures.specialNotes && (
                <>
                  <Separator />
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>支援時の注意点：</strong>
                      <p className="mt-2">{data.behavioralPsychologicalFeatures.specialNotes}</p>
                    </AlertDescription>
                  </Alert>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                アセスメント補足
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.assessmentSupplement.childhoodEpisodes && (
                <InfoItem
                  label="育ちのエピソード"
                  value={data.assessmentSupplement.childhoodEpisodes}
                  fullWidth
                />
              )}
              {data.assessmentSupplement.specialNotes && (
                <InfoItem label="特記事項" value={data.assessmentSupplement.specialNotes} fullWidth />
              )}
              {data.assessmentSupplement.informationSharingOrganizations && (
                <InfoItem
                  label="情報提供先・連携機関"
                  value={data.assessmentSupplement.informationSharingOrganizations}
                  fullWidth
                />
              )}
              {data.assessmentSupplement.recordedBy && (
                <InfoItem label="記録者" value={data.assessmentSupplement.recordedBy} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ⑧ 希望・支援ニーズ */}
        <TabsContent value="support" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                希望・支援ニーズ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.supportNeeds.subjectHope && (
                <Alert className="bg-blue-500/10 border-blue-500/50">
                  <AlertDescription>
                    <strong>本人の希望：</strong>
                    <p className="mt-2">{data.supportNeeds.subjectHope}</p>
                  </AlertDescription>
                </Alert>
              )}

              {data.supportNeeds.familyHope && (
                <Alert className="bg-green-500/10 border-green-500/50">
                  <AlertDescription>
                    <strong>家族の希望：</strong>
                    <p className="mt-2">{data.supportNeeds.familyHope}</p>
                  </AlertDescription>
                </Alert>
              )}

              {data.supportNeeds.necessarySupport && (
                <>
                  <Separator />
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <h4 className="font-semibold mb-2">今後必要と思われる支援</h4>
                    <p className="text-sm">{data.supportNeeds.necessarySupport}</p>
                  </div>
                </>
              )}

              {data.supportNeeds.partnerOrganizations && (
                <>
                  <Separator />
                  <InfoItem
                    label="支援機関連携"
                    value={data.supportNeeds.partnerOrganizations}
                    fullWidth
                  />
                </>
              )}
            </CardContent>
          </Card>
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

interface SkillBadgeProps {
  label: string
  hasSkill?: boolean
}

function SkillBadge({ label, hasSkill }: SkillBadgeProps) {
  return (
    <div
      className={`flex items-center gap-2 text-xs p-2 rounded ${
        hasSkill ? "bg-green-500/20 text-green-700 dark:text-green-400" : "bg-gray-500/20 text-gray-600 dark:text-gray-400"
      }`}
    >
      {hasSkill ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
      <span>{label}</span>
    </div>
  )
}

interface BehaviorBadgeProps {
  label: string
  present?: boolean
}

function BehaviorBadge({ label, present }: BehaviorBadgeProps) {
  return (
    <Badge variant={present ? "destructive" : "outline"} className="justify-center">
      {label}: {present ? "有" : "無"}
    </Badge>
  )
}

