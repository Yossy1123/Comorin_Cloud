'use client'

import { useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export function LogoutButton() {
  const { signOut } = useClerk()
  const router = useRouter()
  
  const handleLogout = async () => {
    await signOut()
    router.push('/sign-in')
  }
  
  return (
    <Button onClick={handleLogout} variant="ghost" size="sm">
      <LogOut className="mr-2 h-4 w-4" />
      ログアウト
    </Button>
  )
}

