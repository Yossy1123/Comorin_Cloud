// アセスメントシートのデータ型定義
// ※個人情報保護のため、氏名・住所・連絡先などは記録しない

// ============================================
// タブ1: 背景・経過
// ============================================

// 基本情報
export interface BasicInfo {
  // 利用者情報（個人を特定できる情報は除外）
  age?: string // 年齢（年代で記録: 10代、20代など）
  familyStructure?: string // 家族構成
  economicStatus?: "生活保護" | "困窮" | "平均的" | "裕福" | "" // 経済状況
  
  // 相談内容
  consultationContent?: string // 相談内容の詳細
}

// ひきこもり歴・経緯
export interface HikikomoriHistory {
  duration?: string // ひきこもり歴（期間）
  trigger?: string // きっかけ・経緯
  triggerCategories?: string[] // きっかけのカテゴリ（不登校、受験、就職活動、職場関係等）
  
  // 相談経験
  hasConsultationHistory?: boolean // 相談歴の有無
  consultationDestination?: string // 相談先
  consultationDate?: string // 相談した時期
  consultationDetails?: string // 相談経緯（支援や対応など）
  
  // 受診・治療の経験
  hasMedicalHistory?: boolean // 受診・治療経験の有無
  diagnosis?: string // 診断名
  firstVisitDate?: string // 初診日
  treatmentPeriod?: string // 受診期間
  otherMedicalHistory?: string // 精神科以外の受診歴
}

// 育ちのエピソード・学歴
export interface DevelopmentalHistory {
  // 各時期のエピソード
  childhoodEpisode?: string // 幼少期
  elementarySchoolEpisode?: string // 小学校
  juniorHighSchoolEpisode?: string // 中学校
  highSchoolEpisode?: string // 高校
  collegeEpisode?: string // 大学・専門学校
  
  // 学業・対人関係のキーワード
  episodeCategories?: string[] // 学業、こだわり、対人関係、不登校、いじめ等
  
  // 最終学歴
  finalEducation?: string // 中・高・専・短・大・大学院
  educationStatus?: "在学中" | "卒業" | "中退" | "休学中" | "" // 在学状況
}

// 就労経験
export interface EmploymentHistory {
  // 就労歴の詳細
  employmentRecords?: Array<{
    age?: string // 年齢
    period?: string // 期間
    jobContent?: string // 就労内容
  }>
  
  // その他の就労
  otherEmployment?: string[] // アルバイト経験、パート、派遣等
  
  // 免許・資格
  licenses?: string // 保有している免許・資格
}

// ============================================
// タブ2: 生活状況
// ============================================

// 現在の生活状況
export interface CurrentLifeStatus {
  // 睡眠
  wakeUpTime?: string // 起床時刻（AM/PM 時頃）
  bedTime?: string // 就寝時刻（AM/PM 時頃）
  hasDayNightReversal?: boolean // 昼夜逆転の有無
  
  // 食事
  mealFrequency?: string // 食事回数（回/日）
  mealsWithFamily?: "一緒" | "別" | "部屋食" | "" // 家族と一緒か
  
  // 入浴
  bathingFrequency?: string // 入浴頻度（毎日、2〜3日ごと、週1回等）
  
  // 趣味
  hobbies?: string[] // テレビ、インターネット、携帯、ゲーム、音楽、読書等
  availableMoney?: string // 本人の使える金銭
  
  // 外出
  goingOutStatus?: string // 外出状況（自室から出ない、家から出ない、近所のコンビニ等）
  
  // 交流
  socialInteraction?: string[] // 家族、親戚、友人、メール、パソコン、無等
  
  // 身だしなみ
  grooming?: "普通" | "関心がない" | "こだわりがある" | "" 
  groomingDetails?: string // こだわりの詳細
  
  // 生活技能
  lifeSkills?: string[] // 調理、食器洗い、洗濯、掃除
  
  // 問題行動
  problemBehaviors?: string[] // 家庭内暴力、支配的言動、物の破損、暴言、強迫行為、自傷行為、浪費、過食、拒食、不潔行為等
  
  // 特記事項（現在）
  currentSpecialNotes?: string // 現在の特記事項
}

// ============================================
// タブ3: 支援ニーズ
// ============================================

// 希望・支援ニーズ
export interface SupportNeeds {
  subjectHope?: string // 本人の希望
  familyHope?: string // 家族の希望
  familyRelationshipNotes?: string // 家族関係・特記事項
  necessarySupport?: string // 今後必要と思われる支援
}

// ============================================
// 統合データ型
// ============================================

// 完全なアセスメントデータ
export interface AssessmentData {
  id?: string
  createdAt?: string
  updatedAt?: string
  
  // タブ1: 背景・経過
  basicInfo: BasicInfo
  hikikomoriHistory: HikikomoriHistory
  developmentalHistory: DevelopmentalHistory
  employmentHistory: EmploymentHistory
  
  // タブ2: 生活状況
  currentLifeStatus: CurrentLifeStatus
  
  // タブ3: 支援ニーズ
  supportNeeds: SupportNeeds
  
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
