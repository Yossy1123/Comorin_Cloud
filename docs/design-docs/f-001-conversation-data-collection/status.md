# F-001: 機能実装状況

本ドキュメントでは、会話データ収集機能（F-001）の詳細な実装状況とフェーズ別の実装計画を記載します。

---

## 📊 実装進捗サマリー

### 全体進捗

**進捗率**: 27.3% (6/22項目完了)

```
UI実装: ████████████████████████████░░░░ 100% (3/3完了)
バックエンド: ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   0% (0/11未着手)
外部API連携: ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   0% (0/8未着手)
```

### フェーズ別進捗

| フェーズ | 進捗 | 完了項目 | 残項目 | 開始予定 | 期間 |
|---------|------|---------|--------|---------|------|
| Phase 1: UI実装 | ✅ 100% | 6/6 | 0 | 完了 | - |
| Phase 2: DB・認証 | ⏳ 0% | 0/7 | 7 | 2ヶ月以内 | 2ヶ月 |
| Phase 3: API連携 | ⏳ 0% | 0/8 | 8 | Phase 2後 | 2-3ヶ月 |
| Phase 4: 高度機能 | ⏳ 0% | 0/5 | 5 | Phase 3後 | 3-4ヶ月 |

---

## ✅ Phase 1: UI実装（完了）

### 完了項目 (6/6)

#### 1. ConversationModule コンポーネント ✅

**実装内容**:
- タブ切り替え機能（録音・履歴・分析）
- Shadcn UI Tabs コンポーネント使用
- レスポンシブデザイン対応

**ファイル**: `components/conversation/conversation-module.tsx`

**主要機能**:
```typescript
✅ タブ切り替え（録音・履歴・分析）
✅ アイコン表示（Mic, FileText, BarChart3）
✅ ページタイトル・説明文の表示
```

**完了日**: 2024年1月

---

#### 2. ConversationRecorder コンポーネント ✅

**実装内容**:
- 録音開始/停止機能（モック）
- **録音データインポート機能（mp3対応）** ← 🆕 2025年10月17日追加
- 当事者選択ドロップダウン
- 録音時間タイマー表示
- テキスト編集エリア
- 保存と分析処理（モック）

**ファイル**: `components/conversation/conversation-recorder.tsx`

**主要機能**:
```typescript
✅ handleStartRecording() - 録音開始処理
✅ handleStopRecording() - 録音停止・テキスト化
✅ handleSaveConversation() - 保存・分析実行
✅ formatTime() - 録音時間フォーマット
✅ handleImportButtonClick() - ファイル選択ダイアログ起動 🆕
✅ handleFileImport() - mp3ファイル読み込み・テキスト化 🆕
✅ 当事者選択（Select コンポーネント）
✅ ローディング状態表示
✅ 成功通知表示
```

**UI要素**:
- ✅ 当事者選択ドロップダウン
- ✅ 録音開始ボタン（緑）
- ✅ 録音停止ボタン（赤）
- ✅ 録音時間カウンター（MM:SS形式）
- ✅ 録音中インジケーター（赤丸アニメーション）
- ✅ **録音データをインポートボタン（FileAudioアイコン）** 🆕
- ✅ **インポートファイル名表示** 🆕
- ✅ **隠しファイル入力（mp3対応）** 🆕
- ✅ テキスト編集エリア（Textarea）
- ✅ 保存して分析ボタン
- ✅ 処理中アラート（Loader2アイコン）
- ✅ 成功アラート（緑背景）

**インポート機能の詳細**:
- ✅ 対応形式: mp3, m4a (`accept=".mp3,.m4a,audio/mpeg,audio/mp4,audio/x-m4a"`)
- ✅ ファイル形式チェック（.mp3または.m4a）
- ✅ 自動テキスト変換（現在はモック、Phase 3で実API統合）
- ✅ インポート後のファイル名表示
- ✅ 既存の録音フローと同じ処理（テキスト編集→保存→分析）

**完了日**: 2024年1月（インポート機能: 2025年10月17日追加）

---

#### 3. ConversationHistory コンポーネント ✅

**実装内容**:
- 会話履歴一覧表示
- 会話詳細モーダル（Dialog）
- 分析結果の表示
- 日時フォーマット処理
- 感情状態のカラーコード表示

**ファイル**: `components/conversation/conversation-history.tsx`

**主要機能**:
```typescript
✅ getConversationHistory() - LocalStorageから履歴取得
✅ formatDate() - 日時フォーマット（ja-JP）
✅ getEmotionColor() - 感情ごとのカラーコード
✅ Dialog による詳細表示
```

**UI要素**:
- ✅ 会話カード一覧
- ✅ 当事者名表示（Userアイコン）
- ✅ 記録日時表示（Calendarアイコン）
- ✅ 感情バッジ（カラーコード付き）
- ✅ ストレスレベルバッジ
- ✅ 詳細ボタン（Eyeアイコン）
- ✅ モーダルダイアログ（会話内容・分析結果）
- ✅ キーワード一覧（Badge）
- ✅ 推奨アプローチ表示
- ✅ データなし時のEmpty State

**完了日**: 2024年1月

---

#### 4. ConversationAnalysis コンポーネント ✅

**実装内容**:
- **当事者選択機能**（個別分析のみ）
- 感情分析統計（円グラフ）
- ストレスレベル分布（棒グラフ）
- サマリーカード（会話数、平均値、最頻値）

**ファイル**: `components/conversation/conversation-analysis.tsx`

**主要機能**:
```typescript
✅ 当事者選択（Selectコンポーネント）
  - 個別選択（特定の当事者のデータのみ分析）
  - デフォルト選択（最初の当事者を自動選択）
✅ 動的フィルタリング（選択された当事者でフィルタリング）
✅ 感情データの集計処理
✅ ストレスデータの集計処理
✅ Recharts PieChart の実装
✅ Recharts BarChart の実装
✅ レスポンシブチャート（ResponsiveContainer）
✅ useMemo による最適化
✅ Empty State対応（会話データがない場合）
```

**UI要素**:
- ✅ 当事者選択カード
  - 当事者選択ドロップダウン（個別選択のみ）
  - 選択された当事者名と会話件数の表示
- ✅ 感情分析円グラフ（PieChart + Legend）
  - 選択された当事者の感情分布を動的表示
- ✅ ストレスレベル棒グラフ（BarChart）
  - 選択された当事者のストレスレベル分布を動的表示
- ✅ 会話数カード（選択された当事者のセッション数）
- ✅ 平均ストレスレベルカード（選択された当事者の平均）
- ✅ 主要な感情カード（選択された当事者の最頻値）
- ✅ データなし時のEmpty State

**完了日**: 2024年1月（当事者選択機能追加: 2025年10月16日）

---

#### 5. Mock Services ✅

**実装内容**:
- 音声→テキスト変換モック
- 自然言語解析モック
- LocalStorage保存・取得

**ファイル**: `lib/mock-conversation.ts`

**主要機能**:
```typescript
✅ mockSpeechToText() - サンプルテキスト返却（2秒待機）
✅ mockNLPAnalysis() - キーワードベース分析（1.5秒待機）
✅ saveConversation() - LocalStorageに保存
✅ getConversationHistory() - LocalStorageから取得
```

**分析ロジック**:
- ✅ 不安検出（"不安", "怖い", "心配"）
- ✅ ポジティブ検出（"嬉しい", "良い", "進歩"）
- ✅ ネガティブ検出（"疲れ", "眠れない"）
- ✅ キーワード抽出（家族、外出、コミュニケーション等）
- ✅ ストレスレベル推定（低/中/高）
- ✅ 推奨アプローチ生成

**完了日**: 2024年1月

---

#### 6. ページコンポーネント ✅

**実装内容**:
- `/dashboard/conversation` ページの実装
- ConversationModule の配置

**ファイル**: `app/dashboard/conversation/page.tsx`

**完了日**: 2024年1月

---

## ⏳ Phase 2: データベース・認証（未着手）

### 予定期間
**開始**: 2ヶ月以内  
**期間**: 2ヶ月  
**担当**: 2名体制

### 実装項目 (0/7)

#### 1. Vercel Postgres セットアップ ⏸️

**タスク**:
- [ ] Vercel Postgres プロジェクト作成
- [ ] 環境変数設定（DATABASE_URL）
- [ ] Prisma CLI セットアップ
- [ ] データベース接続テスト

**依存関係**: なし

**見積工数**: 1-2日

---

#### 2. Prisma スキーマ定義 ⏸️

**タスク**:
- [ ] `prisma/schema.prisma` 作成
- [ ] Conversation モデル定義
- [ ] Patient モデルとのリレーション
- [ ] インデックス設計

**スキーマ案**:
```prisma
model Conversation {
  id          String   @id @default(uuid())
  patientId   String
  patient     Patient  @relation(fields: [patientId], references: [id])
  
  // 会話データ
  transcript  String   @db.Text
  audioUrl    String?
  duration    Int?
  
  // 分析結果（JSON）
  sentiment   Json
  keywords    Json
  
  // メタデータ
  recordedAt  DateTime
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  supporterId String?
  
  @@index([patientId, recordedAt])
}
```

**依存関係**: タスク1（Vercel Postgres）

**見積工数**: 2-3日

---

#### 3. データベースマイグレーション ⏸️

**タスク**:
- [ ] 初期マイグレーション実行
- [ ] マイグレーション履歴管理
- [ ] ロールバック手順の策定

**コマンド**:
```bash
pnpm prisma migrate dev --name init
pnpm prisma generate
```

**依存関係**: タスク2（Prisma スキーマ）

**見積工数**: 1日

---

#### 4. CRUD操作の実装 ⏸️

**タスク**:
- [ ] `createConversation()` - 会話作成
- [ ] `getConversationById()` - 会話取得
- [ ] `getConversationsByPatient()` - 当事者別取得
- [ ] `updateConversation()` - 会話更新（編集機能）
- [ ] `deleteConversation()` - 会話削除（論理削除）

**実装場所**: `lib/conversation.ts`（新規作成）

**依存関係**: タスク3（マイグレーション）

**見積工数**: 3-4日

---

#### 5. LocalStorage から Database への移行 ⏸️

**タスク**:
- [ ] 移行スクリプト作成
- [ ] データ変換ロジック実装
- [ ] 移行テスト
- [ ] LocalStorage クリーンアップ

**移行スクリプト案**:
```typescript
// scripts/migrate-conversations.ts
async function migrateFromLocalStorage() {
  const conversations = getConversationHistory()
  
  for (const conv of conversations) {
    await db.conversation.create({
      data: {
        patientId: conv.patientId,
        transcript: conv.transcript,
        sentiment: conv.analysis,
        recordedAt: new Date(conv.timestamp),
      }
    })
  }
}
```

**依存関係**: タスク4（CRUD操作）

**見積工数**: 2日

---

#### 6. データ暗号化機能 ⏸️

**タスク**:
- [ ] AES-256暗号化ライブラリ選定
- [ ] `encrypt()` 関数実装
- [ ] `decrypt()` 関数実装
- [ ] 暗号化キー管理（環境変数）

**実装場所**: `lib/encryption.ts`（新規作成）

**依存関係**: タスク4（CRUD操作）

**見積工数**: 2-3日

---

#### 7. アクセス制御（RBAC）実装 ⏸️

**タスク**:
- [ ] ロール定義（Admin, Supporter, FacilityStaff）
- [ ] 権限チェックミドルウェア
- [ ] 担当当事者の紐付け機能
- [ ] 監査ログ記録

**権限設計**:
```typescript
// 支援者は担当する当事者の会話のみ閲覧可能
const permissions = {
  admin: ['*'],
  supporter: ['view:assigned_conversations', 'create:conversation'],
  facilityStaff: ['view:facility_conversations'],
}
```

**依存関係**: Firebase Auth 統合（並行実装）

**見積工数**: 4-5日

---

### Phase 2 マイルストーン

**完了条件**:
- ✅ Vercel Postgres + Prisma が稼働
- ✅ Conversation モデルの CRUD が完全動作
- ✅ LocalStorage からの移行完了
- ✅ データ暗号化機能が動作
- ✅ RBAC による適切なアクセス制御

**リスク**:
- Vercel Postgres のパフォーマンス検証不足
- 大量データ移行時のエラー処理
- 暗号化によるパフォーマンス低下

---

## ⏳ Phase 3: 外部API連携（未着手）

### 予定期間
**開始**: Phase 2 完了後  
**期間**: 2-3ヶ月  
**担当**: 2名体制

### 実装項目 (0/8)

#### 1. Azure Speech Services セットアップ ⏸️

**タスク**:
- [ ] Azureアカウント作成
- [ ] Speech Services リソース作成
- [ ] APIキー取得・環境変数設定
- [ ] 日本語音声認識モデル選定

**依存関係**: なし

**見積工数**: 1-2日

---

#### 2. 音声録音機能の実装 ⏸️

**タスク**:
- [ ] MediaRecorder API 統合
- [ ] マイク権限取得処理
- [ ] 音声データのBlob化
- [ ] 音声ファイル保存（オプション）

**実装箇所**: `components/conversation/conversation-recorder.tsx` の拡張

**ブラウザAPI**:
```typescript
const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
const mediaRecorder = new MediaRecorder(stream)

mediaRecorder.ondataavailable = (event) => {
  audioChunks.push(event.data)
}

mediaRecorder.onstop = () => {
  const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
  // Azure Speech Services に送信
}
```

**依存関係**: なし（並行実装可）

**見積工数**: 3-4日

---

#### 3. Azure Speech Services API 統合 ⏸️

**タスク**:
- [ ] API クライアント実装
- [ ] 音声→テキスト変換処理
- [ ] 信頼度スコアの取得
- [ ] エラーハンドリング

**実装場所**: `lib/azure-speech.ts`（新規作成）

**API統合例**:
```typescript
import * as sdk from 'microsoft-cognitiveservices-speech-sdk'

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const speechConfig = sdk.SpeechConfig.fromSubscription(
    process.env.AZURE_SPEECH_KEY!,
    process.env.AZURE_SPEECH_REGION!
  )
  
  speechConfig.speechRecognitionLanguage = 'ja-JP'
  
  // ... 音声認識処理
}
```

**依存関係**: タスク1（Azure セットアップ）、タスク2（音声録音）

**見積工数**: 4-5日

---

#### 4. OpenAI API セットアップ ⏸️

**タスク**:
- [ ] OpenAI アカウント作成
- [ ] APIキー取得・環境変数設定
- [ ] GPT-4 モデルアクセス確認
- [ ] トークン使用量モニタリング設定

**依存関係**: なし

**見積工数**: 1日

---

#### 5. OpenAI GPT-4 API 統合 ⏸️

**タスク**:
- [ ] API クライアント実装
- [ ] プロンプトエンジニアリング
- [ ] 感情分析処理
- [ ] キーワード抽出処理
- [ ] 推奨アプローチ生成

**実装場所**: `lib/openai-nlp.ts`（新規作成）

**プロンプト設計**:
```typescript
const analysisPrompt = `
以下の支援セッションの会話を分析してください。

【会話内容】
${transcript}

【分析項目】
1. 感情状態（ポジティブ/ニュートラル/ネガティブ/不安）
2. ストレスレベル（低/中/高）
3. 重要なキーワード（5個以内）
4. 推奨される支援アプローチ

【出力形式】JSON
{
  "emotion": "string",
  "stressLevel": "string",
  "keywords": ["string"],
  "recommendation": "string"
}
`
```

**依存関係**: タスク4（OpenAI セットアップ）

**見積工数**: 5-6日

---

#### 6. API エラーハンドリング ⏸️

**タスク**:
- [ ] レート制限エラーの処理
- [ ] リトライロジック（指数バックオフ）
- [ ] タイムアウト処理
- [ ] ユーザーフレンドリーなエラーメッセージ

**実装箇所**: `lib/api-error-handler.ts`（新規作成）

**エラーハンドリング例**:
```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      if (error.code === 'RATE_LIMIT_EXCEEDED') {
        await wait(Math.pow(2, i) * 1000) // 指数バックオフ
      }
    }
  }
  throw new Error('Max retries exceeded')
}
```

**依存関係**: タスク3（Azure API）、タスク5（OpenAI API）

**見積工数**: 3-4日

---

#### 7. 統合テスト ⏸️

**タスク**:
- [ ] 録音→テキスト化のE2Eテスト
- [ ] テキスト→分析のE2Eテスト
- [ ] エラーシナリオのテスト
- [ ] パフォーマンステスト

**テストシナリオ**:
- ✅ 正常系: 録音→テキスト化→分析→保存
- ✅ エラー系: API障害時のフォールバック
- ✅ エラー系: ネットワークエラー時の再試行
- ✅ パフォーマンス: レスポンス時間3秒以内

**依存関係**: タスク6（エラーハンドリング）

**見積工数**: 4-5日

---

#### 8. モック実装の置き換え ⏸️

**タスク**:
- [ ] `mockSpeechToText()` を実API に置き換え
- [ ] `mockNLPAnalysis()` を実API に置き換え
- [ ] フィーチャーフラグによる切り替え機能
- [ ] デバッグモード時のモック使用

**実装方針**:
```typescript
// 環境変数でモック/実APIを切り替え
const useMockAPI = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true'

export async function speechToText(audioBlob: Blob): Promise<string> {
  if (useMockAPI) {
    return mockSpeechToText()
  }
  return azureSpeechToText(audioBlob)
}
```

**依存関係**: タスク7（統合テスト）

**見積工数**: 2-3日

---

### Phase 3 マイルストーン

**完了条件**:
- ✅ 実際の音声録音が可能
- ✅ Azure Speech Services で音声→テキスト変換
- ✅ OpenAI GPT-4 で自然言語解析
- ✅ エラーハンドリングが適切に動作
- ✅ レスポンス時間目標達成（音声認識3秒以内）

**リスク**:
- Azure Speech Services の認識精度不足
- OpenAI API のコスト超過
- レート制限による処理遅延

---

## ⏳ Phase 4: 高度な分析機能（未着手）

### 予定期間
**開始**: Phase 3 完了後  
**期間**: 3-4ヶ月  
**担当**: 2名体制

### 実装項目 (0/5)

#### 1. 個人情報自動マスキング ⏸️

**タスク**:
- [ ] 正規表現による個人情報検出
- [ ] 固有表現抽出（NER）の実装
- [ ] マスキング処理（***）
- [ ] マスキングログの記録

**検出対象**:
- 電話番号（090-1234-5678）
- 住所（東京都〇〇区...）
- メールアドレス
- 氏名（固有名詞）

**見積工数**: 5-6日

---

#### 2. 時系列分析 ⏸️

**タスク**:
- [ ] 感情の推移グラフ
- [ ] ストレスレベルの推移グラフ
- [ ] 週次・月次レポート生成
- [ ] トレンド分析

**見積工数**: 6-7日

---

#### 3. 会話パターン検出 ⏸️

**タスク**:
- [ ] 頻出キーワードの分析
- [ ] 会話の長さ・頻度の分析
- [ ] 改善パターンの検出
- [ ] アラートトリガー（悪化傾向の検出）

**見積工数**: 7-8日

---

#### 4. 支援効果予測モデル ⏸️

**タスク**:
- [ ] 機械学習モデルの設計
- [ ] トレーニングデータの収集
- [ ] モデルのトレーニング
- [ ] 予測精度の評価

**見積工数**: 10-12日（AI/ML専門知識必要）

---

#### 5. 音声ファイル保存・再生 ⏸️

**タスク**:
- [ ] 音声ファイルのクラウドストレージ保存
- [ ] 再生機能の実装
- [ ] ダウンロード機能
- [ ] ストレージ容量管理

**見積工数**: 4-5日

---

### Phase 4 マイルストーン

**完了条件**:
- ✅ 個人情報が自動的にマスキングされる
- ✅ 時系列での推移が可視化される
- ✅ 支援効果の予測が可能
- ✅ 音声ファイルの保存・再生が可能

---

## 🎯 優先順位と依存関係

### 最優先（Phase 2 - 2ヶ月以内開始）

1. **Vercel Postgres + Prisma セットアップ**
   - データ永続化の基盤
   - 他のすべての機能の前提条件

2. **CRUD操作の実装**
   - 会話データの作成・取得・更新・削除
   - LocalStorageからの移行

3. **データ暗号化 + RBAC**
   - セキュリティ要件の充足
   - 本番運用の前提条件

### 高優先（Phase 3）

1. **Azure Speech Services 統合**
   - 実際の音声→テキスト変換
   - コア機能の実現

2. **OpenAI GPT-4 統合**
   - 高度な自然言語解析
   - 差別化要因の実現

### 中優先（Phase 4）

1. **個人情報自動マスキング**
   - プライバシー保護の強化

2. **時系列分析**
   - 支援効果の可視化

---

## 📊 品質指標・目標値

### パフォーマンス目標

| 指標 | 目標値 | 現在値 | 達成状況 |
|-----|--------|--------|---------|
| 音声認識レスポンス時間 | 3秒以内 | - | Phase 3で測定 |
| 自然言語解析レスポンス時間 | 5秒以内 | 1.5秒（モック） | Phase 3で測定 |
| 合計処理時間 | 10秒以内 | 3.5秒（モック） | Phase 3で測定 |
| 会話履歴表示 | 1秒以内 | 即座 | ✅ 達成 |
| データベースクエリ | 100ms以内 | - | Phase 2で測定 |

### 精度目標（Phase 3以降）

| 指標 | 目標値 | 測定方法 |
|-----|--------|---------|
| 音声認識精度 | 95%以上 | Azure Speech Services の信頼度スコア |
| 感情分析精度 | 90%以上 | 専門家による評価 |
| キーワード抽出精度 | 85%以上 | 専門家による評価 |

---

## 🚨 既知の課題・技術的負債

### 現在（Phase 1）

1. **LocalStorageの容量制限**
   - 問題: 5-10MBの制限、ブラウザキャッシュで削除
   - 対応: Phase 2でデータベース移行
   - 優先度: 🔴 高

2. **モック実装の限界**
   - 問題: 実際の音声認識・分析ではない
   - 対応: Phase 3で実API統合
   - 優先度: 🟡 中

3. **認証なし**
   - 問題: 誰でもアクセス可能
   - 対応: Phase 2でFirebase Auth統合
   - 優先度: 🔴 高

### 将来対応が必要（Phase 4以降）

1. **個人情報のマスキング処理**
   - 優先度: 🟡 中

2. **音声ファイルの保存・再生**
   - 優先度: 🟢 低

3. **リアルタイムフィードバック**
   - 優先度: 🟢 低

---

## ✅ 次のアクションアイテム

### 即座に着手可能（Phase 2開始前）

1. **Vercel Postgres の調査**
   - [ ] 料金プランの確認
   - [ ] パフォーマンス特性の調査
   - [ ] ドキュメント精読

2. **Prismaスキーマの設計レビュー**
   - [ ] テーブル設計の妥当性確認
   - [ ] インデックス戦略の検討
   - [ ] リレーションシップの確認

3. **Azure Speech Services のトライアル**
   - [ ] 無料枠での動作確認
   - [ ] 日本語認識精度の評価
   - [ ] API制限の確認

---

## 📅 タイムライン

```
2025年10月 ─┬─ 2ヶ月以内 ─┬─ 2-3ヶ月 ─┬─ 3-4ヶ月 ─┬─ PoC
  (現在)    │            │          │          │
         Phase 1      Phase 2    Phase 3    Phase 4   実証実験
         (完了)     (DB・認証)  (API連携)  (AI/ML)   (半年後)
           ✅           ⏸️          ⏸️         ⏸️
```

---

**最終更新**: 2025年10月17日（録音データインポート機能追加）  
**現在のフェーズ**: Phase 1 完了、Phase 2 準備中  
**担当**: 開発チーム（2名体制）  
**次のマイルストーン**: Phase 2開始（2ヶ月以内）、PoC実証（半年後）

