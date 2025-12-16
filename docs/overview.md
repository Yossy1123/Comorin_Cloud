# システムアーキテクチャとポリシー

本ドキュメントでは、ひきこもり支援×AI最適化プラットフォームのシステムアーキテクチャ、設計思想、開発ポリシーについて詳細に説明します。

## 目次

- [1. システムアーキテクチャ](#1-システムアーキテクチャ)
- [2. 技術スタック詳細](#2-技術スタック詳細)
- [3. 設計パターンとベストプラクティス](#3-設計パターンとベストプラクティス)
- [4. セキュリティポリシー](#4-セキュリティポリシー)
- [5. 開発ポリシー](#5-開発ポリシー)
- [6. データアーキテクチャ](#6-データアーキテクチャ)
- [7. 外部API連携（予定）](#7-外部api連携予定)
- [8. パフォーマンス最適化](#8-パフォーマンス最適化)

---

## 1. システムアーキテクチャ

### 1.1 全体構成

本システムは、Next.js 15のApp Routerを基盤としたモダンなWebアプリケーションです。

```
┌─────────────────────────────────────────────────────────┐
│                     ユーザー                              │
│            (支援者・管理者・福祉施設職員)                  │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Next.js Frontend                        │
│  ┌─────────────────────────────────────────────────┐   │
│  │  App Router (React Server Components)           │   │
│  │  ├── ダッシュボード                               │   │
│  │  ├── 会話データ収集                               │   │
│  │  ├── バイタルデータ収集                           │   │
│  │  ├── データ統合・分析                             │   │
│  │  └── データインポート                             │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │  UI Components (Shadcn UI + Radix UI)           │   │
│  └─────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Backend API Layer (予定)                    │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Next.js API Routes / Server Actions            │   │
│  └─────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
┌──────────┐  ┌──────────┐  ┌──────────────┐
│ Database │  │ AI/ML    │  │ External     │
│ (予定)    │  │ Services │  │ APIs         │
│          │  │ (予定)    │  │ (予定)        │
│PostgreSQL│  │ OpenAI   │  │ - Fitbit     │
│ + Prisma │  │ SageMaker│  │ - Azure      │
│          │  │          │  │   Speech     │
└──────────┘  └──────────┘  └──────────────┘
```

### 1.2 レイヤー構成

本システムは以下の3層アーキテクチャで構成されています：

#### プレゼンテーション層 (Presentation Layer)
- **責務**: UI/UX、ユーザーインタラクション
- **技術**: Next.js App Router、React Server Components、Shadcn UI
- **場所**: `app/`, `components/`

#### ビジネスロジック層 (Business Logic Layer)
- **責務**: データ処理、分析ロジック、ビジネスルール
- **技術**: Next.js Server Actions、TypeScript
- **場所**: `lib/`（現在はモック実装）

#### データ層 (Data Layer)
- **責務**: データ永続化、外部API連携
- **技術**: PostgreSQL + Prisma（予定）、外部API
- **場所**: `prisma/`（予定）、API クライアント

### 1.3 現在の実装状態

**MVP Phase 1（完了）**: モックデータを使用したフロントエンド実装

- ✅ UI/UXコンポーネントの完成
- ✅ ページ遷移・ナビゲーションの実装
- ✅ モックデータによる動作確認
- ⏳ バックエンド API実装（Phase 2 - 2ヶ月以内開始）
- ⏳ データベース実装（Phase 2 - Vercel Postgres + Prisma）
- ⏳ 外部API連携（Phase 3）

**開発体制**: 2名体制  
**次マイルストーン**: PoC実証（半年後予定）

---

## 2. 技術スタック詳細

### 2.1 フロントエンド

| カテゴリ | 技術 | バージョン | 用途 |
|---------|------|-----------|------|
| フレームワーク | Next.js | 15.2.4 | App Router、SSR/SSG |
| 言語 | TypeScript | 5.x | 型安全性 |
| UIライブラリ | React | 19.x | コンポーネント開発 |
| スタイリング | Tailwind CSS | 4.1.9 | ユーティリティファーストCSS |
| UIコンポーネント | Shadcn UI | - | 再利用可能なコンポーネント |
| プリミティブ | Radix UI | - | アクセシブルなUI基盤 |
| チャート | Recharts | latest | データ可視化 |
| フォーム | React Hook Form | 7.60.0 | フォーム管理 |
| バリデーション | Zod | 3.25.67 | スキーマバリデーション |
| テーマ | next-themes | 0.4.6 | ダークモード対応 |
| アイコン | Lucide React | 0.454.0 | アイコンセット |
| 通知 | Sonner | 1.7.4 | トースト通知 |

### 2.2 開発環境

| カテゴリ | 技術 | 説明 |
|---------|------|------|
| パッケージマネージャー | pnpm | 高速で効率的なパッケージ管理 |
| リンター | ESLint | コード品質チェック |
| 型チェック | TypeScript Compiler | 静的型チェック |
| Git | Git | バージョン管理 |

### 2.3 バックエンド（予定）

| カテゴリ | 技術 | 用途 |
|---------|------|------|
| データベース | PostgreSQL (Vercel Postgres) | リレーショナルデータベース |
| ORM | Prisma | 型安全なDB操作 |
| 認証 | **Auth0** ✅ | ユーザー認証・認可 |
| AI/ML | OpenAI GPT-4 | 自然言語処理・分析 |
| AI/ML | Vercel AI SDK (予定) | 機械学習モデルの統合 |
| バイタルデータ | Fitbit Web API | 心拍・活動量・睡眠データ取得 |
| 音声認識 | Azure Speech Services | 音声→テキスト変換 |
| クラウド | **Vercel** ✅ | ホスティング・インフラ |

---

## 3. 設計パターンとベストプラクティス

### 3.1 コンポーネント設計

#### Server Components優先

Next.js 15のApp Routerでは、デフォルトでServer Componentsを使用します。

```typescript
// ✅ Good: Server Component（デフォルト）
export default function DashboardPage() {
  // データフェッチなどサーバーサイド処理
  return <DashboardOverview />
}

// ✅ Good: Client Componentは必要な場合のみ
"use client"
export function InteractiveChart() {
  const [data, setData] = useState([])
  // インタラクティブなロジック
  return <Chart data={data} />
}
```

#### コンポーネント構成

```typescript
// components/feature/example-component.tsx

"use client" // Client Componentの場合のみ

import { useState } from "react"
import { Button } from "@/components/ui/button"

// 1. 型定義
interface ExampleComponentProps {
  title: string
  onSubmit: (value: string) => void
}

// 2. メインコンポーネント（エクスポート）
export function ExampleComponent({ title, onSubmit }: ExampleComponentProps) {
  const [value, setValue] = useState("")

  const handleSubmit = () => {
    onSubmit(value)
  }

  return (
    <div>
      <h2>{title}</h2>
      <SubComponent value={value} onChange={setValue} />
      <Button onClick={handleSubmit}>送信</Button>
    </div>
  )
}

// 3. サブコンポーネント（ローカル）
function SubComponent({ 
  value, 
  onChange 
}: { 
  value: string
  onChange: (v: string) => void 
}) {
  return <input value={value} onChange={(e) => onChange(e.target.value)} />
}

// 4. ヘルパー関数
function formatValue(value: string): string {
  return value.trim().toLowerCase()
}
```

### 3.2 ディレクトリ構造規約

```
app/
  dashboard/          # 機能ごとにディレクトリを分割
    [feature]/
      page.tsx        # ページコンポーネント
      layout.tsx      # レイアウト（必要な場合）
      loading.tsx     # ローディングUI
      error.tsx       # エラーUI

components/
  [feature]/          # 機能ごとにグループ化
    feature-main.tsx
    feature-sub.tsx
  ui/                 # 共通UIコンポーネント
    button.tsx
    card.tsx
  dashboard/          # 横断的な共通コンポーネント
    dashboard-layout.tsx

lib/
  [feature].ts        # ビジネスロジック
  utils.ts            # ユーティリティ関数
```

### 3.3 状態管理

現在の実装では、ローカルステート（`useState`）を中心に使用しています。

```typescript
// ✅ ローカルステートで十分な場合
const [isLoading, setIsLoading] = useState(false)

// 🔄 将来的にグローバルステートが必要な場合
// - React Context
// - Zustand
// - Jotai
```

### 3.4 データフェッチパターン

```typescript
// Server Componentでのデータフェッチ（予定）
export default async function DataPage() {
  const data = await fetchData() // サーバーサイドで実行
  return <DataView data={data} />
}

// Client Componentでのデータフェッチ（現在）
"use client"
export function DataComponent() {
  const [data, setData] = useState(null)
  
  useEffect(() => {
    async function loadData() {
      const result = await fetchData()
      setData(result)
    }
    loadData()
  }, [])
  
  return <DataView data={data} />
}
```

### 3.5 エラーハンドリング

```typescript
// エラーバウンダリ（app/error.tsx）
"use client"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h2>エラーが発生しました</h2>
      <button onClick={() => reset()}>再試行</button>
    </div>
  )
}

// Try-Catch パターン
async function handleSubmit() {
  try {
    await submitData()
  } catch (error) {
    console.error("エラー:", error)
    showErrorToast("送信に失敗しました")
  }
}
```

---

## 4. セキュリティポリシー

### 4.1 データ保護

#### 個人情報の取り扱い

- **原則**: 個人情報は匿名統計データとして処理
- **禁止**: 個人に紐づく情報の直接使用
- **準拠**: 個人情報保護法

```typescript
// ✅ 匿名化されたデータ
interface AnonymizedData {
  userId: string        // ハッシュ化されたID
  timestamp: Date
  vitalMetrics: number[]
  // 個人を特定できる情報は含まない
}

// ❌ 個人情報を含むデータ（使用禁止）
interface PersonalData {
  name: string          // NG
  address: string       // NG
  phoneNumber: string   // NG
}
```

#### データ匿名化フロー

```
生データ → 匿名化処理 → 統計データ → 分析・表示
         (個人情報除去)  (集約・平均化)
```

### 4.2 認証・認可

#### 現在（モック実装）

```typescript
// lib/mock-auth.ts
export async function mockLogin(email: string, password: string) {
  // テスト用のシンプルな認証
  if (email === "supporter@example.com" && password === "password123") {
    return { success: true, user: { email, role: "supporter" } }
  }
  return { success: false, error: "認証失敗" }
}
```

#### 将来（本番実装）

- **認証プロバイダー**: **Auth0** ✅ 選定済み
- **セッション管理**: JWT (JSON Web Token) via Auth0
- **権限管理**: RBAC (Role-Based Access Control)
- **実装予定**: Phase 2（2ヶ月以内開始）

```typescript
// 将来の実装イメージ
interface User {
  id: string
  email: string
  role: "admin" | "supporter" | "facility_staff"
  permissions: string[]
}

// ロールに基づくアクセス制御
function requireRole(role: User["role"]) {
  // ミドルウェアでロールチェック
}
```

### 4.3 通信セキュリティ

- **HTTPS必須**: すべての通信を暗号化
- **CORS設定**: 適切なCORS policy
- **CSRF対策**: Next.jsの組み込み保護
- **XSS対策**: React/Next.jsの自動エスケープ

### 4.4 監査ログ

データアクセス履歴を記録（予定）：

```typescript
interface AuditLog {
  timestamp: Date
  userId: string
  action: string        // "view", "edit", "delete"
  resource: string      // "conversation", "vital_data"
  ipAddress: string
  result: "success" | "failure"
}

// ログ保持期間: 3年間
```

---

## 5. 開発ポリシー

### 5.1 コーディング規約

#### TypeScript

```typescript
// ✅ interfaceを優先
interface User {
  id: string
  name: string
}

// ❌ typeは避ける（unionやintersectionの場合は使用可）
type User = {
  id: string
  name: string
}

// ✅ enumは避け、mapを使用
const UserRole = {
  ADMIN: "admin",
  SUPPORTER: "supporter",
} as const

// ❌ enum
enum UserRole {
  ADMIN = "admin",
  SUPPORTER = "supporter",
}
```

#### 命名規則

```typescript
// ディレクトリ: ダッシュ付き小文字
components/auth-wizard/

// コンポーネント: PascalCase
export function UserProfile() { }

// 変数・関数: camelCase
const isLoading = true
function handleSubmit() { }

// 定数: UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3

// 真偽値: is/has/should prefix
const isValid = true
const hasError = false
const shouldRender = true
```

#### 関数宣言

```typescript
// ✅ 純粋関数には"function"キーワード
function calculateScore(data: number[]): number {
  return data.reduce((sum, val) => sum + val, 0)
}

// ✅ コンポーネントやコールバックはアロー関数も可
const handleClick = () => {
  console.log("clicked")
}
```

### 5.2 UIスタイリング

#### Tailwind CSS

```typescript
// ✅ ユーティリティクラスを使用
<div className="flex items-center gap-4 p-4 bg-background rounded-lg">
  <span className="text-sm font-medium text-foreground">ラベル</span>
</div>

// ✅ 条件付きスタイル
<div className={cn(
  "base-styles",
  isActive && "active-styles",
  variant === "primary" && "primary-styles"
)}>
```

#### レスポンシブデザイン

```typescript
// モバイルファースト
<div className="
  flex flex-col         // モバイル: 縦並び
  md:flex-row          // タブレット以上: 横並び
  lg:gap-6             // PC: ギャップ大
">
```

### 5.3 パフォーマンス最適化

#### Server Components優先

```typescript
// ✅ デフォルトでServer Component
export default function StaticContent() {
  return <div>静的コンテンツ</div>
}

// ✅ インタラクティブな部分のみClient Component
"use client"
export function InteractiveWidget() {
  const [state, setState] = useState()
  return <div onClick={() => setState()}>クリック</div>
}
```

#### 動的インポート

```typescript
// 重いコンポーネントは動的ロード
import dynamic from 'next/dynamic'

const HeavyChart = dynamic(() => import('./heavy-chart'), {
  loading: () => <Spinner />,
  ssr: false
})
```

### 5.4 テストポリシー（予定）

```typescript
// ユニットテスト
describe("calculateScore", () => {
  it("正しくスコアを計算する", () => {
    expect(calculateScore([1, 2, 3])).toBe(6)
  })
})

// コンポーネントテスト
describe("LoginForm", () => {
  it("フォーム送信時にonSubmitが呼ばれる", () => {
    // テストコード
  })
})
```

---

## 6. データアーキテクチャ

### 6.1 データモデル（予定）

```prisma
// prisma/schema.prisma

// ユーザー
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  role      Role
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum Role {
  ADMIN
  SUPPORTER
  FACILITY_STAFF
}

// 当事者（匿名化）
model Patient {
  id              String   @id @default(uuid())
  anonymousId     String   @unique // 匿名化されたID
  conversations   Conversation[]
  vitalData       VitalData[]
  supportRecords  SupportRecord[]
  createdAt       DateTime @default(now())
}

// 会話データ
model Conversation {
  id          String   @id @default(uuid())
  patientId   String
  patient     Patient  @relation(fields: [patientId], references: [id])
  transcript  String   // テキスト化された会話
  sentiment   Json     // 感情分析結果
  keywords    Json     // キーワード抽出結果
  recordedAt  DateTime
  createdAt   DateTime @default(now())
}

// バイタルデータ
model VitalData {
  id              String   @id @default(uuid())
  patientId       String
  patient         Patient  @relation(fields: [patientId], references: [id])
  heartRate       Int
  steps           Int
  sleepDuration   Float
  stressLevel     String
  recordedAt      DateTime
  createdAt       DateTime @default(now())
}

// 支援記録
model SupportRecord {
  id              String   @id @default(uuid())
  patientId       String
  patient         Patient  @relation(fields: [patientId], references: [id])
  supporterId     String
  approach        String   // 支援アプローチ
  result          String   // 結果
  notes           String   // メモ
  recordedAt      DateTime
  createdAt       DateTime @default(now())
}

// 分析結果
model AnalysisResult {
  id                String   @id @default(uuid())
  patientId         String
  overallScore      Int
  riskLevel         String
  recommendations   Json
  similarCases      Json
  analyzedAt        DateTime
  createdAt         DateTime @default(now())
}
```

### 6.2 データフロー

```
┌──────────────┐
│ ユーザー入力  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ フロント      │  バリデーション（Zod）
│ エンド        │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ API Layer    │  認証・認可チェック
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ ビジネス      │  データ処理・匿名化
│ ロジック      │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ データベース  │  永続化
└──────────────┘
```

---

## 7. 外部API連携（予定）

### 7.1 Fitbit Web API

心拍・活動量・睡眠データの取得

```typescript
// 将来の実装イメージ
interface FitbitClient {
  getHeartRate(userId: string, date: Date): Promise<HeartRateData>
  getActivitySummary(userId: string, date: Date): Promise<ActivityData>
  getSleepLog(userId: string, date: Date): Promise<SleepData>
}

// API制限: 1日150回リクエスト
// リトライ戦略: 指数バックオフ
```

### 7.2 OpenAI GPT-4

自然言語処理・感情分析

```typescript
interface OpenAIClient {
  analyzeConversation(transcript: string): Promise<{
    sentiment: string
    keywords: string[]
    psychologicalState: Record<string, number>
  }>
  
  generateRecommendations(context: AnalysisContext): Promise<string[]>
}
```

### 7.3 Azure Speech Services

音声→テキスト変換

```typescript
interface SpeechClient {
  transcribeAudio(audioFile: Blob): Promise<{
    text: string
    confidence: number
  }>
}

// レスポンス時間目標: 3秒以内
```

---

## 8. パフォーマンス最適化

### 8.1 レスポンス時間目標

| 操作 | 目標時間 |
|------|---------|
| 主要画面表示 | 3秒以内 |
| データ分析結果表示 | 10秒以内 |
| 音声認識処理 | 3秒以内 |
| バイタルデータ同期 | 1秒以内の遅延 |

### 8.2 最適化戦略

#### コード分割

```typescript
// ルートベースのコード分割（Next.js自動）
// 各ページは独立したバンドル

// コンポーネントレベルの動的インポート
const Chart = dynamic(() => import('./chart'), { ssr: false })
```

#### 画像最適化

```typescript
import Image from 'next/image'

<Image
  src="/image.jpg"
  alt="説明"
  width={800}
  height={600}
  loading="lazy"
  placeholder="blur"
/>
```

#### キャッシング戦略（予定）

```typescript
// Server Componentでのキャッシュ
export const revalidate = 60 // 60秒ごとに再検証

// Redisキャッシュ
const cachedData = await redis.get(key)
if (cachedData) return cachedData

const freshData = await fetchData()
await redis.set(key, freshData, 'EX', 3600)
```

### 8.3 同時接続数対応

| 年度 | 想定ユーザー | 同時接続数 |
|------|------------|-----------|
| 初年度 | 2施設×10ユーザー | 20 |
| 2年目 | 4施設×10ユーザー | 40 |
| 3年目 | 8施設×10ユーザー | 80 |

---

## 9. 運用・監視

### 9.1 Vercel環境

本プロジェクトは **Vercel** をクラウドプロバイダーとして採用しています。

#### Vercel の利点

- **Next.js最適化**: Next.jsの開発元による最適化されたホスティング
- **自動スケーリング**: トラフィックに応じた自動スケール
- **Edge Network**: グローバルCDNによる高速配信
- **Preview Deployment**: PRごとの自動プレビュー環境
- **Zero Config**: 最小限の設定で本番デプロイ可能
- **Vercel Postgres**: PostgreSQL互換のマネージドデータベース
- **Analytics**: 組み込みの分析ツール

#### 環境構成

```
┌─────────────────────────────────────┐
│ Production (本番環境)                │
│ - vercel.app ドメイン                │
│ - Vercel Postgres (本番)            │
│ - Auth0 (本番テナント)               │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Preview (ステージング環境)           │
│ - PRごとの自動プレビューURL          │
│ - Vercel Postgres (開発)            │
│ - Auth0 (開発テナント)               │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Development (ローカル開発)           │
│ - localhost:3000                    │
│ - ローカルPostgreSQL / Vercel Postgres│
│ - Auth0 (開発テナント)               │
└─────────────────────────────────────┘
```

### 9.2 ログ管理

```typescript
// 構造化ログ
logger.info("User action", {
  userId: user.id,
  action: "view_dashboard",
  timestamp: new Date(),
  metadata: { /* ... */ }
})

// エラーログ
logger.error("API error", {
  error: error.message,
  stack: error.stack,
  context: { /* ... */ }
})
```

### 9.3 監視指標

#### Vercel Analytics

- **Core Web Vitals**: LCP、FID、CLS
- **リアルタイムアクセス**: ユーザーアクセスの可視化
- **デバイス・ブラウザ分布**: ユーザー環境の把握

#### Sentry（エラー監視）

- **エラー率**: 1%以下
- **平均レスポンス時間**: 3秒以内
- **API成功率**: 99%以上
- **パフォーマンス監視**: トランザクション追跡

#### 目標指標

- **稼働率**: 99.5%以上（Vercel SLA）
- **エラー率**: 1%以下
- **平均レスポンス時間**: 3秒以内
- **API成功率**: 99%以上

### 9.4 バックアップ

- **日次バックアップ**: データベース全体
- **週次フルバックアップ**: システム全体
- **復旧時間目標（RTO）**: 4時間以内
- **データ復旧目標（RPO）**: 1時間以内

---

## 10. Auth0 実装計画

### 10.1 認証フロー

```typescript
// Auth0 SDK設定
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react'

// Auth0プロバイダー設定
const auth0Config = {
  domain: process.env.NEXT_PUBLIC_AUTH0_DOMAIN!,
  clientId: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID!,
  authorizationParams: {
    redirect_uri: typeof window !== 'undefined' ? window.location.origin : '',
    audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
    scope: 'openid profile email'
  }
}

// ログイン処理
export function LoginButton() {
  const { loginWithRedirect } = useAuth0()
  
  return (
    <button onClick={() => loginWithRedirect()}>
      ログイン
    </button>
  )
}

// Server-side トークン検証
import { auth } from '@auth0/nextjs-auth0'

export async function getUserFromSession() {
  const session = await auth().getSession()
  return session?.user
}
```

### 10.2 権限管理（RBAC with Auth0）

```typescript
// Auth0 Management API（サーバーサイド）
import { ManagementClient } from 'auth0'

const management = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN!,
  clientId: process.env.AUTH0_CLIENT_ID!,
  clientSecret: process.env.AUTH0_CLIENT_SECRET!,
})

// ロールの割り当て
await management.assignRolestoUser(
  { id: userId },
  { roles: ['rol_supporter'] } // rol_admin, rol_supporter
)

// カスタムクレーム（Auth0 Actions）
exports.onExecutePostLogin = async (event, api) => {
  const namespace = 'https://yourapp.com'
  
  if (event.authorization) {
    api.idToken.setCustomClaim(`${namespace}/role`, event.user.app_metadata.role)
    api.idToken.setCustomClaim(`${namespace}/permissions`, event.user.app_metadata.permissions)
  }
}

// トークンからロール取得
const decodedToken = await verifyToken(token)
const role = decodedToken['https://yourapp.com/role'] // 'supporter'
```

### 10.3 Vercel環境変数

```bash
# .env.local
NEXT_PUBLIC_AUTH0_DOMAIN=xxx.auth0.com
NEXT_PUBLIC_AUTH0_CLIENT_ID=xxx
NEXT_PUBLIC_AUTH0_AUDIENCE=https://api.yourapp.com
AUTH0_CLIENT_SECRET=xxx (Server only)
AUTH0_BASE_URL=http://localhost:3000 (or production URL)
```

### 10.4 Auth0 テナント設定

#### 必要な設定

1. **Application設定**
   - Application Type: Single Page Application
   - Allowed Callback URLs: `http://localhost:3000/api/auth/callback`, `https://yourdomain.vercel.app/api/auth/callback`
   - Allowed Logout URLs: `http://localhost:3000`, `https://yourdomain.vercel.app`
   - Allowed Web Origins: `http://localhost:3000`, `https://yourdomain.vercel.app`

2. **API設定**
   - Identifier: `https://api.yourapp.com`
   - Signing Algorithm: RS256
   - RBAC Settings: Enable RBAC, Add Permissions in Access Token

3. **Roles定義**
   - `admin`: 管理者（全権限）
   - `supporter`: 支援者・福祉施設職員

4. **Permissions定義**
   - `read:patients`: 当事者情報の閲覧
   - `write:conversations`: 会話データの記録
   - `read:analytics`: 分析結果の閲覧
   - `manage:users`: ユーザー管理（admin のみ）

## 11. 今後の拡張性

### 11.1 スケーラビリティ

- **Vercel自動スケーリング**: トラフィックに応じた自動スケール
- **Edge Functions**: エッジロケーションでの処理
- **データベーススケーリング**: Vercel Postgres のスケールアップ/アウト

### 11.2 突発的アクセス増対策

- **Vercel Edge Network**: グローバルCDNによる静的コンテンツ配信
- **Vercel KV (Redis)**: キャッシュ戦略による応答速度向上
- **リトライ制御・サーキットブレーカーパターン**

---

### 11.3 国際展開（5年目以降）

- 多言語対応（英語、中国語等）
- 各国の規制対応（HIPAA等）
- 現地パートナーシップ

### 11.4 機能拡張

- モバイルアプリ開発（React Native + Auth0）
- 決済機能統合（Stripe）
- レポート自動生成
- ビデオ会話分析
- VR/AR支援ツール連携

---

## 12. 開発計画サマリー

### 確定事項 ✅

| 項目 | 決定内容 |
|------|---------|
| 認証プロバイダー | **Auth0** |
| クラウドプロバイダー | **Vercel** |
| データベース | **Vercel Postgres + Prisma ORM** |
| 開発体制 | **2名体制** |
| Phase 2 開始 | **2ヶ月以内** |
| PoC実証 | **半年後** |

### 開発スケジュール

```
現在 ─┬─ 2ヶ月 ─┬─ 2-3ヶ月 ─┬─ 3-4ヶ月 ─┬─ 1-2ヶ月 ─┬─ PoC
      │         │           │           │          │
   Phase 1   Phase 2     Phase 3     Phase 4    Phase 5  実証実験
   (完了)  (DB・認証)  (API連携)  (AI/ML)   (本番準備)  (半年後)
```

**累計期間**: 約8-11ヶ月でPoC実証準備完了予定

---

**最終更新**: 2024年1月

