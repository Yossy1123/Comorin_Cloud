"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  User,
  Clock,
  Users,
  Briefcase,
  Home,
  Heart,
  ClipboardList,
  Edit,
  Save,
  X,
  Loader2,
  CheckCircle,
  AlertTriangle,
} from "lucide-react"
import type { AssessmentData } from "@/types/assessment"
import { useToast } from "@/hooks/use-toast"

interface AssessmentEditorProps {
  data: AssessmentData
  onSave?: (updatedData: AssessmentData) => void
  onCancel?: () => void
  readOnly?: boolean
}

export function AssessmentEditor({ data, onSave, onCancel, readOnly = false }: AssessmentEditorProps) {
  const [editedData, setEditedData] = useState<AssessmentData>(data)
  const [isEditing, setIsEditing] = useState(false) // デフォルトは閲覧モード
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  // dataプロップが変更されたらeditedDataも更新
  useEffect(() => {
    setEditedData(data)
  }, [data])

  const handleSave = async () => {
    if (!editedData.id) {
      toast({
        title: "エラー",
        description: "アセスメントIDが見つかりません",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`/api/assessment/${editedData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "保存に失敗しました")
      }

      const result = await response.json()
      toast({
        title: "保存完了",
        description: "アセスメントを更新しました",
      })

      setIsEditing(false)
      if (onSave) {
        onSave(result.data)
      }
    } catch (error) {
      toast({
        title: "エラー",
        description: error instanceof Error ? error.message : "保存中にエラーが発生しました",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditedData(data)
    setIsEditing(false)
    if (onCancel) {
      onCancel()
    }
  }

  const updateField = (section: keyof AssessmentData, field: string, value: any) => {
    setEditedData((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value,
      },
    }))
  }

  const updateArrayField = (section: keyof AssessmentData, field: string, value: string) => {
    const values = value.split(",").map((v) => v.trim()).filter(Boolean)
    updateField(section, field, values)
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>アセスメント情報</CardTitle>
              <CardDescription>
                {isEditing ? "アセスメント情報を編集できます" : "アセスメント情報を表示しています"}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {!isEditing && !readOnly && (
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  編集
                </Button>
              )}
              {isEditing && (
                <>
                  <Button onClick={handleCancel} variant="outline" disabled={isSaving}>
                    <X className="h-4 w-4 mr-2" />
                    キャンセル
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        保存中...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        保存
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">作成日時:</span>
            <span className="font-medium">
              {editedData.createdAt ? new Date(editedData.createdAt).toLocaleString("ja-JP") : "不明"}
            </span>
          </div>
          {editedData.updatedAt && editedData.updatedAt !== editedData.createdAt && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">更新日時:</span>
              <span className="font-medium">
                {new Date(editedData.updatedAt).toLocaleString("ja-JP")}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">抽出精度:</span>
            <Badge variant={editedData.extractionConfidence && editedData.extractionConfidence >= 70 ? "default" : "secondary"}>
              {editedData.extractionConfidence || 0}%
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
                <div className="space-y-2">
                  <Label htmlFor="age">年齢</Label>
                  {isEditing ? (
                    <Input
                      id="age"
                      value={editedData.basicInfo.age || ""}
                      onChange={(e) => updateField("basicInfo", "age", e.target.value)}
                      placeholder="例: 20代"
                    />
                  ) : (
                    <p className="text-sm">{editedData.basicInfo.age || "未記入"}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="economicStatus">経済状況</Label>
                  {isEditing ? (
                    <Select
                      value={editedData.basicInfo.economicStatus || ""}
                      onValueChange={(value) => updateField("basicInfo", "economicStatus", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="生活保護">生活保護</SelectItem>
                        <SelectItem value="困窮">困窮</SelectItem>
                        <SelectItem value="平均的">平均的</SelectItem>
                        <SelectItem value="裕福">裕福</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm">{editedData.basicInfo.economicStatus || "未記入"}</p>
                  )}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="familyStructure">家族構成</Label>
                  {isEditing ? (
                    <Input
                      id="familyStructure"
                      value={editedData.basicInfo.familyStructure || ""}
                      onChange={(e) => updateField("basicInfo", "familyStructure", e.target.value)}
                      placeholder="例: 父、母、本人"
                    />
                  ) : (
                    <p className="text-sm">{editedData.basicInfo.familyStructure || "未記入"}</p>
                  )}
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="consultationContent">相談内容</Label>
                {isEditing ? (
                  <Textarea
                    id="consultationContent"
                    value={editedData.basicInfo.consultationContent || ""}
                    onChange={(e) => updateField("basicInfo", "consultationContent", e.target.value)}
                    placeholder="相談内容の詳細を入力してください"
                    rows={4}
                  />
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{editedData.basicInfo.consultationContent || "未記入"}</p>
                )}
              </div>
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
                <div className="space-y-2">
                  <Label htmlFor="duration">ひきこもり歴</Label>
                  {isEditing ? (
                    <Input
                      id="duration"
                      value={editedData.hikikomoriHistory.duration || ""}
                      onChange={(e) => updateField("hikikomoriHistory", "duration", e.target.value)}
                      placeholder="例: 3年6ヶ月"
                    />
                  ) : (
                    <p className="text-sm font-semibold">{editedData.hikikomoriHistory.duration || "未記入"}</p>
                  )}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="triggerCategories">きっかけ（カテゴリ）</Label>
                  {isEditing ? (
                    <Input
                      id="triggerCategories"
                      value={editedData.hikikomoriHistory.triggerCategories?.join(", ") || ""}
                      onChange={(e) => updateArrayField("hikikomoriHistory", "triggerCategories", e.target.value)}
                      placeholder="例: 不登校, 受験, 就職活動 (カンマ区切り)"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {editedData.hikikomoriHistory.triggerCategories?.map((cat, idx) => (
                        <Badge key={idx} variant="secondary">{cat}</Badge>
                      )) || <span className="text-sm text-muted-foreground">未記入</span>}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="trigger">きっかけ・経緯</Label>
                {isEditing ? (
                  <Textarea
                    id="trigger"
                    value={editedData.hikikomoriHistory.trigger || ""}
                    onChange={(e) => updateField("hikikomoriHistory", "trigger", e.target.value)}
                    placeholder="きっかけや経緯の詳細を入力してください"
                    rows={4}
                  />
                ) : (
                  <p className="text-sm whitespace-pre-wrap font-semibold">{editedData.hikikomoriHistory.trigger || "未記入"}</p>
                )}
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">相談経験</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="hasConsultationHistory">相談歴</Label>
                    {isEditing ? (
                      <Select
                        value={editedData.hikikomoriHistory.hasConsultationHistory ? "true" : "false"}
                        onValueChange={(value) => updateField("hikikomoriHistory", "hasConsultationHistory", value === "true")}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">有</SelectItem>
                          <SelectItem value="false">無</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm">{editedData.hikikomoriHistory.hasConsultationHistory ? "有" : "無"}</p>
                    )}
                  </div>
                  {editedData.hikikomoriHistory.hasConsultationHistory && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="consultationDestination">相談先</Label>
                        {isEditing ? (
                          <Input
                            id="consultationDestination"
                            value={editedData.hikikomoriHistory.consultationDestination || ""}
                            onChange={(e) => updateField("hikikomoriHistory", "consultationDestination", e.target.value)}
                          />
                        ) : (
                          <p className="text-sm">{editedData.hikikomoriHistory.consultationDestination || "未記入"}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="consultationDate">相談時期</Label>
                        {isEditing ? (
                          <Input
                            id="consultationDate"
                            value={editedData.hikikomoriHistory.consultationDate || ""}
                            onChange={(e) => updateField("hikikomoriHistory", "consultationDate", e.target.value)}
                          />
                        ) : (
                          <p className="text-sm">{editedData.hikikomoriHistory.consultationDate || "未記入"}</p>
                        )}
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="consultationDetails">相談経緯（支援や対応など）</Label>
                        {isEditing ? (
                          <Textarea
                            id="consultationDetails"
                            value={editedData.hikikomoriHistory.consultationDetails || ""}
                            onChange={(e) => updateField("hikikomoriHistory", "consultationDetails", e.target.value)}
                            rows={3}
                          />
                        ) : (
                          <p className="text-sm whitespace-pre-wrap">{editedData.hikikomoriHistory.consultationDetails || "未記入"}</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">受診・治療の経験</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="hasMedicalHistory">受診・治療経験</Label>
                    {isEditing ? (
                      <Select
                        value={editedData.hikikomoriHistory.hasMedicalHistory ? "true" : "false"}
                        onValueChange={(value) => updateField("hikikomoriHistory", "hasMedicalHistory", value === "true")}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">有</SelectItem>
                          <SelectItem value="false">無</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm">{editedData.hikikomoriHistory.hasMedicalHistory ? "有" : "無"}</p>
                    )}
                  </div>
                  {editedData.hikikomoriHistory.hasMedicalHistory && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="diagnosis">診断名</Label>
                        {isEditing ? (
                          <Input
                            id="diagnosis"
                            value={editedData.hikikomoriHistory.diagnosis || ""}
                            onChange={(e) => updateField("hikikomoriHistory", "diagnosis", e.target.value)}
                          />
                        ) : (
                          <p className="text-sm font-semibold">{editedData.hikikomoriHistory.diagnosis || "未記入"}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="firstVisitDate">初診日</Label>
                        {isEditing ? (
                          <Input
                            id="firstVisitDate"
                            value={editedData.hikikomoriHistory.firstVisitDate || ""}
                            onChange={(e) => updateField("hikikomoriHistory", "firstVisitDate", e.target.value)}
                          />
                        ) : (
                          <p className="text-sm">{editedData.hikikomoriHistory.firstVisitDate || "未記入"}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="treatmentPeriod">受診期間</Label>
                        {isEditing ? (
                          <Input
                            id="treatmentPeriod"
                            value={editedData.hikikomoriHistory.treatmentPeriod || ""}
                            onChange={(e) => updateField("hikikomoriHistory", "treatmentPeriod", e.target.value)}
                          />
                        ) : (
                          <p className="text-sm">{editedData.hikikomoriHistory.treatmentPeriod || "未記入"}</p>
                        )}
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="otherMedicalHistory">精神科以外の受診歴</Label>
                        {isEditing ? (
                          <Textarea
                            id="otherMedicalHistory"
                            value={editedData.hikikomoriHistory.otherMedicalHistory || ""}
                            onChange={(e) => updateField("hikikomoriHistory", "otherMedicalHistory", e.target.value)}
                            rows={2}
                          />
                        ) : (
                          <p className="text-sm">{editedData.hikikomoriHistory.otherMedicalHistory || "未記入"}</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 育ちのエピソード（一部のみ表示、残りは同様のパターン） */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                育ちのエピソード
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="episodeCategories">キーワード</Label>
                {isEditing ? (
                  <Input
                    id="episodeCategories"
                    value={editedData.developmentalHistory.episodeCategories?.join(", ") || ""}
                    onChange={(e) => updateArrayField("developmentalHistory", "episodeCategories", e.target.value)}
                    placeholder="例: 学業, 対人関係, 不登校 (カンマ区切り)"
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {editedData.developmentalHistory.episodeCategories?.map((cat, idx) => (
                      <Badge key={idx} variant="outline">{cat}</Badge>
                    )) || <span className="text-sm text-muted-foreground">未記入</span>}
                  </div>
                )}
              </div>

              {["childhood", "elementarySchool", "juniorHighSchool", "highSchool", "college"].map((period) => {
                const labels: Record<string, string> = {
                  childhood: "幼少期",
                  elementarySchool: "小学校",
                  juniorHighSchool: "中学校",
                  highSchool: "高校",
                  college: "大学・専門学校",
                }
                const fieldName = `${period}Episode`
                return (
                  <div key={period} className="space-y-2">
                    <Label htmlFor={fieldName}>{labels[period]}</Label>
                    {isEditing ? (
                      <Textarea
                        id={fieldName}
                        value={(editedData.developmentalHistory as any)[fieldName] || ""}
                        onChange={(e) => updateField("developmentalHistory", fieldName, e.target.value)}
                        rows={2}
                      />
                    ) : (
                      <p className="text-sm">{(editedData.developmentalHistory as any)[fieldName] || "未記入"}</p>
                    )}
                  </div>
                )
              })}

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="finalEducation">最終学歴</Label>
                  {isEditing ? (
                    <Input
                      id="finalEducation"
                      value={editedData.developmentalHistory.finalEducation || ""}
                      onChange={(e) => updateField("developmentalHistory", "finalEducation", e.target.value)}
                      placeholder="例: 高校"
                    />
                  ) : (
                    <p className="text-sm">{editedData.developmentalHistory.finalEducation || "未記入"}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="educationStatus">在学状況</Label>
                  {isEditing ? (
                    <Select
                      value={editedData.developmentalHistory.educationStatus || ""}
                      onValueChange={(value) => updateField("developmentalHistory", "educationStatus", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="在学中">在学中</SelectItem>
                        <SelectItem value="卒業">卒業</SelectItem>
                        <SelectItem value="中退">中退</SelectItem>
                        <SelectItem value="休学中">休学中</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm">{editedData.developmentalHistory.educationStatus || "未記入"}</p>
                  )}
                </div>
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
              <div className="space-y-2">
                <Label htmlFor="otherEmployment">その他の就労</Label>
                {isEditing ? (
                  <Input
                    id="otherEmployment"
                    value={editedData.employmentHistory.otherEmployment?.join(", ") || ""}
                    onChange={(e) => updateArrayField("employmentHistory", "otherEmployment", e.target.value)}
                    placeholder="例: アルバイト, パート, 派遣 (カンマ区切り)"
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {editedData.employmentHistory.otherEmployment?.map((emp, idx) => (
                      <Badge key={idx} variant="secondary">{emp}</Badge>
                    )) || <span className="text-sm text-muted-foreground">未記入</span>}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="licenses">免許・資格</Label>
                {isEditing ? (
                  <Textarea
                    id="licenses"
                    value={editedData.employmentHistory.licenses || ""}
                    onChange={(e) => updateField("employmentHistory", "licenses", e.target.value)}
                    rows={2}
                  />
                ) : (
                  <p className="text-sm">{editedData.employmentHistory.licenses || "未記入"}</p>
                )}
              </div>
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
                  <div className="space-y-2">
                    <Label htmlFor="wakeUpTime">起床</Label>
                    {isEditing ? (
                      <Input
                        id="wakeUpTime"
                        value={editedData.currentLifeStatus.wakeUpTime || ""}
                        onChange={(e) => updateField("currentLifeStatus", "wakeUpTime", e.target.value)}
                        placeholder="例: AM 7時頃"
                      />
                    ) : (
                      <p className="text-sm">{editedData.currentLifeStatus.wakeUpTime || "未記入"}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bedTime">就寝</Label>
                    {isEditing ? (
                      <Input
                        id="bedTime"
                        value={editedData.currentLifeStatus.bedTime || ""}
                        onChange={(e) => updateField("currentLifeStatus", "bedTime", e.target.value)}
                        placeholder="例: PM 11時頃"
                      />
                    ) : (
                      <p className="text-sm">{editedData.currentLifeStatus.bedTime || "未記入"}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hasDayNightReversal">昼夜逆転</Label>
                    {isEditing ? (
                      <Select
                        value={editedData.currentLifeStatus.hasDayNightReversal ? "true" : "false"}
                        onValueChange={(value) => updateField("currentLifeStatus", "hasDayNightReversal", value === "true")}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">有</SelectItem>
                          <SelectItem value="false">無</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm">{editedData.currentLifeStatus.hasDayNightReversal ? "有" : "無"}</p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">食事</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="mealFrequency">食事回数</Label>
                    {isEditing ? (
                      <Input
                        id="mealFrequency"
                        value={editedData.currentLifeStatus.mealFrequency || ""}
                        onChange={(e) => updateField("currentLifeStatus", "mealFrequency", e.target.value)}
                        placeholder="例: 3回/日"
                      />
                    ) : (
                      <p className="text-sm">{editedData.currentLifeStatus.mealFrequency || "未記入"}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mealsWithFamily">家族と</Label>
                    {isEditing ? (
                      <Select
                        value={editedData.currentLifeStatus.mealsWithFamily || ""}
                        onValueChange={(value) => updateField("currentLifeStatus", "mealsWithFamily", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="選択してください" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="一緒">一緒</SelectItem>
                          <SelectItem value="別">別</SelectItem>
                          <SelectItem value="部屋食">部屋食</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm">{editedData.currentLifeStatus.mealsWithFamily || "未記入"}</p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="bathingFrequency">入浴頻度</Label>
                {isEditing ? (
                  <Input
                    id="bathingFrequency"
                    value={editedData.currentLifeStatus.bathingFrequency || ""}
                    onChange={(e) => updateField("currentLifeStatus", "bathingFrequency", e.target.value)}
                    placeholder="例: 毎日"
                  />
                ) : (
                  <p className="text-sm">{editedData.currentLifeStatus.bathingFrequency || "未記入"}</p>
                )}
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">趣味</h4>
                <div className="space-y-2">
                  <Label htmlFor="hobbies">趣味</Label>
                  {isEditing ? (
                    <Input
                      id="hobbies"
                      value={editedData.currentLifeStatus.hobbies?.join(", ") || ""}
                      onChange={(e) => updateArrayField("currentLifeStatus", "hobbies", e.target.value)}
                      placeholder="例: テレビ, インターネット, ゲーム (カンマ区切り)"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {editedData.currentLifeStatus.hobbies?.map((hobby, idx) => (
                        <Badge key={idx} variant="secondary">{hobby}</Badge>
                      )) || <span className="text-sm text-muted-foreground">未記入</span>}
                    </div>
                  )}
                </div>
                <div className="space-y-2 mt-3">
                  <Label htmlFor="availableMoney">本人の使える金銭</Label>
                  {isEditing ? (
                    <Input
                      id="availableMoney"
                      value={editedData.currentLifeStatus.availableMoney || ""}
                      onChange={(e) => updateField("currentLifeStatus", "availableMoney", e.target.value)}
                    />
                  ) : (
                    <p className="text-sm">{editedData.currentLifeStatus.availableMoney || "未記入"}</p>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="goingOutStatus">外出状況</Label>
                {isEditing ? (
                  <Textarea
                    id="goingOutStatus"
                    value={editedData.currentLifeStatus.goingOutStatus || ""}
                    onChange={(e) => updateField("currentLifeStatus", "goingOutStatus", e.target.value)}
                    rows={2}
                  />
                ) : (
                  <p className="text-sm">{editedData.currentLifeStatus.goingOutStatus || "未記入"}</p>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="socialInteraction">交流</Label>
                {isEditing ? (
                  <Input
                    id="socialInteraction"
                    value={editedData.currentLifeStatus.socialInteraction?.join(", ") || ""}
                    onChange={(e) => updateArrayField("currentLifeStatus", "socialInteraction", e.target.value)}
                    placeholder="例: 家族, 友人, メール (カンマ区切り)"
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {editedData.currentLifeStatus.socialInteraction?.map((interaction, idx) => (
                      <Badge key={idx} variant="outline">{interaction}</Badge>
                    )) || <span className="text-sm text-muted-foreground">未記入</span>}
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">身だしなみ</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="grooming">身だしなみ</Label>
                    {isEditing ? (
                      <Select
                        value={editedData.currentLifeStatus.grooming || ""}
                        onValueChange={(value) => updateField("currentLifeStatus", "grooming", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="選択してください" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="普通">普通</SelectItem>
                          <SelectItem value="関心がない">関心がない</SelectItem>
                          <SelectItem value="こだわりがある">こだわりがある</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm">{editedData.currentLifeStatus.grooming || "未記入"}</p>
                    )}
                  </div>
                  {editedData.currentLifeStatus.grooming === "こだわりがある" && (
                    <div className="space-y-2">
                      <Label htmlFor="groomingDetails">詳細</Label>
                      {isEditing ? (
                        <Input
                          id="groomingDetails"
                          value={editedData.currentLifeStatus.groomingDetails || ""}
                          onChange={(e) => updateField("currentLifeStatus", "groomingDetails", e.target.value)}
                        />
                      ) : (
                        <p className="text-sm">{editedData.currentLifeStatus.groomingDetails || "未記入"}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="lifeSkills">生活技能</Label>
                {isEditing ? (
                  <Input
                    id="lifeSkills"
                    value={editedData.currentLifeStatus.lifeSkills?.join(", ") || ""}
                    onChange={(e) => updateArrayField("currentLifeStatus", "lifeSkills", e.target.value)}
                    placeholder="例: 調理, 洗濯, 掃除 (カンマ区切り)"
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {editedData.currentLifeStatus.lifeSkills?.map((skill, idx) => (
                      <Badge key={idx} variant="default" className="bg-green-500">{skill}</Badge>
                    )) || <span className="text-sm text-muted-foreground">未記入</span>}
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="problemBehaviors">問題行動</Label>
                {isEditing ? (
                  <Input
                    id="problemBehaviors"
                    value={editedData.currentLifeStatus.problemBehaviors?.join(", ") || ""}
                    onChange={(e) => updateArrayField("currentLifeStatus", "problemBehaviors", e.target.value)}
                    placeholder="例: 暴言, 自傷行為 (カンマ区切り)"
                  />
                ) : editedData.currentLifeStatus.problemBehaviors && editedData.currentLifeStatus.problemBehaviors.length > 0 ? (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {editedData.currentLifeStatus.problemBehaviors.map((behavior, idx) => (
                          <Badge key={idx} variant="destructive">{behavior}</Badge>
                        ))}
                      </div>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <p className="text-sm text-muted-foreground">問題行動の報告はありません</p>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="currentSpecialNotes">特記事項（現在）</Label>
                {isEditing ? (
                  <Textarea
                    id="currentSpecialNotes"
                    value={editedData.currentLifeStatus.currentSpecialNotes || ""}
                    onChange={(e) => updateField("currentLifeStatus", "currentSpecialNotes", e.target.value)}
                    rows={4}
                  />
                ) : editedData.currentLifeStatus.currentSpecialNotes ? (
                  <Alert>
                    <AlertDescription>
                      <p className="whitespace-pre-wrap">{editedData.currentLifeStatus.currentSpecialNotes}</p>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <p className="text-sm text-muted-foreground">未記入</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* タブ3: 支援ニーズ */}
        <TabsContent value="support" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-blue-500" />
                本人の希望
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="subjectHope">本人の希望</Label>
                {isEditing ? (
                  <Textarea
                    id="subjectHope"
                    value={editedData.supportNeeds.subjectHope || ""}
                    onChange={(e) => updateField("supportNeeds", "subjectHope", e.target.value)}
                    rows={4}
                    className="bg-blue-500/5"
                  />
                ) : editedData.supportNeeds.subjectHope ? (
                  <div className="p-4 bg-blue-500/5 rounded-lg border border-blue-500/20">
                    <p className="text-sm whitespace-pre-wrap">{editedData.supportNeeds.subjectHope}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">本人の希望は記録されていません</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-green-500" />
                家族の希望
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="familyHope">家族の希望</Label>
                {isEditing ? (
                  <Textarea
                    id="familyHope"
                    value={editedData.supportNeeds.familyHope || ""}
                    onChange={(e) => updateField("supportNeeds", "familyHope", e.target.value)}
                    rows={4}
                    className="bg-green-500/5"
                  />
                ) : editedData.supportNeeds.familyHope ? (
                  <div className="p-4 bg-green-500/5 rounded-lg border border-green-500/20">
                    <p className="text-sm whitespace-pre-wrap">{editedData.supportNeeds.familyHope}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">家族の希望は記録されていません</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                家族関係・特記事項
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="familyRelationshipNotes">家族関係・特記事項</Label>
                {isEditing ? (
                  <Textarea
                    id="familyRelationshipNotes"
                    value={editedData.supportNeeds.familyRelationshipNotes || ""}
                    onChange={(e) => updateField("supportNeeds", "familyRelationshipNotes", e.target.value)}
                    rows={4}
                  />
                ) : editedData.supportNeeds.familyRelationshipNotes ? (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{editedData.supportNeeds.familyRelationshipNotes}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">未記入</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                今後必要と思われる支援
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="necessarySupport">今後必要と思われる支援</Label>
                {isEditing ? (
                  <Textarea
                    id="necessarySupport"
                    value={editedData.supportNeeds.necessarySupport || ""}
                    onChange={(e) => updateField("supportNeeds", "necessarySupport", e.target.value)}
                    rows={4}
                    className="bg-primary/5"
                  />
                ) : editedData.supportNeeds.necessarySupport ? (
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="text-sm whitespace-pre-wrap">{editedData.supportNeeds.necessarySupport}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">未記入</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

