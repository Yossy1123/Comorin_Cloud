/**
 * Prisma Client - データベースクライアントのシングルトンインスタンス
 * 
 * Next.js開発環境でのホットリロード時に複数のPrismaClientインスタンスが
 * 作成されることを防ぐため、globalオブジェクトにキャッシュします。
 * 
 * 参考: https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
 */

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}

/**
 * データベース接続のテスト
 * アプリケーション起動時に実行してデータベース接続を確認
 */
export async function testDatabaseConnection() {
  try {
    await db.$connect()
    console.log('✅ Database connection successful')
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}

/**
 * データベース接続のクリーンアップ
 * アプリケーション終了時に実行
 */
export async function closeDatabaseConnection() {
  await db.$disconnect()
  console.log('🔌 Database connection closed')
}

