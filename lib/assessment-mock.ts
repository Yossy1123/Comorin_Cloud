/**
 * アセスメントシートのモックデータ生成
 * ※個人情報保護のため、氏名・住所・連絡先などは記録しない
 * クライアント・サーバー両方で使用可能
 */

import type { AssessmentData } from "@/types/assessment"

/**
 * ユニークIDを生成
 */
function generateId(): string {
  return `assessment_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * モックデータ生成（開発・デモ用）
 */
export function generateMockAssessment(): AssessmentData {
  return {
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    extractionConfidence: 85,
    sourceText: "サンプルテキストデータ（個人を特定できる情報は記録していません）",
    
    basicInfo: {
      recordDate: "2025年11月3日",
      receptionDate: "2025年10月28日",
      consultationRoute: "保健所からの紹介",
      staffName: "担当者A",
      gender: "男性",
      relationship: "母",
      livingTogether: "同居",
    },
    
    consultationHistory: {
      consultationRoute: "保健所からの紹介",
      firstConsultationDate: "2025年10月28日",
      firstConsultationOrganization: "〇〇保健所",
      hasConsultationHistory: true,
      consultationHistoryDetails: "2023年に市の相談窓口を利用（1回のみ）",
      hasMedicalHistory: true,
      diagnosis: "適応障害",
      medicalInstitution: "〇〇メンタルクリニック",
      medicalPeriod: "2022年6月〜2023年3月",
      socialResourcesUsed: "就労支援センター（2023年4月〜6月）",
    },
    
    hikikomoriHistory: {
      startDate: "2022年3月",
      statusType: "継続",
      trigger: "大学卒業後の就職活動の失敗、対人関係のストレス",
      currentDuration: "約3年6ヶ月",
      frequency: "ほぼ毎日自室にいる",
      goingOutStatus: "月に1〜2回、深夜のコンビニのみ",
      lifeChanges: "昼夜逆転、家族との会話減少、体重増加",
    },
    
    developmentalHistory: {
      birthCircumstances: "正常分娩、出生時異常なし",
      childhoodCharacteristics: "おとなしく、人見知りが激しい。一人遊びを好む傾向",
      familyStructure: "父、母、本人、きょうだいの4人家族",
      familyRelationships: "父とはほとんど会話なし。母とは最低限の会話。きょうだいとの関係は良好",
      interpersonalRelationships: "幼少期から友人が少なく、集団行動が苦手",
      caregiverRelationship: "母親との関係は良好だが、依存的な面も見られる",
      specialNotes: "小学5年生の時に転校を経験、適応に時間がかかった",
    },
    
    educationEmploymentHistory: {
      education: "大学卒業（私立大学・文学部）",
      hasTruancy: true,
      truancyDetails: "中学2年時に約3ヶ月不登校（いじめが原因）",
      schoolEpisodes: "成績は中程度。大学ではサークル活動に参加せず、友人も少なかった",
      hasEmploymentHistory: false,
      employmentPeriod: "",
      jobChangeCount: 0,
      longestEmploymentPeriod: "",
      employmentType: "",
      reasonForLeaving: "就職活動で内定が取れず、そのまま就労経験なし",
      workplaceRelationships: "",
      employmentSupportHistory: "就労支援センターに3ヶ月通所（2023年4月〜6月）",
    },
    
    currentLifeStatus: {
      wakeUpTime: "午後2時頃",
      bedTime: "午前5時頃",
      hasDayNightReversal: true,
      mealFrequency: "2回（昼・夜）",
      eatsWithFamily: false,
      hasEatingIssues: "偏食傾向（インスタント食品が多い）",
      bathingFrequency: "週に2〜3回",
      hobbiesInterests: "ゲーム（オンラインゲーム）、YouTube視聴、アニメ鑑賞",
      goingOutFrequency: "月に1〜2回",
      goingOutRange: "自宅から徒歩5分圏内のコンビニのみ",
      goingOutPurpose: "食料・飲料の購入",
      companion: "一人",
      familyInteraction: "母親と最低限の会話（食事の受け渡し程度）",
      outsideInteraction: "ほぼなし",
      snsUsage: "Twitter、Discord（ゲーム仲間との交流のみ）",
      friendRelationships: "オンラインゲームで知り合った人とのみ交流",
      grooming: "無頓着",
      cookingSkill: false,
      laundrySkill: false,
      cleaningSkill: false,
      moneyManagement: true,
      economicStatus: "平均",
      availableMoney: "月2万円程度（親から）",
    },
    
    behavioralPsychologicalFeatures: {
      domesticViolence: false,
      verbalAbuse: false,
      propertyDamage: false,
      compulsiveBehavior: false,
      selfHarm: false,
      excessiveSpending: false,
      addictiveBehavior: true, // ゲーム依存の可能性
      psychologicalFeatures: "抑うつ傾向、意欲低下、不安感、自己肯定感の低さ",
      specialNotes: "ゲームに没頭している時は比較的安定している。就労や外出の話題になると不安が強まる",
    },
    
    supportNeeds: {
      subjectHope: "「このままではいけないとは思っているが、何をすればいいかわからない」",
      familyHope: "「まずは生活リズムを整えてほしい。少しずつでも外に出られるようになってほしい」",
      necessarySupport: "生活リズム改善支援、段階的な社会参加プログラム、就労準備支援、家族支援（母親の負担軽減）",
      partnerOrganizations: "就労支援センター、メンタルクリニック、地域活動支援センター",
    },
    
    assessmentSupplement: {
      childhoodEpisodes: "幼少期は比較的順調。小学5年生の転校がターニングポイント。中学でのいじめ経験が対人不安の原因と思われる",
      specialNotes: "本人に変わりたいという気持ちはあるが、具体的な行動に移すのが難しい状態。母親の精神的負担も大きい。段階的な支援が必要",
      informationSharingOrganizations: "〇〇保健所、〇〇メンタルクリニック、市福祉課",
      recordedBy: "担当者A（〇〇ひきこもり支援センター）",
    },
  }
}
