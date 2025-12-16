/**
 * OpenAI Thread管理ユーティリティ
 */

import { openai } from "./openai";
import { db } from "./prisma";

interface CreateThreadParams {
  assistantId: string;
  userId: string;
  patientId?: string;
  title?: string;
}

/**
 * Threadを作成し、DBに保存
 */
export async function createThread(params: CreateThreadParams) {
  const { assistantId, userId, patientId, title } = params;

  // Assistant存在確認
  const assistant = await db.aiChatAssistant.findUnique({
    where: { id: assistantId },
  });

  if (!assistant) {
    throw new Error("Assistantが見つかりません");
  }

  // OpenAI Threadを作成
  const thread = await openai.beta.threads.create();

  // DBに保存
  const dbThread = await db.aiChatThread.create({
    data: {
      openaiId: thread.id,
      assistantId,
      userId,
      patientId: patientId || null,
      title: title || null,
    },
  });

  return dbThread;
}

/**
 * ユーザーのThread一覧を取得
 */
export async function getUserThreads(userId: string) {
  const threads = await db.aiChatThread.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1, // 最新メッセージのみ
      },
      assistant: {
        select: {
          name: true,
        },
      },
    },
  });

  return threads;
}

/**
 * Thread詳細を取得
 */
export async function getThread(threadId: string, userId: string) {
  const thread = await db.aiChatThread.findFirst({
    where: { id: threadId, userId },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
      assistant: true,
    },
  });

  if (!thread) {
    throw new Error("Threadが見つかりません");
  }

  return thread;
}

/**
 * Threadを削除
 */
export async function deleteThread(threadId: string, userId: string) {
  const thread = await db.aiChatThread.findFirst({
    where: { id: threadId, userId },
  });

  if (!thread) {
    throw new Error("Threadが見つかりません");
  }

  // OpenAI Threadを削除
  await openai.beta.threads.del(thread.openaiId);

  // DBから削除（CASCADE削除でメッセージも削除される）
  await db.aiChatThread.delete({
    where: { id: threadId },
  });

  return { success: true };
}

