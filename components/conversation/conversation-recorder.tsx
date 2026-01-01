"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, Loader2, FileText, AlertCircle, Music, X } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { mockNLPAnalysis, saveConversation } from "@/lib/mock-conversation"
import { mockPatients } from "@/lib/mock-patients"
import { MemoUploader } from "./memo-uploader"

interface ConversationRecorderProps {
  onPatientSelect?: (patientId: string) => void
}

interface UploadedAudioFile {
  id: string
  file: File
  status: "pending" | "processing" | "completed" | "error"
  extractedText?: string
  errorMessage?: string
}

export function ConversationRecorder({ onPatientSelect }: ConversationRecorderProps) {
  const [isProcessingAudio, setIsProcessingAudio] = useState(false)
  const [isProcessingSave, setIsProcessingSave] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [selectedPatient, setSelectedPatient] = useState("")
  const [success, setSuccess] = useState(false)
  const [uploadedAudioFiles, setUploadedAudioFiles] = useState<UploadedAudioFile[]>([])
  const [imageDataUrls, setImageDataUrls] = useState<string[]>([])
  const [patientIdError, setPatientIdError] = useState("")
  const [processingProgress, setProcessingProgress] = useState(0)
  const [isMockMode, setIsMockMode] = useState(false)
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

  const handleSaveConversation = async () => {
    if (!selectedPatient || !transcript) {
      return
    }

    setIsProcessingSave(true)

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
    setIsProcessingSave(false)

    // Reset form after 2 seconds
    setTimeout(() => {
      setTranscript("")
      setSelectedPatient("")
      setSuccess(false)
      setUploadedAudioFiles([])
      setImageDataUrls([])
      setIsMockMode(false)
      setProcessingProgress(0)
    }, 2000)
  }

  const handleImportButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const validAudioTypes = ["audio/mpeg", "audio/mp4", "audio/x-m4a", ".mp3", ".m4a"]
    const validTextTypes = ["text/plain", "text/csv", ".txt", ".csv"]
    const maxSize = 25 * 1024 * 1024 // 25MB
    const newFiles: UploadedAudioFile[] = []

    // ファイルの検証
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileName = file.name.toLowerCase()
      const isAudioFile = fileName.endsWith(".mp3") || fileName.endsWith(".m4a") || file.type.startsWith("audio/")
      const isTextFile = fileName.endsWith(".txt") || fileName.endsWith(".csv") || file.type.startsWith("text/")

      // ファイル形式チェック
      if (!isAudioFile && !isTextFile) {
        alert(`${file.name}: 音声ファイル（mp3, m4a）またはテキストファイル（txt, csv）のみ対応しています`)
        continue
      }

      // ファイルサイズチェック
      if (file.size > maxSize) {
        alert(`${file.name}: ファイルサイズは25MB以下にしてください`)
        continue
      }

      newFiles.push({
        id: `${Date.now()}-${i}`,
        file,
        status: "pending",
      })
    }

    if (newFiles.length > 0) {
      setUploadedAudioFiles((prev) => [...prev, ...newFiles])
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleRemoveAudioFile = (fileId: string) => {
    setUploadedAudioFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  const handleProcessAllAudioFiles = async () => {
    setIsProcessingAudio(true)
    setProcessingProgress(0)

    const pendingFiles = uploadedAudioFiles.filter((f) => f.status === "pending")
    const extractedTexts: string[] = []

    for (let i = 0; i < pendingFiles.length; i++) {
      const uploadedFile = pendingFiles[i]
      const fileName = uploadedFile.file.name.toLowerCase()
      const isTextFile = fileName.endsWith(".txt") || fileName.endsWith(".csv")

      // ステータスを「処理中」に更新
      setUploadedAudioFiles((prev) =>
        prev.map((f) => (f.id === uploadedFile.id ? { ...f, status: "processing" as const } : f))
      )

      try {
        if (isTextFile) {
          // テキストファイルの場合：直接読み込み
          const text = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (e) => resolve(e.target?.result as string)
            reader.onerror = () => reject(new Error("ファイルの読み込みに失敗しました"))
            reader.readAsText(uploadedFile.file, "UTF-8")
          })

          // ステータスを「完了」に更新
          setUploadedAudioFiles((prev) =>
            prev.map((f) =>
              f.id === uploadedFile.id ? { ...f, status: "completed" as const, extractedText: text } : f
            )
          )

          extractedTexts.push(`--- ${uploadedFile.file.name} ---\n${text}`)
        } else {
          // 音声ファイルの場合：音声→テキスト変換
          const formData = new FormData()
          formData.append("file", uploadedFile.file)

          const response = await fetch("/api/conversation/transcribe", {
            method: "POST",
            body: formData,
          })

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.error || "音声文字起こしに失敗しました")
          }

          const data = await response.json()
          const extractedText = data.text

          // ステータスを「完了」に更新
          setUploadedAudioFiles((prev) =>
            prev.map((f) =>
              f.id === uploadedFile.id
                ? { ...f, status: "completed" as const, extractedText }
                : f
            )
          )

          extractedTexts.push(`--- ${uploadedFile.file.name} ---\n${extractedText}`)
          setIsMockMode(data.isMock || false)
        }
      } catch (err) {
        console.error("処理エラー:", err)
        const errorMessage = err instanceof Error ? err.message : "処理中にエラーが発生しました"

        // ステータスを「エラー」に更新
        setUploadedAudioFiles((prev) =>
          prev.map((f) =>
            f.id === uploadedFile.id
              ? { ...f, status: "error" as const, errorMessage }
              : f
          )
        )
      }

      // 進捗を更新
      setProcessingProgress(((i + 1) / pendingFiles.length) * 100)
    }

    // すべての抽出されたテキストをテキストエリアに追加
    if (extractedTexts.length > 0) {
      setTranscript((prev) => {
        const separator = prev ? "\n\n--- 音声データより ---\n" : ""
        return prev + separator + extractedTexts.join("\n\n")
      })
    }

    setIsProcessingAudio(false)
  }

  const handleClearAllAudioFiles = () => {
    setUploadedAudioFiles([])
    setIsMockMode(false)
    setProcessingProgress(0)
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
        {/* 音声データアップロードセクション */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5" />
              音声データのアップロード
            </CardTitle>
            <CardDescription>支援における録音データやその他の音声データをアップロードしてテキスト化します</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".mp3,.m4a,.txt,.csv,audio/mpeg,audio/mp4,audio/x-m4a,text/plain,text/csv"
              onChange={handleFileImport}
              className="hidden"
              multiple
            />

            {/* ファイルリスト */}
            {uploadedAudioFiles.length > 0 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  {uploadedAudioFiles.map((uploadedFile) => (
                    <div
                      key={uploadedFile.id}
                      className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {uploadedFile.status === "processing" ? (
                          <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
                        ) : uploadedFile.status === "completed" ? (
                          <div className="h-4 w-4 shrink-0 rounded-full bg-green-500 flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        ) : uploadedFile.status === "error" ? (
                          <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                        ) : (
                          <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{uploadedFile.file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          {uploadedFile.errorMessage && (
                            <p className="text-xs text-destructive mt-1">{uploadedFile.errorMessage}</p>
                          )}
                        </div>
                      </div>
                      {uploadedFile.status !== "processing" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={() => handleRemoveAudioFile(uploadedFile.id)}
                          disabled={isProcessingAudio || isProcessingSave}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {/* アクションボタン */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleImportButtonClick}
                    disabled={!selectedPatient || isProcessingAudio || isProcessingSave || !!patientIdError}
                    variant="outline"
                    className="gap-2 flex-1"
                  >
                    <Upload className="h-4 w-4" />
                    さらに追加
                  </Button>
                  {uploadedAudioFiles.some((f) => f.status === "pending") && (
                    <Button
                      onClick={handleProcessAllAudioFiles}
                      disabled={!selectedPatient || isProcessingAudio || isProcessingSave || !!patientIdError}
                      className="gap-2 flex-1"
                    >
                      {isProcessingAudio ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          処理中...
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4" />
                          すべてを処理
                        </>
                      )}
                    </Button>
                  )}
                  {uploadedAudioFiles.some((f) => f.status === "completed") && !isProcessingAudio && (
                    <Button onClick={handleClearAllAudioFiles} variant="outline" className="gap-2">
                      <X className="h-4 w-4" />
                      クリア
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* ファイル選択エリア */}
            {uploadedAudioFiles.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 space-y-4 border-2 border-dashed rounded-lg">
                <Music className="h-12 w-12 text-muted-foreground" />
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">音声データをアップロード</p>
                  <p className="text-xs text-muted-foreground">MP3、M4A、TXT、CSV（最大25MB）</p>
                  <p className="text-xs text-muted-foreground font-semibold">複数選択可能</p>
                </div>
                <Button
                  onClick={handleImportButtonClick}
                  disabled={!selectedPatient || isProcessingAudio || isProcessingSave || !!patientIdError}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  ファイルを選択
                </Button>
              </div>
            )}

            {/* 処理進捗バー */}
            {isProcessingAudio && processingProgress > 0 && (
              <div className="space-y-2">
                <Progress value={processingProgress} className="w-full" />
                <p className="text-xs text-center text-muted-foreground">
                  処理中... {Math.round(processingProgress)}%
                </p>
              </div>
            )}

            {/* 処理中メッセージ */}
            {isProcessingAudio && (
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription>音声からテキストを抽出しています...</AlertDescription>
              </Alert>
            )}

            {/* モックモード通知 */}
            {isMockMode && !isProcessingAudio && (
              <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
                <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                  🔧 開発モード: サンプルテキストを表示しています。実際の音声文字起こし機能を使用するには、OpenAI APIのクォータを確認してください。
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* 面談メモアップロードセクション */}
        <MemoUploader onTextExtracted={handleMemoTextExtracted} disabled={!selectedPatient || isProcessingAudio || isProcessingSave || !!patientIdError} />
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
              placeholder="ファイルをアップロードして「すべてを処理」をクリックすると、自動的にテキスト化されます..."
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
              disabled={isProcessingAudio || isProcessingSave}
            />
          </div>

          <Button
            onClick={handleSaveConversation}
            disabled={!transcript || !selectedPatient || isProcessingAudio || isProcessingSave || !!patientIdError}
            className="w-full gap-2"
          >
            {isProcessingSave ? (
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

          {/* 保存成功メッセージ */}
          {success && (
            <Alert className="border-primary bg-primary/10">
              <AlertDescription className="text-primary">会話データを保存しました</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
