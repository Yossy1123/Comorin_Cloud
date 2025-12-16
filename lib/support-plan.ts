// 個別支援計画策定のためのデータ型と関数
// 【重要】個人情報保護のため、氏名等の個人を特定できる情報は使用しない
// 利用者の識別には匿名化ID（anonymousId）のみを使用する

import { getConversationHistory } from "./mock-conversation"
import { getActivityData, getSleepData, analyzeAutonomicNervousSystem } from "./mock-vital"
import { findSimilarCases } from "./mock-case-cards"

export interface SupportGoal {
  term: "短期" | "中期" | "長期"
  period: string
  goal: string
  specificActions: string[]
  successCriteria: string[]
}

export interface SupportMethod {
  category: string
  approach: string
  frequency: string
  duration: string
  keyPoints: string[]
  expectedOutcome: string
}

export interface RoleAssignment {
  role: string
  name: string
  responsibilities: string[]
}

export interface EvaluationMetric {
  metric: string
  method: string
  frequency: string
  target: string
}

export interface SupportPlan {
  /** 匿名化ID（YY-NNN形式） */
  patientId: string
  planDate: string
  planPeriod: string
  
  // アセスメント結果
  assessmentSummary: {
    currentStatus: string
    strengths: string[]
    challenges: string[]
    riskLevel: string
    psychologicalState: {
      emotion: string
      stressLevel: string
      motivation: string
    }
    physicalState: {
      sleepQuality: string
      activityLevel: string
      autonomicBalance: string
    }
    socialState: {
      familyRelation: string
      communicationSkill: string
      externalEngagement: string
    }
  }
  
  // 支援目標
  goals: SupportGoal[]
  
  // 支援方針・ポイント
  supportPolicy: {
    basicApproach: string
    keyPoints: string[]
    attentionPoints: string[]
  }
  
  // 具体的な支援内容
  supportMethods: SupportMethod[]
  
  // 役割分担
  roleAssignments: RoleAssignment[]
  
  // 評価指標
  evaluationMetrics: EvaluationMetric[]
  
  // 類似事例参照
  similarCases: Array<{
    caseId: string
    similarity: number
    overview: string
    effectiveApproach: string
    applicationPoints: string[]
  }>
  
  // リスク管理
  riskManagement: {
    identifiedRisks: string[]
    preventiveMeasures: string[]
    emergencyContact: string[]
  }
  
  // 次回評価日
  nextEvaluationDate: string
  
  // 備考
  notes: string
}

export async function generateSupportPlan(
  patientId: string,
  useGPT: boolean = false
): Promise<SupportPlan> {
  // GPT連携を使用する場合
  if (useGPT && typeof window !== "undefined") {
    return await generateSupportPlanWithGPT(patientId);
  }

  // Simulate AI processing time (モック実装)
  await new Promise((resolve) => setTimeout(resolve, 3000))

  const planDate = new Date().toISOString().split("T")[0]
  const nextEvalDate = new Date()
  nextEvalDate.setMonth(nextEvalDate.getMonth() + 3)
  const nextEvaluationDate = nextEvalDate.toISOString().split("T")[0]

  // Get conversation and vital data
  const conversations = getConversationHistory()
  const patientConversations = conversations.filter((conv) => conv.patientId === patientId)
  const activityData = await getActivityData(patientId)
  const sleepData = await getSleepData(patientId)
  const autonomicData = await analyzeAutonomicNervousSystem(patientId)

  // Analyze current status
  let currentStatus = "支援開始期"
  let riskLevel = "中"
  let emotion = "ニュートラル"
  let stressLevel = "中"
  let motivation = "やや低い"

  if (patientConversations.length > 0) {
    const latestConv = patientConversations[0]
    emotion = latestConv.analysis.emotion
    stressLevel = latestConv.analysis.stressLevel

    if (emotion === "ポジティブ") {
      motivation = "向上中"
      riskLevel = "低"
      currentStatus = "改善期"
    } else if (emotion === "不安" || emotion === "ネガティブ") {
      motivation = "低い"
      riskLevel = "高"
      currentStatus = "安定化が必要"
    }
  }

  // Determine strengths and challenges
  const strengths: string[] = []
  const challenges: string[] = []

  if (sleepData.sleepQuality === "良好") {
    strengths.push("規則正しい睡眠習慣が確立されている")
  } else {
    challenges.push("睡眠の質の改善が必要")
  }

  if (activityData.activityLevel === "高") {
    strengths.push("日常的な活動量が十分に確保されている")
  } else if (activityData.activityLevel === "低") {
    challenges.push("活動量が不足しており、段階的な増加が必要")
  }

  if (emotion === "ポジティブ") {
    strengths.push("前向きな思考や意欲の向上が見られる")
  } else if (emotion === "不安" || emotion === "ネガティブ") {
    challenges.push("不安や心配事が多く、心理的サポートが必要")
  }

  if (patientConversations.length > 5) {
    strengths.push("定期的なコミュニケーションが取れている")
  } else {
    challenges.push("対話の機会を増やし、信頼関係の構築が必要")
  }

  // Assessment summary
  const assessmentSummary = {
    currentStatus,
    strengths: strengths.length > 0 ? strengths : ["支援を通じて強みを発見していきます"],
    challenges: challenges.length > 0 ? challenges : ["継続的な観察が必要です"],
    riskLevel,
    psychologicalState: {
      emotion,
      stressLevel,
      motivation,
    },
    physicalState: {
      sleepQuality: sleepData.sleepQuality,
      activityLevel: activityData.activityLevel,
      autonomicBalance: autonomicData.balanceStatus,
    },
    socialState: {
      familyRelation: patientConversations.some((c) => c.analysis.keywords.includes("家族関係"))
        ? "改善の兆しあり"
        : "要支援",
      communicationSkill: patientConversations.length > 3 ? "向上中" : "段階的な改善が必要",
      externalEngagement: activityData.today.steps > 5000 ? "一部活動あり" : "限定的",
    },
  }

  // Support goals
  const goals: SupportGoal[] = []

  // Short-term goals (1-3 months)
  if (sleepData.sleepQuality === "要改善") {
    goals.push({
      term: "短期",
      period: "1-3ヶ月",
      goal: "生活リズムの安定化",
      specificActions: [
        "就寝・起床時刻を記録し、規則的なリズムを確立する",
        "就寝前のリラックスルーティンを導入する",
        "日中の活動時間を確保し、夜間の睡眠の質を向上させる",
      ],
      successCriteria: ["睡眠時間が平均7時間以上", "睡眠スコアが70点以上", "規則的な就寝・起床時刻の維持"],
    })
  }

  if (activityData.activityLevel === "低") {
    goals.push({
      term: "短期",
      period: "1-3ヶ月",
      goal: "段階的な活動量の増加",
      specificActions: [
        "1日15分の散歩から開始する",
        "週2-3回、近所への外出を実施する",
        "家の中での軽い運動やストレッチを取り入れる",
      ],
      successCriteria: ["1日の歩数が3,000歩以上", "週3回以上の外出", "活動に対する抵抗感の軽減"],
    })
  }

  goals.push({
    term: "短期",
    period: "1-3ヶ月",
    goal: "心理的安定の確保",
    specificActions: [
      "週1回の定期的な対話セッションを実施",
      "不安や悩みを表出できる安全な環境を提供",
      "小さな成功体験を積み重ね、自己肯定感を高める",
    ],
    successCriteria: ["定期的な対話の継続", "不安レベルの軽減", "前向きな発言の増加"],
  })

  // Mid-term goals (3-6 months)
  goals.push({
    term: "中期",
    period: "3-6ヶ月",
    goal: "社会的関与の拡大",
    specificActions: [
      "家族とのコミュニケーション頻度を増やす",
      "趣味や興味のある活動を見つける",
      "少人数のグループ活動に参加する",
    ],
    successCriteria: [
      "家族との会話が週3回以上",
      "趣味活動への参加月2回以上",
      "対人不安の軽減",
    ],
  })

  // Long-term goals (6-12 months)
  goals.push({
    term: "長期",
    period: "6-12ヶ月",
    goal: "社会復帰の準備",
    specificActions: [
      "職業訓練や学習プログラムの情報収集",
      "アルバイトやボランティアなどの社会活動を検討",
      "自立した生活リズムの確立",
    ],
    successCriteria: [
      "社会参加への具体的なプランの策定",
      "自己管理能力の向上",
      "安定した心身の状態の維持",
    ],
  })

  // Support policy
  let basicApproach = ""
  const keyPoints: string[] = []
  const attentionPoints: string[] = []

  if (riskLevel === "高") {
    basicApproach =
      "まずは心理的安定を最優先とし、無理のないペースで支援を進めます。当事者の安心感を醸成し、信頼関係を構築することを重視します。"
    keyPoints.push("当事者のペースを尊重し、焦らせない")
    keyPoints.push("小さな成功体験を積み重ね、自信を育てる")
    keyPoints.push("安全で安心できる環境を提供する")
    attentionPoints.push("不安やストレスの兆候に早期に気づき対応する")
    attentionPoints.push("無理な目標設定を避け、達成可能な目標から始める")
  } else if (riskLevel === "低") {
    basicApproach =
      "現在の良好な状態を維持しながら、段階的に活動範囲を広げていきます。当事者の主体性を尊重し、自己決定を促進する支援を行います。"
    keyPoints.push("当事者の意欲や関心を最大限に活かす")
    keyPoints.push("新しい挑戦を支援し、成長の機会を提供する")
    keyPoints.push("自律性を育て、自己管理能力を高める")
    attentionPoints.push("過度な期待や負担をかけないよう配慮する")
    attentionPoints.push("挫折や失敗を学びの機会として前向きに捉える")
  } else {
    basicApproach =
      "安定した支援関係を維持しながら、徐々に活動の幅を広げていきます。当事者の強みを活かしつつ、課題には段階的にアプローチします。"
    keyPoints.push("定期的なコミュニケーションを継続する")
    keyPoints.push("できることから少しずつ取り組む")
    keyPoints.push("強みを認識し、それを伸ばす支援を行う")
    attentionPoints.push("状態の変化を注意深く観察する")
    attentionPoints.push("必要に応じて支援方法を柔軟に調整する")
  }

  const supportPolicy = {
    basicApproach,
    keyPoints,
    attentionPoints,
  }

  // Support methods
  const supportMethods: SupportMethod[] = [
    {
      category: "個別対話支援",
      approach: "定期的な1対1のカウンセリングセッション",
      frequency: "週1回",
      duration: "45-60分",
      keyPoints: [
        "傾聴と共感を基本とする",
        "当事者の感情や思いを丁寧に受け止める",
        "認知行動療法の技法を適宜活用する",
      ],
      expectedOutcome: "心理的安定と自己理解の深化",
    },
    {
      category: "生活リズム支援",
      approach: "睡眠・活動記録とフィードバック",
      frequency: "毎日（記録）、週1回（フィードバック）",
      duration: "継続的",
      keyPoints: [
        "就寝・起床時刻を記録し、リズムを可視化する",
        "活動量を測定し、段階的な目標を設定する",
        "良い習慣を強化し、習慣化を促進する",
      ],
      expectedOutcome: "規則的な生活リズムの確立",
    },
    {
      category: "活動支援",
      approach: "段階的な外出・活動プログラム",
      frequency: "週2-3回",
      duration: "開始時15分から徐々に延長",
      keyPoints: [
        "安心できる環境での短時間の活動から始める",
        "成功体験を積み重ね、自信をつける",
        "徐々に活動範囲と時間を拡大する",
      ],
      expectedOutcome: "活動意欲の向上と行動範囲の拡大",
    },
    {
      category: "家族支援",
      approach: "家族向け心理教育と相談",
      frequency: "月1-2回",
      duration: "60分",
      keyPoints: [
        "ひきこもりに関する正しい理解を促進する",
        "家族のストレス管理をサポートする",
        "効果的なコミュニケーション方法を提案する",
      ],
      expectedOutcome: "家族の理解と適切なサポート体制の構築",
    },
  ]

  // Role assignments
  const roleAssignments: RoleAssignment[] = [
    {
      role: "主担当支援員",
      name: "未定（要割当）",
      responsibilities: [
        "個別対話セッションの実施",
        "支援計画の進捗管理",
        "当事者・家族との連絡調整",
        "緊急時の初期対応",
      ],
    },
    {
      role: "副担当支援員",
      name: "未定（要割当）",
      responsibilities: [
        "主担当支援員のバックアップ",
        "活動支援プログラムの企画・実施",
        "記録の整理と共有",
      ],
    },
    {
      role: "専門相談員（心理）",
      name: "未定（必要時）",
      responsibilities: [
        "専門的な心理アセスメント",
        "心理療法の実施",
        "困難ケースへの助言",
      ],
    },
    {
      role: "家族支援担当",
      name: "未定（要割当）",
      responsibilities: [
        "家族相談の実施",
        "家族向け心理教育プログラムの提供",
        "家族会の運営サポート",
      ],
    },
  ]

  // Evaluation metrics
  const evaluationMetrics: EvaluationMetric[] = [
    {
      metric: "心理的安定度",
      method: "対話時の様子観察、自己評価スケール",
      frequency: "月1回",
      target: "不安レベルの軽減、前向きな発言の増加",
    },
    {
      metric: "生活リズム",
      method: "睡眠・活動記録の分析",
      frequency: "週1回",
      target: "規則的な就寝・起床、睡眠スコア70点以上",
    },
    {
      metric: "活動量",
      method: "歩数計データ、外出記録",
      frequency: "週1回",
      target: "1日3,000歩以上、週3回以上の外出",
    },
    {
      metric: "社会的関与",
      method: "家族との会話頻度、活動参加状況",
      frequency: "月1回",
      target: "家族との会話週3回以上、趣味活動月2回以上",
    },
    {
      metric: "支援目標達成度",
      method: "目標の達成状況レビュー",
      frequency: "3ヶ月ごと",
      target: "短期目標の80%以上達成",
    },
  ]

  // Similar cases
  const similarCases = findSimilarCases({
    riskLevel,
    conversationInsights: { emotion, frequency: "週2-3回", communication: "良好" },
    vitalInsights: {
      stressLevel,
      activityLevel: activityData.activityLevel,
      sleepQuality: sleepData.sleepQuality,
    },
    psychologicalState: [],
  })

  const similarCasesSummary = similarCases.slice(0, 3).map((item) => ({
    caseId: `CASE-${Math.floor(Math.random() * 1000).toString().padStart(4, "0")}`,
    similarity: item.similarity,
    overview: item.caseCard.background,
    effectiveApproach: item.caseCard.mainIntervention,
    applicationPoints: [
      `${item.caseCard.targetPerson}のケースと類似点が多い`,
      "段階的なアプローチが効果的だった",
      `${item.caseCard.results}の成果が期待できる`,
    ],
  }))

  // Risk management
  const identifiedRisks: string[] = []
  const preventiveMeasures: string[] = []

  if (riskLevel === "高") {
    identifiedRisks.push("心理的不安定による状態悪化のリスク")
    identifiedRisks.push("支援関係の構築困難リスク")
    preventiveMeasures.push("頻繁なコンタクトと状態確認")
    preventiveMeasures.push("専門家との連携体制の確保")
  }

  if (sleepData.sleepQuality === "要改善") {
    identifiedRisks.push("睡眠障害による心身の健康悪化")
    preventiveMeasures.push("必要に応じて医療機関への相談を推奨")
  }

  if (activityData.activityLevel === "低") {
    identifiedRisks.push("活動不足による身体機能の低下")
    preventiveMeasures.push("無理のない範囲での活動促進")
  }

  identifiedRisks.push("支援への拒否感や抵抗")
  preventiveMeasures.push("当事者の意思を尊重し、強制しない姿勢")
  preventiveMeasures.push("信頼関係を丁寧に築いていく")

  const emergencyContact = [
    "主担当支援員（緊急連絡先: 要設定）",
    "支援センター代表（平日9:00-18:00）",
    "緊急時対応チーム（24時間対応: 要設定）",
  ]

  const riskManagement = {
    identifiedRisks,
    preventiveMeasures,
    emergencyContact,
  }

  // Notes
  const notes = `本支援計画は、アセスメント結果に基づき作成されました。支援の実施にあたっては、当事者の状態や希望を継続的に確認し、必要に応じて計画を柔軟に調整してください。${
    riskLevel === "高"
      ? "現在リスクレベルが高いため、特に慎重な対応と頻繁なモニタリングが必要です。"
      : ""
  }3ヶ月後の評価時に、目標達成状況を確認し、次期計画を策定します。`

  return {
    patientId,
    planDate,
    planPeriod: "6ヶ月間",
    assessmentSummary,
    goals,
    supportPolicy,
    supportMethods,
    roleAssignments,
    evaluationMetrics,
    similarCases: similarCasesSummary,
    riskManagement,
    nextEvaluationDate,
    notes,
  }
}

/**
 * GPT連携を使用した支援計画生成
 */
export async function generateSupportPlanWithGPT(
  patientId: string
): Promise<SupportPlan> {
  try {
    // 会話データを取得
    const conversations = getConversationHistory();
    const patientConversations = conversations.filter((conv) => conv.patientId === patientId);

    // バイタルデータを取得（モック）
    const activityData = await getActivityData(patientId);
    const sleepData = await getSleepData(patientId);
    const autonomicData = await analyzeAutonomicNervousSystem(patientId);

    // 【匿名化対応】APIリクエストには名前を含めない
    const requestData = {
      patientId,
      conversationData: patientConversations.map((conv) => ({
        transcript: conv.transcript,
        emotion: conv.analysis.emotion,
        stressLevel: conv.analysis.stressLevel,
        keywords: conv.analysis.keywords,
      })),
      vitalData: {
        sleepQuality: sleepData.sleepQuality,
        activityLevel: activityData.activityLevel,
        autonomicBalance: autonomicData.balanceStatus,
      },
    };

    // APIエンドポイントを呼び出し
    const response = await fetch("/api/support-plan/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "支援計画の生成に失敗しました");
    }

    const supportPlan: SupportPlan = await response.json();
    return supportPlan;
  } catch (error) {
    console.error("GPT support plan generation error:", error);
    
    // エラー時はフォールバックとしてモック実装を使用
    console.warn("GPT連携に失敗しました。モックデータを使用します。");
    return generateSupportPlan(patientId, false);
  }
}

// Export support plan
export async function exportSupportPlan(plan: SupportPlan, format: "pdf" | "excel" = "pdf"): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // 【匿名化対応】ファイル名には匿名化IDのみを使用
  const fileName = `個別支援計画_${plan.patientId}_${plan.planDate}.${format}`
  console.log(`個別支援計画をエクスポート: ${fileName}`)

  alert(`個別支援計画「${fileName}」のエクスポートが完了しました（モック実装）`)
}

