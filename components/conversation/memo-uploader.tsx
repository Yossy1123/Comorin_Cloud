"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileImage, Loader2, Upload, X } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface MemoUploaderProps {
  onTextExtracted: (text: string) => void
  disabled?: boolean
}

interface UploadedFile {
  id: string
  file: File
  previewUrl: string
  status: "pending" | "processing" | "completed" | "error"
  extractedText?: string
  errorMessage?: string
}

export function MemoUploader({ onTextExtracted, disabled = false }: MemoUploaderProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isMockMode, setIsMockMode] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    const maxSize = 10 * 1024 * 1024 // 10MB
    const newFiles: UploadedFile[] = []
    let hasError = false

    // ファイルの検証とプレビュー生成
    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // ファイル形式チェック
      if (!validTypes.includes(file.type)) {
        setError(`${file.name}: JPEG、PNG、WebP形式の画像ファイルのみ対応しています`)
        hasError = true
        continue
      }

      // ファイルサイズチェック
      if (file.size > maxSize) {
        setError(`${file.name}: ファイルサイズは10MB以下にしてください`)
        hasError = true
        continue
      }

      // プレビューURLを生成
      const previewUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.readAsDataURL(file)
      })

      newFiles.push({
        id: `${Date.now()}-${i}`,
        file,
        previewUrl,
        status: "pending",
      })
    }

    if (newFiles.length > 0) {
      setError(null)
      setUploadedFiles((prev) => [...prev, ...newFiles])
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  const handleProcessAllFiles = async () => {
    setIsProcessing(true)
    setError(null)
    setProcessingProgress(0)

    const pendingFiles = uploadedFiles.filter((f) => f.status === "pending")
    const extractedTexts: string[] = []

    for (let i = 0; i < pendingFiles.length; i++) {
      const uploadedFile = pendingFiles[i]

      // ステータスを「処理中」に更新
      setUploadedFiles((prev) =>
        prev.map((f) => (f.id === uploadedFile.id ? { ...f, status: "processing" as const } : f))
      )

      try {
        const formData = new FormData()
        formData.append("file", uploadedFile.file)

        const response = await fetch("/api/conversation/ocr", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "OCR処理に失敗しました")
        }

        const data = await response.json()
        const extractedText = data.text

        // ステータスを「完了」に更新
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === uploadedFile.id
              ? { ...f, status: "completed" as const, extractedText }
              : f
          )
        )

        extractedTexts.push(`--- ${uploadedFile.file.name} ---\n${extractedText}`)
        setIsMockMode(data.isMock || false)
      } catch (err) {
        console.error("OCR処理エラー:", err)
        const errorMessage = err instanceof Error ? err.message : "OCR処理中にエラーが発生しました"

        // ステータスを「エラー」に更新
        setUploadedFiles((prev) =>
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

    // すべての抽出されたテキストを結合して親コンポーネントに渡す
    if (extractedTexts.length > 0) {
      onTextExtracted(extractedTexts.join("\n\n"))
    }

    setIsProcessing(false)
  }

  const handleClearAll = () => {
    setUploadedFiles([])
    setError(null)
    setIsMockMode(false)
    setProcessingProgress(0)
  }

  const hasPendingFiles = uploadedFiles.some((f) => f.status === "pending")
  const hasCompletedFiles = uploadedFiles.some((f) => f.status === "completed")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileImage className="h-5 w-5" />
          面談メモのアップロード
        </CardTitle>
        <CardDescription>複数の手書きメモや写真をアップロードしてテキスト化します</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileUpload}
          className="hidden"
          multiple
        />

        {/* 画像プレビューグリッド */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {uploadedFiles.map((uploadedFile) => (
                <div key={uploadedFile.id} className="relative">
                  <div className="relative rounded-lg border overflow-hidden group">
                    <img
                      src={uploadedFile.previewUrl}
                      alt={uploadedFile.file.name}
                      className="w-full h-32 object-cover bg-muted"
                    />
                    {/* ステータスオーバーレイ */}
                    {uploadedFile.status === "processing" && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 text-white animate-spin" />
                      </div>
                    )}
                    {uploadedFile.status === "completed" && (
                      <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="text-green-700 dark:text-green-300 font-semibold text-sm">✓ 完了</div>
                      </div>
                    )}
                    {uploadedFile.status === "error" && (
                      <div className="absolute inset-0 bg-red-500/50 flex items-center justify-center">
                        <div className="text-white font-semibold text-xs px-2 text-center">エラー</div>
                      </div>
                    )}
                    {/* 削除ボタン */}
                    {uploadedFile.status !== "processing" && (
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={() => handleRemoveFile(uploadedFile.id)}
                        disabled={isProcessing}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-center text-muted-foreground mt-1 truncate">
                    {uploadedFile.file.name}
                  </p>
                </div>
              ))}
            </div>

            {/* アクションボタン */}
            <div className="flex gap-2">
              <Button
                onClick={handleButtonClick}
                disabled={disabled || isProcessing}
                variant="outline"
                className="gap-2 flex-1"
              >
                <Upload className="h-4 w-4" />
                さらに追加
              </Button>
              {hasPendingFiles && (
                <Button
                  onClick={handleProcessAllFiles}
                  disabled={disabled || isProcessing}
                  className="gap-2 flex-1"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      処理中...
                    </>
                  ) : (
                    <>
                      <FileImage className="h-4 w-4" />
                      すべてを処理
                    </>
                  )}
                </Button>
              )}
              {hasCompletedFiles && !isProcessing && (
                <Button onClick={handleClearAll} variant="outline" className="gap-2">
                  <X className="h-4 w-4" />
                  クリア
                </Button>
              )}
            </div>
          </div>
        )}

        {/* ファイル選択エリア */}
        {uploadedFiles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4 border-2 border-dashed rounded-lg">
            <FileImage className="h-12 w-12 text-muted-foreground" />
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">画像ファイルをアップロード</p>
              <p className="text-xs text-muted-foreground">JPEG、PNG、WebP（最大10MB）</p>
              <p className="text-xs text-muted-foreground font-semibold">複数選択可能</p>
            </div>
            <Button onClick={handleButtonClick} disabled={disabled || isProcessing} className="gap-2">
              <Upload className="h-4 w-4" />
              ファイルを選択
            </Button>
          </div>
        )}

        {/* 処理進捗バー */}
        {isProcessing && processingProgress > 0 && (
          <div className="space-y-2">
            <Progress value={processingProgress} className="w-full" />
            <p className="text-xs text-center text-muted-foreground">
              処理中... {Math.round(processingProgress)}%
            </p>
          </div>
        )}

        {/* 処理中メッセージ */}
        {isProcessing && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>画像からテキストを抽出しています...</AlertDescription>
          </Alert>
        )}

        {/* モックモード通知 */}
        {isMockMode && !isProcessing && (
          <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
            <AlertDescription className="text-yellow-800 dark:text-yellow-200">
              🔧 開発モード: サンプルテキストを表示しています。実際のOCR機能を使用するには、OpenAI APIのクォータを確認してください。
            </AlertDescription>
          </Alert>
        )}

        {/* エラーメッセージ */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

