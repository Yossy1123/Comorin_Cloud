import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// 認証が必要なルート
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api/(.*)',
])

// 公開ルート（認証不要）
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  // 保護されたルートにアクセスする場合は認証必須
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Next.jsの内部ファイルを除外
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // APIルートは常に実行
    '/(api|trpc)(.*)',
  ],
}

