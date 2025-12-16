"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { AutonomicAnalysis } from "./autonomic-analysis"
import { ActivityData } from "./activity-data"
import { SleepData } from "./sleep-data"
import { TrendingUp, Footprints, Moon, User } from "lucide-react"
import { mockPatients, getDefaultPatientId } from "@/lib/mock-patients"

export function VitalDataModule() {
  const [activeTab, setActiveTab] = useState("activity")
  const [selectedPatientId, setSelectedPatientId] = useState<string>(getDefaultPatientId())

  return (
    <div className="space-y-6">
      {/* 対象者選択 */}
      <Card>
        <CardHeader>
          <CardTitle>対象者の選択</CardTitle>
          <CardDescription>分析対象の当事者を選択してください</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>当事者を選択</Label>
            <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
              <SelectTrigger>
                <SelectValue placeholder="当事者を選択してください" />
              </SelectTrigger>
              <SelectContent>
                {mockPatients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    ID: {patient.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>ID: {selectedPatientId} のデータを表示中</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Footprints className="h-4 w-4" />
            活動量
          </TabsTrigger>
          <TabsTrigger value="sleep" className="flex items-center gap-2">
            <Moon className="h-4 w-4" />
            睡眠
          </TabsTrigger>
          <TabsTrigger value="autonomic" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            自律神経解析
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="mt-6">
          <ActivityData selectedPatientId={selectedPatientId} hidePatientSelector />
        </TabsContent>

        <TabsContent value="sleep" className="mt-6">
          <SleepData selectedPatientId={selectedPatientId} hidePatientSelector />
        </TabsContent>

        <TabsContent value="autonomic" className="mt-6">
          <AutonomicAnalysis selectedPatientId={selectedPatientId} hidePatientSelector />
        </TabsContent>
      </Tabs>
    </div>
  )
}
