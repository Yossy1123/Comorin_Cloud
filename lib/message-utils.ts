/**
 * OpenAI Message管理ユーティリティ
 */

import { openai } from "./openai";
import { db } from "./prisma";

interface SendMessageParams {
  threadId: string;
  userId: string;
  content: string;
}

/**
 * メッセージを送信してAIの応答を取得
 */
export async function sendMessage(params: SendMessageParams) {
  const { threadId, userId, content } = params;

  // Thread存在確認
  const thread = await db.aiChatThread.findFirst({
    where: { id: threadId, userId },
    include: { assistant: true },
  });

  if (!thread) {
    throw new Error("Threadが見つかりません");
  }

  // ユーザーメッセージをDBに保存
  const userMessage = await db.aiChatMessage.create({
    data: {
      threadId,
      role: "user",
      content,
    },
  });

  // OpenAIにメッセージを送信
  await openai.beta.threads.messages.create(thread.openaiId, {
    role: "user",
    content,
  });

  return {
    message: userMessage,
    threadOpenaiId: thread.openaiId,
    assistantOpenaiId: thread.assistant.openaiId,
  };
}

/**
 * Runを作成してストリーミングで応答を取得
 */
export async function createRunStream(threadOpenaiId: string, assistantOpenaiId: string) {
  const stream = await openai.beta.threads.runs.create(threadOpenaiId, {
    assistant_id: assistantOpenaiId,
    stream: true,
  });

  return stream;
}

/**
 * AIの応答をDBに保存
 */
export async function saveAssistantMessage(
  threadId: string,
  content: string,
  openaiMessageId?: string
) {
  const assistantMessage = await db.aiChatMessage.create({
    data: {
      threadId,
      role: "assistant",
      content,
      openaiMessageId: openaiMessageId || null,
    },
  });

  // Thread更新日時を更新
  await db.aiChatThread.update({
    where: { id: threadId },
    data: { updatedAt: new Date() },
  });

  return assistantMessage;
}

/**
 * Thread内のメッセージ一覧を取得
 */
export async function getMessages(threadId: string, userId: string) {
  // Thread存在確認
  const thread = await db.aiChatThread.findFirst({
    where: { id: threadId, userId },
  });

  if (!thread) {
    throw new Error("Threadが見つかりません");
  }

  const messages = await db.aiChatMessage.findMany({
    where: { threadId },
    orderBy: { createdAt: "asc" },
  });

  return messages;
}

