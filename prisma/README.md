# Prisma セットアップガイド

## 概要

このプロジェクトでは、Neon PostgreSQLデータベースとPrisma ORMを使用してデータ管理を行います。

## 前提条件

- Node.js 18以上
- pnpm（推奨）
- Neonアカウント（https://neon.tech）

## セットアップ手順

### 1. 依存パッケージのインストール

```bash
pnpm install
```

これにより、以下のパッケージがインストールされます：
- `prisma` (開発依存)
- `@prisma/client` (本番依存)

### 2. Neonデータベースの作成

1. [Neon Console](https://console.neon.tech)にアクセス
2. 新しいプロジェクトを作成
3. データベース接続文字列をコピー

接続文字列の形式:
```
postgresql://[user]:[password]@[hostname].neon.tech/[dbname]?sslmode=require
```

### 3. 環境変数の設定

プロジェクトルートに `.env` ファイルを作成し、データベース接続文字列を設定：

```bash
cp .env.example .env
```

`.env` ファイルを編集：

```env
DATABASE_URL="postgresql://user:password@your-hostname.neon.tech/dbname?sslmode=require"
```

⚠️ **重要**: `.env` ファイルは `.gitignore` に含まれています。絶対にコミットしないでください。

### 4. Prisma Clientの生成

```bash
pnpm db:generate
```

または

```bash
npx prisma generate
```

これにより、`node_modules/@prisma/client` にPrisma Clientが生成されます。

### 5. データベーススキーマの同期

**開発環境**（スキーマをデータベースにプッシュ）：

```bash
pnpm db:push
```

または

```bash
npx prisma db push
```

**本番環境**（マイグレーションを使用）：

```bash
npx prisma migrate deploy
```

### 6. データベースの確認

Prisma Studioを起動してデータベースを視覚的に確認：

```bash
pnpm db:studio
```

または

```bash
npx prisma studio
```

ブラウザで `http://localhost:5555` が開きます。

## 使用方法

### アプリケーションコードでの使用

```typescript
import { db } from '@/lib/prisma'

// ユーザーの取得
const users = await db.user.findMany()

// 会話データの作成
const conversation = await db.conversation.create({
  data: {
    patientId: 'patient-id',
    transcript: '会話内容',
    recordedAt: new Date(),
  },
})

// 当事者の検索（リレーション込み）
const patient = await db.patient.findUnique({
  where: { id: 'patient-id' },
  include: {
    conversations: true,
    vitalData: true,
    analysisResults: true,
  },
})
```

## データモデル概要

### 主要モデル

| モデル名 | 説明 | 責務 |
|---------|------|------|
| `User` | ユーザー（支援者・管理者） | 認証・権限管理 |
| `Patient` | 当事者（匿名化） | ひきこもり当事者のデータ管理 |
| `Conversation` | 会話データ | 会話の記録と分析結果 |
| `VitalData` | バイタルデータ | Fitbitからの健康データ |
| `SupportRecord` | 支援記録 | 支援活動の履歴 |
| `AnalysisResult` | 分析結果 | AI/MLによる統合分析 |
| `ImportHistory` | インポート履歴 | データインポートの記録 |
| `AuditLog` | 監査ログ | データアクセスの記録 |

### ロール定義

| ロール | 権限 |
|--------|------|
| `ADMIN` | 全機能へのフルアクセス |
| `SUPPORTER` | 支援者（精神科医・支援員・福祉施設職員） |

## 便利なコマンド

```bash
# Prisma Studioを起動
pnpm db:studio

# スキーマをデータベースにプッシュ（開発環境）
pnpm db:push

# Prisma Clientを再生成
pnpm db:generate

# データベース接続のリセット（開発環境のみ）
npx prisma db push --force-reset

# スキーマのフォーマット
npx prisma format

# スキーマの検証
npx prisma validate
```

## トラブルシューティング

### データベース接続エラー

```
Error: P1001: Can't reach database server
```

**対処法**:
1. `.env` ファイルの `DATABASE_URL` が正しいか確認
2. Neonデータベースが起動しているか確認
3. ネットワーク接続を確認
4. Neon Consoleで接続文字列を再確認

### Prisma Clientが見つからない

```
Error: Cannot find module '@prisma/client'
```

**対処法**:
```bash
pnpm install
pnpm db:generate
```

### スキーマ変更が反映されない

**対処法**:
```bash
# Prisma Clientを再生成
pnpm db:generate

# データベースに反映
pnpm db:push
```

## セキュリティ

- `.env` ファイルは絶対にコミットしない
- 本番環境の接続文字列は環境変数として安全に管理
- Vercel等のホスティングサービスの環境変数機能を使用
- データベース接続は常に SSL/TLS を使用（`sslmode=require`）

## Phase 2実装計画

現在、データベーススキーマは定義されていますが、実際のデータ操作はモック実装を使用しています。

**Phase 2（2ヶ月以内開始予定）**:
- Neonデータベースの本番セットアップ
- Prisma Clientを使用したCRUD操作の実装
- モック実装からの移行
- データマイグレーション戦略の策定

## 参考資料

- [Prisma公式ドキュメント](https://www.prisma.io/docs)
- [Neon公式ドキュメント](https://neon.tech/docs)
- [Next.js + Prisma ベストプラクティス](https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices)
- [プロジェクトREADME](/docs/README.md)
- [要件定義書](/docs/requirements_specification.md)

---

**最終更新**: 2024年1月  
**ステータス**: Phase 1完了（スキーマ定義）、Phase 2準備中

