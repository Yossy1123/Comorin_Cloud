/**
 * 個別支援計画生成API
 * OpenAI GPTを使用して、会話データから支援計画を生成
 */

import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

interface GenerateSupportPlanRequest {
  patientId: string;
  patientName: string;
  conversationData: Array<{
    transcript: string;
    emotion: string;
    stressLevel: string;
    keywords: string[];
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateSupportPlanRequest = await request.json();
    const { patientId, patientName, conversationData } = body;

    // データ検証
    if (!patientId || !patientName) {
      return NextResponse.json(
        { error: "患者IDと患者名は必須です" },
        { status: 400 }
      );
    }

    // GPTに送信するプロンプトを構築
    const prompt = buildSupportPlanPrompt({
      patientName,
      conversationData,
    });

    // OpenAI Chat Completions APIを使用
    // 注: Assistants APIを使用する場合は、事前にAssistantを作成し、IDを環境変数に設定する必要があります
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o",
      messages: [
        {
          role: "system",
          content: `あなたは30事例以上のひきこもり支援の実績を持つ、経験豊富な支援計画策定の専門家です。
          
以下の役割を担ってください：
1. 当事者の会話データを分析
2. 過去の成功事例から最も適した支援方法を提案
3. 具体的で実践可能な個別支援計画を策定
4. リスク管理と評価指標を明確に設定

提案する支援計画には以下を含めてください：
- アセスメント結果（心理・社会的側面）
- 短期・中期・長期の目標設定
- 具体的な支援方法とアプローチ
- 類似事例の参照と応用ポイント
- リスク管理と予防的対策
- 評価指標と次回評価日

常に当事者の尊厳を尊重し、科学的根拠に基づいた支援を提案してください。`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const gptResponse = completion.choices[0]?.message?.content;

    if (!gptResponse) {
      throw new Error("GPTからの応答が取得できませんでした");
    }

    // GPTの応答を構造化されたデータに変換
    const supportPlan = parseSupportPlanFromGPT(gptResponse, patientId, patientName);

    return NextResponse.json(supportPlan);
  } catch (error) {
    console.error("Support plan generation error:", error);
    
    // エラーハンドリング
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: "支援計画の生成中にエラーが発生しました" },
      { status: 500 }
    );
  }
}

/**
 * 支援計画生成用のプロンプトを構築
 */
function buildSupportPlanPrompt(data: {
  patientName: string;
  conversationData: Array<{
    transcript: string;
    emotion: string;
    stressLevel: string;
    keywords: string[];
  }>;
}): string {
  const { patientName, conversationData } = data;

  // 会話データのサマリー
  const conversationSummary = conversationData.map((conv, index) => {
    return `
【会話記録 ${index + 1}】
感情状態: ${conv.emotion}
ストレスレベル: ${conv.stressLevel}
キーワード: ${conv.keywords.join(", ")}
内容の抜粋:
${conv.transcript.substring(0, 500)}...
`;
  }).join("\n");

  return `
# ${patientName}さんの個別支援計画策定依頼

## 収集データ

### 会話データ
${conversationSummary}

## 依頼内容
上記のデータを基に、${patientName}さんに最適な個別支援計画を策定してください。

以下の形式でJSON形式で返答してください：

\`\`\`json
{
  "assessmentSummary": {
    "currentStatus": "現在の状態",
    "strengths": ["強み1", "強み2"],
    "challenges": ["課題1", "課題2"],
    "riskLevel": "低/中/高",
    "psychologicalState": {
      "emotion": "感情状態",
      "stressLevel": "ストレスレベル",
      "motivation": "意欲レベル"
    },
    "socialState": {
      "familyRelation": "家族関係",
      "communicationSkill": "コミュニケーション能力",
      "externalEngagement": "外部との関わり"
    }
  },
  "goals": [
    {
      "term": "短期/中期/長期",
      "period": "期間",
      "goal": "目標",
      "specificActions": ["具体的なアクション1", "具体的なアクション2"],
      "successCriteria": ["達成基準1", "達成基準2"]
    }
  ],
  "supportPolicy": {
    "basicApproach": "基本的なアプローチ",
    "keyPoints": ["ポイント1", "ポイント2"],
    "attentionPoints": ["留意点1", "留意点2"]
  },
  "supportMethods": [
    {
      "category": "支援カテゴリ",
      "approach": "アプローチ方法",
      "frequency": "頻度",
      "duration": "期間",
      "keyPoints": ["ポイント1", "ポイント2"],
      "expectedOutcome": "期待される成果"
    }
  ],
  "similarCases": [
    {
      "caseId": "事例ID",
      "similarity": 85,
      "overview": "事例の概要",
      "effectiveApproach": "効果的だったアプローチ",
      "applicationPoints": ["応用ポイント1", "応用ポイント2"]
    }
  ],
  "riskManagement": {
    "identifiedRisks": ["リスク1", "リスク2"],
    "preventiveMeasures": ["予防策1", "予防策2"],
    "emergencyContact": ["連絡先1", "連絡先2"]
  },
  "evaluationMetrics": [
    {
      "metric": "評価指標名",
      "method": "測定方法",
      "frequency": "評価頻度",
      "target": "目標値"
    }
  ],
  "notes": "備考・特記事項"
}
\`\`\`

※ 過去の30事例以上の支援事例を参考に、最も効果的な支援方法を提案してください。
※ 類似事例は具体的な成功例を3つ程度挙げてください。
`;
}

/**
 * GPTの応答をSupportPlan型に変換
 */
function parseSupportPlanFromGPT(
  gptResponse: string,
  patientId: string,
  patientName: string
): any {
  try {
    // JSONブロックを抽出
    const jsonMatch = gptResponse.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch && jsonMatch[1]) {
      const parsed = JSON.parse(jsonMatch[1]);
      
      // 必要なフィールドを追加
      const planDate = new Date().toISOString().split("T")[0];
      const nextEvalDate = new Date();
      nextEvalDate.setMonth(nextEvalDate.getMonth() + 3);
      
      return {
        patientId,
        patientName,
        planDate,
        planPeriod: "6ヶ月間",
        nextEvaluationDate: nextEvalDate.toISOString().split("T")[0],
        ...parsed,
        // 役割分担のデフォルト値を追加
        roleAssignments: parsed.roleAssignments || [
          {
            role: "主担当支援員",
            name: "未定（要割当）",
            responsibilities: [
              "個別対話セッションの実施",
              "支援計画の進捗管理",
              "当事者・家族との連絡調整",
            ],
          },
        ],
      };
    }
    
    // JSONブロックがない場合はエラー
    throw new Error("GPTの応答からJSONを抽出できませんでした");
  } catch (error) {
    console.error("Parse error:", error);
    throw new Error("GPTの応答を解析できませんでした");
  }
}

