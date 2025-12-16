# F-007: AI Chat with Vector Stores - 実装ノート

## 実装日
2025年10月29日

---

## 実装概要

OpenAI の Assistants API と Vector Stores を活用した対話型AIチャット機能を実装しました。支援者がRAG（Retrieval-Augmented Generation）を用いて当事者に関する情報を質問・分析できます。

---

## アーキテクチャ

### 技術スタック

- **フレームワーク**: Next.js 15.2.4 (App Router)
- **言語**: TypeScript
- **認証**: Clerk (@clerk/nextjs v6.34.0)
- **データベース**: PostgreSQL + Prisma
- **AI**: OpenAI SDK (openai@^4.76.0)
- **UI**: Shadcn UI + Radix UI + Tailwind CSS

### ディレクトリ構造

```
/app/api/ai-chat/
├── assistant/route.ts     # Assistant管理API
├── thread/route.ts        # Thread管理API
├── message/route.ts       # メッセージ送受信API（ストリーミング）
├── upload/route.ts        # ファイルアップロードAPI
└── sessions/route.ts      # セッション一覧API

/app/dashboard/
└── ai-chat/
    └── page.tsx           # メインチャット画面

/lib/
├── openai.ts              # OpenAIクライアント初期化
├── assistant-utils.ts     # Assistant管理ロジック
├── thread-utils.ts        # Thread管理ロジック
├── message-utils.ts       # メッセージ管理ロジック
└── vector-store-utils.ts  # Vector Store管理ロジック

/components/ai-chat/
├── chat-interface.tsx     # メインチャットUI
├── message-list.tsx       # メッセージ一覧
├── message-input.tsx      # メッセージ入力欄
├── thread-sidebar.tsx     # スレッド一覧サイドバー
└── file-upload.tsx        # ファイルアップロード

/types/
└── ai-chat.ts             # TypeScript型定義

/prisma/
└── schema.prisma          # データベーススキーマ
    ├── AiChatAssistant    # Assistantモデル
    ├── AiChatThread       # Threadモデル
    ├── AiChatMessage      # Messageモデル
    └── AiChatFile         # Fileモデル
```

---

## データフロー

### メッセージ送信フロー

```
1. ユーザーがメッセージ入力
   ↓
2. クライアント → POST /api/ai-chat/message
   ↓
3. DBにユーザーメッセージ保存
   ↓
4. OpenAI Threads APIにメッセージ送信
   ↓
5. OpenAI Run作成（ストリーミング有効）
   ↓
6. サーバー → クライアント（SSE ストリーミング）
   ↓
7. クライアントでリアルタイム表示
   ↓
8. Run完了後、DBにアシスタントメッセージ保存
```

### ファイルアップロードフロー

```
1. ユーザーがファイル選択・アップロード
   ↓
2. クライアント → POST /api/ai-chat/upload (FormData)
   ↓
3. ファイルバリデーション（サイズ、形式）
   ↓
4. OpenAI Files APIにアップロード
   ↓
5. Vector Store作成（初回のみ）
   ↓
6. Vector StoreにファイルID追加
   ↓
7. AssistantにVector Store紐付け
   ↓
8. DBにファイル情報保存
```

---

## 主要機能

### 1. Assistant管理

**ファイル**: `lib/assistant-utils.ts`

- `createAssistant()` - 新規Assistant作成
- `getOrCreateAssistant()` - Assistant取得（なければ作成）
- `attachVectorStore()` - Vector Store紐付け

**デフォルト設定**:
- モデル: `gpt-4-turbo-preview`
- システムプロンプト: ひきこもり支援専門家としての振る舞い
- ツール: `file_search`（Vector Store使用時）

### 2. Thread管理

**ファイル**: `lib/thread-utils.ts`

- `createThread()` - 新規Thread作成
- `getUserThreads()` - ユーザーのThread一覧取得
- `getThread()` - Thread詳細取得
- `deleteThread()` - Thread削除

### 3. メッセージ送受信

**ファイル**: `lib/message-utils.ts`, `app/api/ai-chat/message/route.ts`

- ユーザーメッセージのDB保存
- OpenAI Runの作成とストリーミング
- Server-Sent Events（SSE）による応答配信
- アシスタントメッセージのDB保存

**ストリーミングイベント**:
- `thread.message.delta` - テキストチャンク
- `thread.run.completed` - Run完了
- `thread.run.failed` - Run失敗

### 4. Vector Store統合

**ファイル**: `lib/vector-store-utils.ts`

- `createVectorStore()` - Vector Store作成
- `uploadFileToVectorStore()` - ファイルアップロード
- `getVectorStoreFiles()` - ファイル一覧取得
- `deleteFile()` - ファイル削除

**サポートファイル形式**:
- PDF (`application/pdf`)
- テキスト (`text/plain`)
- Markdown (`text/markdown`)
- JSON (`application/json`)
- CSV (`text/csv`)

**制約**:
- ファイルサイズ上限: 10MB

---

## セキュリティ考慮事項

### 1. 認証・認可

- **Clerk認証**: 全APIエンドポイントで必須
- **ユーザー分離**: ThreadとFileはuserIdで分離
- **権限確認**: Thread/File操作時にownership確認

### 2. APIキー管理

- 環境変数での管理（`OPENAI_API_KEY`）
- サーバーサイドのみで使用（クライアント露出なし）

### 3. ファイルバリデーション

- MIMEタイプチェック
- ファイルサイズチェック
- マルウェア対策（将来実装予定）

### 4. データ保護

- 個人情報の匿名化（既存のPatientモデルと連携）
- HTTPS通信の強制
- データベース暗号化（Prisma標準）

---

## パフォーマンス最適化

### 1. ストリーミング応答

- Server-Sent Events（SSE）使用
- テキストチャンクの逐次配信
- UX向上: 応答待ち時間の体感短縮

### 2. データベースインデックス

```prisma
@@index([userId, createdAt(sort: Desc)])  // Thread一覧
@@index([threadId, createdAt])             // メッセージ一覧
@@index([openaiId])                        // OpenAI ID検索
```

### 3. Server Components

- Thread一覧の初期データはサーバーで取得
- クライアントコンポーネントは最小限（`use client`）

---

## エラーハンドリング

### 1. APIエラー

```typescript
try {
  // API呼び出し
} catch (error) {
  console.error("エラー:", error);
  return NextResponse.json(
    { error: "エラーメッセージ" },
    { status: 500 }
  );
}
```

### 2. ストリーミングエラー

- Run失敗時: `type: "error"` イベント送信
- クライアント側でエラーメッセージ表示

### 3. ファイルアップロードエラー

- ファイルサイズ超過
- 非サポート形式
- OpenAI API制限

---

## テスト戦略

### 1. 単体テスト（未実装）

- ユーティリティ関数のテスト
- Jest / Vitest使用

### 2. 統合テスト（未実装）

- APIエンドポイントのテスト
- モックデータベース使用

### 3. E2Eテスト（未実装）

- Playwright / Cypress使用
- ユーザーフロー全体のテスト

---

## 運用・監視

### 1. ログ

- `console.error()` でエラーログ記録
- 本番環境: Sentry等の導入推奨

### 2. コスト監視（未実装）

- OpenAI API使用量のトラッキング
- トークン数のログ記録
- 月間コスト表示ダッシュボード

### 3. パフォーマンス監視（未実装）

- レスポンス時間計測
- ストリーミング遅延計測
- Vercel Analytics活用

---

## 今後の拡張案

### 短期（1-2ヶ月）

1. **ファイル管理UI**
   - アップロード済みファイル一覧
   - ファイル削除機能
   - ファイル検索

2. **Thread機能強化**
   - タイトル自動生成
   - タイトル編集
   - アーカイブ機能

3. **エラーハンドリング強化**
   - リトライロジック
   - ユーザーフレンドリーなメッセージ

### 中期（3-6ヶ月）

1. **コスト管理**
   - トークン使用量表示
   - 月間コスト見積もり
   - 使用量アラート

2. **検索機能**
   - メッセージ全文検索
   - Thread検索
   - ファイル検索

3. **エクスポート機能**
   - 会話履歴のPDF出力
   - テキストエクスポート

### 長期（6ヶ月以上）

1. **マルチモーダル対応**
   - 画像アップロード
   - 音声入力
   - 図表生成

2. **協調編集**
   - 複数支援者での共有
   - コメント機能

3. **API拡張**
   - Webhook連携
   - 外部システム連携

---

## トラブルシューティング

### 問題1: OpenAI API エラー

**症状**: `OPENAI_API_KEY環境変数が設定されていません`

**解決策**:
```bash
# .env.local に追加
OPENAI_API_KEY=sk-...
```

### 問題2: データベース接続エラー

**症状**: Prismaクライアントエラー

**解決策**:
```bash
npx prisma db push
npx prisma generate
```

### 問題3: ストリーミング応答が表示されない

**症状**: メッセージが一括で表示される

**解決策**:
- ブラウザのネットワークタブで確認
- SSEストリームが正常に配信されているか確認
- サーバーログでエラー確認

### 問題4: ファイルアップロード失敗

**症状**: ファイルサイズ制限エラー

**解決策**:
- ファイルサイズを10MB以下に圧縮
- 対応形式（PDF, TXT, MD, JSON, CSV）を確認

---

## 参考資料

### OpenAI ドキュメント
- [Assistants API Overview](https://platform.openai.com/docs/assistants/overview)
- [File Search Tool](https://platform.openai.com/docs/assistants/tools/file-search)
- [Streaming with Assistants](https://platform.openai.com/docs/assistants/overview/step-4-create-a-run)

### Next.js ドキュメント
- [App Router](https://nextjs.org/docs/app)
- [Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)

### Clerk ドキュメント
- [Next.js Integration](https://clerk.com/docs/quickstarts/nextjs)
- [Authentication](https://clerk.com/docs/authentication/overview)

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
|------|-----------|---------|
| 2025/10/29 | 1.0.0 | 初回リリース - 基本機能実装完了 |

---

**作成者**: AI Assistant  
**最終更新**: 2025年10月29日

