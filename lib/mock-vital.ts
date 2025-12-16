// Mock vital data and analysis functions
// 【重要】個人情報保護のため、氏名等の個人を特定できる情報は使用しない
// 利用者の識別には匿名化ID（anonymousId）のみを使用する

export interface VitalData {
  heartRate: number
  steps: number
  stressLevel: string
  sympathetic: number
  parasympathetic: number
  autonomicBalance: string
  sleepHours: number
  activeHours: string
  lifestylePattern: string
}

export interface VitalHistoryRecord {
  id: string
  patientId: string
  timestamp: string
  avgHeartRate: number
  steps: number
  sleepHours: number
  stressLevel: string
}

export interface AutonomicAnalysisResult {
  sympathetic: number
  parasympathetic: number
  balanceStatus: string
  lfComponent: number
  hfComponent: number
  lfHfRatio: number
  interpretation: string
  recommendations: string[]
  stressTrend: Array<{ day: string; stress: number }>
}

export interface ActivityDataRecord {
  patientId: string
  today: {
    steps: number
    stepsGoal: number
    calories: number
    caloriesGoal: number
    activeMinutes: number
    activeMinutesGoal: number
    distance: number
  }
  weeklySteps: Array<{ day: string; steps: number; goal: number }>
  intensityDistribution: Array<{ intensity: string; minutes: number }>
  activityLevel: string
  interpretation: string
  recommendations: string[]
}

export interface SleepDataRecord {
  patientId: string
  lastNight: {
    totalMinutes: number
    efficiency: number
    bedTime: string
    wakeTime: string
    sleepScore: number
    stages: Array<{ stage: string; minutes: number }>
  }
  weeklySleep: Array<{ day: string; hours: number; score: number }>
  sleepGoal: number
  sleepQuality: string
  interpretation: string
  recommendations: string[]
  avgBedTime: string
  avgWakeTime: string
}

// Generate mock real-time vital data
export async function generateMockVitalData(): Promise<VitalData> {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const heartRate = Math.floor(Math.random() * 30) + 60 // 60-90 bpm
  const steps = Math.floor(Math.random() * 5000) + 2000 // 2000-7000 steps
  const sympathetic = Math.floor(Math.random() * 40) + 40 // 40-80%
  const parasympathetic = 100 - sympathetic

  let stressLevel = "中"
  let autonomicBalance = "バランスが取れています"

  if (sympathetic > 70) {
    stressLevel = "高"
    autonomicBalance = "交感神経が優位です。ストレスが高い状態です。"
  } else if (sympathetic < 50) {
    stressLevel = "低"
    autonomicBalance = "副交感神経が優位です。リラックスした状態です。"
  }

  const sleepHours = Math.floor(Math.random() * 3) + 6 // 6-9 hours
  const activeHours = `${Math.floor(Math.random() * 4) + 10}:00-${Math.floor(Math.random() * 4) + 18}:00`

  let lifestylePattern = "規則的"
  if (sleepHours < 7) {
    lifestylePattern = "睡眠不足"
  } else if (steps < 3000) {
    lifestylePattern = "活動不足"
  }

  return {
    heartRate,
    steps,
    stressLevel,
    sympathetic,
    parasympathetic,
    autonomicBalance,
    sleepHours,
    activeHours,
    lifestylePattern,
  }
}

// Get vital history for a patient
export function getVitalHistory(patientId: string): VitalHistoryRecord[] {
  // Generate mock history data for the past 30 days
  const history: VitalHistoryRecord[] = []
  const now = new Date()

  for (let i = 0; i < 30; i++) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    const avgHeartRate = Math.floor(Math.random() * 20) + 65 // 65-85 bpm
    const steps = Math.floor(Math.random() * 6000) + 2000 // 2000-8000 steps
    const sleepHours = Math.floor(Math.random() * 3) + 6 // 6-9 hours

    let stressLevel = "中"
    if (avgHeartRate > 80 || steps < 3000) {
      stressLevel = "高"
    } else if (avgHeartRate < 70 && steps > 5000) {
      stressLevel = "低"
    }

    history.push({
      id: `${patientId}-${i}`,
      patientId,
      timestamp: date.toISOString(),
      avgHeartRate,
      steps,
      sleepHours,
      stressLevel,
    })
  }

  return history
}

// Analyze autonomic nervous system using Fourier transform (mocked)
export async function analyzeAutonomicNervousSystem(patientId: string): Promise<AutonomicAnalysisResult> {
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Mock Fourier transform analysis
  const sympathetic = Math.floor(Math.random() * 40) + 40 // 40-80%
  const parasympathetic = 100 - sympathetic

  let balanceStatus = "良好"
  let interpretation = ""
  const recommendations: string[] = []

  if (sympathetic > 70) {
    balanceStatus = "交感神経優位"
    interpretation = "交感神経が過度に優位な状態です。ストレスや緊張が高く、リラックスが不足している可能性があります。"
    recommendations.push("深呼吸やリラクゼーション技法の実践を推奨します")
    recommendations.push("規則的な睡眠リズムの確立が重要です")
    recommendations.push("適度な運動でストレス解消を図りましょう")
  } else if (parasympathetic > 70) {
    balanceStatus = "副交感神経優位"
    interpretation = "副交感神経が過度に優位な状態です。活動量が不足している可能性があります。"
    recommendations.push("軽い運動や散歩で活動量を増やしましょう")
    recommendations.push("日中の活動時間を意識的に設けることが効果的です")
    recommendations.push("生活リズムの見直しを検討してください")
  } else {
    balanceStatus = "良好"
    interpretation = "自律神経のバランスが良好です。現在の生活リズムを維持することが推奨されます。"
    recommendations.push("現在の良好な状態を維持しましょう")
    recommendations.push("定期的な運動と十分な睡眠を継続してください")
    recommendations.push("ストレス管理を意識的に行いましょう")
  }

  // Mock frequency components
  const lfComponent = Math.floor(Math.random() * 500) + 500 // 500-1000 ms²
  const hfComponent = Math.floor(Math.random() * 400) + 300 // 300-700 ms²
  const lfHfRatio = Number.parseFloat((lfComponent / hfComponent).toFixed(2))

  // Mock stress trend for past 7 days
  const stressTrend = []
  const days = ["月", "火", "水", "木", "金", "土", "日"]
  for (let i = 6; i >= 0; i--) {
    stressTrend.push({
      day: days[6 - i],
      stress: Math.floor(Math.random() * 40) + 30, // 30-70
    })
  }

  return {
    sympathetic,
    parasympathetic,
    balanceStatus,
    lfComponent,
    hfComponent,
    lfHfRatio,
    interpretation,
    recommendations,
    stressTrend,
  }
}

// 【匿名化対応】利用者プロファイル（匿名化IDで管理）
// フォーマット: YY-NNN（例: 25-001 = 2025年に利用開始した1番目の利用者）
const patientActivityProfiles: Record<string, { baseSteps: number; trend: 'improving' | 'stable' | 'declining' }> = {
  '25-001': { baseSteps: 6000, trend: 'improving' },    // 改善傾向
  '25-002': { baseSteps: 4500, trend: 'stable' },       // 安定
  '25-003': { baseSteps: 3000, trend: 'declining' },    // 低下傾向
  '25-004': { baseSteps: 7500, trend: 'stable' },       // 高活動
  '25-005': { baseSteps: 2500, trend: 'improving' },    // 回復中
}

export async function getActivityData(patientId: string): Promise<ActivityDataRecord> {
  await new Promise((resolve) => setTimeout(resolve, 500))

  // 患者ごとのプロファイルを取得（デフォルトは中程度の活動量）
  const profile = patientActivityProfiles[patientId] || { baseSteps: 5000, trend: 'stable' }
  
  // 今日の歩数（基準値に±1500のランダム変動）
  const steps = Math.floor(Math.random() * 3000) + (profile.baseSteps - 1500)
  const stepsGoal = 8000
  const calories = Math.floor(steps * 0.04) + 1000 // 歩数に基づいて計算
  const caloriesGoal = 2000
  const activeMinutes = Math.floor(steps / 100) + Math.floor(Math.random() * 20) // 歩数に基づいて計算
  const activeMinutesGoal = 60
  const distance = Number.parseFloat((steps * 0.0007).toFixed(1)) // Approximate km

  // Weekly steps data - 個人ごとの推移パターンを生成
  const weeklySteps = []
  const days = ["月", "火", "水", "木", "金", "土", "日"]
  
  for (let i = 6; i >= 0; i--) {
    let daySteps = profile.baseSteps
    
    // トレンドに基づいて推移を生成
    if (profile.trend === 'improving') {
      // 改善傾向: 週の後半に向けて増加
      daySteps = profile.baseSteps + (6 - i) * 300 + Math.floor(Math.random() * 1000) - 500
    } else if (profile.trend === 'declining') {
      // 低下傾向: 週の後半に向けて減少
      daySteps = profile.baseSteps - (6 - i) * 200 + Math.floor(Math.random() * 1000) - 500
    } else {
      // 安定: 小さな変動のみ
      daySteps = profile.baseSteps + Math.floor(Math.random() * 2000) - 1000
    }
    
    // 負の値にならないように調整
    daySteps = Math.max(500, daySteps)
    
    weeklySteps.push({
      day: days[6 - i],
      steps: daySteps,
      goal: stepsGoal,
    })
  }

  // Activity intensity distribution
  const intensityDistribution = [
    { intensity: "軽度", minutes: Math.floor(Math.random() * 100) + 200 },
    { intensity: "中度", minutes: Math.floor(Math.random() * 60) + 30 },
    { intensity: "高度", minutes: Math.floor(Math.random() * 30) + 10 },
  ]

  // Determine activity level and recommendations
  let activityLevel = "中"
  let interpretation = ""
  const recommendations: string[] = []

  if (steps >= 7000 && activeMinutes >= 60) {
    activityLevel = "高"
    interpretation = "活動量が十分です。現在の活動レベルを維持することで、心身の健康状態が良好に保たれています。"
    recommendations.push("現在の活動レベルを継続してください")
    recommendations.push("新しい運動や趣味にチャレンジするのも良いでしょう")
    recommendations.push("定期的な休息も忘れずに取りましょう")
  } else if (steps < 4000 || activeMinutes < 30) {
    activityLevel = "低"
    interpretation = "活動量が不足しています。日常生活での活動を増やすことで、心身の健康改善が期待できます。"
    recommendations.push("まずは短時間の散歩から始めましょう")
    recommendations.push("日常生活で階段を使うなど、小さな活動を増やしましょう")
    recommendations.push("無理のない範囲で徐々に活動量を増やしていきましょう")
  } else {
    activityLevel = "中"
    interpretation = "適度な活動量です。さらに活動を増やすことで、より良い健康状態を目指せます。"
    recommendations.push("1日の歩数を少しずつ増やしていきましょう")
    recommendations.push("好きな運動や趣味を見つけることが継続の鍵です")
    recommendations.push("友人や家族と一緒に活動すると楽しく続けられます")
  }

  return {
    patientId,
    today: {
      steps,
      stepsGoal,
      calories,
      caloriesGoal,
      activeMinutes,
      activeMinutesGoal,
      distance,
    },
    weeklySteps,
    intensityDistribution,
    activityLevel,
    interpretation,
    recommendations,
  }
}

// 【匿名化対応】睡眠データプロファイル（匿名化IDで管理）
const patientSleepProfiles: Record<string, { baseSleepHours: number; quality: 'good' | 'improving' | 'poor' }> = {
  '25-001': { baseSleepHours: 7.5, quality: 'improving' },  // 改善中
  '25-002': { baseSleepHours: 7.0, quality: 'good' },       // 良好
  '25-003': { baseSleepHours: 5.5, quality: 'poor' },       // 不良
  '25-004': { baseSleepHours: 8.0, quality: 'good' },       // 良好
  '25-005': { baseSleepHours: 6.5, quality: 'improving' },  // 改善中
}

export async function getSleepData(patientId: string): Promise<SleepDataRecord> {
  await new Promise((resolve) => setTimeout(resolve, 500))

  // 患者ごとのプロファイルを取得
  const profile = patientSleepProfiles[patientId] || { baseSleepHours: 7.0, quality: 'good' }
  
  // 昨夜の睡眠時間（基準値に±1時間のランダム変動）
  const totalMinutes = Math.floor(profile.baseSleepHours * 60 + (Math.random() * 120 - 60))
  
  // 睡眠品質に応じた効率とスコア
  let efficiency: number
  let sleepScore: number
  
  if (profile.quality === 'good') {
    efficiency = Math.floor(Math.random() * 10) + 85 // 85-95%
    sleepScore = Math.floor(Math.random() * 15) + 80 // 80-95
  } else if (profile.quality === 'improving') {
    efficiency = Math.floor(Math.random() * 15) + 75 // 75-90%
    sleepScore = Math.floor(Math.random() * 20) + 70 // 70-90
  } else {
    efficiency = Math.floor(Math.random() * 15) + 65 // 65-80%
    sleepScore = Math.floor(Math.random() * 20) + 55 // 55-75
  }

  // 睡眠品質に応じた就寝・起床時刻
  let bedHour: number
  let wakeHour: number
  
  if (profile.quality === 'good') {
    bedHour = Math.floor(Math.random() * 2) + 22 // 22:00-23:00
    wakeHour = Math.floor(Math.random() * 2) + 6 // 6:00-7:00
  } else if (profile.quality === 'improving') {
    bedHour = Math.floor(Math.random() * 2) + 23 // 23:00-00:00
    wakeHour = Math.floor(Math.random() * 2) + 6 // 6:00-7:00
  } else {
    bedHour = Math.floor(Math.random() * 3) + 0 // 0:00-2:00（不規則）
    wakeHour = Math.floor(Math.random() * 3) + 7 // 7:00-9:00
  }
  
  const bedTime = `${bedHour % 24}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`
  const wakeTime = `${wakeHour}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`

  // Sleep stages distribution - 睡眠品質に応じて配分
  let stages: Array<{ stage: string; minutes: number }>
  
  if (profile.quality === 'good') {
    stages = [
      { stage: "覚醒", minutes: Math.floor(Math.random() * 10) + 5 },
      { stage: "浅い睡眠", minutes: Math.floor(Math.random() * 80) + 140 },
      { stage: "深い睡眠", minutes: Math.floor(Math.random() * 40) + 100 },
      { stage: "レム睡眠", minutes: Math.floor(Math.random() * 40) + 90 },
    ]
  } else if (profile.quality === 'improving') {
    stages = [
      { stage: "覚醒", minutes: Math.floor(Math.random() * 15) + 10 },
      { stage: "浅い睡眠", minutes: Math.floor(Math.random() * 100) + 150 },
      { stage: "深い睡眠", minutes: Math.floor(Math.random() * 50) + 80 },
      { stage: "レム睡眠", minutes: Math.floor(Math.random() * 50) + 80 },
    ]
  } else {
    stages = [
      { stage: "覚醒", minutes: Math.floor(Math.random() * 30) + 30 },
      { stage: "浅い睡眠", minutes: Math.floor(Math.random() * 100) + 180 },
      { stage: "深い睡眠", minutes: Math.floor(Math.random() * 30) + 40 },
      { stage: "レム睡眠", minutes: Math.floor(Math.random() * 30) + 50 },
    ]
  }

  // Weekly sleep data - 個人ごとの推移パターンを生成
  const weeklySleep = []
  const days = ["月", "火", "水", "木", "金", "土", "日"]
  
  for (let i = 6; i >= 0; i--) {
    let dayHours = profile.baseSleepHours
    let dayScore = sleepScore
    
    // 品質に基づいて推移を生成
    if (profile.quality === 'improving') {
      // 改善傾向: 週の後半に向けて睡眠時間とスコアが向上
      dayHours = profile.baseSleepHours + (6 - i) * 0.2 + (Math.random() * 0.8 - 0.4)
      dayScore = sleepScore + (6 - i) * 2 + Math.floor(Math.random() * 10 - 5)
    } else if (profile.quality === 'poor') {
      // 不良: 不規則な睡眠パターン
      dayHours = profile.baseSleepHours + (Math.random() * 2 - 1)
      dayScore = sleepScore + Math.floor(Math.random() * 20 - 10)
    } else {
      // 良好: 安定した睡眠パターン
      dayHours = profile.baseSleepHours + (Math.random() * 1 - 0.5)
      dayScore = sleepScore + Math.floor(Math.random() * 10 - 5)
    }
    
    // 値の範囲を調整
    dayHours = Math.max(4, Math.min(10, dayHours))
    dayScore = Math.max(30, Math.min(100, dayScore))
    
    weeklySleep.push({
      day: days[6 - i],
      hours: Number.parseFloat(dayHours.toFixed(1)),
      score: Math.floor(dayScore),
    })
  }

  const sleepGoal = 7.5

  // Determine sleep quality and recommendations
  let sleepQuality = "普通"
  let interpretation = ""
  const recommendations: string[] = []

  if (totalMinutes >= 420 && efficiency >= 85 && sleepScore >= 80) {
    sleepQuality = "良好"
    interpretation = "睡眠の質が良好です。十分な睡眠時間と高い睡眠効率により、心身の回復が適切に行われています。"
    recommendations.push("現在の睡眠習慣を維持してください")
    recommendations.push("就寝・起床時刻の規則性を保ちましょう")
    recommendations.push("日中の活動とのバランスを意識しましょう")
  } else if (totalMinutes < 360 || efficiency < 75 || sleepScore < 70) {
    sleepQuality = "要改善"
    interpretation = "睡眠の質に改善の余地があります。睡眠時間の確保と睡眠環境の見直しが必要です。"
    recommendations.push("就寝時刻を早めて睡眠時間を確保しましょう")
    recommendations.push("寝室の環境(温度、光、音)を整えましょう")
    recommendations.push("就寝前のスマートフォン使用を控えましょう")
    recommendations.push("カフェインの摂取は午後3時までにしましょう")
  } else {
    sleepQuality = "普通"
    interpretation = "睡眠の質は標準的です。さらに改善することで、より良い心身の状態を目指せます。"
    recommendations.push("規則的な就寝・起床時刻を心がけましょう")
    recommendations.push("就寝前のリラックスタイムを設けましょう")
    recommendations.push("適度な運動で睡眠の質を向上させましょう")
  }

  const avgBedTime = "23:15"
  const avgWakeTime = "06:45"

  return {
    patientId,
    lastNight: {
      totalMinutes,
      efficiency,
      bedTime,
      wakeTime,
      sleepScore,
      stages,
    },
    weeklySleep,
    sleepGoal,
    sleepQuality,
    interpretation,
    recommendations,
    avgBedTime,
    avgWakeTime,
  }
}
