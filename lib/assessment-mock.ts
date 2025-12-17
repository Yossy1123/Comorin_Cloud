/**
 * アセスメントシートのモックデータ生成
 * ※個人情報保護のため、氏名・住所・連絡先などは記録しない
 * クライアント・サーバー両方で使用可能
 */

import type { AssessmentData } from "@/types/assessment"
import type { ConversationRecord } from "./mock-conversation"

/**
 * ユニークIDを生成
 */
function generateId(): string {
  return `assessment_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * 会話データからアセスメント情報を生成（簡易版・API不要）
 * @param conversations - 当事者の会話履歴
 * @param patientId - 当事者ID
 */
export function generateAssessmentFromConversations(
  conversations: ConversationRecord[],
  patientId: string
): AssessmentData {
  if (conversations.length === 0) {
    // 会話データがない場合はデフォルトのモックデータを返す
    return generateMockAssessment()
  }

  // 会話データから情報を抽出
  const allTranscripts = conversations.map((conv) => conv.transcript).join("\n\n")
  const allKeywords = conversations.flatMap((conv) => conv.analysis.keywords)
  const uniqueKeywords = [...new Set(allKeywords)]

  // 感情とストレスレベルの集計
  const emotions = conversations.map((conv) => conv.analysis.emotion)
  const stressLevels = conversations.map((conv) => conv.analysis.stressLevel)

  // 最新の会話データ
  const latestConv = conversations[0]
  const latestDate = new Date(latestConv.timestamp).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // 感情の分布を分析
  const emotionCounts: Record<string, number> = {}
  emotions.forEach((emotion) => {
    emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1
  })
  const dominantEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "ニュートラル"

  // ストレスレベルの平均を計算
  const stressMap = { "低": 1, "中": 2, "高": 3 }
  const avgStress =
    stressLevels.reduce((sum, level) => sum + (stressMap[level as keyof typeof stressMap] || 2), 0) /
    stressLevels.length
  const avgStressLevel = avgStress < 1.5 ? "低" : avgStress < 2.5 ? "中" : "高"

  // 会話内容から特徴を抽出
  const hasAnxiety = allTranscripts.includes("不安") || allTranscripts.includes("心配")
  const hasSleepIssues = allTranscripts.includes("眠れない") || allTranscripts.includes("睡眠")
  const hasFamily = allTranscripts.includes("家族")
  const hasGoingOut = allTranscripts.includes("外出") || allTranscripts.includes("外に出")
  const hasPositiveChange = allTranscripts.includes("前に進") || allTranscripts.includes("良い") || allTranscripts.includes("進歩")

  // アセスメントデータを生成
  return {
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    extractionConfidence: 75, // 会話データからの推定なので精度は中程度
    sourceText: `会話記録（${conversations.length}件のセッション）から生成\n\n主要なキーワード: ${uniqueKeywords.join(", ")}`,

    basicInfo: {
      recordDate: latestDate,
      receptionDate: new Date(conversations[conversations.length - 1].timestamp).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      consultationRoute: "ひきこもり支援センター",
      staffName: "担当支援員",
      gender: "",
      relationship: "家族",
      livingTogether: "同居",
    },

    consultationHistory: {
      consultationRoute: "ひきこもり支援センター",
      firstConsultationDate: new Date(conversations[conversations.length - 1].timestamp).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      firstConsultationOrganization: "ひきこもり支援センター",
      hasConsultationHistory: true,
      consultationHistoryDetails: `支援センターでの面談 ${conversations.length}回実施`,
      hasMedicalHistory: false,
      diagnosis: "",
      medicalInstitution: "",
      medicalPeriod: "",
      socialResourcesUsed: "ひきこもり支援センター",
    },

    hikikomoriHistory: {
      startDate: "不明",
      statusType: "継続",
      trigger: "会話記録から詳細を確認中",
      currentDuration: "継続中",
      frequency: "会話記録から推定中",
      goingOutStatus: hasGoingOut ? "外出について言及あり" : "外出について言及なし",
      lifeChanges: dominantEmotion === "ポジティブ" && hasPositiveChange
        ? "前向きな変化が見られている"
        : hasAnxiety
        ? "不安が見られる"
        : "継続的な支援が必要",
    },

    developmentalHistory: {
      birthCircumstances: "会話記録からは詳細不明",
      childhoodCharacteristics: "会話記録からは詳細不明",
      familyStructure: hasFamily ? "家族との関係について言及あり" : "詳細不明",
      familyRelationships: hasFamily ? "会話記録から家族との交流について言及がある" : "詳細不明",
      interpersonalRelationships: "会話記録から推定中",
      caregiverRelationship: hasFamily ? "家族との関わりが確認されている" : "詳細不明",
      specialNotes: uniqueKeywords.length > 0 ? `主なテーマ: ${uniqueKeywords.slice(0, 5).join(", ")}` : "なし",
    },

    educationEmploymentHistory: {
      education: "詳細不明",
      hasTruancy: false,
      truancyDetails: "",
      schoolEpisodes: "会話記録からは詳細不明",
      hasEmploymentHistory: false,
      employmentPeriod: "",
      jobChangeCount: 0,
      longestEmploymentPeriod: "",
      employmentType: "",
      reasonForLeaving: "",
      workplaceRelationships: "",
      employmentSupportHistory: "",
    },

    currentLifeStatus: {
      wakeUpTime: "詳細不明",
      bedTime: "詳細不明",
      hasDayNightReversal: hasSleepIssues,
      mealFrequency: "詳細不明",
      eatsWithFamily: hasFamily,
      hasEatingIssues: "",
      bathingFrequency: "詳細不明",
      hobbiesInterests: "会話記録から推定中",
      goingOutFrequency: hasGoingOut ? "外出について言及あり" : "詳細不明",
      goingOutRange: hasGoingOut ? "近所（会話から推定）" : "詳細不明",
      goingOutPurpose: hasGoingOut ? "日常的な用事（会話から推定）" : "",
      companion: "",
      familyInteraction: hasFamily ? "家族との交流あり（会話から推定）" : "詳細不明",
      outsideInteraction: "",
      snsUsage: "",
      friendRelationships: "",
      grooming: "",
      cookingSkill: false,
      laundrySkill: false,
      cleaningSkill: false,
      moneyManagement: false,
      economicStatus: "",
      availableMoney: "",
    },

    behavioralPsychologicalFeatures: {
      domesticViolence: false,
      verbalAbuse: false,
      propertyDamage: false,
      compulsiveBehavior: false,
      selfHarm: false,
      excessiveSpending: false,
      addictiveBehavior: false,
      psychologicalFeatures:
        dominantEmotion === "不安"
          ? "不安傾向が見られる"
          : dominantEmotion === "ポジティブ"
          ? "前向きな変化が見られる"
          : dominantEmotion === "ネガティブ"
          ? "ネガティブな感情が見られる"
          : "比較的安定した状態",
      specialNotes: `平均ストレスレベル: ${avgStressLevel}\n主要な感情状態: ${dominantEmotion}\n面談回数: ${conversations.length}回`,
    },

    supportNeeds: {
      subjectHope: "会話記録から詳細を抽出中",
      familyHope: hasFamily ? "家族の協力が得られている様子" : "詳細不明",
      necessarySupport:
        hasAnxiety
          ? "不安軽減のための支援、段階的な社会参加プログラム"
          : hasPositiveChange
          ? "現在の前向きな変化を維持・促進するための継続的支援"
          : "継続的な面談と段階的な支援",
      partnerOrganizations: "ひきこもり支援センター",
    },

    assessmentSupplement: {
      childhoodEpisodes: "会話記録からは詳細不明",
      specialNotes: `${conversations.length}回の面談記録から生成されたアセスメント。\n主なキーワード: ${uniqueKeywords.slice(0, 10).join(", ")}\n\n※このアセスメントは会話データから自動生成されたものです。詳細な情報を得るためには、AI解析（OpenAI API使用）を利用することを推奨します。`,
      informationSharingOrganizations: "ひきこもり支援センター",
      recordedBy: "システム自動生成（面談記録ベース）",
    },
  }
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
