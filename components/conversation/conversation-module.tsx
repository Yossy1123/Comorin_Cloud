"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ConversationRecorder } from "./conversation-recorder"
import { ConversationAnalysis } from "./conversation-analysis"
import { Mic, BarChart3 } from "lucide-react"

export function ConversationModule() {
  const [activeTab, setActiveTab] = useState("record")
  const [selectedPatientId, setSelectedPatientId] = useState<string>("")
  const [refreshKey, setRefreshKey] = useState(0)

  // 録音タブで当事者が選択されたときに呼ばれる
  const handlePatientSelect = (patientId: string) => {
    setSelectedPatientId(patientId)
  }

  // 分析タブに切り替えたときにデータを更新
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    if (value === "analysis") {
      setRefreshKey(prev => prev + 1)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">会話データ収集</h2>
        <p className="text-muted-foreground mt-2">支援者と当事者の会話を記録・分析します</p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="record" className="flex items-center gap-2">
            <Mic className="h-4 w-4" />
            録音・記録
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            分析結果
          </TabsTrigger>
        </TabsList>

        <TabsContent value="record" className="mt-6">
          <ConversationRecorder onPatientSelect={handlePatientSelect} />
        </TabsContent>

        <TabsContent value="analysis" className="mt-6">
          <ConversationAnalysis key={refreshKey} selectedPatientId={selectedPatientId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
