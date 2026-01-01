/**
 * 管理者専用：ユーザー管理ページ
 * 全ユーザーの一覧と管理
 */

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUserRole } from "@/hooks/use-user-role"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Shield, User, Mail, Calendar, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface UserData {
  id: string
  email: string
  displayName: string | null
  role: "ADMIN" | "SUPPORTER"
  createdAt: string
  lastLoginAt: string | null
  emailVerified: boolean
}

export default function AdminUsersPage() {
  const router = useRouter()
  const { isAdmin, isLoading: roleLoading } = useUserRole()
  const [users, setUsers] = useState<UserData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      router.push("/dashboard")
    }
  }, [isAdmin, roleLoading, router])

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch("/api/admin/users")
        if (!response.ok) {
          throw new Error("ユーザー一覧の取得に失敗しました")
        }
        const data = await response.json()
        setUsers(data.users)
      } catch (err) {
        setError(err instanceof Error ? err.message : "エラーが発生しました")
      } finally {
        setIsLoading(false)
      }
    }

    if (isAdmin) {
      fetchUsers()
    }
  }, [isAdmin])

  if (roleLoading || !isAdmin) {
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">ユーザー管理</h1>
        <p className="text-muted-foreground">
          システムに登録されている全ユーザーの管理
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>登録ユーザー数</CardTitle>
              <CardDescription>システムに登録されているユーザー数</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">{users.length}</div>
              <div className="mt-2 text-sm text-muted-foreground">
                管理者: {users.filter((u) => u.role === "ADMIN").length} 名 / 
                支援者: {users.filter((u) => u.role === "SUPPORTER").length} 名
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {users.map((user) => (
              <Card key={user.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        {user.role === "ADMIN" ? (
                          <Shield className="h-5 w-5 text-primary" />
                        ) : (
                          <User className="h-5 w-5 text-muted-foreground" />
                        )}
                        {user.displayName || "名前未設定"}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {user.email}
                      </CardDescription>
                    </div>
                    <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                      {user.role === "ADMIN" ? "管理者" : "支援者"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Calendar className="h-4 w-4" />
                        登録日時
                      </div>
                      <div className="font-medium">
                        {new Date(user.createdAt).toLocaleString("ja-JP")}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Calendar className="h-4 w-4" />
                        最終ログイン
                      </div>
                      <div className="font-medium">
                        {user.lastLoginAt
                          ? new Date(user.lastLoginAt).toLocaleString("ja-JP")
                          : "未ログイン"}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <Badge variant={user.emailVerified ? "default" : "secondary"}>
                      {user.emailVerified ? "メール認証済み" : "メール未認証"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}







