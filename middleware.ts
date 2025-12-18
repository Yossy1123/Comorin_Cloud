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
  '/api/webhooks/(.*)', // Webhookは認証不要
])

export default clerkMiddleware(async (auth, req) => {
  // 公開ルートは認証不要
  if (isPublicRoute(req)) {
    return
  }

  // 保護されたルートは認証が必要
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

