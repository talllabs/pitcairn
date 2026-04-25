import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Nav from '@/components/Nav'
import SuggestClient from './SuggestClient'

export default async function SuggestPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/')

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <main className="pt-14">
        <SuggestClient />
      </main>
    </div>
  )
}
