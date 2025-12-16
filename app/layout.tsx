import type React from "react"
import type { Metadata } from "next"
import { ClerkProvider } from '@clerk/nextjs'
import { jaJP } from '@clerk/localizations'
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "ひきこもり支援プラットフォーム",
  description: "データドリブンな支援の最適化",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider localization={jaJP}>
      <html lang="ja">
        <body
          suppressHydrationWarning
          className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}
        >
          <Suspense fallback={null}>{children}</Suspense>
        </body>
      </html>
    </ClerkProvider>
  )
}
