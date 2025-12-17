"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FileText, X } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"

interface ConversationRecord {
  id: string
  patientId: string
  recordedAt: string
  transcript: string
}

interface GroupedRecords {
  [patientId: string]: ConversationRecord[]
}

export function DashboardOverview() {
  const [records, setRecords] = useState<GroupedRecords>({})
  const [loading, setLoading] = useState(true)
  const [selectedRecord, setSelectedRecord] = useState<ConversationRecord | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    fetchConversationRecords()
  }, [])

  async function fetchConversationRecords() {
    try {
      const response = await fetch("/api/conversation/records")
      
      if (!response.ok) {
        throw new Error("面談記録の取得に失敗しました")
      }
      
      const data = await response.json()
      setRecords(data.records || {})
    } catch (error) {
      console.error("面談記録取得エラー:", error)
      // エラー時は空のレコードを設定
      setRecords({})
    } finally {
      setLoading(false)
    }
  }

  // 日付を YYMMDD 形式にフォーマット
  function formatRecordDate(dateString: string): string {
    const date = new Date(dateString)
    return format(date, "yyMMdd")
  }

  // 日付を詳細表示用にフォーマット
  function formatDetailDate(dateString: string): string {
    const date = new Date(dateString)
    return format(date, "yyyy年MM月dd日")
  }

  // 面談記録をクリックした時の処理
  function handleRecordClick(record: ConversationRecord) {
    setSelectedRecord(record)
    setIsDialogOpen(true)
  }

  // ダミーの詳細メモを生成
  function generateDummyMemo(record: ConversationRecord): string {
    const memos = [
      `【面談記録】

日時: ${formatDetailDate(record.recordedAt)}
利用者ID: ${record.patientId}

■ 本日の様子
表情は明るく、コミュニケーションも良好でした。最近は生活リズムが改善されており、午前中から活動できる日が増えているとのこと。

■ 話し合った内容
・今週の活動状況の振り返り
・来週の目標設定
・家族との関係について

■ 利用者の発言（抜粋）
「最近は少しずつ外に出られるようになってきました。まだ人混みは苦手ですが、朝の散歩を続けています。」

■ 支援者の所見
小さな成功体験の積み重ねが自信につながっているように見受けられます。引き続き、本人のペースを尊重しながら支援を継続していきます。

■ 次回までの目標
1. 朝の散歩を週3回以上継続する
2. 家族と食事を共にする機会を増やす
3. 興味のある趣味の活動を一つ始める

■ 特記事項
睡眠の質が改善されており、疲労感が軽減されているとのこと。`,

      `【面談記録】

日時: ${formatDetailDate(record.recordedAt)}
利用者ID: ${record.patientId}

■ 本日の様子
やや疲れた様子が見られました。先週に比べて活動量が減少しているとのこと。

■ 話し合った内容
・最近の体調について
・ストレス要因の特定
・リラクゼーション方法の提案

■ 利用者の発言（抜粋）
「今週は少し疲れやすくて...無理をしないように気をつけています。でも、できることは続けたいと思っています。」

■ 支援者の所見
無理のないペースを保つことを優先しています。本人も自分の状態を客観的に把握できており、適切な判断ができているようです。

■ 次回までの目標
1. 十分な休息を取る
2. 無理のない範囲での活動継続
3. ストレス管理の実践

■ 特記事項
次回の面談で、活動量の調整について再度話し合う予定。`,

      `【面談記録】

日時: ${formatDetailDate(record.recordedAt)}
利用者ID: ${record.patientId}

■ 本日の様子
非常に前向きな様子でした。新しいことにチャレンジしたいという意欲が見られます。

■ 話し合った内容
・これまでの進捗の確認
・新しい目標の設定
・社会参加に向けた準備

■ 利用者の発言（抜粋）
「最近は自信がついてきました。もう少し活動の幅を広げてみたいと思っています。アルバイトなども視野に入れて考えています。」

■ 支援者の所見
着実に回復の兆しが見られます。本人の意欲を大切にしながら、段階的なステップアップを支援していきます。

■ 次回までの目標
1. 地域の活動に参加してみる
2. アルバイト情報の収集
3. 生活リズムの維持

■ 特記事項
家族との関係も改善されており、良好なサポート体制が整っています。次のステージへの移行を検討する時期かもしれません。`,
    ];

    // ランダムにメモを選択（実際はrecord.transcriptを使用）
    return memos[Math.floor(Math.random() * memos.length)];
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">読み込み中...</p>
      </div>
    )
  }

  const patientIds = Object.keys(records).sort()

  if (patientIds.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground">概要</h2>
          <p className="text-muted-foreground mt-2">面談記録一覧</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              面談記録がありません
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground">概要</h2>
        <p className="text-muted-foreground mt-2">面談記録一覧</p>
      </div>

      <div className="space-y-8">
        {patientIds.map((patientId) => (
          <div key={patientId} className="flex gap-8 items-start">
            {/* 左側：利用者ID */}
            <div className="w-32 flex-shrink-0">
              <h3 className="text-2xl font-bold text-foreground">{patientId}</h3>
            </div>

            {/* 右側：面談記録リスト */}
            <div className="flex-1">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {records[patientId].map((record) => (
                      <div
                        key={record.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => handleRecordClick(record)}
                      >
                        <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <span className="text-base text-foreground">
                          {formatRecordDate(record.recordedAt)}_面談記録
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ))}
      </div>

      {/* 面談記録詳細モーダル */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {selectedRecord && `${formatRecordDate(selectedRecord.recordedAt)}_面談記録`}
            </DialogTitle>
            <DialogDescription>
              {selectedRecord && `利用者ID: ${selectedRecord.patientId}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            {selectedRecord && (
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {generateDummyMemo(selectedRecord)}
              </div>
            )}
          </div>

          <div className="flex justify-end mt-6">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              閉じる
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
