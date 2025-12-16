// アセスメントシートのデータ型定義
// ※個人情報保護のため、氏名・住所・連絡先などは記録しない

// ① 基本情報（個人を特定できる情報は除外）
export interface BasicInfo {
  recordDate?: string // 記入日
  receptionDate?: string // 受付日
  consultationRoute?: string // 相談経路
  staffName?: string // 担当者名
  
  // 対象者情報（個人特定情報は除外）
  gender?: "男性" | "女性" | "その他" | "" // 性別
  
  // 相談者情報（個人名は除外）
  relationship?: string // 続柄
  livingTogether?: "同居" | "非同居" | "" // 同居・非同居
}

// ② 相談・経過情報
export interface ConsultationHistory {
  consultationRoute?: string // 相談経路
  firstConsultationDate?: string // 初回相談日
  firstConsultationOrganization?: string // 初回相談機関
  
  // 相談歴
  hasConsultationHistory?: boolean // 相談歴の有無
  consultationHistoryDetails?: string // 相談先、時期
  
  // 受診歴
  hasMedicalHistory?: boolean // 受診歴の有無
  diagnosis?: string // 診断名
  medicalInstitution?: string // 医療機関名
  medicalPeriod?: string // 期間
  
  // 社会資源利用歴
  socialResourcesUsed?: string // 福祉・就労支援・医療など
}

// ③ ひきこもりの経過
export interface HikikomoriHistory {
  startDate?: string // ひきこもり開始時期
  statusType?: "継続" | "断続" | "" // 継続・断続
  trigger?: string // きっかけ・経緯
  
  // 現在の状況
  currentDuration?: string // 継続期間
  frequency?: string // 頻度
  goingOutStatus?: string // 外出状況
  lifeChanges?: string // 生活の変化や特徴
}

// ④ 生育歴・家族構成
export interface DevelopmentalHistory {
  birthCircumstances?: string // 出生状況
  childhoodCharacteristics?: string // 幼少期の性格や特徴
  familyStructure?: string // 家族構成
  familyRelationships?: string // 家族関係
  interpersonalRelationships?: string // 対人関係の特徴
  caregiverRelationship?: string // 養育者との関係性
  specialNotes?: string // 特記事項
}

// ⑤ 学歴・就労歴
export interface EducationEmploymentHistory {
  // 学歴
  education?: string // 小・中・高・専・大・大学院・通信
  hasTruancy?: boolean // 不登校歴の有無
  truancyDetails?: string // 時期・理由
  schoolEpisodes?: string // 成績・いじめ・人間関係など
  
  // 就労歴
  hasEmploymentHistory?: boolean // 就労歴の有無
  employmentPeriod?: string // 期間
  jobChangeCount?: number // 転職回数
  longestEmploymentPeriod?: string // 最長勤務期間
  employmentType?: string // 雇用形態
  reasonForLeaving?: string // 仕事を辞めた理由
  workplaceRelationships?: string // 職場での対人関係
  employmentSupportHistory?: string // 就労支援機関利用歴
}

// ⑥ 現在の生活状況
export interface CurrentLifeStatus {
  // 睡眠
  wakeUpTime?: string // 起床時刻
  bedTime?: string // 就寝時刻
  hasDayNightReversal?: boolean // 昼夜逆転の有無
  
  // 食事
  mealFrequency?: string // 回数
  eatsWithFamily?: boolean // 家族と一緒
  hasEatingIssues?: string // 偏食・過食・拒食
  
  // 入浴
  bathingFrequency?: string // 頻度
  
  // 趣味・興味
  hobbiesInterests?: string // ゲーム・音楽・テレビ・ネット・読書など
  
  // 外出状況
  goingOutFrequency?: string // 頻度
  goingOutRange?: string // 範囲
  goingOutPurpose?: string // 目的
  companion?: string // 同行者
  
  // 交流状況
  familyInteraction?: string // 家族内
  outsideInteraction?: string // 家族外
  snsUsage?: string // SNS
  friendRelationships?: string // 友人関係
  
  // 身だしなみ
  grooming?: "整っている" | "無頓着" | "こだわりがある" | "" 
  
  // 生活技能
  cookingSkill?: boolean
  laundrySkill?: boolean
  cleaningSkill?: boolean
  moneyManagement?: boolean
  
  // 経済状況
  economicStatus?: "生活保護" | "困窮" | "平均" | "裕福" | ""
  availableMoney?: string // 本人が使える金額
}

// ⑦ 問題行動・心理的特徴
export interface BehavioralPsychologicalFeatures {
  // 問題行動
  domesticViolence?: boolean // 家庭内暴力
  verbalAbuse?: boolean // 暴言
  propertyDamage?: boolean // 器物破損
  compulsiveBehavior?: boolean // 強迫行為
  selfHarm?: boolean // 自傷行為
  excessiveSpending?: boolean // 浪費
  addictiveBehavior?: boolean // 依存行動
  
  // 精神的特徴
  psychologicalFeatures?: string // 不安・抑うつ・緊張・意欲低下など
  specialNotes?: string // 支援時に注意すべき行動パターンなど
}

// ⑧ 希望・支援ニーズ
export interface SupportNeeds {
  subjectHope?: string // 本人の希望
  familyHope?: string // 家族の希望
  necessarySupport?: string // 今後必要と思われる支援
  partnerOrganizations?: string // 支援機関連携
}

// ⑨ アセスメント補足項目
export interface AssessmentSupplement {
  childhoodEpisodes?: string // 育ちのエピソード
  specialNotes?: string // 特記事項（印象・支援上の留意点）
  informationSharingOrganizations?: string // 情報提供先・連携機関
  recordedBy?: string // 記録者（記入者氏名・所属）
}

// 完全なアセスメントデータ
export interface AssessmentData {
  id?: string
  createdAt?: string
  updatedAt?: string
  
  basicInfo: BasicInfo
  consultationHistory: ConsultationHistory
  hikikomoriHistory: HikikomoriHistory
  developmentalHistory: DevelopmentalHistory
  educationEmploymentHistory: EducationEmploymentHistory
  currentLifeStatus: CurrentLifeStatus
  behavioralPsychologicalFeatures: BehavioralPsychologicalFeatures
  supportNeeds: SupportNeeds
  assessmentSupplement: AssessmentSupplement
  
  // メタ情報
  sourceText?: string // 元のテキストデータ
  extractionConfidence?: number // 抽出精度（0-100）
}

// 抽出結果
export interface ExtractionResult {
  success: boolean
  data?: AssessmentData
  error?: string
  warnings?: string[]
}
