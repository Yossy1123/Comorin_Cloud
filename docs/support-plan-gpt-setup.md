# 個別支援計画GPT連携機能セットアップガイド

## 概要

個別支援計画の作成において、OpenAI GPTを活用して過去の30事例以上の支援事例から最適な支援方法を提案する機能を実装しました。

## 機能の特徴

- **AI支援計画生成**: 会話データとバイタルデータを統合し、GPTを使用して個別最適化された支援計画を自動生成
- **類似事例の参照**: 過去の成功事例から類似パターンを抽出し、効果的なアプローチを提案
- **フォールバック機能**: GPT連携に失敗した場合、自動的にモックデータを使用
- **柔軟な切り替え**: UI上でGPT連携のON/OFFを切り替え可能

## 環境設定

### 1. OpenAI APIキーの取得

1. [OpenAI Platform](https://platform.openai.com/)にアクセス
2. アカウントを作成またはログイン
3. API Keys ページから新しいAPIキーを作成
4. 生成されたAPIキーをコピー（後で使用）

### 2. 環境変数の設定

プロジェクトルートに `.env.local` ファイルを作成し、以下の環境変数を設定してください：

```bash
# OpenAI API Key (必須)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# オプション: カスタムモデルの指定（デフォルト: gpt-4o）
# OPENAI_MODEL=gpt-4o
# 他の選択肢: gpt-4-turbo, gpt-4, gpt-3.5-turbo
```

**重要**: `.env.local` ファイルは `.gitignore` に含まれており、Gitにコミットされません。

### 3. 支援事例データの準備（オプション）

現在の実装では、GPTに支援事例をプロンプトで提供していますが、より高度な実装としてOpenAI Assistants APIとVector Storeを使用することもできます。

#### Assistants APIを使用する場合（推奨）

1. **Vector Storeの作成**:
   ```bash
   # OpenAI APIを使用してVector Storeを作成
   curl https://api.openai.com/v1/vector_stores \
     -H "Authorization: Bearer $OPENAI_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "ひきこもり支援事例"
     }'
   ```

2. **支援事例ファイルのアップロード**:
   - 30事例以上の支援事例をJSON、CSV、またはテキストファイルで準備
   - OpenAI Files APIを使用してアップロード
   - Vector Storeにファイルを紐付け

3. **Assistantの作成**:
   ```bash
   curl https://api.openai.com/v1/assistants \
     -H "Authorization: Bearer $OPENAI_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "支援計画策定アシスタント",
       "instructions": "あなたは30事例以上のひきこもり支援の実績を持つ専門家です...",
       "model": "gpt-4-turbo-preview",
       "tools": [{"type": "file_search"}],
       "tool_resources": {
         "file_search": {
           "vector_store_ids": ["vs_xxxxxxxxxxxxx"]
         }
       }
     }'
   ```

4. **.env.localに追加**:
   ```bash
   OPENAI_ASSISTANT_ID=asst_xxxxxxxxxxxxxxxxxxxxx
   OPENAI_VECTOR_STORE_ID=vs_xxxxxxxxxxxxxxxxxxxxx
   ```

## 使用方法

### 1. UI上での操作

1. ダッシュボードから「データ分析」ページに移動
2. 当事者を選択
3. 「AI支援計画生成（GPT連携）」トグルをONにする（デフォルトで有効）
4. 「個別支援計画」ボタンをクリック
5. GPTが会話データとバイタルデータを分析し、支援計画を生成

### 2. GPT連携のON/OFF切り替え

- **ON（推奨）**: GPTを使用して30事例以上の支援事例から最適な支援計画を生成
- **OFF**: 従来のモックデータを使用した支援計画を生成

### 3. 生成される支援計画の内容

GPT連携により、以下の内容が含まれた詳細な支援計画が生成されます：

- **アセスメント結果**: 心理・身体・社会的側面の総合評価
- **支援目標**: 短期・中期・長期の具体的な目標設定
- **支援方法**: カテゴリ別の具体的なアプローチ
- **類似事例の参照**: 過去の成功事例との比較と応用ポイント
- **リスク管理**: 想定されるリスクと予防的対策
- **評価指標**: 支援の進捗を測定する具体的な指標

## API仕様

### エンドポイント

```
POST /api/support-plan/generate
```

### リクエストボディ

```typescript
{
  patientId: string;
  patientName: string;
  conversationData: Array<{
    transcript: string;
    emotion: string;
    stressLevel: string;
    keywords: string[];
  }>;
  vitalData: {
    sleepQuality: string;
    activityLevel: string;
    autonomicBalance: string;
  };
}
```

### レスポンス

```typescript
{
  patientId: string;
  patientName: string;
  planDate: string;
  planPeriod: string;
  assessmentSummary: { ... };
  goals: [ ... ];
  supportPolicy: { ... };
  supportMethods: [ ... ];
  similarCases: [ ... ];
  riskManagement: { ... };
  evaluationMetrics: [ ... ];
  roleAssignments: [ ... ];
  nextEvaluationDate: string;
  notes: string;
}
```

## トラブルシューティング

### GPT連携が動作しない

1. **APIキーを確認**:
   - `.env.local` に正しいAPIキーが設定されているか確認
   - APIキーが有効か、OpenAI Platformで確認

2. **開発サーバーを再起動**:
   ```bash
   pnpm dev
   ```

3. **ブラウザのコンソールを確認**:
   - エラーメッセージがないか確認
   - ネットワークタブでAPIリクエストの状態を確認

4. **フォールバックモード**:
   - GPT連携に失敗した場合、自動的にモックデータを使用
   - コンソールに警告メッセージが表示される

### エラーメッセージ

| エラー | 原因 | 対処法 |
|--------|------|--------|
| `OPENAI_API_KEY is not set` | APIキーが設定されていない | `.env.local` にAPIキーを追加 |
| `GPTからの応答が取得できませんでした` | GPTのレスポンスが空 | APIキーの権限を確認、モデル名を確認 |
| `支援計画の生成中にエラーが発生しました` | 一般的なエラー | コンソールログで詳細を確認 |

## セキュリティ注意事項

- **APIキーの管理**:
  - `.env.local` ファイルをGitにコミットしない
  - APIキーを外部に漏らさない
  - 定期的にAPIキーをローテーション

- **データプライバシー**:
  - 会話データとバイタルデータはOpenAI APIに送信される
  - 個人を特定できる情報は送信前に匿名化を推奨
  - OpenAIのデータ利用ポリシーを確認

## 利用可能なモデル

| モデル名 | 特徴 | 推奨用途 |
|---------|------|---------|
| `gpt-4o` | 最新・最速・最安価 | **推奨**（デフォルト） |
| `gpt-4-turbo` | 高速・高性能 | 複雑な分析が必要な場合 |
| `gpt-4` | 標準モデル | 高精度が必要な場合 |
| `gpt-3.5-turbo` | 高速・低コスト | コスト重視の場合 |

モデルを変更する場合は、`.env.local` に以下を追加：
```bash
OPENAI_MODEL=gpt-4-turbo
```

## コスト見積もり

**GPT-4o（推奨）**:
- Input: $2.50/1M tokens（約$0.0025/1K tokens）
- Output: $10.00/1M tokens（約$0.01/1K tokens）
- **1回の支援計画生成**: 約$0.03-0.05
- **月間100件**: 約$3-5

**GPT-4 Turbo**:
- Input: $10.00/1M tokens（約$0.01/1K tokens）
- Output: $30.00/1M tokens（約$0.03/1K tokens）
- **1回の支援計画生成**: 約$0.10-0.20
- **月間100件**: 約$10-20

詳細は[OpenAI Pricing](https://openai.com/pricing)を参照してください。

## カスタムGPTについて

ユーザーが指定したカスタムGPT（`https://chatgpt.com/g/g-6908277e89748191b8a7d60591a4f28d`）は、ChatGPTのWebインターフェース専用であり、OpenAI APIから直接アクセスすることはできません。

**代替アプローチ**:
1. **Assistants API + Vector Store**: 同様の支援事例データをVector Storeにアップロード（推奨）
2. **プロンプトエンジニアリング**: 支援事例をプロンプトに含める（現在の実装）

カスタムGPTの知識を活用したい場合は、以下の手順をお勧めします：
1. カスタムGPTで使用している支援事例データをエクスポート
2. JSON/CSV形式で整理
3. OpenAI Vector Storeにアップロード
4. Assistants APIを使用するように実装を更新

## 今後の改善案

- [ ] Assistants API + Vector Storeの完全実装
- [ ] 支援事例データベースの構築とUI上での管理
- [ ] 生成された支援計画の評価とフィードバック機能
- [ ] 多言語対応（英語、中国語等）
- [ ] カスタムプロンプトの設定機能

## 参考リンク

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [OpenAI Assistants API](https://platform.openai.com/docs/assistants/overview)
- [OpenAI Vector Stores](https://platform.openai.com/docs/assistants/tools/file-search)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

---

**最終更新**: 2025年11月5日  
**バージョン**: 1.0.0

