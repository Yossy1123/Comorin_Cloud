/**
 * AI Chat Message API
 * メッセージ送信とストリーミング応答
 */

import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sendMessage, createRunStream, saveAssistantMessage, getMessages } from "@/lib/message-utils";
import { SendMessageRequest } from "@/types/ai-chat";

/**
 * GET /api/ai-chat/message
 * Thread内のメッセージ一覧を取得
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "認証が必要です" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const { searchParams } = new URL(request.url);
    const threadId = searchParams.get("threadId");

    if (!threadId) {
      return new Response(
        JSON.stringify({ error: "threadIdは必須です" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const messages = await getMessages(threadId, userId);
    
    return new Response(
      JSON.stringify({ messages }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("メッセージ取得エラー:", error);
    return new Response(
      JSON.stringify({ error: "メッセージの取得に失敗しました" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

/**
 * POST /api/ai-chat/message
 * メッセージを送信してストリーミング応答を返す
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "認証が必要です" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await request.json() as SendMessageRequest;
    const { threadId, content } = body;

    if (!threadId || !content) {
      return new Response(
        JSON.stringify({ error: "threadIdとcontentは必須です" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // メッセージを送信
    const { message, threadOpenaiId, assistantOpenaiId } = await sendMessage({
      threadId,
      userId,
      content,
    });

    // ストリーミングレスポンスを作成
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Runを作成してストリーミング開始
          const runStream = await createRunStream(threadOpenaiId, assistantOpenaiId);
          
          let fullResponse = "";
          let lastMessageId: string | undefined;

          for await (const event of runStream) {
            // テキストデルタを取得
            if (event.event === "thread.message.delta") {
              const delta = event.data.delta;
              if (delta.content && delta.content[0] && "text" in delta.content[0]) {
                const text = delta.content[0].text?.value || "";
                fullResponse += text;
                
                // クライアントにテキストをストリーミング
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ type: "text", content: text })}\n\n`
                  )
                );
              }
            }

            // メッセージID取得
            if (event.event === "thread.message.created") {
              lastMessageId = event.data.id;
            }

            // Run完了
            if (event.event === "thread.run.completed") {
              // DBに保存
              await saveAssistantMessage(threadId, fullResponse, lastMessageId);
              
              // 完了通知
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: "done" })}\n\n`
                )
              );
              controller.close();
              break;
            }

            // エラー処理
            if (event.event === "thread.run.failed") {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: "error", error: "Run failed" })}\n\n`
                )
              );
              controller.close();
              break;
            }
          }
        } catch (error) {
          console.error("ストリーミングエラー:", error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "error", error: "ストリーミング中にエラーが発生しました" })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("メッセージ送信エラー:", error);
    return new Response(
      JSON.stringify({ error: "メッセージの送信に失敗しました" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
