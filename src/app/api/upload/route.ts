import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

function serviceRoleClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const postId = formData.get('postId') as string | null

    if (!file || !postId) {
      return NextResponse.json({ error: 'Missing file or postId' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const result = await new Promise<{
      secure_url: string
      public_id: string
    }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'pitcairn-comms-hub',
          resource_type: 'image',
        },
        (error, result) => {
          if (error || !result) reject(error ?? new Error('Upload failed'))
          else resolve(result as { secure_url: string; public_id: string })
        }
      )
      stream.end(buffer)
    })

    const supabase = serviceRoleClient()
    const { data: photo, error: dbError } = await supabase
      .from('photos')
      .insert({
        post_id: postId,
        cloudinary_url: result.secure_url,
        cloudinary_public_id: result.public_id,
      })
      .select()
      .single()

    if (dbError) {
      await cloudinary.uploader.destroy(result.public_id)
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    return NextResponse.json({ photo })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { cloudinary_public_id, photo_id } = await request.json()

    if (!cloudinary_public_id || !photo_id) {
      return NextResponse.json({ error: 'Missing cloudinary_public_id or photo_id' }, { status: 400 })
    }

    await cloudinary.uploader.destroy(cloudinary_public_id)

    const supabase = serviceRoleClient()
    const { error } = await supabase
      .from('photos')
      .delete()
      .eq('id', photo_id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
