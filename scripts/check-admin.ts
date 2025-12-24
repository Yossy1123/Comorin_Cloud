/**
 * 管理者権限チェックスクリプト
 * yasutaka_yoshida@asagi.waseda.jpの権限を確認・修正
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const ADMIN_EMAIL = 'yasutaka_yoshida@asagi.waseda.jp'

async function main() {
  console.log('🔍 管理者権限チェック中...\n')

  // ユーザーを検索
  const user = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
  })

  if (!user) {
    console.log(`❌ ユーザーが見つかりません: ${ADMIN_EMAIL}`)
    console.log('   初回ログイン時に自動的に管理者として作成されます。\n')
    return
  }

  console.log(`✅ ユーザーが見つかりました:`)
  console.log(`   Email: ${user.email}`)
  console.log(`   Role: ${user.role}`)
  console.log(`   Created: ${user.createdAt}`)
  console.log(`   Last Login: ${user.lastLoginAt || 'なし'}\n`)

  if (user.role === 'ADMIN') {
    console.log('✨ 既に管理者権限が付与されています！')
  } else {
    console.log('⚠️  現在のロール: SUPPORTER')
    console.log('   管理者権限への更新が必要です。\n')
    
    // ロールを更新
    const updated = await prisma.user.update({
      where: { email: ADMIN_EMAIL },
      data: { role: 'ADMIN' },
    })
    
    console.log('✅ 管理者権限を付与しました！')
    console.log(`   新しいロール: ${updated.role}\n`)
  }

  // 全ユーザー一覧を表示
  const allUsers = await prisma.user.findMany({
    select: {
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  console.log('📋 全ユーザー一覧:')
  allUsers.forEach((u, index) => {
    const roleIcon = u.role === 'ADMIN' ? '👑' : '👤'
    console.log(`   ${index + 1}. ${roleIcon} ${u.email} - ${u.role}`)
  })
}

main()
  .catch((e) => {
    console.error('❌ エラーが発生しました:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


