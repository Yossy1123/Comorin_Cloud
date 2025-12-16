/**
 * OpenAI クライアントの初期化と設定
 * ⚠️ このファイルはサーバーサイド専用です
 */

import OpenAI from "openai";

/**
 * OpenAIクライアントのシングルトンインスタンス
 * サーバーサイドでのみ使用してください
 */
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

/**
 * OpenAI APIキーが設定されているかチェック
 */
export function checkOpenAIKey(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

/**
 * デフォルト設定
 */
export const DEFAULT_MODEL = "gpt-4o";
export const DEFAULT_INSTRUCTIONS = `あなたはひきこもり支援の専門家です。
支援者からの質問に対して、以下の点を考慮して回答してください：

1. 当事者の心理状態や背景を理解した上で回答する
2. 科学的根拠に基づいた支援方法を提案する
3. 個別の状況に応じた具体的なアプローチを提示する
4. 支援者が実践しやすい形で情報を提供する
5. 必要に応じて、アップロードされた資料や過去の会話履歴を参照する

常に当事者と支援者の両方の立場を考慮し、実践的で有益な情報を提供してください。`;

/**
 * サポートされているファイル形式
 */
export const SUPPORTED_FILE_TYPES = [
  "application/pdf",
  "text/plain",
  "text/markdown",
  "application/json",
  "text/csv",
] as const;

/**
 * ファイルサイズ制限（10MB）
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;
