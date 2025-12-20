// Mock conversation data and analysis functions
// 【重要】個人情報保護のため、氏名等の個人を特定できる情報は使用しない
// 利用者の識別には匿名化ID（anonymousId）のみを使用する

export interface ConversationAnalysis {
  emotion: string
  stressLevel: string
  keywords: string[]
  recommendation: string
}

export interface ConversationRecord {
  id: string
  /** 匿名化ID（YY-NNN形式） */
  patientId: string
  transcript: string
  analysis: ConversationAnalysis
  imageUrls?: string[]
  timestamp: string
}

// Mock speech-to-text conversion
export async function mockSpeechToText(): Promise<string> {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  const mockTranscripts = [
    `支援者: こんにちは。今日の調子はどうですか?
当事者: まあまあです。最近は少し外に出る気持ちが出てきました。
支援者: それは良い兆候ですね。具体的にどんなことをしたいと思っていますか?
当事者: 近所のコンビニに行ってみたいです。でも、人が多いと不安になります。
支援者: その気持ちはよく分かります。まずは人が少ない時間帯を選んでみるのはどうでしょう?
当事者: そうですね。朝早い時間なら大丈夫かもしれません。`,

    `支援者: 前回のお話から、何か変化はありましたか?
当事者: 実は、家族と少し話せるようになりました。
支援者: それは素晴らしいですね。どんな話をされましたか?
当事者: 最近見ているアニメの話とか、些細なことですけど。
支援者: 些細なことでも、コミュニケーションが取れているのは大きな進歩です。
当事者: ありがとうございます。少しずつですが、前に進んでいる気がします。`,

    `支援者: 今日は少し疲れているように見えますが、大丈夫ですか?
当事者: 昨日あまり眠れなくて...また不安が強くなってきました。
支援者: 何か特別な出来事がありましたか?
当事者: 特にないんですが、将来のことを考えると怖くなります。
支援者: その気持ちは自然なことです。一緒に小さな目標から考えていきましょう。
当事者: はい...でも、本当に自分が変われるのか不安です。`,
  ]

  return mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)]
}

// Mock NLP analysis
export async function mockNLPAnalysis(transcript: string): Promise<ConversationAnalysis> {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Simple keyword-based mock analysis
  const lowerTranscript = transcript.toLowerCase()

  let emotion = "ニュートラル"
  let stressLevel = "中"
  const keywords: string[] = []
  let recommendation = ""

  // Emotion detection (mock)
  if (lowerTranscript.includes("不安") || lowerTranscript.includes("怖い") || lowerTranscript.includes("心配")) {
    emotion = "不安"
    stressLevel = "高"
    keywords.push("不安", "心配")
    recommendation =
      "不安が強い状態です。リラクゼーション技法の導入や、小さな成功体験を積み重ねるアプローチが推奨されます。"
  } else if (
    lowerTranscript.includes("嬉しい") ||
    lowerTranscript.includes("良い") ||
    lowerTranscript.includes("進歩")
  ) {
    emotion = "ポジティブ"
    stressLevel = "低"
    keywords.push("前向き", "進歩")
    recommendation =
      "ポジティブな変化が見られます。この調子で小さな目標を設定し、達成感を積み重ねていくことが効果的です。"
  } else if (lowerTranscript.includes("疲れ") || lowerTranscript.includes("眠れない")) {
    emotion = "ネガティブ"
    stressLevel = "高"
    keywords.push("疲労", "睡眠")
    recommendation =
      "疲労や睡眠の問題が見られます。生活リズムの改善と、必要に応じて医療的なサポートの検討が推奨されます。"
  } else {
    keywords.push("日常", "対話")
    recommendation = "安定した状態です。現在のペースを維持しながら、徐々に活動範囲を広げていくことが推奨されます。"
  }

  // Add more keywords based on content
  if (lowerTranscript.includes("家族")) keywords.push("家族関係")
  if (lowerTranscript.includes("外出") || lowerTranscript.includes("外に出る")) keywords.push("外出")
  if (lowerTranscript.includes("コミュニケーション") || lowerTranscript.includes("話"))
    keywords.push("コミュニケーション")

  return {
    emotion,
    stressLevel,
    keywords: [...new Set(keywords)], // Remove duplicates
    recommendation,
  }
}

// Save conversation to database via API
export async function saveConversation(record: Omit<ConversationRecord, "id">): Promise<void> {
  try {
    // APIを通じてデータベースに保存
    const response = await fetch("/api/conversation/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        patientId: record.patientId,
        transcript: record.transcript,
        analysis: record.analysis,
        imageUrls: record.imageUrls,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("会話データの保存に失敗しました:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      // エラー時もlocalStorageには保存（フォールバック）
      await saveToLocalStorage(record);
    }
  } catch (error) {
    console.error("API呼び出しエラー:", error);
    // エラー時もlocalStorageには保存（フォールバック）
    await saveToLocalStorage(record);
  }
}

// Fallback: Save to localStorage
async function saveToLocalStorage(record: Omit<ConversationRecord, "id">): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const conversations = getConversationHistory();
  const newRecord: ConversationRecord = {
    ...record,
    id: Date.now().toString(),
  };

  conversations.unshift(newRecord); // Add to beginning
  localStorage.setItem("conversations", JSON.stringify(conversations));
}

// Get conversation history from localStorage
export function getConversationHistory(): ConversationRecord[] {
  if (typeof window === "undefined") return []

  const stored = localStorage.getItem("conversations")
  if (!stored) return []

  try {
    return JSON.parse(stored) as ConversationRecord[]
  } catch {
    return []
  }
}
