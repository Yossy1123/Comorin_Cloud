import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const { userId } = await auth()
  
  if (userId) {
    // ログイン済みの場合はダッシュボードへ
    redirect('/dashboard')
  } else {
    // 未ログインの場合はサインインページへ
    redirect('/sign-in')
  }
}
