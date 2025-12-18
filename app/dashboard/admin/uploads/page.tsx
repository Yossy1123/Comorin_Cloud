/**
 * 管理者専用：アップロードデータ一覧ページ
 * 全ユーザーのアップロードデータ（音声・メモ）を確認
 */

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUserRole } from "@/hooks/use-user-role"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  FileText, 
  Mic, 
  Calendar, 
  User, 
  AlertCircle, 
  Search,
  Filter,
  Eye,
  Download,
  Code,
  Copy,
  CheckCircle,
  Image
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ConversationData {
  id: string
  patientId: string
  patientAnonymousId: string
  transcript: string
  recordedAt: string
  createdAt: string
  supporterId: string | null
  supporterEmail: string | null
  sentiment: {
    emotion: string
    stressLevel: string
  } | null
  keywords: string[] | null
  audioUrl: string | null
  imageUrls: string[] | null
  duration: number | null
}

interface FilterState {
  search: string
  supporterId: string
  dateFrom: string
  dateTo: string
}

export default function AdminUploadsPage() {
  const router = useRouter()
  const { isAdmin, isLoading: roleLoading } = useUserRole()
  const [conversations, setConversations] = useState<ConversationData[]>([])
  const [filteredConversations, setFilteredConversations] = useState<ConversationData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    supporterId: "all",
    dateFrom: "",
    dateTo: "",
  })

  // ユニークな支援者リストを取得
  const supporters = Array.from(
    new Set(conversations.map((c) => c.supporterEmail).filter(Boolean))
  ).map((email) => ({
    email,
    id: conversations.find((c) => c.supporterEmail === email)?.supporterId || "",
  }))

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      router.push("/dashboard")
    }
  }, [isAdmin, roleLoading, router])

  useEffect(() => {
    async function fetchConversations() {
      try {
        const response = await fetch("/api/admin/conversations")
        if (!response.ok) {
          throw new Error("データの取得に失敗しました")
        }
        const data = await response.json()
        setConversations(data.conversations)
        setFilteredConversations(data.conversations)
      } catch (err) {
        setError(err instanceof Error ? err.message : "エラーが発生しました")
      } finally {
        setIsLoading(false)
      }
    }

    if (isAdmin) {
      fetchConversations()
    }
  }, [isAdmin])

  // フィルタリング処理
  useEffect(() => {
    let filtered = [...conversations]

    // 検索フィルター
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (c) =>
          c.transcript.toLowerCase().includes(searchLower) ||
          c.patientAnonymousId.toLowerCase().includes(searchLower) ||
          c.supporterEmail?.toLowerCase().includes(searchLower)
      )
    }

    // 支援者フィルター
    if (filters.supporterId !== "all") {
      filtered = filtered.filter((c) => c.supporterId === filters.supporterId)
    }

    // 日付フィルター（開始日）
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom)
      filtered = filtered.filter((c) => new Date(c.recordedAt) >= fromDate)
    }

    // 日付フィルター（終了日）
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo)
      toDate.setHours(23, 59, 59, 999) // 終了日の最後まで含める
      filtered = filtered.filter((c) => new Date(c.recordedAt) <= toDate)
    }

    setFilteredConversations(filtered)
  }, [filters, conversations])

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      search: "",
      supporterId: "all",
      dateFrom: "",
      dateTo: "",
    })
  }

  // 生データをクリップボードにコピー
  const handleCopyRawData = async (conversation: ConversationData) => {
    try {
      const rawData = JSON.stringify(conversation, null, 2)
      await navigator.clipboard.writeText(rawData)
      setCopiedId(conversation.id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error("コピーに失敗しました:", err)
      alert("コピーに失敗しました")
    }
  }

  // 音声データをダウンロード
  const handleDownloadAudio = (audioUrl: string, conversationId: string) => {
    const link = document.createElement("a")
    link.href = audioUrl
    link.download = `conversation_${conversationId}.webm`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 生データ（JSON）をダウンロード
  const handleDownloadRawData = (conversation: ConversationData) => {
    try {
      const jsonString = JSON.stringify(conversation, null, 2)
      const blob = new Blob([jsonString], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `conversation_${conversation.patientAnonymousId}_${conversation.id}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("ダウンロードに失敗しました:", err)
      alert("ダウンロードに失敗しました")
    }
  }

  // 画像をダウンロード
  const handleDownloadImage = (imageDataUrl: string, index: number, conversationId: string) => {
    try {
      const link = document.createElement("a")
      link.href = imageDataUrl
      link.download = `conversation_${conversationId}_image_${index + 1}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error("画像ダウンロードに失敗しました:", err)
      alert("画像ダウンロードに失敗しました")
    }
  }

  // すべての画像を一括ダウンロード
  const handleDownloadAllImages = (imageUrls: string[], conversationId: string) => {
    imageUrls.forEach((url, index) => {
      setTimeout(() => {
        handleDownloadImage(url, index, conversationId)
      }, index * 100) // 100msずつずらしてダウンロード
    })
  }

  if (roleLoading || !isAdmin) {
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">アップロードデータ一覧</h1>
        <p className="text-muted-foreground">
          全ユーザーがアップロードした音声データ・メモを確認できます
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 統計カード */}
      {!isLoading && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                総アップロード数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{conversations.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                音声データ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {conversations.filter((c) => c.audioUrl).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                メモ・テキスト
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {conversations.filter((c) => !c.audioUrl).length}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* フィルターセクション */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            フィルター
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* 検索 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">検索</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="テキスト、当事者ID、支援者"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {/* 支援者フィルター */}
            <div className="space-y-2">
              <label className="text-sm font-medium">支援者</label>
              <Select
                value={filters.supporterId}
                onValueChange={(value) => handleFilterChange("supporterId", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全て</SelectItem>
                  {supporters.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 開始日 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">開始日</label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
              />
            </div>

            {/* 終了日 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">終了日</label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange("dateTo", e.target.value)}
              />
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={clearFilters}>
            フィルターをクリア
          </Button>
        </CardContent>
      </Card>

      {/* データ一覧 */}
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
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredConversations.length} 件のデータ
            </p>
          </div>

          {filteredConversations.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                データが見つかりません
              </CardContent>
            </Card>
          ) : (
            filteredConversations.map((conversation) => (
              <Card key={conversation.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        {conversation.audioUrl ? (
                          <Mic className="h-5 w-5 text-primary" />
                        ) : (
                          <FileText className="h-5 w-5 text-primary" />
                        )}
                        当事者: {conversation.patientAnonymousId}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(conversation.recordedAt).toLocaleString("ja-JP")}
                        </span>
                        {conversation.supporterEmail && (
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {conversation.supporterEmail}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {conversation.audioUrl && (
                        <Badge variant="secondary">音声データ</Badge>
                      )}
                      {conversation.sentiment && (
                        <Badge variant="outline">{conversation.sentiment.emotion}</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* テキストプレビュー */}
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-sm line-clamp-3">{conversation.transcript}</p>
                  </div>

                  {/* メタデータ */}
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    {conversation.duration && (
                      <span>録音時間: {Math.floor(conversation.duration / 60)}分{conversation.duration % 60}秒</span>
                    )}
                    {conversation.keywords && conversation.keywords.length > 0 && (
                      <span>キーワード: {conversation.keywords.join(", ")}</span>
                    )}
                  </div>

                  {/* アクション */}
                  <div className="flex flex-wrap gap-2">
                    {/* 全文表示 */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Eye className="h-4 w-4" />
                          全文表示
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh]">
                        <DialogHeader>
                          <DialogTitle>会話内容</DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="h-[60vh] w-full rounded-md border p-4">
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-sm font-semibold mb-2">基本情報</h4>
                              <dl className="grid grid-cols-2 gap-2 text-sm">
                                <dt className="text-muted-foreground">当事者ID:</dt>
                                <dd>{conversation.patientAnonymousId}</dd>
                                <dt className="text-muted-foreground">記録日時:</dt>
                                <dd>{new Date(conversation.recordedAt).toLocaleString("ja-JP")}</dd>
                                <dt className="text-muted-foreground">支援者:</dt>
                                <dd>{conversation.supporterEmail || "未設定"}</dd>
                              </dl>
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold mb-2">会話内容</h4>
                              <p className="text-sm whitespace-pre-wrap">{conversation.transcript}</p>
                            </div>
                            {conversation.sentiment && (
                              <div>
                                <h4 className="text-sm font-semibold mb-2">分析結果</h4>
                                <dl className="grid grid-cols-2 gap-2 text-sm">
                                  <dt className="text-muted-foreground">感情:</dt>
                                  <dd>{conversation.sentiment.emotion}</dd>
                                  <dt className="text-muted-foreground">ストレスレベル:</dt>
                                  <dd>{conversation.sentiment.stressLevel}</dd>
                                </dl>
                              </div>
                            )}
                          </div>
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>

                    {/* 生データ表示 */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Code className="h-4 w-4" />
                          生データ
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[80vh]">
                        <DialogHeader>
                          <DialogTitle className="flex items-center justify-between">
                            <span>生データ</span>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyRawData(conversation)}
                                className="gap-2"
                              >
                                {copiedId === conversation.id ? (
                                  <>
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    コピー済み
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-4 w-4" />
                                    JSONコピー
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadRawData(conversation)}
                                className="gap-2"
                              >
                                <Download className="h-4 w-4" />
                                JSON
                              </Button>
                              {conversation.audioUrl && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDownloadAudio(conversation.audioUrl!, conversation.id)}
                                  className="gap-2"
                                >
                                  <Download className="h-4 w-4" />
                                  音声
                                </Button>
                              )}
                              {conversation.imageUrls && conversation.imageUrls.length > 0 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDownloadAllImages(conversation.imageUrls!, conversation.id)}
                                  className="gap-2"
                                >
                                  <Image className="h-4 w-4" />
                                  画像 ({conversation.imageUrls.length})
                                </Button>
                              )}
                            </div>
                          </DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="h-[60vh] w-full rounded-md border">
                          <pre className="p-4 text-xs font-mono">
                            {JSON.stringify(conversation, null, 2)}
                          </pre>
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>

                    {/* 音声ダウンロード */}
                    {conversation.audioUrl && (
                      <Button
                        variant="default"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleDownloadAudio(conversation.audioUrl!, conversation.id)}
                      >
                        <Mic className="h-4 w-4" />
                        音声ダウンロード
                      </Button>
                    )}

                    {/* 画像ダウンロード */}
                    {conversation.imageUrls && conversation.imageUrls.length > 0 && (
                      <Button
                        variant="default"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleDownloadAllImages(conversation.imageUrls!, conversation.id)}
                      >
                        <Image className="h-4 w-4" />
                        画像ダウンロード ({conversation.imageUrls.length}枚)
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}

