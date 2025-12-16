"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getConversationHistory, type ConversationRecord } from "@/lib/mock-conversation"
import { maskPersonalNames } from "@/lib/name-masking"
import { Calendar, User, Eye } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function ConversationHistory() {
  const [conversations, setConversations] = useState<ConversationRecord[]>([])
  const [selectedConversation, setSelectedConversation] = useState<ConversationRecord | null>(null)

  useEffect(() => {
    const history = getConversationHistory()
    setConversations(history)
  }, [])

  const formatDate = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getEmotionColor = (emotion: string) => {
    const colors: Record<string, string> = {
      ポジティブ: "bg-green-500",
      ニュートラル: "bg-blue-500",
      ネガティブ: "bg-yellow-500",
      不安: "bg-orange-500",
    }
    return colors[emotion] || "bg-gray-500"
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>会話履歴</CardTitle>
          <CardDescription>過去の会話セッションと分析結果を確認できます</CardDescription>
        </CardHeader>
        <CardContent>
          {conversations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>まだ会話データがありません</p>
              <p className="text-sm mt-2">録音タブから会話を記録してください</p>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map((conversation) => (
                <Card key={conversation.id} className="border-border">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold text-foreground">ID: {conversation.patientId}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(conversation.timestamp)}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <Badge variant="outline" className="gap-1">
                            <div className={`h-2 w-2 rounded-full ${getEmotionColor(conversation.analysis.emotion)}`} />
                            {conversation.analysis.emotion}
                          </Badge>
                          <Badge variant="secondary">ストレス: {conversation.analysis.stressLevel}</Badge>
                        </div>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedConversation(conversation)}>
                            <Eye className="h-4 w-4 mr-2" />
                            詳細
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>会話詳細</DialogTitle>
                            <DialogDescription>
                              ID: {conversation.patientId} - {formatDate(conversation.timestamp)}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 mt-4">
                            <div>
                              <h4 className="font-semibold mb-2">会話内容</h4>
                              <div className="bg-muted p-4 rounded-lg text-sm whitespace-pre-wrap">
                                {maskPersonalNames(conversation.transcript)}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">分析結果</h4>
                              <div className="grid gap-3">
                                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                  <span className="text-sm">感情状態</span>
                                  <Badge className="gap-1">
                                    <div
                                      className={`h-2 w-2 rounded-full ${getEmotionColor(conversation.analysis.emotion)}`}
                                    />
                                    {conversation.analysis.emotion}
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                  <span className="text-sm">ストレスレベル</span>
                                  <Badge variant="secondary">{conversation.analysis.stressLevel}</Badge>
                                </div>
                                <div className="p-3 bg-muted rounded-lg">
                                  <span className="text-sm font-medium">キーワード</span>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {conversation.analysis.keywords.map((keyword, i) => (
                                      <Badge key={i} variant="outline">
                                        {keyword}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                <div className="p-3 bg-muted rounded-lg">
                                  <span className="text-sm font-medium">推奨アプローチ</span>
                                  <p className="text-sm text-muted-foreground mt-2">
                                    {conversation.analysis.recommendation}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
