// Mock data integration and AI analysis engine
// 【重要】個人情報保護のため、氏名等の個人を特定できる情報は使用しない
// 利用者の識別には匿名化ID（anonymousId）のみを使用する

import { getConversationHistory } from "./mock-conversation"
import { getVitalHistory } from "./mock-vital"
import { findSimilarCases, type CaseCard } from "./mock-case-cards"
import { formatAnonymousIdForDisplay } from "./anonymous-id"

export interface IntegratedAnalysis {
  /** 匿名化ID（YY-NNN形式） */
  patientId: string
  overallScore: number
  riskLevel: string
  supportDuration: number
  improvementTrend: string
  conversationInsights: {
    emotion: string
    frequency: string
    communication: string
  }
  vitalInsights: {
    stressLevel: string
    activityLevel: string
    sleepQuality: string
  }
  integratedInsight: string
  psychologicalState: Array<{
    aspect: string
    score: number
  }>
  recommendations: Array<{
    title: string
    description: string
    category: string
    priority: string
  }>
  cautions: string[]
  similarCases: Array<{
    caseId: string
    similarity: number
    duration: string
    outcome: string
    characteristics: string[]
    effectiveApproach: string
  }>
  recommendedCases: Array<{
    caseCard: CaseCard
    similarity: number
    matchingFactors: string[]
  }>
  predictedPath: string
}

export async function integrateAndAnalyze(patientId: string): Promise<IntegratedAnalysis> {
  // Simulate AI processing time
  await new Promise((resolve) => setTimeout(resolve, 2500))

  // Get conversation and vital data
  const conversations = getConversationHistory()
  const vitalHistory = getVitalHistory(patientId)

  // 【匿名化対応】利用者は匿名化IDのみで識別される
  // patientIdは匿名化ID（YY-NNN形式）として扱う
  const displayId = formatAnonymousIdForDisplay(patientId)

  // Calculate mock scores based on data
  const hasConversations = conversations.length > 0
  const hasVitals = vitalHistory.length > 0

  const overallScore = Math.floor(Math.random() * 30) + 50 // 50-80
  let riskLevel = "中"
  let improvementTrend = "安定"

  if (overallScore > 70) {
    riskLevel = "低"
    improvementTrend = "改善"
  } else if (overallScore < 60) {
    riskLevel = "高"
    improvementTrend = "要注意"
  }

  const supportDuration = Math.floor(Math.random() * 12) + 3 // 3-15 months

  // Conversation insights
  const emotions = ["ポジティブ", "ニュートラル", "不安", "ネガティブ"]
  const conversationInsights = {
    emotion: emotions[Math.floor(Math.random() * emotions.length)],
    frequency: hasConversations ? "週2-3回" : "データ不足",
    communication: hasConversations ? "良好" : "改善が必要",
  }

  // Vital insights
  const vitalInsights = {
    stressLevel: riskLevel,
    activityLevel: hasVitals ? "やや低い" : "データ不足",
    sleepQuality: hasVitals ? "改善傾向" : "データ不足",
  }

  // Integrated insight
  const integratedInsight =
    riskLevel === "低"
      ? "会話データとバイタルデータの両方から、心理状態の改善傾向が見られます。現在の支援アプローチを継続することで、さらなる改善が期待できます。"
      : riskLevel === "高"
        ? "会話データからは不安傾向が、バイタルデータからはストレスの高まりが確認されます。早期の介入と支援強化が推奨されます。"
        : "全体的に安定した状態ですが、一部に改善の余地があります。継続的なモニタリングと段階的な支援が効果的です。"

  // Psychological state
  const psychologicalState = [
    { aspect: "自己肯定感", score: Math.floor(Math.random() * 30) + 50 },
    { aspect: "社会的関心", score: Math.floor(Math.random() * 30) + 40 },
    { aspect: "活動意欲", score: Math.floor(Math.random() * 30) + 45 },
    { aspect: "ストレス耐性", score: Math.floor(Math.random() * 30) + 55 },
    { aspect: "コミュニケーション", score: Math.floor(Math.random() * 30) + 50 },
  ]

  // Recommendations
  const recommendations = [
    {
      title: "段階的な外出支援",
      description:
        "まずは近所への短時間の外出から始め、徐々に時間と距離を延ばしていきます。人が少ない時間帯を選ぶことで、不安を軽減できます。",
      category: "行動支援",
      priority: riskLevel === "高" ? "高" : "中",
    },
    {
      title: "リラクゼーション技法の導入",
      description:
        "深呼吸法やマインドフルネス瞑想を日常に取り入れることで、ストレス管理能力を向上させます。1日10分から始めることを推奨します。",
      category: "ストレス管理",
      priority: "中",
    },
    {
      title: "生活リズムの改善",
      description:
        "規則的な起床・就寝時間を設定し、日中の活動時間を確保します。バイタルデータから睡眠の質の改善が見られています。",
      category: "生活習慣",
      priority: "中",
    },
    {
      title: "小さな成功体験の積み重ね",
      description:
        "達成可能な小さな目標を設定し、成功体験を積み重ねることで自己肯定感を高めます。週に1つの目標から始めましょう。",
      category: "心理支援",
      priority: "高",
    },
  ]

  // Cautions
  const cautions = [
    "急激な変化を求めず、当事者のペースを尊重してください",
    "ストレスレベルが高い時期は、無理な活動を避けることが重要です",
    "家族との関係性にも注意を払い、必要に応じて家族支援も検討してください",
  ]

  if (riskLevel === "高") {
    cautions.unshift("現在リスクレベルが高い状態です。頻繁なモニタリングと早期介入が必要です")
  }

  // Similar cases
  const similarCases = [
    {
      caseId: "2023-045",
      similarity: 87,
      duration: "8ヶ月",
      outcome: "成功",
      characteristics: ["不安傾向", "活動量低下", "家族関係良好"],
      effectiveApproach: "段階的な外出支援と、リラクゼーション技法の組み合わせが効果的でした。",
    },
    {
      caseId: "2023-032",
      similarity: 78,
      duration: "12ヶ月",
      outcome: "成功",
      characteristics: ["コミュニケーション困難", "睡眠障害", "ストレス高"],
      effectiveApproach: "生活リズムの改善を優先し、その後に社会的活動を段階的に導入しました。",
    },
    {
      caseId: "2023-018",
      similarity: 72,
      duration: "6ヶ月",
      outcome: "改善中",
      characteristics: ["自己肯定感低下", "活動意欲低下"],
      effectiveApproach: "小さな成功体験の積み重ねと、定期的なポジティブフィードバックが有効でした。",
    },
  ]

  const recommendedCases = findSimilarCases({
    riskLevel,
    conversationInsights,
    vitalInsights,
    psychologicalState,
  })

  // Predicted path
  const predictedPath =
    riskLevel === "低"
      ? "類似事例の分析から、現在のペースで支援を継続することで、6-8ヶ月以内に社会復帰の準備が整うと予測されます。"
      : riskLevel === "高"
        ? "早期介入により、3-4ヶ月で状態の安定化が見込まれます。その後、段階的な支援により12-18ヶ月での社会復帰を目指します。"
        : "現在の支援を継続しながら、段階的に活動範囲を広げることで、9-12ヶ月での社会復帰が期待できます。"

  return {
    patientId: displayId,
    overallScore,
    riskLevel,
    supportDuration,
    improvementTrend,
    conversationInsights,
    vitalInsights,
    integratedInsight,
    psychologicalState,
    recommendations,
    cautions,
    similarCases,
    recommendedCases,
    predictedPath,
  }
}
