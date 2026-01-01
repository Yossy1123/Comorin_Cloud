/**
 * アセスメントシート抽出ロジック
 * テキストデータからアセスメント情報を抽出します
 * ⚠️ このファイルはサーバーサイド専用です（API Routeから使用）
 */

import { openai, checkOpenAIKey } from "@/lib/openai"
import type { AssessmentData, ExtractionResult } from "@/types/assessment"

/**
 * テキストからアセスメントデータを抽出
 * サーバーサイドでのみ呼び出してください
 */
export async function extractAssessmentFromText(text: string): Promise<ExtractionResult> {
  try {
    // OpenAI APIキーのチェック
    if (!checkOpenAIKey()) {
      return {
        success: false,
        error: "OpenAI APIキーが設定されていません。環境変数OPENAI_API_KEYを設定してください。",
      }
    }

    if (!text || text.trim().length === 0) {
      return {
        success: false,
        error: "テキストが空です",
      }
    }

    // OpenAI APIを使用してテキストを解析
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `あなたはひきこもり支援のアセスメント情報抽出の専門家です。
提供されたテキストから情報を抽出し、以下のJSON形式で返してください。

【重要】個人情報保護のため、氏名・生年月日・住所・電話番号は抽出しないでください。

【必須】以下のJSON構造で返してください：

{
  "basicInfo": {
    "age": "年齢（例: 20代後半）",
    "familyStructure": "家族構成（例: 両親と本人の3人家族、一人っ子）",
    "economicStatus": "経済状況",
    "consultationContent": "相談内容"
  },
  "hikikomoriHistory": {
    "duration": "ひきこもり歴（例: 23歳頃から、約5年）",
    "trigger": "きっかけ・経緯（詳細に記述）",
    "triggerCategories": ["不登校", "対人関係", "心身の不調"],
    "hasConsultationHistory": true/false,
    "consultationDestination": "相談先（例: 市の窓口）",
    "consultationDate": "相談時期",
    "consultationDetails": "相談経緯",
    "hasMedicalHistory": true/false,
    "diagnosis": "診断名（例: 抑うつ、不安障害）",
    "firstVisitDate": "初診日（例: 20歳頃）",
    "treatmentPeriod": "受診期間",
    "otherMedicalHistory": "その他医療歴・薬歴（詳細に記述、例: 抗うつ薬服用、薬が合わなかった等）"
  },
  "developmentalHistory": {
    "childhoodEpisode": "幼少期エピソード",
    "elementarySchoolEpisode": "小学校エピソード",
    "juniorHighSchoolEpisode": "中学校エピソード",
    "highSchoolEpisode": "高校エピソード（例: 2年から不登校、人間関係で中退）",
    "collegeEpisode": "大学・専門学校エピソード",
    "episodeCategories": ["不登校", "対人関係", "いじめ"],
    "finalEducation": "最終学歴（例: 高校中退）",
    "educationStatus": "在学状況"
  },
  "employmentHistory": {
    "employmentRecords": [{"age": "23歳", "period": "3ヶ月", "content": "飲食店"}],
    "otherEmployment": ["倉庫業アルバイト"],
    "licenses": "免許・資格"
  },
  "currentLifeStatus": {
    "wakeUpTime": "起床時刻",
    "bedTime": "就寝時刻",
    "hasDayNightReversal": true/false,
    "mealFrequency": "食事回数",
    "mealsWithFamily": "家族と一緒/別/部屋食",
    "bathingFrequency": "入浴頻度（例: 週2〜3回）",
    "hobbies": ["ゲーム", "動画視聴"],
    "availableMoney": "本人の使える金銭",
    "goingOutStatus": "外出状況（例: 月1〜2回、コンビニくらい）",
    "socialInteraction": ["家族", "友人なし"],
    "grooming": "身だしなみ",
    "groomingDetails": "詳細",
    "lifeSkills": ["調理", "掃除"],
    "problemBehaviors": ["暴言たまに", "オンラインゲーム課金"],
    "currentSpecialNotes": "特記事項"
  },
  "supportNeeds": {
    "subjectHope": "本人の希望（詳細に記述）",
    "familyHope": "家族の希望（詳細に記述）",
    "familyRelationshipNotes": "家族関係（例: 母が対応多い、父は忙しい）",
    "necessarySupport": "今後必要な支援"
  }
}

【重要な抽出ポイント】
1. 受診歴・治療歴は必ず抽出してください（診断名、薬歴、服薬状況、副作用等）
2. 「20歳頃」「23歳頃から」などの時期情報を正確に抽出
3. 本人・家族の発言は直接引用して記録
4. 情報がない項目は空文字""、空配列[]、またはfalseを返す

抽出できない情報は空にしてください。必ずJSON形式で返してください。`,
        },
        {
          role: "user",
          content: `以下のテキストからアセスメント情報を抽出してください：\n\n${text}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      return {
        success: false,
        error: "AIからのレスポンスが空です",
      }
    }

    // JSONをパース
    const parsedData = JSON.parse(content)

    // AssessmentData形式に変換
    const assessmentData: AssessmentData = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sourceText: text,
      extractionConfidence: calculateConfidence(parsedData),
      
      // タブ1: 背景・経過
      basicInfo: {
        age: parsedData.basicInfo?.age || "",
        familyStructure: parsedData.basicInfo?.familyStructure || "",
        economicStatus: parsedData.basicInfo?.economicStatus || "",
        consultationContent: parsedData.basicInfo?.consultationContent || "",
      },
      
      hikikomoriHistory: {
        duration: parsedData.hikikomoriHistory?.duration || "",
        trigger: parsedData.hikikomoriHistory?.trigger || "",
        triggerCategories: parsedData.hikikomoriHistory?.triggerCategories || [],
        hasConsultationHistory: parsedData.hikikomoriHistory?.hasConsultationHistory || false,
        consultationDestination: parsedData.hikikomoriHistory?.consultationDestination || "",
        consultationDate: parsedData.hikikomoriHistory?.consultationDate || "",
        consultationDetails: parsedData.hikikomoriHistory?.consultationDetails || "",
        hasMedicalHistory: parsedData.hikikomoriHistory?.hasMedicalHistory || false,
        diagnosis: parsedData.hikikomoriHistory?.diagnosis || "",
        firstVisitDate: parsedData.hikikomoriHistory?.firstVisitDate || "",
        treatmentPeriod: parsedData.hikikomoriHistory?.treatmentPeriod || "",
        otherMedicalHistory: parsedData.hikikomoriHistory?.otherMedicalHistory || "",
      },
      
      developmentalHistory: {
        childhoodEpisode: parsedData.developmentalHistory?.childhoodEpisode || "",
        elementarySchoolEpisode: parsedData.developmentalHistory?.elementarySchoolEpisode || "",
        juniorHighSchoolEpisode: parsedData.developmentalHistory?.juniorHighSchoolEpisode || "",
        highSchoolEpisode: parsedData.developmentalHistory?.highSchoolEpisode || "",
        collegeEpisode: parsedData.developmentalHistory?.collegeEpisode || "",
        episodeCategories: parsedData.developmentalHistory?.episodeCategories || [],
        finalEducation: parsedData.developmentalHistory?.finalEducation || "",
        educationStatus: parsedData.developmentalHistory?.educationStatus || "",
      },
      
      employmentHistory: {
        employmentRecords: parsedData.employmentHistory?.employmentRecords || [],
        otherEmployment: parsedData.employmentHistory?.otherEmployment || [],
        licenses: parsedData.employmentHistory?.licenses || "",
      },
      
      // タブ2: 生活状況
      currentLifeStatus: {
        wakeUpTime: parsedData.currentLifeStatus?.wakeUpTime || "",
        bedTime: parsedData.currentLifeStatus?.bedTime || "",
        hasDayNightReversal: parsedData.currentLifeStatus?.hasDayNightReversal || false,
        mealFrequency: parsedData.currentLifeStatus?.mealFrequency || "",
        mealsWithFamily: parsedData.currentLifeStatus?.mealsWithFamily || "",
        bathingFrequency: parsedData.currentLifeStatus?.bathingFrequency || "",
        hobbies: parsedData.currentLifeStatus?.hobbies || [],
        availableMoney: parsedData.currentLifeStatus?.availableMoney || "",
        goingOutStatus: parsedData.currentLifeStatus?.goingOutStatus || "",
        socialInteraction: parsedData.currentLifeStatus?.socialInteraction || [],
        grooming: parsedData.currentLifeStatus?.grooming || "",
        groomingDetails: parsedData.currentLifeStatus?.groomingDetails || "",
        lifeSkills: parsedData.currentLifeStatus?.lifeSkills || [],
        problemBehaviors: parsedData.currentLifeStatus?.problemBehaviors || [],
        currentSpecialNotes: parsedData.currentLifeStatus?.currentSpecialNotes || "",
      },
      
      // タブ3: 支援ニーズ
      supportNeeds: {
        subjectHope: parsedData.supportNeeds?.subjectHope || "",
        familyHope: parsedData.supportNeeds?.familyHope || "",
        familyRelationshipNotes: parsedData.supportNeeds?.familyRelationshipNotes || "",
        necessarySupport: parsedData.supportNeeds?.necessarySupport || "",
      },
    }

    return {
      success: true,
      data: assessmentData,
      warnings: generateWarnings(assessmentData),
    }
  } catch (error) {
    console.error("アセスメント抽出エラー:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "不明なエラーが発生しました",
    }
  }
}

/**
 * ユニークIDを生成
 */
function generateId(): string {
  return `assessment_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * 抽出精度を計算
 */
function calculateConfidence(data: any): number {
  let filledFields = 0
  let totalFields = 0

  function countFields(obj: any): void {
    for (const key in obj) {
      if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
        countFields(obj[key])
      } else {
        totalFields++
        if (obj[key] && obj[key] !== "" && obj[key] !== false && obj[key] !== null) {
          filledFields++
        }
      }
    }
  }

  countFields(data)
  return totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0
}

/**
 * 警告メッセージを生成
 */
function generateWarnings(data: AssessmentData): string[] {
  const warnings: string[] = []

  // ひきこもり歴のチェック
  if (!data.hikikomoriHistory.duration) {
    warnings.push("ひきこもり歴（期間）が抽出できませんでした")
  }
  if (!data.hikikomoriHistory.trigger) {
    warnings.push("ひきこもりのきっかけ・経緯が抽出できませんでした")
  }

  // 支援ニーズのチェック
  if (!data.supportNeeds.subjectHope && !data.supportNeeds.familyHope) {
    warnings.push("本人または家族の希望が抽出できませんでした")
  }

  // 生活状況のチェック
  if (!data.currentLifeStatus.wakeUpTime && !data.currentLifeStatus.bedTime) {
    warnings.push("睡眠時間の情報が抽出できませんでした")
  }

  return warnings
}


