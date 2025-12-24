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
提供されたテキストから、3つのタブに分類された情報を抽出してください。

【重要】個人情報保護のため、以下の情報は抽出しないでください：
- 氏名（本人・家族）
- 生年月日（年齢は年代で記録: 10代、20代など）
- 住所
- 電話番号、携帯番号
- その他、個人を特定できる情報

■ タブ1: 背景・経過
1. 基本情報
   - 年齢（年代）、家族構成、経済状況（生活保護・困窮・平均的・裕福）
   - 相談内容

2. ひきこもり歴・経緯
   - ひきこもり歴（期間）
   - きっかけ・経緯（不登校、受験、就職活動、職場関係、解雇、対人関係、心身の不調等）
   - 相談経験（有無、相談先、時期、相談経緯）
   - 受診・治療経験（有無、診断名、初診日、受診期間、精神科以外の受診歴）

3. 育ちのエピソード
   - 幼少期、小学校、中学校、高校、大学・専門学校の各エピソード
   - 学業、こだわり、対人関係、不登校、いじめ等
   - 最終学歴（中・高・専・短・大・大学院、在学状況）

4. 就労経験
   - 就労歴（年齢、期間、就労内容）
   - その他の就労（アルバイト、パート、派遣等）
   - 免許・資格

■ タブ2: 生活状況
- 睡眠（起床時刻、就寝時刻、昼夜逆転の有無）
- 食事（回数/日、家族と一緒か別か部屋食か）
- 入浴（毎日、2〜3日ごと、週1回、月2〜3回、入浴しない）
- 趣味（テレビ、インターネット、携帯、ゲーム、音楽、読書等）
- 本人の使える金銭
- 外出（自室から出ない、家から出ない、近所のコンビニ等、趣味の用事のみ）
- 交流（家族、親戚、友人、メール、パソコン、無等）
- 身だしなみ（普通、関心がない、こだわりがある）
- 生活技能（調理、食器洗い、洗濯、掃除）
- 問題行動（家庭内暴力、支配的言動、物の破損、暴言、強迫行為、自傷行為、浪費、過食、拒食、不潔行為等）
- 特記事項（現在）

■ タブ3: 支援ニーズ
- 本人の希望
- 家族の希望
- 家族関係・特記事項
- 今後必要と思われる支援

抽出できない情報は空文字、空配列、またはnullで返してください。
必ずJSON形式で返してください。`,
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


