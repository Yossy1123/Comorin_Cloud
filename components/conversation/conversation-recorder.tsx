"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mic, Square, Upload, Loader2, FileText, AlertCircle } from "lucide-react"
import { mockNLPAnalysis, saveConversation } from "@/lib/mock-conversation"
import { mockPatients } from "@/lib/mock-patients"
import { MemoUploader } from "./memo-uploader"

interface ConversationRecorderProps {
  onPatientSelect?: (patientId: string) => void
}

export function ConversationRecorder({ onPatientSelect }: ConversationRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [selectedPatient, setSelectedPatient] = useState("")
  const [recordingTime, setRecordingTime] = useState(0)
  const [success, setSuccess] = useState(false)
  const [importedFileName, setImportedFileName] = useState("")
  const [imageDataUrls, setImageDataUrls] = useState<string[]>([])
  const [patientIdError, setPatientIdError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 当事者IDのバリデーション（数字、アルファベット、ハイフンのみ、最大8文字）
  const validatePatientId = (id: string): boolean => {
    const pattern = /^[a-zA-Z0-9-]{1,8}$/
    return pattern.test(id)
  }

  // 当事者ID入力時の処理
  const handlePatientIdChange = (value: string) => {
    // 入力値をそのまま設定（表示用）
    setSelectedPatient(value)

    // バリデーション
    if (value === "") {
      setPatientIdError("")
    } else if (value.length > 8) {
      setPatientIdError("IDは8文字以内で入力してください")
    } else if (!/^[a-zA-Z0-9-]*$/.test(value)) {
      setPatientIdError("使用できる文字: 数字、アルファベット、ハイフン（-）のみ")
    } else {
      setPatientIdError("")
      // 有効なIDの場合、コールバックを呼び出す
      if (onPatientSelect) {
        onPatientSelect(value)
      }
    }
  }

  // クイック選択: 既存の当事者IDを選択
  const handleQuickSelect = (patientId: string) => {
    setSelectedPatient(patientId)
    setPatientIdError("")
    if (onPatientSelect) {
      onPatientSelect(patientId)
    }
  }

  const handleStartRecording = () => {
    setIsRecording(true)
    setRecordingTime(0)
    setSuccess(false)

    // Mock recording timer
    const interval = setInterval(() => {
      setRecordingTime((prev) => prev + 1)
    }, 1000)

    // Store interval ID for cleanup
    ;(window as any).recordingInterval = interval
  }

  const handleStopRecording = async () => {
    setIsRecording(false)
    clearInterval((window as any).recordingInterval)
    setIsProcessing(true)

    // Mock speech-to-text processing
    const mockTranscript = await mockSpeechToText()
    setTranscript(mockTranscript)
    setIsProcessing(false)
  }

  const handleSaveConversation = async () => {
    if (!selectedPatient || !transcript) {
      return
    }

    setIsProcessing(true)

    // Mock NLP analysis
    const analysis = await mockNLPAnalysis(transcript)

    // 【匿名化対応】patientIdのみを保存（名前は使用しない）
    await saveConversation({
      patientId: selectedPatient,
      transcript,
      analysis,
      imageUrls: imageDataUrls.length > 0 ? imageDataUrls : undefined,
      timestamp: new Date().toISOString(),
    })

    setSuccess(true)
    setIsProcessing(false)

    // Reset form after 2 seconds
    setTimeout(() => {
      setTranscript("")
      setSelectedPatient("")
      setRecordingTime(0)
      setSuccess(false)
      setImportedFileName("")
      setImageDataUrls([])
    }, 2000)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleImportButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const fileName = file.name.toLowerCase()
    const isAudioFile = fileName.endsWith(".mp3") || fileName.endsWith(".m4a")
    const isTextFile = fileName.endsWith(".txt") || fileName.endsWith(".csv")

    // ファイル形式チェック
    if (!isAudioFile && !isTextFile) {
      alert("音声ファイル（mp3, m4a）またはテキストファイル（txt, csv）のみ対応しています")
      return
    }

    setImportedFileName(file.name)
    setIsProcessing(true)
    setSuccess(false)

    try {
      if (isTextFile) {
        // テキストファイルの場合：直接読み込み
        const reader = new FileReader()
        reader.onload = (e) => {
          const text = e.target?.result as string
          setTranscript(text)
          setIsProcessing(false)
        }
        reader.onerror = () => {
          alert("ファイルの読み込みに失敗しました")
          setIsProcessing(false)
        }
        reader.readAsText(file, "UTF-8")
      } else {
        // 音声ファイルの場合：音声→テキスト変換
        try {
          const formData = new FormData()
          formData.append("file", file)

          const response = await fetch("/api/conversation/transcribe", {
            method: "POST",
            body: formData,
          })

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.error || "音声文字起こしに失敗しました")
          }

          const data = await response.json()
          setTranscript(data.text)
          
          // モック使用の場合は警告を表示
          if (data.isMock) {
            console.warn("⚠️ モック音声文字起こしを使用しています")
          }
          
          setIsProcessing(false)
        } catch (error: any) {
          console.error("音声文字起こしエラー:", error)
          alert(error.message || "音声ファイルの処理中にエラーが発生しました")
          setIsProcessing(false)
        }
      }
    } catch (error) {
      alert("ファイルの処理中にエラーが発生しました")
      setIsProcessing(false)
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleMemoTextExtracted = (text: string, urls?: string[]) => {
    // 既存のテキストに追加する形で結合
    setTranscript((prev) => {
      const separator = prev ? "\n\n--- 面談メモより ---\n" : ""
      return prev + separator + text
    })
    // 画像データURLを追加
    if (urls && urls.length > 0) {
      setImageDataUrls((prev) => [...prev, ...urls])
    }
  }

  return (
    <div className="space-y-6">
      {/* 当事者選択セクション */}
      <Card>
        <CardHeader>
          <CardTitle>録音対象の選択</CardTitle>
          <CardDescription>会話を記録する当事者のIDを入力してください（最大8文字）</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="patientId">当事者ID</Label>
            <Input
              id="patientId"
              type="text"
              placeholder="例: 25-001"
              value={selectedPatient}
              onChange={(e) => handlePatientIdChange(e.target.value)}
              maxLength={8}
              className={patientIdError ? "border-destructive" : ""}
            />
            <p className="text-xs text-muted-foreground">
              使用可能な文字: 数字、アルファベット、ハイフン（-）
            </p>
            {patientIdError && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">{patientIdError}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* 既存IDのクイック選択 */}
          {mockPatients.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">クイック選択</Label>
              <div className="flex flex-wrap gap-2">
                {mockPatients.map((patient) => (
                  <Button
                    key={patient.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickSelect(patient.id)}
                    className="text-xs"
                  >
                    {patient.id}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>音声データのアップロード</CardTitle>
            <CardDescription>支援における録音データやその他の音声データをアップロードしてテキスト化します</CardDescription>
          </CardHeader>
        <CardContent className="space-y-4">
          {/* データインポート */}
          <div className="flex flex-col items-center justify-center py-8 space-y-4 border-2 border-dashed rounded-lg">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">音声データをアップロード</p>
              <p className="text-xs text-muted-foreground">MP3、M4A、TXT、CSV</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".mp3,.m4a,.txt,.csv,audio/mpeg,audio/mp4,audio/x-m4a,text/plain,text/csv"
              onChange={handleFileImport}
              className="hidden"
            />
            <Button
              onClick={handleImportButtonClick}
              disabled={!selectedPatient || isProcessing || !!patientIdError}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              ファイルを選択
            </Button>
            {importedFileName && (
              <div className="text-xs text-center text-muted-foreground font-medium">
                インポート済み: {importedFileName}
              </div>
            )}
          </div>

          {isProcessing && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>データを処理しています...</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-primary bg-primary/10">
              <AlertDescription className="text-primary">会話データを保存しました</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* 面談メモアップロードセクション */}
      <MemoUploader onTextExtracted={handleMemoTextExtracted} disabled={!selectedPatient || isProcessing || !!patientIdError} />
      </div>

      {/* テキスト編集セクション */}
      <Card>
        <CardHeader>
          <CardTitle>テキスト編集</CardTitle>
          <CardDescription>自動変換されたテキストを確認・編集できます</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>会話内容</Label>
            <Textarea
              placeholder="録音を停止すると、自動的にテキスト化されます..."
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
              disabled={isProcessing}
            />
          </div>

          <Button
            onClick={handleSaveConversation}
            disabled={!transcript || !selectedPatient || isProcessing || !!patientIdError}
            className="w-full gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                処理中...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                保存して分析
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
