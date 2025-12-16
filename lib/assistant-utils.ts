/**
 * OpenAI Assistant管理ユーティリティ
 */

import { openai, DEFAULT_MODEL, DEFAULT_INSTRUCTIONS } from "./openai";
import { db } from "./prisma";

interface CreateAssistantParams {
  name: string;
  instructions?: string;
  model?: string;
  vectorStoreId?: string;
}

/**
 * Assistantを作成し、DBに保存
 */
export async function createAssistant(params: CreateAssistantParams) {
  const { name, instructions = DEFAULT_INSTRUCTIONS, model = DEFAULT_MODEL, vectorStoreId } = params;

  // OpenAI Assistantを作成
  const tools: Array<{ type: "file_search" }> = [];
  const toolResources: { file_search?: { vector_store_ids: string[] } } = {};

  if (vectorStoreId) {
    tools.push({ type: "file_search" });
    toolResources.file_search = { vector_store_ids: [vectorStoreId] };
  }

  const assistant = await openai.beta.assistants.create({
    name,
    instructions,
    model,
    tools: tools.length > 0 ? tools : undefined,
    tool_resources: Object.keys(toolResources).length > 0 ? toolResources : undefined,
  });

  // DBに保存
  const dbAssistant = await db.aiChatAssistant.create({
    data: {
      openaiId: assistant.id,
      name,
      instructions,
      model,
      vectorStoreId: vectorStoreId || null,
    },
  });

  return dbAssistant;
}

/**
 * 既存のAssistantを取得（なければ作成）
 */
export async function getOrCreateAssistant() {
  // DBから最新のAssistantを取得
  const existingAssistant = await db.aiChatAssistant.findFirst({
    orderBy: { createdAt: "desc" },
  });

  if (existingAssistant) {
    return existingAssistant;
  }

  // なければ新規作成
  return createAssistant({
    name: "ひきこもり支援アシスタント",
  });
}

/**
 * AssistantにVector Storeを紐付け
 */
export async function attachVectorStore(assistantId: string, vectorStoreId: string) {
  const assistant = await db.aiChatAssistant.findUnique({
    where: { id: assistantId },
  });

  if (!assistant) {
    throw new Error("Assistantが見つかりません");
  }

  // OpenAI Assistantを更新
  await openai.beta.assistants.update(assistant.openaiId, {
    tools: [{ type: "file_search" }],
    tool_resources: {
      file_search: { vector_store_ids: [vectorStoreId] },
    },
  });

  // DBを更新
  return db.aiChatAssistant.update({
    where: { id: assistantId },
    data: { vectorStoreId },
  });
}

