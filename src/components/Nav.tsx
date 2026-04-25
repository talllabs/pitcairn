'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function Nav() {
  const router = useRouter()
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-pitcairn-blue text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href="/calendar" className="font-bold text-lg tracking-tight">
            Pitcairn Comms Hub
          </Link>
          <div className="flex items-center gap-5 text-sm">
            <Link href="/calendar" className="hover:text-pitcairn-sand transition-colors">
              Calendar
            </Link>
            <Link href="/suggest" className="hover:text-pitcairn-sand transition-colors">
              Suggest a Post
            </Link>
            <Link href="/admin" className="hover:text-pitcairn-sand transition-colors">
              Admin
            </Link>
            <button
              onClick={signOut}
              className="hover:text-pitcairn-sand transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
