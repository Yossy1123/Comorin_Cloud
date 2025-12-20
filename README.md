# ひきこもり支援 × AI 最適化プラットフォーム

データドリブンな支援により、ひきこもり当事者一人ひとりに最適化された支援を提供するプラットフォーム

## 🚀 クイックスタート

### 前提条件

- Node.js 18以上
- pnpm（推奨）
- PostgreSQLデータベース（オプション：開発時はモックデータで動作可能）

### セットアップ手順

#### 1. リポジトリのクローン

```bash
git clone [repository-url]
cd WARP-004-022-poc
```

#### 2. 依存パッケージのインストール

```bash
pnpm install
```

#### 3. 環境変数の設定

`.env.local`ファイルを作成し、必要な環境変数を設定してください：

```bash
# データベース接続URL
DATABASE_URL="postgresql://user:password@localhost:5432/hikikomori_support?schema=public"

# Clerk認証（https://dashboard.clerk.com から取得）
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_your_key_here"
CLERK_SECRET_KEY="sk_test_your_key_here"
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
NEXT_PUBLIC_APP_URL=http://localhost:3000

# OpenAI API（https://platform.openai.com/api-keys から取得）
OPENAI_API_KEY="sk-your_openai_api_key_here"

NODE_ENV=development
```

**📝 重要**: `.env.example`をコピーして`.env.local`を作成してください。

#### 4. Prismaクライアントの生成

```bash
pnpm db:generate
```

#### 5. データベースのセットアップ（オプション）

データベースを使用する場合：

```bash
# データベーススキーマをプッシュ
pnpm db:push

# Prisma Studioでデータベースを確認
pnpm db:studio
```

**注意**: データベースが設定されていなくても、モックデータで開発サーバーは起動できます。

#### 6. 開発サーバーの起動

```bash
pnpm dev
```

アプリケーションは http://localhost:3000 で起動します。

## 📚 ドキュメント

詳細なドキュメントは`docs/`ディレクトリを参照してください：

- [プロジェクト概要](./docs/README.md)
- [要件定義書](./docs/requirements_specification.md)
- [アーキテクチャとポリシー](./docs/overview.md)
- [機能実装状況](./docs/status.md)
- [ユーザー認証実装ノート](./docs/design-docs/f-005-user-authentication/implementation-notes.md)

## 🛠️ 技術スタック

### フロントエンド

- **フレームワーク**: Next.js 15.2.5 (App Router)
- **言語**: TypeScript 5
- **UIライブラリ**: React 19
- **スタイリング**: Tailwind CSS 4.1.14
- **UIコンポーネント**: Shadcn UI + Radix UI
- **チャート**: Recharts

### バックエンド

- **データベース**: PostgreSQL (Prisma ORM)
- **認証**: Clerk
- **AI/ML**: OpenAI GPT-4

### 開発ツール

- **パッケージマネージャー**: pnpm
- **リンター**: ESLint
- **型チェック**: TypeScript

## 📋 利用可能なスクリプト

```bash
# 開発サーバー起動
pnpm dev

# 本番ビルド
pnpm build

# 本番サーバー起動
pnpm start

# リンター実行
pnpm lint

# Prismaクライアント生成
pnpm db:generate

# データベーススキーマプッシュ
pnpm db:push

# Prisma Studio起動
pnpm db:studio
```

## 🔑 認証設定

### Clerkのセットアップ

1. [Clerk Dashboard](https://dashboard.clerk.com)でアカウント作成
2. アプリケーションを作成
3. API Keysを取得して`.env.local`に設定

詳細は[認証実装ノート](./docs/design-docs/f-005-user-authentication/implementation-notes.md)を参照してください。

### OpenAI APIのセットアップ

1. [OpenAI Platform](https://platform.openai.com/api-keys)でAPIキーを取得
2. `.env.local`の`OPENAI_API_KEY`に設定

## 🐛 トラブルシューティング

### データベース接続エラー

データベースが設定されていない場合でも、モックデータで開発は可能です。本番データベースを使用する場合は、PostgreSQLをセットアップしてください。

### Clerk認証エラー

`.env.local`にClerkのAPIキーが正しく設定されているか確認してください。開発サーバーの再起動が必要な場合があります。

### ポート競合エラー

ポート3000が使用中の場合、別のポートで起動できます：

```bash
PORT=3001 pnpm dev
```

## 📖 主要機能

### 実装済み（Phase 1）

- ✅ ユーザー認証（Clerk統合）
- ✅ ダッシュボード
- ✅ 会話データ収集UI
- ✅ バイタルデータ収集UI
- ✅ データ統合・分析UI
- ✅ データインポート機能
- ✅ AI Chat機能（OpenAI GPT-4 + Vector Stores）

### 開発中（Phase 2）

- ⏳ データベース統合（Prisma + PostgreSQL）
- ⏳ 実API連携（Fitbit、Azure Speech Services）

## 🤝 コントリビューション

このプロジェクトはプライベートリポジトリです。開発チーム内でのコントリビューションガイドラインに従ってください。

## 📄 ライセンス

このプロジェクトはプライベートリポジトリです。

---

**最終更新**: 2024年12月20日  
**開発体制**: 2名  
**次マイルストーン**: Phase 2（データベース統合）

