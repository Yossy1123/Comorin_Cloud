"use client"

import type React from "react"

import { useRouter, usePathname } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { ClerkUserButton } from "@/components/auth/user-button"
import { LogoutButton } from "@/components/auth/logout-button"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  ClipboardList,
  Database,
  FileText,
  Home,
  Shield,
  Users,
  Upload,
} from "lucide-react"
import { useUserRole } from "@/hooks/use-user-role"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isLoaded, isSignedIn } = useUser()
  const { isAdmin, isLoading: roleLoading } = useUserRole()

  // 認証チェック
  if (!isLoaded || roleLoading) {
    return (
      <div className="min-h-screen bg-background dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!isSignedIn) {
    router.push("/sign-in")
    return (
      <div className="min-h-screen bg-background dark flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">リダイレクト中...</p>
        </div>
      </div>
    )
  }

  // 基本ナビゲーション
  const baseNavigation = [
    { id: "overview", name: "概要", icon: Home, href: "/dashboard" },
    { id: "conversation", name: "記録アップロード", icon: FileText, href: "/dashboard/conversation" },
    { id: "analysis", name: "データ分析", icon: BarChart3, href: "/dashboard/analysis" },
  ]

  // 管理者専用ナビゲーション
  const adminNavigation = [
    { id: "uploads", name: "アップロードデータ", icon: Upload, href: "/dashboard/admin/uploads", adminOnly: true },
    { id: "users", name: "ユーザー管理", icon: Users, href: "/dashboard/admin/users", adminOnly: true },
  ]

  const navigation = isAdmin ? [...baseNavigation, ...adminNavigation] : baseNavigation

  return (
    <div className="min-h-screen bg-background dark">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">ひきこもり支援プラットフォーム</h1>
          </div>

          <div className="ml-auto flex items-center gap-4">
            {isAdmin && (
              <Badge variant="default" className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                管理者
              </Badge>
            )}
            <LogoutButton />
            <ClerkUserButton />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border bg-card min-h-[calc(100vh-4rem)] flex flex-col">
          <nav className="flex flex-col gap-1 p-4 flex-1">
            {navigation.map((item: any) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "secondary" : "ghost"}
                  className={`justify-start ${
                    isActive
                      ? "bg-secondary text-secondary-foreground"
                      : "text-foreground hover:text-foreground hover:bg-accent"
                  }`}
                  onClick={() => router.push(item.href)}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.name}
                  {item.adminOnly && (
                    <Badge variant="outline" className="ml-auto text-xs">
                      管理者
                    </Badge>
                  )}
                </Button>
              )
            })}
          </nav>
          
          {/* ログアウトボタン */}
          <div className="p-4 border-t border-border">
            <LogoutButton />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
