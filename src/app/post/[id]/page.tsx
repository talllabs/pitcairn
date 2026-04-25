import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Nav from '@/components/Nav'
import PostDetailClient from './PostDetailClient'
import type { Post, Photo } from '@/lib/types'

interface Props {
  params: { id: string }
}

export default async function PostDetailPage({ params }: Props) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !post) notFound()

  const { data: photos } = await supabase
    .from('photos')
    .select('*')
    .eq('post_id', params.id)
    .order('uploaded_at', { ascending: true })

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <main className="pt-14">
        <PostDetailClient post={post as Post} initialPhotos={(photos as Photo[]) ?? []} />
      </main>
    </div>
  )
}
