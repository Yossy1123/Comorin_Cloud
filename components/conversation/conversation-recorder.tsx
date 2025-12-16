"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mic, Square, Upload, Loader2, FileText } from "lucide-react"
import { mockSpeechToText, mockNLPAnalysis, saveConversation } from "@/lib/mock-conversation"
import { mockPatients } from "@/lib/mock-patients"
import { MemoUploader } from "./memo-uploader"

export function ConversationRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [selectedPatient, setSelectedPatient] = useState("")
  const [recordingTime, setRecordingTime] = useState(0)
  const [success, setSuccess] = useState(false)
  const [importedFileName, setImportedFileName] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

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
        // ファイル読み込みのシミュレーション（実際にはFileReaderで読み込む）
        // 本番環境では、ここでFileReaderを使ってArrayBufferを読み込み、
        // APIに送信して音声認識を行う
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Mock speech-to-text processing
        const mockTranscript = await mockSpeechToText()
        setTranscript(mockTranscript)
        setIsProcessing(false)
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

  const handleMemoTextExtracted = (text: string) => {
    // 既存のテキストに追加する形で結合
    setTranscript((prev) => {
      const separator = prev ? "\n\n--- 面談メモより ---\n" : ""
      return prev + separator + text
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>会話の録音</CardTitle>
            <CardDescription>支援セッションの会話を録音してテキスト化します</CardDescription>
          </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>当事者を選択</Label>
            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
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
          </div>

          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            {isRecording && <div className="text-4xl font-mono text-primary">{formatTime(recordingTime)}</div>}

            <div className="flex gap-4">
              {!isRecording ? (
                <Button
                  size="lg"
                  onClick={handleStartRecording}
                  disabled={!selectedPatient || isProcessing}
                  className="gap-2"
                >
                  <Mic className="h-5 w-5" />
                  録音開始
                </Button>
              ) : (
                <Button size="lg" variant="destructive" onClick={handleStopRecording} className="gap-2">
                  <Square className="h-5 w-5" />
                  録音停止
                </Button>
              )}
            </div>

            {isRecording && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                録音中...
              </div>
            )}

            {/* 録音データインポート */}
            {!isRecording && (
              <div className="w-full border-t pt-4 mt-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".mp3,.m4a,.txt,.csv,audio/mpeg,audio/mp4,audio/x-m4a,text/plain,text/csv"
                  onChange={handleFileImport}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleImportButtonClick}
                  disabled={!selectedPatient || isProcessing}
                  className="w-full gap-2"
                >
                  <FileText className="h-5 w-5" />
                  データをインポート
                </Button>
                <div className="mt-2 text-xs text-center text-muted-foreground">
                  音声ファイル（mp3, m4a）またはテキストファイル（txt, csv）
                </div>
                {importedFileName && (
                  <div className="mt-1 text-xs text-center text-muted-foreground font-medium">
                    インポート済み: {importedFileName}
                  </div>
                )}
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
            disabled={!transcript || !selectedPatient || isProcessing}
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

      {/* 面談メモアップロードセクション */}
      <MemoUploader onTextExtracted={handleMemoTextExtracted} disabled={!selectedPatient || isProcessing} />
    </div>
  )
}
