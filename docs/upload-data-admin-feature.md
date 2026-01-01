# アップロードデータ管理機能 実装ドキュメント

## 概要

音声データやメモのアップロード情報を管理者画面で確認できる機能を実装しました。フロントエンドのUI・UXは変更せず、バックエンドでデータベースへの保存と管理者専用の確認画面を追加しています。

## 実装内容

### 1. 会話データ保存API

**ファイル**: `app/api/conversation/save/route.ts`

**機能**:
- 音声データやメモからテキスト化された会話内容をデータベースに保存
- 認証チェック（ログインユーザーのみ）
- 当事者（Patient）の存在確認
- 感情分析結果、キーワード、音声URL、録音時間などのメタデータも保存
- 自動的に支援者ID（supporterId）を紐付け

**エンドポイント**:
```
POST /api/conversation/save
```

**リクエストボディ**:
```json
{
  "patientId": "string",
  "transcript": "string",
  "analysis": {
    "emotion": "string",
    "stressLevel": "string",
    "keywords": ["string"],
    "recommendation": "string"
  },
  "audioUrl": "string (optional)",
  "duration": "number (optional, 秒)"
}
```

**レスポンス**:
```json
{
  "success": true,
  "conversation": {
    "id": "string",
    "patientId": "string (anonymousId)",
    "recordedAt": "ISO 8601 datetime"
  }
}
```

### 2. フロントエンドの接続

**ファイル**: `lib/mock-conversation.ts`

**変更点**:
- `saveConversation` 関数を更新し、APIを通じてデータベースに保存
- エラー時は自動的にlocalStorageにフォールバック（データ損失を防ぐ）
- ユーザー体験は変更なし（既存のUIそのまま）

**動作フロー**:
1. ユーザーが音声・メモをアップロード
2. テキスト化されたデータを`saveConversation`で保存
3. API経由でデータベースに保存
4. 成功/失敗に関わらず、ユーザーには同じ成功メッセージを表示

### 3. 管理者専用：アップロードデータ一覧ページ

**ファイル**: `app/dashboard/admin/uploads/page.tsx`

**機能**:
- ✅ 全ユーザーのアップロードデータを一覧表示
- ✅ 音声データとメモを区別して表示
- ✅ 統計情報（総数、音声データ数、テキスト数）
- ✅ フィルタリング機能
  - テキスト検索（会話内容、当事者ID、支援者）
  - 支援者別フィルター
  - 日付範囲フィルター（開始日・終了日）
- ✅ データプレビュー（3行まで）
- ✅ 全文表示ダイアログ
- ✅ メタデータ表示（感情、キーワード、録音時間など）

**アクセス**:
- 管理者のみアクセス可能
- URL: `/dashboard/admin/uploads`
- サイドバーメニュー「アップロードデータ」から遷移

### 4. 管理者専用：会話データ取得API

**ファイル**: `app/api/admin/conversations/route.ts`

**機能**:
- 全ユーザーの会話データを取得（管理者のみ）
- 支援者情報を結合して返却
- 録音日時の降順でソート

**エンドポイント**:
```
GET /api/admin/conversations
```

**レスポンス**:
```json
{
  "conversations": [
    {
      "id": "string",
      "patientId": "string",
      "patientAnonymousId": "string (YY-NNN形式)",
      "transcript": "string",
      "recordedAt": "ISO 8601 datetime",
      "createdAt": "ISO 8601 datetime",
      "supporterId": "string | null",
      "supporterEmail": "string | null",
      "supporterName": "string | null",
      "sentiment": {
        "emotion": "string",
        "stressLevel": "string"
      } | null,
      "keywords": ["string"] | null,
      "audioUrl": "string | null",
      "duration": "number | null"
    }
  ]
}
```

### 5. ダッシュボードメニューの更新

**ファイル**: `components/dashboard/dashboard-layout.tsx`

**追加内容**:
- 管理者専用メニューに「アップロードデータ」を追加
- アイコン: Upload
- 管理者バッジ付き

## データフロー

```
┌─────────────────────────────────────────────────────────┐
│              ユーザー（一般・管理者）                      │
│                                                           │
│  1. 音声データ・メモをアップロード                          │
│  2. テキスト化                                             │
│  3. 「保存して分析」ボタンをクリック                        │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│           lib/mock-conversation.ts                       │
│           saveConversation()                             │
│                                                           │
│  - API /api/conversation/save を呼び出し                  │
│  - エラー時はlocalStorageに保存（フォールバック）          │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│         POST /api/conversation/save                      │
│                                                           │
│  1. 認証チェック                                           │
│  2. 当事者の存在確認                                       │
│  3. Conversationテーブルに保存                            │
│     - transcript                                         │
│     - sentiment (感情分析)                                │
│     - keywords                                           │
│     - audioUrl                                           │
│     - duration                                           │
│     - supporterId (自動設定)                              │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│              データベース（PostgreSQL）                    │
│              Conversationテーブル                         │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│          管理者のみアクセス可能                            │
│                                                           │
│  GET /api/admin/conversations                            │
│  ↓                                                        │
│  /dashboard/admin/uploads                                │
│                                                           │
│  - 全ユーザーのデータを確認                                │
│  - フィルタリング・検索                                     │
│  - 詳細表示                                                │
└─────────────────────────────────────────────────────────┘
```

## 使用方法

### 一般ユーザー（支援者）

1. ダッシュボードの「記録アップロード」にアクセス
2. 当事者を選択
3. 音声ファイル（mp3, m4a）またはメモ画像（JPEG, PNG, WebP）をアップロード
4. テキスト化された内容を確認・編集
5. 「保存して分析」をクリック
6. **データは自動的にデータベースに保存される**

### 管理者

1. ダッシュボードのサイドバー「アップロードデータ」にアクセス
2. 全ユーザーのアップロードデータを確認
3. フィルター機能を使用
   - 検索ボックスでテキスト検索
   - 支援者を選択してフィルタリング
   - 日付範囲を指定
4. 「全文表示」ボタンで詳細を確認

## データ構造

### Conversationテーブル

| フィールド | 型 | 説明 |
|----------|---|------|
| id | String | UUID |
| patientId | String | 当事者ID |
| transcript | Text | テキスト化された会話内容 |
| audioUrl | String? | 音声ファイルのURL（将来実装） |
| sentiment | Json? | 感情分析結果 `{ emotion, stressLevel }` |
| keywords | Json? | キーワード配列 `string[]` |
| duration | Int? | 録音時間（秒） |
| recordedAt | DateTime | 録音日時 |
| createdAt | DateTime | 作成日時 |
| updatedAt | DateTime | 更新日時 |
| supporterId | String? | 支援者ID |

## セキュリティ

### 認証・権限チェック

1. **データ保存**（`/api/conversation/save`）
   - ログイン必須
   - 自分のデータとして保存

2. **管理者専用API**（`/api/admin/conversations`）
   - 管理者権限必須（`requireAdmin()`）
   - 一般ユーザーはアクセス不可（403エラー）

3. **管理者画面**（`/dashboard/admin/uploads`）
   - クライアント側で管理者チェック
   - 非管理者は自動的にダッシュボードにリダイレクト

### 個人情報保護

- 当事者の識別には匿名化ID（YY-NNN形式）のみを使用
- 氏名等の個人を特定できる情報は保存しない
- データベースのフィールドも匿名化IDのみ

## テスト手順

### 1. データ保存のテスト

```bash
# 開発サーバー起動
pnpm dev

# ブラウザで以下を実行
# 1. ログイン（任意のユーザー）
# 2. /dashboard/conversation にアクセス
# 3. 当事者を選択
# 4. ファイルをアップロード
# 5. 「保存して分析」をクリック
# 6. ネットワークタブで /api/conversation/save が200を返すか確認
```

### 2. 管理者画面のテスト

```bash
# 1. yasutaka_yoshida@asagi.waseda.jp でログイン
# 2. サイドバーに「アップロードデータ」メニューが表示されることを確認
# 3. /dashboard/admin/uploads にアクセス
# 4. アップロードしたデータが表示されることを確認
# 5. フィルターが正常に動作することを確認
# 6. 「全文表示」ボタンで詳細が表示されることを確認
```

### 3. 権限チェックのテスト

```bash
# 1. 一般ユーザーでログイン
# 2. /dashboard/admin/uploads に直接アクセス
# 3. /dashboard にリダイレクトされることを確認
# 4. サイドバーに「アップロードデータ」メニューが表示されないことを確認
```

## トラブルシューティング

### データが保存されない

1. ブラウザのコンソールでエラーを確認
2. ネットワークタブで `/api/conversation/save` のレスポンスを確認
3. データベース接続を確認
   ```bash
   pnpm db:studio
   ```

### 管理者画面にアクセスできない

1. `/api/user/role` にアクセスしてロールを確認
2. データベースで `users` テーブルの `role` フィールドを確認
3. 必要に応じて手動で更新：
   ```sql
   UPDATE users SET role = 'ADMIN' 
   WHERE email = 'yasutaka_yoshida@asagi.waseda.jp';
   ```

### データが表示されない

1. `/api/admin/conversations` に直接アクセスしてデータを確認
2. ブラウザのコンソールでエラーを確認
3. データベースに実際にデータが保存されているか確認

## 今後の拡張案

1. **音声ファイルのストレージ連携**
   - 現在は`audioUrl`フィールドのみ（将来実装）
   - S3やCloudflare R2などのストレージサービスと連携

2. **CSVエクスポート機能**
   - 管理者画面からデータをCSV形式でエクスポート
   - 統計分析やレポート作成に活用

3. **高度な検索機能**
   - 全文検索（PostgreSQL Full-Text Search）
   - 感情・ストレスレベルでのフィルタリング
   - キーワードでのフィルタリング

4. **データ可視化**
   - アップロード数の推移グラフ
   - 支援者別の活動状況
   - 当事者別のデータ分析

5. **通知機能**
   - 新しいアップロードがあったときの通知
   - 異常な感情パターンの検出

---

**実装完了日**: 2025年12月18日  
**バージョン**: 1.0.0





