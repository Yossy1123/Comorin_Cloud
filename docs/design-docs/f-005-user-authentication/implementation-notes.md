# F-005: ユーザー認証機能（Clerk統合）- 実装ノート

本ドキュメントでは、F-005ユーザー認証機能のClerk統合に関する技術的な詳細、コード例、ベストプラクティスを記載します。

---

## 📋 目次

1. [Clerk プロジェクトセットアップ](#1-clerk-プロジェクトセットアップ)
2. [環境変数設定](#2-環境変数設定)
3. [Next.js統合](#3-nextjs統合)
4. [認証画面実装](#4-認証画面実装)
5. [RBAC実装](#5-rbac実装)
6. [セッション管理](#6-セッション管理)
7. [ユーザー管理機能](#7-ユーザー管理機能)
8. [モック実装の削除](#8-モック実装の削除)
9. [テスト戦略](#9-テスト戦略)
10. [トラブルシューティング](#10-トラブルシューティング)

---

## 1. Clerk プロジェクトセットアップ

### 1.1 Clerkアカウント作成

1. **Clerk公式サイトにアクセス**
   - https://clerk.com/
   - 「Start Building」または「Sign Up」をクリック

2. **アカウント登録**
   - Googleアカウントで登録（推奨）
   - またはメールアドレスで登録

3. **アプリケーション作成**
   - Dashboard → 「Create Application」
   - アプリケーション名: `WARP-004-022 Hikikomori Support`
   - 認証方法を選択:
     - ✅ **Email/Password**
     - ✅ **Google**
   - 「Create Application」をクリック

### 1.2 Google OAuth設定

1. **Google Cloud Consoleでプロジェクト作成**
   - https://console.cloud.google.com/
   - 新しいプロジェクトを作成

2. **OAuth同意画面の設定**
   - 「APIとサービス」→「OAuth同意画面」
   - ユーザータイプ: 外部
   - アプリ名: `ひきこもり支援プラットフォーム`
   - サポートメール: あなたのメールアドレス
   - 承認済みドメイン: `vercel.app` または独自ドメイン

3. **OAuth 2.0 クライアントID作成**
   - 「APIとサービス」→「認証情報」
   - 「認証情報を作成」→「OAuth クライアント ID」
   - アプリケーションの種類: ウェブアプリケーション
   - 承認済みのリダイレクトURI: Clerk Dashboardから取得
     - 形式: `https://[your-clerk-domain].accounts.dev/v1/oauth_callback`

4. **ClerkにGoogle OAuth情報を設定**
   - Clerk Dashboard → 「Configure」→「SSO Connections」
   - 「Google」を選択
   - Client IDとClient Secretを入力
   - 「Save」をクリック

### 1.3 Clerk設定の確認

Clerk Dashboard → 「API Keys」で以下を確認：
- **Publishable Key**: `pk_test_...` または `pk_live_...`
- **Secret Key**: `sk_test_...` または `sk_live_...`

---

## 2. 環境変数設定

### 2.1 環境変数ファイル

**`.env.local`** (開発環境):
```bash
# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Vercel環境変数設定**:
```bash
# Vercel Dashboard → Project Settings → Environment Variables で設定

# 本番環境:
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_[YOUR_PUBLISHABLE_KEY]
CLERK_SECRET_KEY=sk_live_[YOUR_SECRET_KEY]  # [Secret]

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### 2.2 .env.example の作成

```bash
# .env.example
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key_here
CLERK_SECRET_KEY=your_secret_key_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 3. Next.js統合

### 3.1 パッケージインストール

```bash
pnpm add @clerk/nextjs
```

### 3.2 ClerkProvider設定

**`app/layout.tsx`**:
```typescript
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="ja">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

### 3.3 Middleware設定（認証保護）

**`middleware.ts`** (プロジェクトルート):
```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// 認証が必要なルート
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api/(.*)',
])

// 公開ルート（認証不要）
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  // 保護されたルートにアクセスする場合は認証必須
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Next.jsの内部ファイルを除外
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // APIルートは常に実行
    '/(api|trpc)(.*)',
  ],
}
```

### 3.4 日本語ローカライゼーション

**`app/layout.tsx`** (更新):
```typescript
import { ClerkProvider } from '@clerk/nextjs'
import { jaJP } from '@clerk/localizations'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider localization={jaJP}>
      <html lang="ja">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

---

## 4. 認証画面実装

### 4.1 ログイン画面

**`app/sign-in/[[...sign-in]]/page.tsx`**:
```typescript
import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <SignIn
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'shadow-lg border border-border',
            headerTitle: 'text-2xl font-bold',
            headerSubtitle: 'text-muted-foreground',
            socialButtonsBlockButton: 'border border-border hover:bg-accent',
            formButtonPrimary: 'bg-primary text-primary-foreground hover:bg-primary/90',
            footerActionLink: 'text-primary hover:text-primary/80',
          },
        }}
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
      />
    </div>
  )
}
```

### 4.2 サインアップ画面

**`app/sign-up/[[...sign-up]]/page.tsx`**:
```typescript
import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <SignUp
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'shadow-lg border border-border',
            headerTitle: 'text-2xl font-bold',
            headerSubtitle: 'text-muted-foreground',
            socialButtonsBlockButton: 'border border-border hover:bg-accent',
            formButtonPrimary: 'bg-primary text-primary-foreground hover:bg-primary/90',
            footerActionLink: 'text-primary hover:text-primary/80',
          },
        }}
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
      />
    </div>
  )
}
```

### 4.3 ユーザーボタンコンポーネント

**`components/auth/user-button.tsx`**:
```typescript
'use client'

import { UserButton } from '@clerk/nextjs'

export function ClerkUserButton() {
  return (
    <UserButton
      afterSignOutUrl="/sign-in"
      appearance={{
        elements: {
          avatarBox: 'h-10 w-10',
        },
      }}
      userProfileMode="modal"
      userProfileProps={{
        appearance: {
          elements: {
            rootBox: 'w-full max-w-2xl',
            card: 'shadow-lg border border-border',
          },
        },
      }}
    />
  )
}
```

### 4.4 ログアウトボタン

**`components/auth/logout-button.tsx`**:
```typescript
'use client'

import { useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export function LogoutButton() {
  const { signOut } = useClerk()
  const router = useRouter()
  
  const handleLogout = async () => {
    await signOut()
    router.push('/sign-in')
  }
  
  return (
    <Button onClick={handleLogout} variant="ghost" size="sm">
      <LogOut className="mr-2 h-4 w-4" />
      ログアウト
    </Button>
  )
}
```

---

## 5. RBAC実装

### 5.1 ロール定義

**`lib/rbac.ts`**:
```typescript
import { auth, currentUser } from '@clerk/nextjs/server'

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

export type Role = 'supporter' | 'admin'
export type Permission = typeof permissions.supporter[number] | '*'

/**
 * 現在のユーザーのロール取得
 */
export async function getCurrentUserRole(): Promise<Role | null> {
  const user = await currentUser()
  
  if (!user) return null
  
  // Public Metadataからロール取得
  const role = user.publicMetadata.role as Role | undefined
  
  // デフォルトはsupporter
  return role || 'supporter'
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

/**
 * 認証チェック
 */
export async function requireAuth() {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error('Unauthorized')
  }
  
  return userId
}

/**
 * 管理者権限チェック
 */
export async function requireAdmin() {
  await requireAuth()
  
  const admin = await isAdmin()
  
  if (!admin) {
    throw new Error('Forbidden: Admin only')
  }
}
```

### 5.2 クライアントサイドフック

**`hooks/use-user-role.ts`**:
```typescript
'use client'

import { useUser } from '@clerk/nextjs'
import type { Role, Permission } from '@/lib/rbac'

export function useUserRole() {
  const { user, isLoaded } = useUser()
  
  const role = (user?.publicMetadata.role as Role | undefined) || 'supporter'
  
  const permissions = {
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
    admin: ['*'],
  }
  
  const hasPermission = (permission: Permission): boolean => {
    const userPermissions = permissions[role]
    
    if (userPermissions.includes('*')) {
      return true
    }
    
    return userPermissions.includes(permission as any)
  }
  
  return {
    role,
    isAdmin: role === 'admin',
    isSupporter: role === 'supporter',
    hasPermission,
    isLoaded,
  }
}
```

### 5.3 保護ルートコンポーネント

**`components/auth/protected-route.tsx`**:
```typescript
'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Spinner } from '@/components/ui/spinner'
import type { Permission } from '@/lib/rbac'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermission?: Permission
  requireAdmin?: boolean
}

export function ProtectedRoute({ 
  children, 
  requiredPermission,
  requireAdmin = false 
}: ProtectedRouteProps) {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  
  useEffect(() => {
    if (!isLoaded) return
    
    // 未ログイン
    if (!user) {
      router.push('/sign-in')
      return
    }
    
    const role = user.publicMetadata.role as 'supporter' | 'admin' | undefined
    
    // 管理者チェック
    if (requireAdmin && role !== 'admin') {
      router.push('/access-denied')
      return
    }
    
    // 権限チェック
    if (requiredPermission) {
      const permissions = {
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
        admin: ['*'],
      }
      
      const userPermissions = permissions[role || 'supporter']
      
      if (!userPermissions.includes('*') && !userPermissions.includes(requiredPermission as any)) {
        router.push('/access-denied')
        return
      }
    }
  }, [isLoaded, user, requireAdmin, requiredPermission, router])
  
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    )
  }
  
  if (!user) {
    return null
  }
  
  return <>{children}</>
}
```

### 5.4 アクセス拒否画面

**`app/access-denied/page.tsx`**:
```typescript
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ShieldAlert } from 'lucide-react'

export default function AccessDeniedPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-4">
        <ShieldAlert className="mx-auto h-16 w-16 text-destructive" />
        <h1 className="text-2xl font-bold">アクセス拒否</h1>
        <p className="text-muted-foreground">
          この機能を使用する権限がありません。
        </p>
        <Button asChild>
          <Link href="/dashboard">ダッシュボードに戻る</Link>
        </Button>
      </div>
    </div>
  )
}
```

---

## 6. セッション管理

### 6.1 セッションタイムアウト実装

**`hooks/use-session-timeout.ts`**:
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
  
  const saveUnsavedData = () => {
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
        
        console.log(`[Session] Saved form data: ${formId}`)
      }
    })
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
        console.log('[Session] Timeout detected, logging out...')
        
        // 入力中データを保存
        saveUnsavedData()
        
        // ログアウト
        signOut()
        
        // 通知
        toast.error('セッションがタイムアウトしました。再度ログインしてください。')
        
        // リダイレクト
        router.push('/sign-in?timeout=true')
      }
    }, 60 * 1000) // 1分ごと
    
    console.log('[Session] Monitoring started')
    
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetTimer)
      })
      clearInterval(interval)
      console.log('[Session] Monitoring stopped')
    }
  }, [signOut, router])
}
```

### 6.2 データ復元機能

**`lib/session-storage.ts`**:
```typescript
interface SavedFormData {
  data: Record<string, any>
  timestamp: number
}

/**
 * 未保存データの復元
 */
export function restoreUnsavedData(formId: string): Record<string, any> | null {
  if (typeof window === 'undefined') return null
  
  const saved = localStorage.getItem(`autosave_${formId}`)
  
  if (!saved) return null
  
  try {
    const { data, timestamp }: SavedFormData = JSON.parse(saved)
    
    // 1時間以上古いデータは削除
    if (Date.now() - timestamp > 60 * 60 * 1000) {
      localStorage.removeItem(`autosave_${formId}`)
      return null
    }
    
    console.log(`[Session] Restored form data: ${formId}`)
    return data
  } catch (error) {
    console.error('[Session] Error restoring data:', error)
    return null
  }
}

/**
 * 未保存データのクリア
 */
export function clearUnsavedData(formId: string): void {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem(`autosave_${formId}`)
  console.log(`[Session] Cleared form data: ${formId}`)
}
```

### 6.3 ダッシュボードレイアウトでの使用

**`components/dashboard/dashboard-layout.tsx`** (更新):
```typescript
'use client'

import { useSessionTimeout } from '@/hooks/use-session-timeout'
import { ClerkUserButton } from '@/components/auth/user-button'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  // セッションタイムアウト監視
  useSessionTimeout()
  
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">ダッシュボード</h1>
          <ClerkUserButton />
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
```

---

## 7. ユーザー管理機能

### 7.1 ロール設定Server Action

**`app/actions/user-management.ts`**:
```typescript
'use server'

import { clerkClient } from '@clerk/nextjs/server'
import { requireAdmin } from '@/lib/rbac'
import type { Role } from '@/lib/rbac'

/**
 * ユーザーのロール設定
 */
export async function setUserRole(userId: string, role: Role) {
  try {
    // 管理者権限チェック
    await requireAdmin()
    
    // ロール更新
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        role,
      },
    })
    
    return { success: true }
  } catch (error) {
    console.error('Error setting user role:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'ロール設定中にエラーが発生しました' 
    }
  }
}

/**
 * ユーザー一覧取得
 */
export async function getUsers() {
  try {
    // 管理者権限チェック
    await requireAdmin()
    
    // ユーザー一覧取得
    const response = await clerkClient.users.getUserList({
      limit: 100,
    })
    
    return { 
      success: true, 
      users: response.data.map(user => ({
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        role: user.publicMetadata.role as Role | undefined || 'supporter',
        createdAt: user.createdAt,
        lastSignInAt: user.lastSignInAt,
      }))
    }
  } catch (error) {
    console.error('Error getting users:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'ユーザー取得中にエラーが発生しました' 
    }
  }
}

/**
 * ユーザー削除
 */
export async function deleteUser(userId: string) {
  try {
    // 管理者権限チェック
    await requireAdmin()
    
    // ユーザー削除
    await clerkClient.users.deleteUser(userId)
    
    return { success: true }
  } catch (error) {
    console.error('Error deleting user:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'ユーザー削除中にエラーが発生しました' 
    }
  }
}
```

### 7.2 ユーザー管理画面

**`app/admin/users/page.tsx`**:
```typescript
import { getUsers } from '@/app/actions/user-management'
import { UserManagementTable } from '@/components/admin/user-management-table'
import { requireAdmin } from '@/lib/rbac'
import { redirect } from 'next/navigation'

export default async function UsersPage() {
  // サーバーサイドで管理者チェック
  try {
    await requireAdmin()
  } catch {
    redirect('/access-denied')
  }
  
  const result = await getUsers()
  
  if (!result.success) {
    return <div>ユーザー取得に失敗しました</div>
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">ユーザー管理</h1>
      <UserManagementTable users={result.users} />
    </div>
  )
}
```

**`components/admin/user-management-table.tsx`**:
```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { setUserRole, deleteUser } from '@/app/actions/user-management'
import { toast } from 'sonner'
import type { Role } from '@/lib/rbac'

interface User {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  imageUrl: string
  role: Role
  createdAt: number
  lastSignInAt: number | null
}

interface UserManagementTableProps {
  users: User[]
}

export function UserManagementTable({ users: initialUsers }: UserManagementTableProps) {
  const [users, setUsers] = useState(initialUsers)
  
  const handleRoleChange = async (userId: string, newRole: Role) => {
    const result = await setUserRole(userId, newRole)
    
    if (result.success) {
      // ローカル状態更新
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ))
      toast.success('ロールを更新しました')
    } else {
      toast.error(result.error || 'ロール更新に失敗しました')
    }
  }
  
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('本当にこのユーザーを削除しますか？')) {
      return
    }
    
    const result = await deleteUser(userId)
    
    if (result.success) {
      // ローカル状態更新
      setUsers(users.filter(user => user.id !== userId))
      toast.success('ユーザーを削除しました')
    } else {
      toast.error(result.error || 'ユーザー削除に失敗しました')
    }
  }
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>メールアドレス</TableHead>
          <TableHead>名前</TableHead>
          <TableHead>ロール</TableHead>
          <TableHead>登録日</TableHead>
          <TableHead>最終ログイン</TableHead>
          <TableHead>操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map(user => (
          <TableRow key={user.id}>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              {user.firstName && user.lastName 
                ? `${user.lastName} ${user.firstName}` 
                : '未設定'}
            </TableCell>
            <TableCell>
              <Select 
                value={user.role} 
                onValueChange={(value) => handleRoleChange(user.id, value as Role)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="supporter">支援者</SelectItem>
                  <SelectItem value="admin">管理者</SelectItem>
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell>
              {new Date(user.createdAt).toLocaleDateString('ja-JP')}
            </TableCell>
            <TableCell>
              {user.lastSignInAt 
                ? new Date(user.lastSignInAt).toLocaleDateString('ja-JP')
                : '未ログイン'}
            </TableCell>
            <TableCell>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => handleDeleteUser(user.id)}
              >
                削除
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

---

## 8. モック実装の削除

### 8.1 削除対象ファイル

Clerk統合完了後、以下のモック実装ファイルを削除します：

```bash
# 削除するファイル
lib/mock-auth.ts
components/auth/login-form.tsx  # Clerk UIに置き換え
app/login/page.tsx              # /sign-in に置き換え
```

### 8.2 削除コマンド

```bash
# モックファイル削除
rm lib/mock-auth.ts
rm components/auth/login-form.tsx
rm -rf app/login/
```

### 8.3 インポート修正

モック実装を使用している箇所を検索して修正：

```bash
# モック実装の使用箇所を検索
grep -r "mock-auth" .
grep -r "login-form" .
```

---

## 9. テスト戦略

### 9.1 ユニットテスト

**`__tests__/lib/rbac.test.ts`**:
```typescript
import { describe, it, expect, vi } from 'vitest'
import { permissions } from '@/lib/rbac'

describe('RBAC', () => {
  describe('permissions', () => {
    it('supporter has correct permissions', () => {
      expect(permissions.supporter).toContain('conversation:read')
      expect(permissions.supporter).toContain('vital:read')
      expect(permissions.supporter).not.toContain('*')
    })
    
    it('admin has all permissions', () => {
      expect(permissions.admin).toEqual(['*'])
    })
  })
})
```

### 9.2 E2Eテスト（Playwright）

**`e2e/auth.spec.ts`**:
```typescript
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('sign in page loads correctly', async ({ page }) => {
    await page.goto('/sign-in')
    
    // Clerk UIが表示されることを確認
    await expect(page.locator('text=ログイン')).toBeVisible()
    await expect(page.locator('text=Googleでログイン')).toBeVisible()
  })
  
  test('sign up page loads correctly', async ({ page }) => {
    await page.goto('/sign-up')
    
    // Clerk UIが表示されることを確認
    await expect(page.locator('text=アカウント作成')).toBeVisible()
  })
  
  test('protected route redirects to sign in', async ({ page }) => {
    await page.goto('/dashboard')
    
    // ログインページにリダイレクト
    await expect(page).toHaveURL(/\/sign-in/)
  })
})
```

---

## 10. トラブルシューティング

### 10.1 よくある問題

#### 問題: Clerk UIが表示されない
```
Error: Clerk: Missing publishable key
```

**解決策**:
- `.env.local`に`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`が設定されているか確認
- 開発サーバーを再起動
- ブラウザのキャッシュをクリア

#### 問題: Google OAuthが動作しない
```
Error: OAuth error
```

**解決策**:
- Clerk DashboardでGoogle OAuth設定を確認
- Google Cloud ConsoleでリダイレクトURIが正しいか確認
- Client IDとClient Secretが正しいか確認

#### 問題: ロールが取得できない
```
Error: Role is undefined
```

**解決策**:
```typescript
// Clerk DashboardでユーザーのpublicMetadataを確認
// または、Server Actionで設定
await clerkClient.users.updateUserMetadata(userId, {
  publicMetadata: {
    role: 'supporter',
  },
})
```

#### 問題: Middlewareが動作しない
```
Error: Middleware not executing
```

**解決策**:
- `middleware.ts`がプロジェクトルートに配置されているか確認
- `config.matcher`が正しいか確認
- 開発サーバーを再起動

### 10.2 デバッグ方法

**Clerk状態の確認**:
```typescript
'use client'

import { useUser, useAuth } from '@clerk/nextjs'

export function DebugClerk() {
  const { user, isLoaded, isSignedIn } = useUser()
  const { sessionId, userId } = useAuth()
  
  return (
    <pre className="bg-gray-100 p-4 rounded text-xs">
      {JSON.stringify({
        isLoaded,
        isSignedIn,
        userId,
        sessionId,
        email: user?.emailAddresses[0]?.emailAddress,
        role: user?.publicMetadata.role,
      }, null, 2)}
    </pre>
  )
}
```

**Middleware デバッグ**:
```typescript
// middleware.ts
export default clerkMiddleware(async (auth, req) => {
  console.log('[Middleware]', {
    path: req.nextUrl.pathname,
    userId: (await auth()).userId,
  })
  
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})
```

---

**最終更新**: 2025年10月23日  
**担当**: 開発チーム（2名体制）
