'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Post, PostStatus } from '@/lib/types'

const STATUS_LABELS: Record<PostStatus, string> = {
  needs_content: 'Needs Content',
  pending: 'Pending',
  ready: 'Ready',
  posted: 'Posted',
}

const STATUS_COLORS: Record<PostStatus, string> = {
  needs_content: 'bg-red-100 text-red-700',
  pending: 'bg-amber-100 text-amber-700',
  ready: 'bg-blue-100 text-blue-700',
  posted: 'bg-green-100 text-green-700',
}

const FORMAT_LABELS: Record<string, string> = {
  photo: 'Photo',
  video: 'Video',
  photo_video: 'Photo/Video',
}

const FILTER_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Needs Content', value: 'needs_content' },
  { label: 'Pending', value: 'pending' },
  { label: 'Ready', value: 'ready' },
  { label: 'Posted', value: 'posted' },
]

const MONTH_ORDER = [
  'April 2026',
  'May 2026',
  'June 2026',
  'July 2026',
  'August 2026',
  'September 2026',
  'Evergreen',
]

function monthSortKey(month: string): number {
  const idx = MONTH_ORDER.indexOf(month)
  return idx === -1 ? MONTH_ORDER.length : idx
}

interface Props {
  posts: Post[]
  photoCountMap: Record<string, number>
}

export default function CalendarClient({ posts, photoCountMap }: Props) {
  const [filter, setFilter] = useState<string>('all')

  const filtered = filter === 'all' ? posts : posts.filter(p => p.status === filter)

  const grouped: Record<string, Post[]> = {}
  for (const post of filtered) {
    if (!grouped[post.month]) grouped[post.month] = []
    grouped[post.month].push(post)
  }

  const months = Object.keys(grouped).sort((a, b) => monthSortKey(a) - monthSortKey(b))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Content Calendar</h1>
        <p className="text-gray-500 text-sm">{posts.length} posts scheduled</p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {FILTER_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === opt.value
                ? 'bg-pitcairn-blue text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-pitcairn-blue hover:text-pitcairn-blue'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {months.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No posts match this filter.</div>
      ) : (
        <div className="space-y-10">
          {months.map(month => (
            <section key={month}>
              <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b border-gray-200 pb-2">
                {month}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {grouped[month].map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    photoCount={photoCountMap[post.id] ?? 0}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

function PostCard({ post, photoCount }: { post: Post; photoCount: number }) {
  return (
    <Link
      href={`/post/${post.id}`}
      className="block bg-white rounded-xl border border-gray-200 hover:border-pitcairn-blue hover:shadow-md transition-all p-4 group"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          {post.date_label && (
            <p className="text-xs text-gray-400 mb-0.5">{post.date_label}</p>
          )}
          <h3 className="font-semibold text-gray-900 group-hover:text-pitcairn-blue transition-colors leading-tight">
            {post.title}
          </h3>
        </div>
        <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[post.status]}`}>
          {STATUS_LABELS[post.status]}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {post.format && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
            {FORMAT_LABELS[post.format] ?? post.format}
          </span>
        )}
        {photoCount > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-pitcairn-teal/10 text-pitcairn-teal">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            {photoCount} photo{photoCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {post.caption && (
        <p className="text-sm text-gray-600 line-clamp-2 mb-2">{post.caption}</p>
      )}

      {post.asset_needed && (
        <p className="text-xs text-gray-400 truncate">{post.asset_needed}</p>
      )}
    </Link>
  )
}
