'use client'

import { UserButton } from '@clerk/nextjs'

export function ClerkUserButton() {
  return (
    <UserButton
      afterSignOutUrl="/sign-in"
      appearance={{
        elements: {
          avatarBox: 'h-10 w-10',
        },
      }}
      userProfileMode="modal"
      userProfileProps={{
        appearance: {
          elements: {
            rootBox: 'w-full max-w-2xl',
            card: 'shadow-lg border border-border',
          },
        },
      }}
    />
  )
}

