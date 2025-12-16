# F-007: AI Chat with Vector Stores

## 概要

OpenAI の Assistants API と Vector Stores を活用した対話型チャット機能です。支援者がRAG（Retrieval-Augmented Generation）を用いて当事者に関する情報を質問・分析できます。

## 機能要件

### 主要機能

1. **Assistant管理**
   - OpenAI Assistantの作成・取得
   - Vector Storeとの紐付け
   - 専門的な支援知識を持つAssistantの設定

2. **Thread（会話スレッド）管理**
   - 当事者ごとの会話スレッド作成
   - 会話履歴の保持と検索
   - スレッドの削除・アーカイブ

3. **メッセージ送受信**
   - ユーザーからの質問送信
   - AIアシスタントからのストリーミング応答
   - メッセージ履歴の表示

4. **Vector Store統合**
   - 支援資料・ガイドラインのアップロード
   - 当事者の会話履歴・バイタルデータの埋め込み
   - 文脈に基づいた回答生成

5. **ファイルアップロード**
   - PDF、テキスト、Markdown等のアップロード
   - Vector Storeへの自動インデックス化
   - ファイル管理（一覧、削除）

## 技術仕様

### 使用技術

- **OpenAI Assistants API** - v2 (最新安定版)
- **Vector Stores** - ファイルベースRAG
- **Streaming** - Server-Sent Events (SSE)
- **認証** - Clerk（既存）
- **データベース** - PostgreSQL + Prisma（既存）

### APIエンドポイント

| エンドポイント | メソッド | 説明 |
|--------------|---------|------|
| `/api/ai-chat/assistant` | GET, POST | Assistant作成・取得 |
| `/api/ai-chat/thread` | GET, POST, DELETE | Thread管理 |
| `/api/ai-chat/message` | POST | メッセージ送信（ストリーミング） |
| `/api/ai-chat/upload` | POST | ファイルアップロード |
| `/api/ai-chat/sessions` | GET | セッション一覧取得 |

### データモデル

```prisma
model AiChatAssistant {
  id              String   @id @default(uuid())
  openaiId        String   @unique  // OpenAI Assistant ID
  name            String
  instructions    String   @db.Text
  model           String   @default("gpt-4-turbo-preview")
  vectorStoreId   String?  // Vector Store ID
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  threads         AiChatThread[]
}

model AiChatThread {
  id              String   @id @default(uuid())
  openaiId        String   @unique  // OpenAI Thread ID
  assistantId     String
  assistant       AiChatAssistant @relation(fields: [assistantId], references: [id])
  userId          String   // Clerk User ID
  patientId       String?  // 当事者ID（オプション）
  title           String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  messages        AiChatMessage[]
}

model AiChatMessage {
  id              String   @id @default(uuid())
  threadId        String
  thread          AiChatThread @relation(fields: [threadId], references: [id])
  role            String   // "user" | "assistant"
  content         String   @db.Text
  openaiMessageId String?  // OpenAI Message ID
  createdAt       DateTime @default(now())
}

model AiChatFile {
  id              String   @id @default(uuid())
  openaiFileId    String   @unique  // OpenAI File ID
  fileName        String
  fileSize        Int
  mimeType        String
  vectorStoreId   String?
  userId          String   // アップロードしたユーザー
  createdAt       DateTime @default(now())
}
```

## ユーザーストーリー

1. **支援者として、当事者に関する過去の会話や資料を参照しながらAIと対話したい。なぜなら、より正確で文脈に基づいたアドバイスを得られるからだ。**

2. **支援者として、支援ガイドラインやベストプラクティスをアップロードしてAIに学習させたい。なぜなら、組織の知識を活用した支援提案を受けられるからだ。**

3. **支援者として、当事者ごとに会話スレッドを管理したい。なぜなら、各当事者に特化した継続的な対話が可能になるからだ。**

## UI/UX設計

### 画面構成

```
/dashboard/ai-chat/
├── サイドバー（左）
│   ├── 新規チャットボタン
│   ├── スレッド一覧
│   └── ファイル管理リンク
├── メインチャット領域（中央）
│   ├── メッセージリスト
│   └── メッセージ入力欄
└── 情報パネル（右・オプション）
    ├── 当事者情報
    └── 参照ファイル一覧
```

### 主要コンポーネント

- `chat-interface.tsx` - メインチャットUI
- `message-list.tsx` - メッセージ表示
- `message-input.tsx` - 入力欄
- `thread-sidebar.tsx` - スレッド一覧
- `file-upload.tsx` - ファイルアップロード
- `streaming-message.tsx` - ストリーミング表示

## 実装フェーズ

### Phase 1: 基盤構築 ✅
- [x] 設計ドキュメント作成
- [ ] OpenAI SDK導入
- [ ] データベーススキーマ拡張
- [ ] 基本ユーティリティ実装

### Phase 2: API実装
- [ ] Assistant管理API
- [ ] Thread管理API
- [ ] メッセージ送受信API（ストリーミング）
- [ ] ファイルアップロードAPI

### Phase 3: フロントエンド実装
- [ ] チャット画面UI
- [ ] メッセージコンポーネント
- [ ] ストリーミング表示
- [ ] ファイル管理UI

### Phase 4: 統合とテスト
- [ ] エンドツーエンドテスト
- [ ] エラーハンドリング
- [ ] パフォーマンス最適化

## セキュリティ考慮事項

1. **APIキー管理**
   - 環境変数での管理（`OPENAI_API_KEY`）
   - サーバーサイドのみでの使用

2. **アクセス制御**
   - Clerk認証による保護
   - ユーザーごとのThread分離

3. **データ保護**
   - アップロードファイルの検証
   - 個人情報の適切な取り扱い

4. **コスト管理**
   - トークン使用量の監視
   - レート制限の実装

## パフォーマンス要件

- メッセージ送信レスポンス: 初回チャンク 2秒以内
- ストリーミング応答: スムーズな表示
- ファイルアップロード: 10MB以下のファイル対応
- 同時接続数: 20ユーザー対応

## 制約事項

1. Vector Store容量制限（OpenAI API制限に準拠）
2. ファイルサイズ制限: 10MB/ファイル
3. サポートファイル形式: PDF, TXT, MD, JSON, CSV
4. コスト制約: 月間トークン使用量の監視

## 参考資料

- [OpenAI Assistants API Documentation](https://platform.openai.com/docs/assistants/overview)
- [Vector Stores Guide](https://platform.openai.com/docs/assistants/tools/file-search)
- [Streaming with Assistants](https://platform.openai.com/docs/assistants/overview/step-4-create-a-run)

## ステータス

- **作成日**: 2025/10/29
- **最終更新**: 2025/10/29
- **実装状況**: Phase 1 進行中
- **担当者**: AI Assistant
