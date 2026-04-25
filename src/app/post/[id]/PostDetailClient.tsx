'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import type { Post, Photo, PostStatus } from '@/lib/types'

const STATUS_OPTIONS: { value: PostStatus; label: string }[] = [
  { value: 'needs_content', label: 'Needs Content' },
  { value: 'pending', label: 'Pending' },
  { value: 'ready', label: 'Ready' },
  { value: 'posted', label: 'Posted' },
]

const STATUS_COLORS: Record<PostStatus, string> = {
  needs_content: 'bg-red-100 text-red-700 border-red-200',
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  ready: 'bg-blue-100 text-blue-700 border-blue-200',
  posted: 'bg-green-100 text-green-700 border-green-200',
}

interface Props {
  post: Post
  initialPhotos: Photo[]
}

export default function PostDetailClient({ post, initialPhotos }: Props) {
  const supabase = createClient()

  const [status, setStatus] = useState<PostStatus>(post.status)
  const [caption, setCaption] = useState(post.caption ?? '')
  const [assetNeeded, setAssetNeeded] = useState(post.asset_needed ?? '')
  const [provider, setProvider] = useState(post.provider ?? '')
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos)
  const [savedField, setSavedField] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function showSaved(field: string) {
    setSavedField(field)
    setTimeout(() => setSavedField(null), 2000)
  }

  async function updateField(field: string, value: string) {
    await supabase
      .from('posts')
      .update({ [field]: value, updated_at: new Date().toISOString() })
      .eq('id', post.id)
    showSaved(field)
  }

  async function handleStatusChange(newStatus: PostStatus) {
    setStatus(newStatus)
    await supabase
      .from('posts')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', post.id)
    showSaved('status')
  }

  async function uploadFiles(files: FileList | File[]) {
    setUploading(true)
    const arr = Array.from(files)

    for (const file of arr) {
      const tempId = `${Date.now()}-${file.name}`
      setUploadProgress(prev => ({ ...prev, [tempId]: 0 }))

      const formData = new FormData()
      formData.append('file', file)
      formData.append('postId', post.id)

      try {
        setUploadProgress(prev => ({ ...prev, [tempId]: 50 }))
        const res = await fetch('/api/upload', { method: 'POST', body: formData })
        const data = await res.json()

        if (res.ok && data.photo) {
          setPhotos(prev => [...prev, data.photo as Photo])
        }
      } catch {
        // silently ignore individual upload failures
      } finally {
        setUploadProgress(prev => {
          const next = { ...prev }
          delete next[tempId]
          return next
        })
      }
    }

    setUploading(false)
  }

  async function deletePhoto(photo: Photo) {
    const res = await fetch('/api/upload', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cloudinary_public_id: photo.cloudinary_public_id,
        photo_id: photo.id,
      }),
    })

    if (res.ok) {
      setPhotos(prev => prev.filter(p => p.id !== photo.id))
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files)
    }
  }, [])

  const pendingCount = Object.keys(uploadProgress).length

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/calendar"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-pitcairn-blue mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        Back to Calendar
      </Link>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
        {/* Header */}
        <div>
          {post.date_label && (
            <p className="text-xs text-gray-400 mb-1">{post.month} · {post.date_label}</p>
          )}
          <h1 className="text-xl font-bold text-gray-900">{post.title}</h1>
          {post.format && (
            <span className="inline-flex items-center mt-2 px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 capitalize">
              {post.format.replace('_', '/')}
            </span>
          )}
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleStatusChange(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                  status === opt.value
                    ? STATUS_COLORS[opt.value]
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {savedField === 'status' && <p className="text-xs text-green-600 mt-1">Saved ✓</p>}
        </div>

        {/* Caption */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Caption</label>
          <textarea
            value={caption}
            onChange={e => setCaption(e.target.value)}
            onBlur={() => updateField('caption', caption)}
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pitcairn-blue focus:border-transparent resize-y transition"
            placeholder="Write caption here…"
          />
          {savedField === 'caption' && <p className="text-xs text-green-600 mt-1">Saved ✓</p>}
        </div>

        {/* Asset Needed */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Asset Needed</label>
          <input
            type="text"
            value={assetNeeded}
            onChange={e => setAssetNeeded(e.target.value)}
            onBlur={() => updateField('asset_needed', assetNeeded)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pitcairn-blue focus:border-transparent transition"
            placeholder="Describe required asset…"
          />
          {savedField === 'asset_needed' && <p className="text-xs text-green-600 mt-1">Saved ✓</p>}
        </div>

        {/* Provider */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
          <input
            type="text"
            value={provider}
            onChange={e => setProvider(e.target.value)}
            onBlur={() => updateField('provider', provider)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pitcairn-blue focus:border-transparent transition"
            placeholder="Who provides this content?"
          />
          {savedField === 'provider' && <p className="text-xs text-green-600 mt-1">Saved ✓</p>}
        </div>

        {/* Photo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Photos
          </label>

          {/* Drop zone */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              dragOver
                ? 'border-pitcairn-blue bg-pitcairn-blue/5'
                : 'border-gray-300 hover:border-pitcairn-blue hover:bg-gray-50'
            }`}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
            </svg>
            <p className="text-sm text-gray-500">
              {uploading
                ? `Uploading ${pendingCount} file${pendingCount !== 1 ? 's' : ''}…`
                : 'Drop images here or click to browse'}
            </p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP, GIF accepted</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => e.target.files && uploadFiles(e.target.files)}
            />
          </div>

          {/* Progress bars */}
          {pendingCount > 0 && (
            <div className="mt-3 space-y-1">
              {Object.entries(uploadProgress).map(([id]) => (
                <div key={id} className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-pitcairn-blue animate-pulse rounded-full w-1/2" />
                </div>
              ))}
            </div>
          )}

          {/* Photo grid */}
          {photos.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
              {photos.map(photo => (
                <div key={photo.id} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={photo.cloudinary_url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 33vw, 25vw"
                  />
                  <button
                    onClick={() => deletePhoto(photo)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    aria-label="Delete photo"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
