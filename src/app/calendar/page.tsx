import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Nav from '@/components/Nav'
import CalendarClient from './CalendarClient'
import type { Post } from '@/lib/types'

export default async function CalendarPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    console.error(error)
  }

  const { data: photos } = await supabase
    .from('photos')
    .select('post_id')

  const photoCountMap: Record<string, number> = {}
  if (photos) {
    for (const p of photos) {
      photoCountMap[p.post_id] = (photoCountMap[p.post_id] ?? 0) + 1
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <main className="pt-14">
        <CalendarClient posts={(posts as Post[]) ?? []} photoCountMap={photoCountMap} />
      </main>
    </div>
  )
}
