// 日報作成のためのデータ型と関数
// 【重要】個人情報保護のため、氏名等の個人を特定できる情報は使用しない
// 利用者の識別には匿名化ID（anonymousId）のみを使用する

import { getConversationHistory } from "./mock-conversation"

export interface DailyReport {
  /** 匿名化ID（YY-NNN形式） */
  patientId: string
  reportDate: string
  conversationSummary: {
    hasConversation: boolean
    emotionalState: string
    keyTopics: string[]
    concerns: string[]
    positivePoints: string[]
  }
  comprehensiveAssessment: {
    todayStatus: string
    mentalState: string
    physicalState: string
    socialEngagement: string
  }
  supportActions: {
    actionsTaken: string[]
    patientResponse: string
    effectivenessLevel: string
  }
  noteworthyObservations: string[]
  nextSteps: string[]
  overallRating: number // 1-5
  supporterNotes: string
}

export async function generateDailyReport(
  patientId: string,
  targetDate?: Date
): Promise<DailyReport> {
  // Simulate processing time
  await new Promise((resolve) => setTimeout(resolve, 2000))

  const reportDate = targetDate ? targetDate.toISOString().split("T")[0] : new Date().toISOString().split("T")[0]

  // Get conversation data
  const conversations = getConversationHistory()
  const todayConversations = conversations.filter((conv) => {
    const convDate = new Date(conv.timestamp).toISOString().split("T")[0]
    return convDate === reportDate && conv.patientId === patientId
  })

  // Analyze conversation
  const hasConversation = todayConversations.length > 0
  let emotionalState = "データなし"
  const keyTopics: string[] = []
  const concerns: string[] = []
  const positivePoints: string[] = []

  if (hasConversation) {
    const latestConv = todayConversations[0]
    emotionalState = latestConv.analysis.emotion

    // Extract key topics from keywords
    keyTopics.push(...latestConv.analysis.keywords)

    // Analyze concerns and positive points based on emotion
    if (latestConv.analysis.emotion === "不安" || latestConv.analysis.emotion === "ネガティブ") {
      concerns.push("不安や心配事の表出が見られました")
      if (latestConv.transcript.includes("眠れない")) {
        concerns.push("睡眠に関する困難を報告")
      }
      if (latestConv.transcript.includes("将来")) {
        concerns.push("将来に対する不安を表明")
      }
    }

    if (
      latestConv.analysis.emotion === "ポジティブ" ||
      latestConv.transcript.includes("少しずつ") ||
      latestConv.transcript.includes("前に進")
    ) {
      positivePoints.push("前向きな発言や意欲の向上が見られました")
    }

    if (latestConv.transcript.includes("外出") || latestConv.transcript.includes("外に出")) {
      positivePoints.push("外出への意欲を示しました")
    }

    if (latestConv.transcript.includes("家族")) {
      keyTopics.push("家族関係")
      if (latestConv.transcript.includes("話せる")) {
        positivePoints.push("家族とのコミュニケーションが改善")
      }
    }
  } else {
    concerns.push("本日は会話セッションが記録されていません")
  }

  // Comprehensive assessment
  let todayStatus = "安定"
  let mentalState = "落ち着いている"
  let physicalState = "標準的"
  let socialEngagement = "限定的"

  if (hasConversation) {
    if (emotionalState === "不安" || emotionalState === "ネガティブ") {
      todayStatus = "要注意"
      mentalState = "不安定・支援が必要"
    } else if (emotionalState === "ポジティブ") {
      todayStatus = "良好"
      mentalState = "前向き・意欲的"
    }

    if (keyTopics.includes("家族関係") || keyTopics.includes("コミュニケーション")) {
      socialEngagement = "向上中"
    }
  }

  // Physical state is determined from conversation topics
  if (keyTopics.includes("体調") || keyTopics.includes("睡眠")) {
    if (concerns.some(c => c.includes("睡眠") || c.includes("体調"))) {
      physicalState = "要改善"
    } else {
      physicalState = "良好"
    }
  }

  const comprehensiveAssessment = {
    todayStatus,
    mentalState,
    physicalState,
    socialEngagement,
  }

  // Support actions
  const actionsTaken: string[] = []
  let patientResponse = "記録なし"
  let effectivenessLevel = "評価待ち"

  if (hasConversation) {
    actionsTaken.push("傾聴と共感的対話を実施")

    const latestConv = todayConversations[0]
    if (latestConv.analysis.recommendation) {
      actionsTaken.push("個別支援アプローチを提案")
    }

    if (emotionalState === "ポジティブ") {
      patientResponse = "積極的・受容的"
      effectivenessLevel = "効果的"
    } else if (emotionalState === "不安") {
      patientResponse = "不安定だが対話可能"
      effectivenessLevel = "部分的に効果"
    } else {
      patientResponse = "落ち着いて対話"
      effectivenessLevel = "適切"
    }

    if (keyTopics.includes("外出")) {
      actionsTaken.push("外出支援の計画について相談")
    }
  } else {
    actionsTaken.push("本日は直接的な支援活動なし")
  }

  const supportActions = {
    actionsTaken,
    patientResponse,
    effectivenessLevel,
  }

  // Noteworthy observations
  const noteworthyObservations: string[] = []

  if (hasConversation && emotionalState === "ポジティブ") {
    noteworthyObservations.push("会話中に前向きな発言が多く見られ、心理状態の改善傾向が確認できます")
  }

  if (hasConversation && concerns.length > positivePoints.length) {
    noteworthyObservations.push("不安や懸念事項が多く表出されており、追加的な支援が必要な可能性があります")
  }

  // Next steps
  const nextSteps: string[] = []

  if (hasConversation && keyTopics.includes("外出")) {
    nextSteps.push("外出支援の具体的なプランを作成し、次回セッションで共有")
  }

  if (concerns.length > 2) {
    nextSteps.push("不安軽減のための追加セッションを計画")
  }

  if (emotionalState === "ポジティブ") {
    nextSteps.push("現在の良好な状態を維持するため、達成感を強化する活動を提案")
  }

  if (!hasConversation) {
    nextSteps.push("次回の会話セッションを早めに設定し、状況を確認")
  }

  // Overall rating (1-5)
  let overallRating = 3

  if (todayStatus === "良好") {
    overallRating = 4
  } else if (todayStatus === "要注意") {
    overallRating = 2
  }
  
  // Adjust rating based on conversation quality
  if (hasConversation && positivePoints.length > concerns.length) {
    overallRating = Math.min(5, overallRating + 1)
  } else if (concerns.length > 2) {
    overallRating = Math.max(1, overallRating - 1)
  }

  // Supporter notes
  let supporterNotes = ""

  if (overallRating >= 4) {
    supporterNotes =
      "本日は全体的に良好な状態でした。引き続き現在の支援方針を継続し、当事者のペースを尊重しながら段階的な改善を目指します。"
  } else if (overallRating === 3) {
    supporterNotes =
      "概ね安定していますが、いくつかの改善点が見られます。継続的なモニタリングと、必要に応じた支援の調整を行います。"
  } else {
    supporterNotes =
      "注意が必要な状態です。不安や生活リズムの乱れが確認されるため、より頻繁な接触と、具体的な支援策の実施が必要です。必要に応じて専門家への相談も検討します。"
  }

  return {
    patientId,
    reportDate,
    conversationSummary: {
      hasConversation,
      emotionalState,
      keyTopics: [...new Set(keyTopics)],
      concerns,
      positivePoints,
    },
    comprehensiveAssessment,
    supportActions,
    noteworthyObservations,
    nextSteps,
    overallRating,
    supporterNotes,
  }
}

// Export report data
export async function exportDailyReport(report: DailyReport, format: "pdf" | "excel" = "pdf"): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // 【匿名化対応】ファイル名には匿名化IDのみを使用
  const fileName = `日報_${report.patientId}_${report.reportDate}.${format}`
  console.log(`日報をエクスポート: ${fileName}`)

  // In a real implementation, this would generate and download the file
  // For now, we'll just show a success message
  alert(`日報「${fileName}」のエクスポートが完了しました（モック実装）`)
}

