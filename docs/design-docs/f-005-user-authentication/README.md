# F-005: ユーザー認証機能（Clerk統合）

## 📋 機能概要

ユーザー認証機能は、Clerkを活用した支援者・管理者のログイン・権限管理を行う認証システムです。本機能はシステム全体のセキュリティ基盤となり、ロールベースのアクセス制御（RBAC）により、適切な権限でのデータアクセスを保証します。

### 機能ID
**F-005**

### 優先度
**Must** - MVP対象機能

### 担当領域
認証・認可・セッション管理・ユーザー管理

---

## 🎯 目的

### ビジネス目的
- システムへの不正アクセス防止
- 個人情報・医療データの保護
- 監査ログによる透明性の確保
- 支援者・管理者の役割に応じた適切なアクセス制御
- 安全かつ使いやすいユーザー管理

### 技術的目的
- Clerkによる堅牢な認証基盤の構築（外部サービス連携）
- メール/パスワード認証 + Google OAuth対応
- JWTトークンによるステートレスな認証
- ロールベースアクセス制御（RBAC）の実装
- セッション管理とタイムアウト制御
- 自動ログアウト時のデータ保護

### Clerkを選択した理由
- **外部サービス連携**: 認証を専門サービスに委譲し、セキュリティとメンテナンス負荷を軽減
- **豊富な認証オプション**: メール/パスワード、Google OAuth、その他のプロバイダーを簡単に統合
- **組み込みUI**: 美しく使いやすいログイン・サインアップUIをカスタマイズ可能
- **Next.js最適化**: Next.js App Routerとの統合が非常にスムーズ
- **無料枠が充実**: 月間5,000アクティブユーザーまで無料（初期段階に最適）
- **セキュリティ**: MFA、パスワードレス認証、セッション管理などをビルトインで提供

---

## 👥 ユーザーロール定義

### 統合後のロール（2種類）

#### 1. `supporter`（支援者）
**対象ユーザー**:
- 精神科医
- 支援員
- 福祉施設職員
- カウンセラー

**権限**:
| 機能 | 閲覧 | 編集 | 削除 | 備考 |
|------|------|------|------|------|
| 会話データ収集 | ✅ | ✅ | ✅ | 自分が担当する当事者のみ |
| バイタルデータ | ✅ | ❌ | ❌ | 閲覧のみ（自動収集のため） |
| データ統合・分析 | ✅ | ❌ | ❌ | 分析結果の閲覧 |
| ダッシュボード | ✅ | ❌ | ❌ | 自分の担当当事者のみ |
| データインポート | ✅ | ✅ | ❌ | 施設データのインポート |
| ユーザー管理 | ❌ | ❌ | ❌ | 不可 |
| システム設定 | ❌ | ❌ | ❌ | 不可 |

**具体的な権限**:
```typescript
const supporterPermissions = [
  "conversation:read",      // 会話データ閲覧
  "conversation:write",     // 会話データ作成・編集
  "conversation:delete",    // 会話データ削除
  "vital:read",            // バイタルデータ閲覧
  "analysis:read",         // 分析結果閲覧
  "dashboard:read",        // ダッシュボード閲覧
  "import:read",           // インポート履歴閲覧
  "import:write",          // データインポート実行
]
```

#### 2. `admin`（管理者）
**対象ユーザー**:
- システム管理者
- 組織の責任者
- 技術サポート担当

**権限**:
- **全機能へのフルアクセス**
- ユーザー管理（招待・停止・削除）
- システム設定
- 監査ログの閲覧
- 全当事者のデータへのアクセス

**具体的な権限**:
```typescript
const adminPermissions = ["*"] // 全権限
```

---

## 🏗️ システムアーキテクチャ

### 認証フロー全体図

```
┌─────────────────────────────────────────────────────────────┐
│                      ユーザー                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   Clerk UI Components                        │
│  - SignIn Component (ログイン画面)                            │
│    - メール/パスワード認証                                     │
│    - Google OAuth ボタン                                      │
│  - SignUp Component (サインアップ画面)                         │
│    - メール/パスワード登録                                     │
│    - Google OAuth 登録                                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                     Clerk Service                            │
│  - ユーザー認証処理                                           │
│  - Google OAuth連携                                          │
│  - JWTトークン発行                                           │
│  - Public Metadata（role情報）                               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Next.js Middleware / Server Actions             │
│  - Clerkトークン検証                                         │
│  - ロール確認                                                 │
│  - セッション管理（30分タイムアウト）                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    ダッシュボード                              │
│  - ロールに応じた画面表示                                       │
│  - RBAC による機能制限                                         │
└─────────────────────────────────────────────────────────────┘
```

### サインアップフロー（新規ユーザー登録）

```
┌──────────────┐
│ 新規ユーザー  │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────┐
│ サインアップ画面（Clerk UI）  │
│ - メールアドレス入力           │
│ - パスワード設定              │
│ - または Google でサインアップ│
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ メール認証（Clerk）           │
│ - 認証リンク送信              │
│ - ユーザーがリンクをクリック   │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ ロール設定（管理者承認）      │
│ - デフォルト: supporter       │
│ - 管理者が必要に応じてadminへ │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ 初回ログイン完了              │
│ - ダッシュボードへ            │
└──────────────────────────────┘
```

### ログインフロー

```
┌──────────────┐
│ ユーザー      │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────┐
│ ログイン画面（Clerk UI）      │
│ - メール/パスワード入力        │
│ - または Google でログイン     │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ Clerk 認証処理                │
│ - トークン発行                │
│ - Public Metadata取得（role） │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ Next.js Middleware            │
│ - トークン検証                │
│ - ロール確認                  │
│ - セッション開始              │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ ダッシュボード画面            │
│ - ロール別表示                │
└──────────────────────────────┘
```

### セッション管理フロー

```
┌──────────────┐
│ ログイン成功  │
└──────┬───────┘
       │
       ▼
┌────────────────────────────────────┐
│ セッション開始                      │
│ - Clerk セッショントークン取得      │
│ - ブラウザCookieに保存             │
└──────┬─────────────────────────────┘
       │
       ▼
┌────────────────────────────────────┐
│ 操作監視（30分無操作でタイムアウト） │
│ - 各操作時にタイムスタンプ更新      │
│ - バックグラウンドでチェック        │
└──────┬─────────────────────────────┘
       │
       ├─ 操作あり ─→ タイマーリセット
       │
       ├─ 30分無操作 ─→ 自動ログアウト
       │                │
       │                ▼
       │         ┌──────────────────┐
       │         │ 入力中データ保存  │
       │         │ - LocalStorage   │
       │         │ - 復元可能に     │
       │         └──────┬───────────┘
       │                │
       │                ▼
       │         ┌──────────────────┐
       │         │ ログイン画面へ    │
       │         │ - セッション切れ  │
       │         │   メッセージ表示  │
       │         └──────────────────┘
       │
       └─ 手動ログアウト ─→ 即座にログアウト
                              │
                              ▼
                       ┌──────────────────┐
                       │ Clerk signOut()  │
                       │ ログイン画面へ    │
                       └──────────────────┘
```

---

## 🔐 セキュリティ仕様

### 1. パスワードポリシー
- **最小文字数**: 8文字以上（Clerkデフォルト）
- **複雑さ要件**: Clerk設定で変更可能（推奨：大文字・小文字・数字の組み合わせ）
- **パスワード漏洩チェック**: Clerk組み込み（Have I Been Pwned連携）

### 2. アカウントロック
- **ロック条件**: Clerkのデフォルト設定（一定回数のログイン失敗）
- **ロック解除方法**:
  - **自動解除**: 一定時間経過後（Clerk管理）
  - **管理者による解除**: Clerk Dashboardから手動解除可能

### 3. セッション管理
- **通常セッション**: 7日間有効（Clerkデフォルト）
- **無操作タイムアウト**: 30分（アプリケーション側で実装）
- **自動ログアウト時**: 入力中データを LocalStorage に一時保存

### 4. トークン管理
- **JWT**: Clerkが自動管理
- **トークン更新**: 自動バックグラウンド更新（Clerk SDK）
- **トークン有効期限**: 1時間（Clerkデフォルト）

### 5. 通信セキュリティ
- **HTTPS必須**: すべての通信を暗号化
- **Clerk SDK**: 最新版を使用（セキュリティパッチ自動適用）
- **CORS設定**: Vercel ドメインのみ許可

### 6. 監査ログ
- **ログイン成功/失敗**: Clerk Dashboard で確認可能
- **ログアウト**: タイムスタンプ、ユーザーID
- **権限変更**: 管理者操作の記録（アプリケーション側で実装）
- **保持期間**: 3年間（Vercel Postgres等で保存）

---

## 🧩 機能詳細

### 1. サインアップ機能（新規ユーザー登録）

**責務**:
- メール/パスワードでの新規登録
- Google OAuthでの新規登録
- メール認証
- デフォルトロール設定（supporter）

**UIコンポーネント**:
- Clerk提供の`<SignUp />`コンポーネント
- Google OAuthボタン（Clerk組み込み）
- メール認証ステータス表示

**実装詳細**:
```typescript
import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-lg",
          },
        }}
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        afterSignUpUrl="/dashboard"
      />
    </div>
  )
}
```

### 2. ログイン機能

**責務**:
- メール/パスワード認証
- Google OAuth認証
- Clerkとの連携
- セッション確立

**UIコンポーネント**:
- Clerk提供の`<SignIn />`コンポーネント
- Google OAuthボタン（Clerk組み込み）

**実装詳細**:
```typescript
import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-lg",
          },
        }}
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        afterSignInUrl="/dashboard"
      />
    </div>
  )
}
```

### 3. ログアウト機能

**責務**:
- Clerkからのログアウト
- セッションクリア
- ログイン画面へのリダイレクト

**実装詳細**:
```typescript
'use client'

import { useClerk } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function LogoutButton() {
  const { signOut } = useClerk()
  const router = useRouter()
  
  const handleLogout = async () => {
    await signOut()
    router.push('/sign-in')
  }
  
  return (
    <Button onClick={handleLogout} variant="outline">
      ログアウト
    </Button>
  )
}
```

### 4. ロール管理機能（RBAC）

**責務**:
- ユーザーにロール（supporter/admin）を設定
- Public Metadataを使用したロール保存
- 管理者によるロール変更

**実装詳細**:
```typescript
// ユーザーのロール設定（Server Action）
'use server'

import { auth, clerkClient } from "@clerk/nextjs/server"

export async function setUserRole(userId: string, role: 'supporter' | 'admin') {
  const { userId: currentUserId } = await auth()
  
  if (!currentUserId) {
    throw new Error('Unauthorized')
  }
  
  // 現在のユーザーが管理者かチェック
  const currentUser = await clerkClient.users.getUser(currentUserId)
  const currentRole = currentUser.publicMetadata.role as string
  
  if (currentRole !== 'admin') {
    throw new Error('Forbidden: Admin only')
  }
  
  // ロール更新
  await clerkClient.users.updateUserMetadata(userId, {
    publicMetadata: {
      role,
    },
  })
  
  return { success: true }
}
```

### 5. セッション監視機能

**責務**:
- 無操作タイムアウトの監視（30分）
- 自動ログアウト時のデータ保存
- タイムアウト警告の表示（オプション）

**実装詳細**:
```typescript
'use client'

import { useEffect, useRef } from 'react'
import { useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const TIMEOUT_MS = 30 * 60 * 1000 // 30分

export function useSessionTimeout() {
  const { signOut } = useClerk()
  const router = useRouter()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastActivityRef = useRef<number>(Date.now())
  
  const resetTimer = () => {
    lastActivityRef.current = Date.now()
  }
  
  useEffect(() => {
    // ユーザー操作イベント
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']
    
    events.forEach(event => {
      window.addEventListener(event, resetTimer, { passive: true })
    })
    
    // 定期チェック（1分ごと）
    const interval = setInterval(() => {
      const inactiveTime = Date.now() - lastActivityRef.current
      
      if (inactiveTime >= TIMEOUT_MS) {
        // 入力中データを保存
        saveUnsavedData()
        
        // ログアウト
        signOut()
        
        // 通知
        toast.error('セッションがタイムアウトしました。再度ログインしてください。')
        
        // リダイレクト
        router.push('/sign-in?timeout=true')
      }
    }, 60 * 1000)
    
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetTimer)
      })
      clearInterval(interval)
    }
  }, [signOut, router])
}

function saveUnsavedData() {
  // フォーム入力データを LocalStorage に一時保存
  const forms = document.querySelectorAll('form[data-autosave]')
  forms.forEach(form => {
    if (form instanceof HTMLFormElement) {
      const formData = new FormData(form)
      const data = Object.fromEntries(formData.entries())
      const formId = form.id || form.getAttribute('name') || 'unknown'
      localStorage.setItem(`autosave_${formId}`, JSON.stringify({
        data,
        timestamp: Date.now(),
      }))
    }
  })
}
```

### 6. 権限チェック機能（RBAC）

**責務**:
- ロールに基づく機能アクセス制御
- ページレベル・機能レベルの権限チェック

**実装詳細**:
```typescript
// lib/rbac.ts
import { auth, currentUser } from "@clerk/nextjs/server"

// 権限定義
export const permissions = {
  supporter: [
    'conversation:read',
    'conversation:write',
    'conversation:delete',
    'vital:read',
    'analysis:read',
    'dashboard:read',
    'import:read',
    'import:write',
  ],
  admin: ['*'], // 全権限
} as const

export type Permission = typeof permissions.supporter[number] | '*'

/**
 * 現在のユーザーのロール取得
 */
export async function getCurrentUserRole(): Promise<'supporter' | 'admin' | null> {
  const user = await currentUser()
  
  if (!user) return null
  
  return user.publicMetadata.role as 'supporter' | 'admin' | undefined || null
}

/**
 * 権限チェック
 */
export async function hasPermission(permission: Permission): Promise<boolean> {
  const role = await getCurrentUserRole()
  
  if (!role) return false
  
  const userPermissions = permissions[role]
  
  // 管理者は全権限
  if (userPermissions.includes('*')) {
    return true
  }
  
  return userPermissions.includes(permission as any)
}

/**
 * 管理者チェック
 */
export async function isAdmin(): Promise<boolean> {
  const role = await getCurrentUserRole()
  return role === 'admin'
}
```

**クライアントサイドフック**:
```typescript
// hooks/use-user-role.ts
'use client'

import { useUser } from '@clerk/nextjs'

export function useUserRole() {
  const { user } = useUser()
  
  const role = user?.publicMetadata.role as 'supporter' | 'admin' | undefined
  
  return {
    role: role || null,
    isAdmin: role === 'admin',
    isSupporter: role === 'supporter',
  }
}
```

---

## 📊 データモデル

### Clerk Public Metadata

```typescript
interface ClerkPublicMetadata {
  role: 'supporter' | 'admin'
  organizationId?: string  // 将来の拡張用
}
```

### User インターフェース

```typescript
interface User {
  id: string              // Clerk User ID
  email: string
  firstName?: string
  lastName?: string
  imageUrl?: string
  role: 'supporter' | 'admin'
  createdAt: Date
  lastSignInAt?: Date
  emailVerified: boolean
}
```

---

## 🔧 技術スタック

### 認証プロバイダー
- **Clerk**: 認証・ユーザー管理プラットフォーム
- **Google OAuth**: 外部認証プロバイダー

### フロントエンド
- **React 19**: UIコンポーネント
- **Next.js 15 App Router**: ページルーティング
- **TypeScript**: 型安全性
- **Shadcn UI**: UIコンポーネントライブラリ
- **@clerk/nextjs**: Clerk Next.js SDK

### バックエンド
- **Next.js Server Actions**: API Layer
- **Clerk Backend API**: ユーザー管理
- **Vercel**: ホスティング
- **Vercel Postgres**: 監査ログ保存（オプション）

---

## 📁 ファイル構成

```
app/
├── sign-in/
│   └── [[...sign-in]]/
│       └── page.tsx           # Clerkログイン画面
├── sign-up/
│   └── [[...sign-up]]/
│       └── page.tsx           # Clerkサインアップ画面
├── dashboard/
│   └── page.tsx               # ダッシュボード（保護ルート）
└── middleware.ts              # Clerk認証ミドルウェア

components/auth/
├── logout-button.tsx          # ログアウトボタン
├── user-button.tsx            # ユーザーメニュー（Clerk提供）
└── protected-route.tsx        # RBAC保護ルート（クライアント側）

lib/
├── rbac.ts                    # RBAC実装
└── clerk-utils.ts             # Clerkユーティリティ関数

hooks/
├── use-user-role.ts           # ユーザーロールフック
└── use-session-timeout.ts     # セッションタイムアウトフック

app/actions/
└── user-management.ts         # ユーザー管理Server Actions

middleware.ts                  # Clerk認証ミドルウェア（ルート）
```

---

## 🔄 連携する機能

### 入力
- **ユーザー入力**: メールアドレス、パスワード
- **Google OAuth**: Googleアカウント情報
- **管理者操作**: ロール設定、ユーザー管理

### 出力
- **全機能**: 認証状態の提供、ロール情報の提供
- **監査ログ**: ログイン/ログアウトイベント
- **Clerk Webhook**: ユーザー作成・更新イベント（オプション）

### 依存関係
- **Clerk Service**: 認証基盤
- **Google OAuth**: 外部認証プロバイダー
- **すべての機能**: F-005の認証・認可に依存

---

## 📈 今後の拡張計画

### Phase 2: Clerk統合（2ヶ月以内開始）
- Clerk プロジェクト作成
- メール/パスワード認証有効化
- Google OAuth設定
- Next.js との統合
- RBAC実装
- セッション管理実装
- モック実装削除

### Phase 3: パスワードリセット（Phase 2後）
- Clerkのパスワードリセット機能活用
- カスタムメールテンプレート（将来）

### Phase 4: ユーザー管理画面（Phase 2後）
- ユーザー一覧表示
- ロール変更UI
- ユーザー無効化・削除

### Phase 5: MFA対応（本番運用開始後）
- SMS認証統合（Clerk組み込み）
- 認証アプリ（TOTP）統合
- バックアップコード生成

### 将来機能
- ソーシャルログイン追加（Microsoft、GitHub等）
- 組織管理機能（複数組織対応）
- SSO統合（SAML、OAuth 2.0）
- 詳細な監査ログ分析ダッシュボード

---

## 📚 参考資料

- [要件定義書 - F-005詳細仕様](/docs/requirements_specification.md#426-f-006-ユーザー認証機能)
- [アーキテクチャドキュメント](/docs/overview.md)
- [実装状況ドキュメント](/docs/status.md)
- [Clerk Documentation](https://clerk.com/docs)
- [Clerk Next.js Quickstart](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk Authentication](https://clerk.com/docs/authentication/overview)
- [Clerk User Management](https://clerk.com/docs/users/overview)

---

**最終更新**: 2025年10月23日  
**ステータス**: Phase 1完了（モックUI実装）、Phase 2準備中（Clerk統合）  
**担当**: 開発チーム（2名体制）
