# F-001: 実装における留意点・注意事項

本ドキュメントでは、会話データ収集機能（F-001）の実装において注意すべき技術的制約、セキュリティ上の配慮、UI/UX上の留意点などを記載します。

---

## 🔐 セキュリティ・プライバシー上の注意点

### 1. 個人情報保護法への準拠

**原則**: 
- すべての個人情報は匿名統計データとして処理
- 個人に紐づく情報の直接使用は禁止

**実装時の注意**:
```typescript
// ❌ NG: 個人を特定できる情報を保存
interface ConversationRecord {
  realName: string      // 実名 → NG
  address: string       // 住所 → NG
  phoneNumber: string   // 電話番号 → NG
}

// ✅ OK: 匿名化されたID、統計データ
interface ConversationRecord {
  patientId: string     // ハッシュ化されたID
  anonymousId: string   // 匿名ID
  transcript: string    // 会話内容（個人情報マスキング済み）
}
```

**個人情報の自動マスキング（Phase 3実装予定）**:
- 電話番号、住所、氏名などを自動検出
- `***`でマスキング処理
- マスキング前のデータは保存しない

### 2. データ暗号化

**保存時の暗号化（Phase 2実装予定）**:
```typescript
// データベース保存時にAES-256で暗号化
import { encrypt, decrypt } from '@/lib/encryption'

const encryptedTranscript = encrypt(transcript)
await db.conversation.create({
  data: {
    transcript: encryptedTranscript,
    // ...
  }
})
```

**通信時の暗号化**:
- すべてのAPI通信はHTTPSを強制
- Azure Speech Services、OpenAI APIへの通信も暗号化

### 3. アクセス制御

**ロールベースアクセス制御（Phase 2実装予定）**:
```typescript
// 支援者は担当する当事者の会話のみ閲覧可能
async function getConversations(supporterId: string) {
  const assignedPatients = await getAssignedPatients(supporterId)
  return db.conversation.findMany({
    where: {
      patientId: { in: assignedPatients.map(p => p.id) }
    }
  })
}
```

**監査ログの記録（Phase 2実装予定）**:
```typescript
// すべての会話データアクセスをログに記録
await auditLog.create({
  userId: supporterId,
  action: 'VIEW_CONVERSATION',
  resourceId: conversationId,
  timestamp: new Date(),
  ipAddress: request.ip
})
```

---

## 🛠️ 技術的制約・課題

### 1. ブラウザAPI制約

**Web Audio API / MediaRecorder API**:
- **HTTPS必須**: ローカルホスト以外ではHTTPS接続が必須
- **ブラウザ互換性**: Chrome、Edge、Safari（最新版）で動作確認必要
- **権限取得**: マイクへのアクセス許可が必要

```typescript
// マイク権限の取得
async function requestMicrophonePermission() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    return stream
  } catch (error) {
    // 権限拒否時のエラーハンドリング
    console.error('マイクへのアクセスが拒否されました', error)
    throw new Error('マイク権限が必要です')
  }
}
```

**対応ブラウザ**:
- ✅ Chrome 60+
- ✅ Edge 79+
- ✅ Firefox 25+
- ✅ Safari 14.1+
- ❌ Internet Explorer（サポート対象外）

### 2. Azure Speech Services API制約（Phase 3実装予定）

**API制限**:
- **リクエスト制限**: 1分あたり最大20リクエスト（Standard tier）
- **レスポンス時間**: 平均2-5秒（音声長による）
- **最大音声長**: 1リクエストあたり最大10分

**エラーハンドリング**:
```typescript
async function transcribeAudio(audioBlob: Blob) {
  try {
    const response = await azureSpeech.recognize(audioBlob)
    return response.text
  } catch (error) {
    if (error.code === 'RATE_LIMIT_EXCEEDED') {
      // レート制限エラー時のリトライ処理
      await wait(60000) // 1分待機
      return transcribeAudio(audioBlob)
    }
    
    if (error.code === 'LOW_CONFIDENCE') {
      // 認識精度が低い場合の警告
      console.warn('音声認識の信頼度が低いです:', error.confidence)
      return { text: error.partialText, confidence: error.confidence }
    }
    
    throw error
  }
}
```

**音声品質の要件**:
- **推奨サンプルレート**: 16kHz以上
- **ノイズ対策**: 静かな環境での録音を推奨
- **マイク品質**: 可能な限り高品質なマイクを使用

### 3. OpenAI GPT-4 API制約（Phase 3実装予定）

**API制限**:
- **トークン制限**: 1リクエストあたり最大8,192トークン（GPT-4）
- **レート制限**: TPM（Tokens Per Minute）、RPM（Requests Per Minute）の制約
- **コスト**: 1,000トークンあたりの従量課金

**コスト最適化**:
```typescript
// 会話内容が長い場合は要約してから分析
async function analyzeConversation(transcript: string) {
  const tokenCount = estimateTokenCount(transcript)
  
  if (tokenCount > 4000) {
    // 長い場合は要約処理を挟む
    const summary = await summarizeText(transcript)
    return await analyzeWithGPT4(summary)
  }
  
  return await analyzeWithGPT4(transcript)
}
```

**プロンプトエンジニアリング**:
```typescript
// 分析精度を高めるためのプロンプト設計
const analysisPrompt = `
以下の支援セッションの会話を分析してください。

【会話内容】
${transcript}

【分析項目】
1. 感情状態（ポジティブ/ニュートラル/ネガティブ/不安）
2. ストレスレベル（低/中/高）
3. 重要なキーワード（5個以内）
4. 推奨される支援アプローチ

【注意事項】
- 臨床心理学の観点から分析してください
- 具体的で実践可能なアドバイスを提供してください
- 当事者の自尊心を傷つけない表現を使用してください

【出力形式】JSON
`
```

### 4. LocalStorage制限（現在のモック実装）

**容量制限**:
- **最大容量**: ブラウザごとに5-10MB程度
- **データ形式**: JSON文字列のみ
- **永続性**: ブラウザキャッシュクリアで削除される

**Phase 2でのデータベース移行の必要性**:
```typescript
// LocalStorageは一時的な保存のみ
// Phase 2でVercel Postgresに移行必須

// ❌ NG: 本番環境でLocalStorageに依存
localStorage.setItem('conversations', JSON.stringify(data))

// ✅ OK: データベースへの永続化
await db.conversation.create({ data })
```

---

## 🎨 UI/UX上の留意点

### 1. 録音中の明確なフィードバック

**視覚的インジケーター**:
```tsx
// 録音中は明確に表示
{isRecording && (
  <div className="flex items-center gap-2">
    <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
    <span>録音中...</span>
    <span className="text-4xl font-mono">{formatTime(recordingTime)}</span>
  </div>
)}
```

**誤操作防止**:
- 録音中は当事者選択を無効化
- 録音停止前の確認ダイアログは不要（停止後に編集可能なため）
- 保存前のプレビュー機能（テキスト編集エリア）

### 2. 処理中の待機体験

**ローディング状態の明示**:
```tsx
// 音声→テキスト変換中
{isProcessing && (
  <Alert>
    <Loader2 className="h-4 w-4 animate-spin" />
    <AlertDescription>音声をテキストに変換しています...</AlertDescription>
  </Alert>
)}
```

**レスポンス時間の目標**:
- 音声認識: 3秒以内
- 自然言語解析: 5秒以内
- 合計処理時間: 10秒以内

**長時間処理時の対応**:
- プログレスバーの表示
- 推定残り時間の表示
- キャンセルボタンの提供

### 3. エラーハンドリング

**ユーザーフレンドリーなエラーメッセージ**:
```typescript
// ❌ NG: 技術的なエラーメッセージ
throw new Error('Failed to fetch API: 500 Internal Server Error')

// ✅ OK: ユーザーに分かりやすいメッセージ
const errorMessages = {
  MICROPHONE_PERMISSION_DENIED: 'マイクへのアクセスが拒否されました。ブラウザの設定を確認してください。',
  SPEECH_RECOGNITION_FAILED: '音声の認識に失敗しました。もう一度お試しください。',
  NETWORK_ERROR: 'ネットワーク接続エラーです。インターネット接続を確認してください。',
  API_RATE_LIMIT: 'リクエスト制限に達しました。しばらく待ってから再試行してください。',
}
```

**エラー時のフォールバック**:
- 音声認識失敗時: 手動でテキスト入力可能
- API接続失敗時: オフラインモードで一時保存→後で同期
- 分析失敗時: 会話内容のみ保存（分析結果なし）

### 5. データインポート機能（🆕 2025/11/03追加）

**対応ファイル形式**:
- **音声ファイル**: mp3, m4a
- **テキストファイル**: txt, csv（UTF-8エンコーディング）

**テキストファイルの読み込み**:
```typescript
// FileReader APIでUTF-8テキストファイルを読み込み
const reader = new FileReader()
reader.onload = (e) => {
  const text = e.target?.result as string
  setTranscript(text)
}
reader.onerror = () => {
  alert("ファイルの読み込みに失敗しました")
}
reader.readAsText(file, "UTF-8")
```

**ファイル形式のバリデーション**:
```typescript
const fileName = file.name.toLowerCase()
const isAudioFile = fileName.endsWith(".mp3") || fileName.endsWith(".m4a")
const isTextFile = fileName.endsWith(".txt") || fileName.endsWith(".csv")

if (!isAudioFile && !isTextFile) {
  alert("音声ファイル（mp3, m4a）またはテキストファイル（txt, csv）のみ対応しています")
  return
}
```

**エンコーディングの注意点**:
- **推奨**: UTF-8エンコーディング
- **非対応**: Shift_JIS、EUC-JP等は文字化けの可能性
- **対応策**: 将来的に文字コード自動判定機能を追加予定（Phase 4）

**CSVファイルの扱い**:
- 現在は単純なテキストとして読み込み
- 将来的にCSVパース機能を追加予定（Phase 4）
- 会話データがカンマ区切りの場合でも、そのまま表示

### 4. レスポンシブ対応

**デバイス別の最適化**:
```tsx
// PC: 2カラムレイアウト
<div className="grid gap-6 md:grid-cols-2">
  <Card>録音エリア</Card>
  <Card>テキスト編集エリア</Card>
</div>

// タブレット: 1カラムレイアウト
<div className="grid gap-6">
  <Card>録音エリア</Card>
  <Card>テキスト編集エリア</Card>
</div>
```

**タブレット対応の優先度**:
- ✅ PC: 最優先（主要利用デバイス）
- ✅ タブレット: 対応必須
- ⏳ スマートフォン: Phase 6で対応（モバイルアプリ）

---

## 📊 パフォーマンス最適化

### 1. コンポーネントの最適化

**不要な再レンダリングの防止**:
```typescript
// ✅ useCallback でメモ化
const handleStopRecording = useCallback(async () => {
  // ...
}, [])

// ✅ useMemo で重い計算をメモ化
const emotionData = useMemo(() => {
  return conversations.map(conv => conv.analysis.emotion)
}, [conversations])
```

**動的インポート**:
```typescript
// 重いコンポーネントは動的ロード
import dynamic from 'next/dynamic'

const ConversationAnalysis = dynamic(
  () => import('./conversation-analysis'),
  { 
    loading: () => <Spinner />,
    ssr: false 
  }
)
```

### 2. データ取得の最適化

**ページネーション（Phase 2実装予定）**:
```typescript
// 履歴を一度に全件取得しない
async function getConversations(page: number, limit: number = 10) {
  return db.conversation.findMany({
    skip: page * limit,
    take: limit,
    orderBy: { recordedAt: 'desc' }
  })
}
```

**キャッシング戦略**:
```typescript
// SWRやReact Queryでキャッシング
import useSWR from 'swr'

function useConversationHistory() {
  const { data, error } = useSWR('/api/conversations', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 60000, // 1分ごとに更新
  })
  
  return { conversations: data, isLoading: !error && !data, error }
}
```

### 3. バンドルサイズの最適化

**Tree Shaking**:
```typescript
// ✅ 必要な機能のみインポート
import { format } from 'date-fns'

// ❌ 全体をインポートしない
import * as dateFns from 'date-fns'
```

**Rechartsの最適化**:
```typescript
// ✅ 使用するコンポーネントのみインポート
import { PieChart, Pie, Cell } from 'recharts'

// ❌ 全体をインポートしない
import * as Recharts from 'recharts'
```

---

## 🧪 テスト戦略（Phase 2実装予定）

### 1. ユニットテスト

**モック関数のテスト**:
```typescript
describe('mockSpeechToText', () => {
  it('2秒後にテキストを返す', async () => {
    const start = Date.now()
    const result = await mockSpeechToText()
    const duration = Date.now() - start
    
    expect(result).toBeDefined()
    expect(typeof result).toBe('string')
    expect(duration).toBeGreaterThanOrEqual(2000)
  })
})

describe('mockNLPAnalysis', () => {
  it('不安キーワードを正しく検出する', async () => {
    const transcript = '最近、不安が強くて眠れません'
    const result = await mockNLPAnalysis(transcript)
    
    expect(result.emotion).toBe('不安')
    expect(result.stressLevel).toBe('高')
    expect(result.keywords).toContain('不安')
  })
})
```

### 2. コンポーネントテスト

**React Testing Library**:
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ConversationRecorder } from './conversation-recorder'

describe('ConversationRecorder', () => {
  it('録音開始ボタンをクリックするとタイマーが開始する', async () => {
    render(<ConversationRecorder />)
    
    const startButton = screen.getByText('録音開始')
    fireEvent.click(startButton)
    
    await waitFor(() => {
      expect(screen.getByText(/録音中/)).toBeInTheDocument()
    })
  })
})
```

### 3. E2Eテスト（Phase 5実装予定）

**Playwright / Cypress**:
```typescript
describe('会話データ収集フロー', () => {
  it('録音→テキスト化→分析→保存の一連の流れが正常に動作する', async () => {
    await page.goto('/dashboard/conversation')
    
    // 当事者を選択
    await page.selectOption('select', '1')
    
    // 録音開始
    await page.click('text=録音開始')
    await page.waitForSelector('text=録音中')
    
    // 5秒待機
    await page.waitForTimeout(5000)
    
    // 録音停止
    await page.click('text=録音停止')
    
    // テキスト化を待つ
    await page.waitForSelector('textarea')
    
    // 保存
    await page.click('text=保存して分析')
    
    // 成功メッセージを確認
    await page.waitForSelector('text=会話データを保存しました')
  })
})
```

---

## 🚨 運用上の注意点

### 1. データ保持期間

**個人情報保護法に基づく保持期間**:
- 会話データ: 支援終了後3年間保持
- 分析結果: 統計データとして無期限保持可能
- 監査ログ: 3年間保持

**自動削除処理（Phase 2実装予定）**:
```typescript
// 定期的に古いデータを削除
async function cleanupOldConversations() {
  const threeYearsAgo = new Date()
  threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3)
  
  await db.conversation.deleteMany({
    where: {
      recordedAt: { lt: threeYearsAgo }
    }
  })
}
```

### 2. バックアップ戦略（Phase 2実装予定）

**日次バックアップ**:
- データベース全体のスナップショット
- S3等への保存
- 復旧時間目標（RTO）: 4時間以内

**増分バックアップ**:
- 1時間ごとの変更分を保存
- データ復旧目標（RPO）: 1時間以内

### 3. 監視・アラート（Phase 5実装予定）

**監視項目**:
- API エラー率（1%以下を維持）
- レスポンス時間（音声認識: 3秒以内）
- ディスク使用量（80%超過でアラート）

**Sentry連携**:
```typescript
import * as Sentry from '@sentry/nextjs'

try {
  await transcribeAudio(audioBlob)
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      feature: 'conversation-data-collection',
      action: 'speech-to-text'
    }
  })
  throw error
}
```

---

## 📖 参考資料・関連ドキュメント

### 内部ドキュメント
- [README.md](./README.md) - 機能概要・アーキテクチャ
- [status.md](./status.md) - 実装状況
- [要件定義書](/docs/requirements_specification.md)
- [アーキテクチャドキュメント](/docs/overview.md)

### 外部リソース
- [Web Audio API](https://developer.mozilla.org/ja/docs/Web/API/Web_Audio_API)
- [MediaRecorder API](https://developer.mozilla.org/ja/docs/Web/API/MediaRecorder)
- [Azure Speech Services](https://learn.microsoft.com/ja-jp/azure/cognitive-services/speech-service/)
- [OpenAI API Best Practices](https://platform.openai.com/docs/guides/best-practices)
- [個人情報保護法ガイドライン](https://www.ppc.go.jp/personalinfo/legal/)

---

## ✅ 実装前チェックリスト

### Phase 2: データベース実装
- [ ] Vercel Postgres セットアップ完了
- [ ] Prisma スキーマ定義完了
- [ ] Conversation モデルのマイグレーション実行
- [ ] LocalStorage からの移行スクリプト作成
- [ ] データ暗号化機能の実装
- [ ] アクセス制御（RBAC）の実装
- [ ] 監査ログ機能の実装

### Phase 3: 外部API連携
- [ ] Azure Speech Services アカウント作成
- [ ] OpenAI API キー取得
- [ ] API統合のテスト環境構築
- [ ] エラーハンドリングの実装
- [ ] レート制限対策の実装
- [ ] コスト最適化の実装

### Phase 4: 高度な機能
- [ ] 個人情報自動マスキング機能
- [ ] 音声ファイル保存機能
- [ ] 話者識別機能
- [ ] リアルタイムフィードバック機能

---

**最終更新**: 2025年11月3日（テキストファイルインポート機能追加）  
**ステータス**: Phase 1完了、Phase 2準備中  
**担当**: 開発チーム（2名体制）

