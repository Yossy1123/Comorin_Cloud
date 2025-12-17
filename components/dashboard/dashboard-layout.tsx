"use client"

import type React from "react"

import { useRouter, usePathname } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { ClerkUserButton } from "@/components/auth/user-button"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  Database,
  FileText,
  Home,
} from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isLoaded, isSignedIn, user } = useUser()

  // MVP検証用：認証チェックを一時的に無効化
  // if (!isLoaded) {
  //   return null
  // }

  // if (!isSignedIn) {
  //   router.push("/sign-in")
  //   return null
  // }

  const navigation = [
    { id: "overview", name: "概要", icon: Home, href: "/dashboard" },
    { id: "conversation", name: "記録アップロード", icon: FileText, href: "/dashboard/conversation" },
    { id: "analysis", name: "データ分析", icon: BarChart3, href: "/dashboard/analysis" },
  ]

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
            <ClerkUserButton />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border bg-card min-h-[calc(100vh-4rem)]">
          <nav className="flex flex-col gap-1 p-4">
            {navigation.map((item) => {
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
                </Button>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
