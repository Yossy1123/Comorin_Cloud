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
    
    // タブ1: 背景・経過
    basicInfo: {
      age: "20代",
      familyStructure: "父、母、本人、きょうだいの4人家族",
      economicStatus: "平均的",
      consultationContent: "ひきこもり状態が続いており、生活リズムの改善と社会参加を希望している",
    },
    
    hikikomoriHistory: {
      duration: "約3年6ヶ月",
      trigger: "大学卒業後の就職活動の失敗、対人関係のストレス",
      triggerCategories: ["就職活動", "対人関係", "心身の不調"],
      hasConsultationHistory: true,
      consultationDestination: "市の相談窓口",
      consultationDate: "2023年5月",
      consultationDetails: "2023年に市の相談窓口を利用（1回のみ）。その後、保健所からの紹介で当センターに相談",
      hasMedicalHistory: true,
      diagnosis: "適応障害",
      firstVisitDate: "2022年6月",
      treatmentPeriod: "2022年6月〜2023年3月",
      otherMedicalHistory: "特になし",
    },
    
    developmentalHistory: {
      childhoodEpisode: "おとなしく、人見知りが激しい。一人遊びを好む傾向",
      elementarySchoolEpisode: "小学5年生の時に転校を経験、適応に時間がかかった",
      juniorHighSchoolEpisode: "中学2年時に約3ヶ月不登校（いじめが原因）",
      highSchoolEpisode: "成績は中程度。友人は少なかった",
      collegeEpisode: "大学ではサークル活動に参加せず、友人も少なかった",
      episodeCategories: ["対人関係", "不登校", "いじめ"],
      finalEducation: "大",
      educationStatus: "卒業",
    },
    
    employmentHistory: {
      employmentRecords: [],
      otherEmployment: [],
      licenses: "普通自動車免許（ペーパードライバー）",
    },
    
    // タブ2: 生活状況
    currentLifeStatus: {
      wakeUpTime: "PM 2時頃",
      bedTime: "AM 5時頃",
      hasDayNightReversal: true,
      mealFrequency: "2回/日",
      mealsWithFamily: "部屋食",
      bathingFrequency: "2〜3日ごと",
      hobbies: ["ゲーム", "インターネット", "テレビ"],
      availableMoney: "月2万円程度（親から）",
      goingOutStatus: "近所のコンビニ等",
      socialInteraction: ["家族", "メール", "パソコン"],
      grooming: "関心がない",
      groomingDetails: "",
      lifeSkills: [],
      problemBehaviors: [],
      currentSpecialNotes: "ゲームに没頭している時は比較的安定している。就労や外出の話題になると不安が強まる",
    },
    
    // タブ3: 支援ニーズ
    supportNeeds: {
      subjectHope: "このままではいけないとは思っているが、何をすればいいかわからない。まずは生活リズムを整えたい",
      familyHope: "まずは生活リズムを整えてほしい。少しずつでも外に出られるようになってほしい",
      familyRelationshipNotes: "父とはほとんど会話なし。母とは最低限の会話。きょうだいとの関係は良好。母親の精神的負担も大きい",
      necessarySupport: "生活リズム改善支援、段階的な社会参加プログラム、就労準備支援、家族支援（母親の負担軽減）",
    },
  }
}
