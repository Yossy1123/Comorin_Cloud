# 認証・権限管理セットアップガイド

## 概要

このガイドでは、ひきこもり支援プラットフォームの認証・権限管理システムのセットアップ方法を説明します。

## 実装機能

### 1. ロールベースのアクセス制御（RBAC）

- **管理者（ADMIN）**
  - 全ユーザーのデータにアクセス可能
  - ユーザー管理画面へのアクセス
  - 全ての会話記録・支援記録の閲覧
  - 全てのAIチャットスレッドへのアクセス

- **支援者（SUPPORTER）**
  - 自分が作成したデータのみアクセス可能
  - 自分が担当する当事者のデータにアクセス
  - 自分のAIチャットスレッドのみアクセス

### 2. 管理者アカウント

デフォルトの管理者メールアドレス：
```
yasutaka_yoshida@asagi.waseda.jp
```

このメールアドレスでサインアップしたユーザーは自動的に管理者権限が付与されます。

## セットアップ手順

### 1. データベースマイグレーション

既存のスキーマに `User` テーブルと `Role` enumが含まれているため、データベースを更新します：

```bash
# Prismaクライアントを生成
pnpm db:generate

# データベースをプッシュ
pnpm db:push
```

### 2. 環境変数の確認

`.env.local` に以下の環境変数が設定されていることを確認：

```env
# Clerk認証
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key

# データベース（Neon PostgreSQL）
DATABASE_URL=your_database_url

# OpenAI API
OPENAI_API_KEY=your_openai_api_key
```

### 3. Clerk Webhookの設定（オプション）

Clerkダッシュボードでwebhookを設定すると、ユーザーの作成・更新・削除が自動的にデータベースに同期されます。

1. Clerkダッシュボードにログイン
2. "Webhooks" セクションに移動
3. 新しいWebhookを追加：
   - Endpoint URL: `https://your-domain.com/api/webhooks/clerk`
   - Events: `user.created`, `user.updated`, `user.deleted`

> **注意**: Webhookを設定しない場合でも、ユーザーが初めてログインした際に自動的にデータベースに作成されます。

### 4. 開発サーバーの起動

```bash
pnpm dev
```

## 使用方法

### 管理者としてログイン

1. `yasutaka_yoshida@asagi.waseda.jp` でサインアップ/ログイン
2. ダッシュボードにアクセス
3. ヘッダーに「管理者」バッジが表示される
4. サイドバーに「ユーザー管理」メニューが表示される

### 一般ユーザーとしてログイン

1. 任意のメールアドレスでサインアップ/ログイン
2. ダッシュボードにアクセス
3. 自分のデータのみ表示される
4. 管理者専用メニューは表示されない

## API エンドポイント

### ユーザーロール取得
```
GET /api/user/role
```
現在のユーザーのロール情報を取得

### 管理者専用：ユーザー一覧
```
GET /api/admin/users
```
全ユーザーの一覧を取得（管理者のみ）

### 会話記録一覧
```
GET /api/conversation/records
```
- 管理者：全ての会話記録
- 一般ユーザー：自分が担当する会話記録のみ

### AIチャットスレッド
```
GET /api/ai-chat/thread
GET /api/ai-chat/sessions
```
- 管理者：全てのスレッド
- 一般ユーザー：自分のスレッドのみ

## トラブルシューティング

### データベース接続エラー

```bash
# データベース接続を確認
pnpm db:studio
```

### ユーザーが作成されない

1. Clerkの認証が正しく設定されているか確認
2. データベース接続が正常か確認
3. ブラウザのコンソールでエラーを確認

### 権限エラー

1. `/api/user/role` にアクセスしてロールを確認
2. データベースで `users` テーブルの `role` フィールドを確認
3. 必要に応じて手動でロールを更新：
   ```sql
   UPDATE users SET role = 'ADMIN' WHERE email = 'yasutaka_yoshida@asagi.waseda.jp';
   ```

## セキュリティ考慮事項

1. **管理者メールアドレスの保護**
   - 本番環境では環境変数で管理することを推奨
   - `ADMIN_EMAIL=your_admin_email@domain.com`

2. **APIルートの保護**
   - すべてのAPIルートで認証チェックを実施
   - 管理者専用APIは `requireAdmin()` でガード

3. **監査ログ**
   - 将来的に `AuditLog` テーブルを使用して全アクセスを記録

## 次のステップ

- [ ] Clerk Webhookの設定
- [ ] 本番環境での管理者メールアドレスの環境変数化
- [ ] 監査ログ機能の実装
- [ ] ユーザーロール変更機能の追加（管理者UI）
- [ ] 組織・チーム機能の追加（将来的な拡張）

---

**最終更新**: 2025年12月18日  
**バージョン**: 1.0.0


