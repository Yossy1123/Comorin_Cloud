// 【重要】個人情報保護のため、氏名等の個人を特定できる情報は使用しない
// 利用者の識別には匿名化ID（anonymousId）のみを使用する

import type { IntegratedAnalysis } from "./mock-analysis"

export interface ExportHistory {
  id: string
  filename: string
  format: string
  timestamp: string
  content: string
  mimeType: string
}

/**
 * 統合レポートをエクスポートする
 * @param analysis - 分析結果
 * @param patientId - 匿名化ID（YY-NNN形式）
 * @param format - 出力形式
 */
export async function exportIntegratedReport(
  analysis: IntegratedAnalysis,
  patientId: string,
  format: "pdf" | "json",
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 2000))

  const dateStr = new Date().toISOString().split("T")[0]
  const filename = `support-report_${patientId}_${dateStr}.${format}`

  let content = ""
  let mimeType = ""

  switch (format) {
    case "pdf":
      content = generateIntegratedPDFReport(analysis, patientId)
      mimeType = "text/plain"
      break
    case "json":
      content = generateIntegratedJSONReport(analysis, patientId)
      mimeType = "application/json"
      break
  }

  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function generateIntegratedPDFReport(analysis: IntegratedAnalysis, patientId: string): string {
  const today = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 30)

  return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ひきこもり支援 統合レポート
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

生成日時: ${today.toLocaleString("ja-JP")}
対象者ID: ${patientId}
分析期間: ${startDate.toLocaleDateString("ja-JP")} 〜 ${today.toLocaleDateString("ja-JP")} (30日間)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【1. 総合評価サマリー】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

総合スコア: ${analysis.overallScore}点 / 100点
リスクレベル: ${analysis.riskLevel}
支援継続期間: ${analysis.supportDuration}ヶ月
改善傾向: ${analysis.improvementTrend}

現在の状態:
  ${analysis.riskLevel === "低" ? "✓ 安定した状態を維持しています" : analysis.riskLevel === "中" ? "△ 継続的な支援が必要です" : "⚠ 重点的な支援が必要です"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【2. データソース統合分析】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

2-1. 会話データ分析
────────────────────────────────────
  感情状態: ${analysis.conversationInsights.emotion}
  会話頻度: ${analysis.conversationInsights.frequency}
  コミュニケーション: ${analysis.conversationInsights.communication}

2-2. バイタルデータ分析
────────────────────────────────────
  ストレスレベル: ${analysis.vitalInsights.stressLevel}
  活動量: ${analysis.vitalInsights.activityLevel}
  睡眠状態: ${analysis.vitalInsights.sleepQuality}

2-3. AI統合分析
────────────────────────────────────
  ${analysis.integratedInsight}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【3. 心理状態の推定】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${analysis.psychologicalState.map((state) => `  ${state.aspect}: ${state.score}%`).join("\n")}

所見:
  会話データとバイタルデータを統合的に分析した結果、
  ${analysis.overallScore >= 70 ? "心理的な安定性が向上していることが確認されました。" : "継続的な支援により改善の兆しが見られます。"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【4. 個別最適化された推奨支援アプローチ】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${analysis.recommendations
  .map(
    (rec, index) => `
${index + 1}. ${rec.title}
   優先度: ${rec.priority}
   カテゴリ: ${rec.category}
   
   内容:
   ${rec.description}
   
   期待される効果:
   この支援アプローチにより、${rec.category}の改善が期待されます。
`,
  )
  .join("\n")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【5. 注意事項】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

支援時に留意すべきポイント:

${analysis.cautions.map((caution, index) => `  ${index + 1}. ${caution}`).join("\n")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【6. 類似事例との比較】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

過去の支援事例から類似パターンを抽出しました:

${analysis.similarCases
  .map(
    (case_) => `
事例 #${case_.caseId}
  類似度: ${case_.similarity}%
  支援期間: ${case_.duration}
  結果: ${case_.outcome}
  
  主な特徴:
  ${case_.characteristics.map((char) => `  • ${char}`).join("\n")}
  
  効果的だったアプローチ:
  ${case_.effectiveApproach}
`,
  )
  .join("\n")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【7. 予測される支援経路】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

類似事例に基づく今後の見通し:

${analysis.predictedPath}

今後の目標:
  短期目標（3ヶ月）:
    • 総合スコア ${analysis.overallScore + 10}点以上
    • リスクレベルの維持または改善
    • 推奨アプローチの実践

  中期目標（6ヶ月）:
    • 総合スコア ${analysis.overallScore + 20}点以上
    • 社会参加活動の増加
    • 生活リズムの安定化

  長期目標（12ヶ月）:
    • 自立した生活の確立
    • 就労または就学の検討
    • 支援の段階的縮小

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【8. 支援者へのメッセージ】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

本レポートは、会話データ、活動量、睡眠、自律神経データを
統合的に分析し、AIによる客観的な評価と推奨アプローチを
提示したものです。

対象者（ID: ${patientId}）は${analysis.improvementTrend === "改善" ? "着実に改善の道を歩んでいます。" : "継続的な支援により、改善の可能性があります。"}
データからは、${analysis.integratedInsight}

今後も本人のペースを尊重しながら、段階的な支援を
継続していくことが重要です。

支援者の皆様の継続的なサポートが、
当事者の回復と自立への大きな力となっています。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

レポート作成: AI支援システム v1.0
次回レポート推奨日: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("ja-JP")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`
}

function generateIntegratedJSONReport(analysis: IntegratedAnalysis, patientId: string): string {
  const today = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 30)

  const report = {
    reportMetadata: {
      generatedAt: today.toISOString(),
      reportType: "integrated_support_report",
      patientId: patientId,
      analysisStartDate: startDate.toISOString(),
      analysisEndDate: today.toISOString(),
      analysisDays: 30,
    },
    overallAssessment: {
      overallScore: analysis.overallScore,
      riskLevel: analysis.riskLevel,
      supportDuration: analysis.supportDuration,
      improvementTrend: analysis.improvementTrend,
    },
    dataSourceAnalysis: {
      conversation: {
        emotion: analysis.conversationInsights.emotion,
        frequency: analysis.conversationInsights.frequency,
        communication: analysis.conversationInsights.communication,
      },
      vital: {
        stressLevel: analysis.vitalInsights.stressLevel,
        activityLevel: analysis.vitalInsights.activityLevel,
        sleepQuality: analysis.vitalInsights.sleepQuality,
      },
      integratedInsight: analysis.integratedInsight,
    },
    psychologicalState: analysis.psychologicalState.map((state) => ({
      aspect: state.aspect,
      score: state.score,
    })),
    recommendedApproaches: analysis.recommendations.map((rec) => ({
      title: rec.title,
      description: rec.description,
      category: rec.category,
      priority: rec.priority,
    })),
    cautions: analysis.cautions,
    similarCases: analysis.similarCases.map((case_) => ({
      caseId: case_.caseId,
      similarity: case_.similarity,
      duration: case_.duration,
      outcome: case_.outcome,
      characteristics: case_.characteristics,
      effectiveApproach: case_.effectiveApproach,
    })),
    predictedPath: analysis.predictedPath,
    goals: {
      shortTerm: {
        period: "3ヶ月",
        targetScore: analysis.overallScore + 10,
        targets: ["リスクレベルの維持または改善", "推奨アプローチの実践"],
      },
      mediumTerm: {
        period: "6ヶ月",
        targetScore: analysis.overallScore + 20,
        targets: ["社会参加活動の増加", "生活リズムの安定化"],
      },
      longTerm: {
        period: "12ヶ月",
        targets: ["自立した生活の確立", "就労または就学の検討", "支援の段階的縮小"],
      },
    },
  }

  return JSON.stringify(report, null, 2)
}
