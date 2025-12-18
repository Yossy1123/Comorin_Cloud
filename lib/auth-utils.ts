/**
 * 認証・権限管理ユーティリティ
 * ユーザーの権限確認とロールベースのアクセス制御
 */

import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { Role } from "@prisma/client";

// 管理者メールアドレス（環境変数から取得可能にする）
const ADMIN_EMAIL = "yasutaka_yoshida@asagi.waseda.jp";

/**
 * 現在のユーザー情報を取得
 * Clerkの認証情報からPrismaのUserレコードを取得または作成
 */
export async function getCurrentUser() {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }

  // Clerkからユーザー情報を取得
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    return null;
  }

  const email = clerkUser.emailAddresses[0]?.emailAddress;

  if (!email) {
    throw new Error("メールアドレスが取得できませんでした");
  }

  // PrismaのUserレコードを取得または作成
  let user = await db.user.findUnique({
    where: { email },
  });

  if (!user) {
    // 新規ユーザーの場合は作成
    const role = email === ADMIN_EMAIL ? Role.ADMIN : Role.SUPPORTER;
    
    user = await db.user.create({
      data: {
        id: userId,
        email,
        role,
        emailVerified: true,
      },
    });
  }

  return user;
}

/**
 * 管理者かどうかを判定
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === Role.ADMIN;
}

/**
 * 特定のユーザーが管理者かどうかを判定
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  
  return user?.role === Role.ADMIN;
}

/**
 * ユーザーのロールを取得
 */
export async function getUserRole(userId: string): Promise<Role | null> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  
  return user?.role || null;
}

/**
 * リソースへのアクセス権限を確認
 * 管理者：すべてのリソースにアクセス可能
 * 一般ユーザー：自分のリソースのみアクセス可能
 */
export async function canAccessResource(
  resourceUserId: string
): Promise<boolean> {
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    return false;
  }

  // 管理者は全てのリソースにアクセス可能
  if (currentUser.role === Role.ADMIN) {
    return true;
  }

  // 一般ユーザーは自分のリソースのみアクセス可能
  return currentUser.id === resourceUserId;
}

/**
 * 当事者（Patient）データへのアクセス権限を確認
 * 管理者：すべての当事者データにアクセス可能
 * 一般ユーザー：自分が担当する当事者データのみアクセス可能
 */
export async function canAccessPatient(
  patientId: string
): Promise<boolean> {
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    return false;
  }

  // 管理者は全ての当事者データにアクセス可能
  if (currentUser.role === Role.ADMIN) {
    return true;
  }

  // 一般ユーザーは自分が担当する当事者のみアクセス可能
  // SupportRecordを通じて担当している当事者を確認
  const supportRecord = await db.supportRecord.findFirst({
    where: {
      patientId,
      supporterId: currentUser.id,
    },
  });

  return !!supportRecord;
}

/**
 * 会話データへのアクセス権限を確認
 */
export async function canAccessConversation(
  conversationId: string
): Promise<boolean> {
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    return false;
  }

  // 管理者は全ての会話データにアクセス可能
  if (currentUser.role === Role.ADMIN) {
    return true;
  }

  // 会話データを取得
  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
    select: { 
      patientId: true,
      supporterId: true,
    },
  });

  if (!conversation) {
    return false;
  }

  // 支援者IDが一致するか、担当している当事者の会話か確認
  if (conversation.supporterId === currentUser.id) {
    return true;
  }

  // 担当している当事者の会話かチェック
  return await canAccessPatient(conversation.patientId);
}

/**
 * AIチャットスレッドへのアクセス権限を確認
 */
export async function canAccessThread(
  threadId: string
): Promise<boolean> {
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    return false;
  }

  // 管理者は全てのスレッドにアクセス可能
  if (currentUser.role === Role.ADMIN) {
    return true;
  }

  // スレッドのユーザーIDを確認
  const thread = await db.aiChatThread.findUnique({
    where: { id: threadId },
    select: { userId: true },
  });

  if (!thread) {
    return false;
  }

  // 自分のスレッドのみアクセス可能
  return thread.userId === currentUser.id;
}

/**
 * 認証が必要なAPIハンドラーのラッパー
 * 認証されていない場合は401エラーを返す
 */
export async function requireAuth() {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("認証が必要です");
  }

  return userId;
}

/**
 * 管理者権限が必要なAPIハンドラーのラッパー
 * 管理者でない場合は403エラーを返す
 */
export async function requireAdmin() {
  const userId = await requireAuth();
  const admin = await isUserAdmin(userId);
  
  if (!admin) {
    throw new Error("管理者権限が必要です");
  }

  return userId;
}

