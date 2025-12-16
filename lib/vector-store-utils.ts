/**
 * OpenAI Vector Store管理ユーティリティ
 */

import { openai, MAX_FILE_SIZE, SUPPORTED_FILE_TYPES } from "./openai";
import { db } from "./prisma";

/**
 * Vector Storeを作成
 */
export async function createVectorStore(name: string) {
  const vectorStore = await openai.beta.vectorStores.create({
    name,
  });

  return vectorStore;
}

/**
 * ファイルをアップロードしてVector Storeに追加
 */
export async function uploadFileToVectorStore(
  file: File,
  vectorStoreId: string,
  userId: string
) {
  // ファイルサイズチェック
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`ファイルサイズは${MAX_FILE_SIZE / 1024 / 1024}MB以下にしてください`);
  }

  // ファイル形式チェック
  if (!SUPPORTED_FILE_TYPES.includes(file.type as any)) {
    throw new Error(
      `サポートされていないファイル形式です。対応形式: ${SUPPORTED_FILE_TYPES.join(", ")}`
    );
  }

  // OpenAIにファイルをアップロード
  const openaiFile = await openai.files.create({
    file,
    purpose: "assistants",
  });

  // Vector Storeにファイルを追加
  await openai.beta.vectorStores.files.create(vectorStoreId, {
    file_id: openaiFile.id,
  });

  // DBに保存
  const dbFile = await db.aiChatFile.create({
    data: {
      openaiFileId: openaiFile.id,
      vectorStoreId,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      userId,
    },
  });

  return dbFile;
}

/**
 * Vector Store内のファイル一覧を取得
 */
export async function getVectorStoreFiles(vectorStoreId: string, userId: string) {
  const files = await db.aiChatFile.findMany({
    where: {
      vectorStoreId,
      userId,
    },
    orderBy: { createdAt: "desc" },
  });

  return files;
}

/**
 * ファイルを削除
 */
export async function deleteFile(fileId: string, userId: string) {
  const file = await db.aiChatFile.findFirst({
    where: { id: fileId, userId },
  });

  if (!file) {
    throw new Error("ファイルが見つかりません");
  }

  // OpenAIからファイルを削除
  await openai.files.del(file.openaiFileId);

  // DBから削除
  await db.aiChatFile.delete({
    where: { id: fileId },
  });

  return { success: true };
}

