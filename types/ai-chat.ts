// AI Chat関連の型定義

export interface AiChatAssistant {
  id: string;
  openaiId: string;
  name: string;
  instructions: string;
  model: string;
  vectorStoreId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AiChatThread {
  id: string;
  openaiId: string;
  assistantId: string;
  userId: string;
  patientId: string | null;
  title: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AiChatMessage {
  id: string;
  threadId: string;
  role: "user" | "assistant";
  content: string;
  openaiMessageId: string | null;
  createdAt: Date;
}

export interface AiChatFile {
  id: string;
  openaiFileId: string;
  vectorStoreId: string | null;
  fileName: string;
  fileSize: number;
  mimeType: string;
  userId: string;
  createdAt: Date;
}

// API Request/Response型

export interface CreateAssistantRequest {
  name: string;
  instructions: string;
  model?: string;
  vectorStoreId?: string;
}

export interface CreateThreadRequest {
  assistantId: string;
  patientId?: string;
  title?: string;
}

export interface SendMessageRequest {
  threadId: string;
  content: string;
}

export interface UploadFileRequest {
  file: File;
  purpose?: "assistants";
}

export interface CreateAssistantResponse {
  assistant: AiChatAssistant;
}

export interface CreateThreadResponse {
  thread: AiChatThread;
}

export interface SendMessageResponse {
  message: AiChatMessage;
  threadId: string;
}

export interface UploadFileResponse {
  file: AiChatFile;
}

export interface GetThreadsResponse {
  threads: (AiChatThread & {
    messages: AiChatMessage[];
    messageCount: number;
  })[];
}

export interface GetMessagesResponse {
  messages: AiChatMessage[];
  hasMore: boolean;
  nextCursor?: string;
}

// ストリーミング関連の型

export interface StreamEvent {
  type: "text" | "done" | "error";
  content?: string;
  error?: string;
}

