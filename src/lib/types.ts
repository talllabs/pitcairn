export type PostStatus = 'needs_content' | 'pending' | 'ready' | 'posted'
export type PostFormat = 'photo' | 'video' | 'photo_video'

export interface Post {
  id: string
  month: string
  date_label: string | null
  title: string
  caption: string | null
  status: PostStatus
  asset_needed: string | null
  format: PostFormat | null
  provider: string | null
  created_at: string
  updated_at: string
}

export interface Photo {
  id: string
  post_id: string
  cloudinary_url: string
  cloudinary_public_id: string
  uploaded_at: string
}

export interface Suggestion {
  id: string
  proposed_date: string | null
  theme: string
  notes: string | null
  submitted_by_name: string | null
  created_at: string
}
