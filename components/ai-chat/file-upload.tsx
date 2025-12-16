"use client";

/**
 * File Upload - ファイルアップロード機能
 */

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, File, X } from "lucide-react";
import { toast } from "sonner";

interface FileUploadProps {
  onUploadComplete?: () => void;
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload() {
    if (!selectedFile) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/ai-chat/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "アップロードに失敗しました");
      }

      toast.success("ファイルがアップロードされました");
      setSelectedFile(null);
      
      if (inputRef.current) {
        inputRef.current.value = "";
      }

      onUploadComplete?.();
    } catch (error) {
      console.error("ファイルアップロードエラー:", error);
      toast.error(error instanceof Error ? error.message : "アップロードに失敗しました");
    } finally {
      setIsUploading(false);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>ファイルアップロード</CardTitle>
        <CardDescription>
          PDF、テキスト、Markdownファイルをアップロードして知識ベースに追加
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground">
            クリックしてファイルを選択
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            対応形式: PDF, TXT, MD, JSON, CSV（最大10MB）
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.txt,.md,.json,.csv"
          className="hidden"
          onChange={handleFileSelect}
        />

        {selectedFile && (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <File className="h-5 w-5 text-muted-foreground" />
            <span className="flex-1 text-sm truncate">{selectedFile.name}</span>
            <span className="text-xs text-muted-foreground">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => {
                setSelectedFile(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className="w-full"
        >
          {isUploading ? "アップロード中..." : "アップロード"}
        </Button>
      </CardContent>
    </Card>
  );
}
