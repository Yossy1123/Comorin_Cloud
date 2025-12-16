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
提供されたテキストから、以下の9つのカテゴリに該当する情報を抽出してください。

【重要】個人情報保護のため、以下の情報は抽出しないでください：
- 氏名（本人・家族）
- 生年月日、年齢
- 住所
- 電話番号、携帯番号
- その他、個人を特定できる情報

カテゴリ：
1. 基本情報（記入日、相談経路、担当者名、性別、続柄、同居・非同居）※個人名・住所・連絡先は除外
2. 相談・経過情報（相談経路、相談歴、受診歴等）
3. ひきこもりの経過（開始時期、きっかけ、現在の状況等）
4. 生育歴・家族構成（出生状況、家族関係等）※個人名は除外
5. 学歴・就労歴（学歴、不登校歴、就労歴等）
6. 現在の生活状況（睡眠、食事、趣味、外出状況等）
7. 問題行動・心理的特徴（暴力、自傷、精神的特徴等）
8. 希望・支援ニーズ（本人の希望、家族の希望等）
9. アセスメント補足項目（育ちのエピソード、特記事項等）

抽出できない情報は空文字またはnullで返してください。
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
      
      basicInfo: {
        recordDate: parsedData.basicInfo?.recordDate || "",
        receptionDate: parsedData.basicInfo?.receptionDate || "",
        consultationRoute: parsedData.basicInfo?.consultationRoute || "",
        staffName: parsedData.basicInfo?.staffName || "",
        gender: parsedData.basicInfo?.gender || "",
        relationship: parsedData.basicInfo?.relationship || "",
        livingTogether: parsedData.basicInfo?.livingTogether || "",
      },
      
      consultationHistory: {
        consultationRoute: parsedData.consultationHistory?.consultationRoute || "",
        firstConsultationDate: parsedData.consultationHistory?.firstConsultationDate || "",
        firstConsultationOrganization: parsedData.consultationHistory?.firstConsultationOrganization || "",
        hasConsultationHistory: parsedData.consultationHistory?.hasConsultationHistory || false,
        consultationHistoryDetails: parsedData.consultationHistory?.consultationHistoryDetails || "",
        hasMedicalHistory: parsedData.consultationHistory?.hasMedicalHistory || false,
        diagnosis: parsedData.consultationHistory?.diagnosis || "",
        medicalInstitution: parsedData.consultationHistory?.medicalInstitution || "",
        medicalPeriod: parsedData.consultationHistory?.medicalPeriod || "",
        socialResourcesUsed: parsedData.consultationHistory?.socialResourcesUsed || "",
      },
      
      hikikomoriHistory: {
        startDate: parsedData.hikikomoriHistory?.startDate || "",
        statusType: parsedData.hikikomoriHistory?.statusType || "",
        trigger: parsedData.hikikomoriHistory?.trigger || "",
        currentDuration: parsedData.hikikomoriHistory?.currentDuration || "",
        frequency: parsedData.hikikomoriHistory?.frequency || "",
        goingOutStatus: parsedData.hikikomoriHistory?.goingOutStatus || "",
        lifeChanges: parsedData.hikikomoriHistory?.lifeChanges || "",
      },
      
      developmentalHistory: {
        birthCircumstances: parsedData.developmentalHistory?.birthCircumstances || "",
        childhoodCharacteristics: parsedData.developmentalHistory?.childhoodCharacteristics || "",
        familyStructure: parsedData.developmentalHistory?.familyStructure || "",
        familyRelationships: parsedData.developmentalHistory?.familyRelationships || "",
        interpersonalRelationships: parsedData.developmentalHistory?.interpersonalRelationships || "",
        caregiverRelationship: parsedData.developmentalHistory?.caregiverRelationship || "",
        specialNotes: parsedData.developmentalHistory?.specialNotes || "",
      },
      
      educationEmploymentHistory: {
        education: parsedData.educationEmploymentHistory?.education || "",
        hasTruancy: parsedData.educationEmploymentHistory?.hasTruancy || false,
        truancyDetails: parsedData.educationEmploymentHistory?.truancyDetails || "",
        schoolEpisodes: parsedData.educationEmploymentHistory?.schoolEpisodes || "",
        hasEmploymentHistory: parsedData.educationEmploymentHistory?.hasEmploymentHistory || false,
        employmentPeriod: parsedData.educationEmploymentHistory?.employmentPeriod || "",
        jobChangeCount: parsedData.educationEmploymentHistory?.jobChangeCount || undefined,
        longestEmploymentPeriod: parsedData.educationEmploymentHistory?.longestEmploymentPeriod || "",
        employmentType: parsedData.educationEmploymentHistory?.employmentType || "",
        reasonForLeaving: parsedData.educationEmploymentHistory?.reasonForLeaving || "",
        workplaceRelationships: parsedData.educationEmploymentHistory?.workplaceRelationships || "",
        employmentSupportHistory: parsedData.educationEmploymentHistory?.employmentSupportHistory || "",
      },
      
      currentLifeStatus: {
        wakeUpTime: parsedData.currentLifeStatus?.wakeUpTime || "",
        bedTime: parsedData.currentLifeStatus?.bedTime || "",
        hasDayNightReversal: parsedData.currentLifeStatus?.hasDayNightReversal || false,
        mealFrequency: parsedData.currentLifeStatus?.mealFrequency || "",
        eatsWithFamily: parsedData.currentLifeStatus?.eatsWithFamily || false,
        hasEatingIssues: parsedData.currentLifeStatus?.hasEatingIssues || "",
        bathingFrequency: parsedData.currentLifeStatus?.bathingFrequency || "",
        hobbiesInterests: parsedData.currentLifeStatus?.hobbiesInterests || "",
        goingOutFrequency: parsedData.currentLifeStatus?.goingOutFrequency || "",
        goingOutRange: parsedData.currentLifeStatus?.goingOutRange || "",
        goingOutPurpose: parsedData.currentLifeStatus?.goingOutPurpose || "",
        companion: parsedData.currentLifeStatus?.companion || "",
        familyInteraction: parsedData.currentLifeStatus?.familyInteraction || "",
        outsideInteraction: parsedData.currentLifeStatus?.outsideInteraction || "",
        snsUsage: parsedData.currentLifeStatus?.snsUsage || "",
        friendRelationships: parsedData.currentLifeStatus?.friendRelationships || "",
        grooming: parsedData.currentLifeStatus?.grooming || "",
        cookingSkill: parsedData.currentLifeStatus?.cookingSkill || false,
        laundrySkill: parsedData.currentLifeStatus?.laundrySkill || false,
        cleaningSkill: parsedData.currentLifeStatus?.cleaningSkill || false,
        moneyManagement: parsedData.currentLifeStatus?.moneyManagement || false,
        economicStatus: parsedData.currentLifeStatus?.economicStatus || "",
        availableMoney: parsedData.currentLifeStatus?.availableMoney || "",
      },
      
      behavioralPsychologicalFeatures: {
        domesticViolence: parsedData.behavioralPsychologicalFeatures?.domesticViolence || false,
        verbalAbuse: parsedData.behavioralPsychologicalFeatures?.verbalAbuse || false,
        propertyDamage: parsedData.behavioralPsychologicalFeatures?.propertyDamage || false,
        compulsiveBehavior: parsedData.behavioralPsychologicalFeatures?.compulsiveBehavior || false,
        selfHarm: parsedData.behavioralPsychologicalFeatures?.selfHarm || false,
        excessiveSpending: parsedData.behavioralPsychologicalFeatures?.excessiveSpending || false,
        addictiveBehavior: parsedData.behavioralPsychologicalFeatures?.addictiveBehavior || false,
        psychologicalFeatures: parsedData.behavioralPsychologicalFeatures?.psychologicalFeatures || "",
        specialNotes: parsedData.behavioralPsychologicalFeatures?.specialNotes || "",
      },
      
      supportNeeds: {
        subjectHope: parsedData.supportNeeds?.subjectHope || "",
        familyHope: parsedData.supportNeeds?.familyHope || "",
        necessarySupport: parsedData.supportNeeds?.necessarySupport || "",
        partnerOrganizations: parsedData.supportNeeds?.partnerOrganizations || "",
      },
      
      assessmentSupplement: {
        childhoodEpisodes: parsedData.assessmentSupplement?.childhoodEpisodes || "",
        specialNotes: parsedData.assessmentSupplement?.specialNotes || "",
        informationSharingOrganizations: parsedData.assessmentSupplement?.informationSharingOrganizations || "",
        recordedBy: parsedData.assessmentSupplement?.recordedBy || "",
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

  // ひきこもり経過のチェック
  if (!data.hikikomoriHistory.startDate) {
    warnings.push("ひきこもり開始時期が抽出できませんでした")
  }
  if (!data.hikikomoriHistory.trigger) {
    warnings.push("ひきこもりのきっかけ・経緯が抽出できませんでした")
  }

  // 支援ニーズのチェック
  if (!data.supportNeeds.subjectHope && !data.supportNeeds.familyHope) {
    warnings.push("本人または家族の希望が抽出できませんでした")
  }

  return warnings
}


