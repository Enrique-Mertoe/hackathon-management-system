import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabase } from '@/lib/supabase.server'
import { supabaseAdmin } from '@/lib/supabase.admin'
import { v4 as uuidv4 } from 'uuid'

// POST /api/upload - Handle file uploads
export async function POST(request: NextRequest) {
  try {
    const user = await auth.getCurrentUser(await supabase())
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!type || !['poster', 'avatar', 'document'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Must be poster, avatar, or document' },
        { status: 400 }
      )
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = {
      poster: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      avatar: ['image/jpeg', 'image/png', 'image/webp'],
      document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    }

    if (!allowedTypes[type as keyof typeof allowedTypes].includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type for ${type}. Allowed types: ${allowedTypes[type as keyof typeof allowedTypes].join(', ')}` },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const uniqueFilename = `${type}/${uuidv4()}.${fileExtension}`

    // Convert File to Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('hackathon-files')
      .upload(uniqueFilename, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('hackathon-files')
      .getPublicUrl(uniqueFilename)

    // Store file metadata in database
    const { data: fileRecord, error: dbError } = await supabaseAdmin
      .from('files')
      .insert({
        original_name: file.name,
        stored_name: uniqueFilename,
        file_path: uploadData.path,
        file_url: urlData.publicUrl,
        mime_type: file.type,
        file_size: file.size,
        uploaded_by: user.id,
        category: type
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      // Try to clean up uploaded file
      await supabaseAdmin.storage
        .from('hackathon-files')
        .remove([uniqueFilename])
      
      return NextResponse.json(
        { error: 'Failed to save file metadata' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'File uploaded successfully',
      file: fileRecord,
      url: urlData.publicUrl
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/upload - Get uploaded files for user
export async function GET(request: NextRequest) {
  try {
    const user = await auth.getCurrentUser(await supabase())
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '20')

    let query = supabaseAdmin
      .from('files')
      .select('*')
      .eq('uploaded_by', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (type) {
      query = query.eq('category', type)
    }

    const { data: files, error } = await query

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      files: files || []
    })

  } catch (error) {
    console.error('Error fetching files:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/upload - Delete uploaded file
export async function DELETE(request: NextRequest) {
  try {
    const user = await auth.getCurrentUser(await supabase())
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('id')

    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      )
    }

    // Get file record
    const { data: fileRecord, error: fetchError } = await supabaseAdmin
      .from('files')
      .select('*')
      .eq('id', fileId)
      .eq('uploaded_by', user.id)
      .single()

    if (fetchError || !fileRecord) {
      return NextResponse.json(
        { error: 'File not found or unauthorized' },
        { status: 404 }
      )
    }

    // Delete from storage
    const { error: storageError } = await supabaseAdmin.storage
      .from('hackathon-files')
      .remove([fileRecord.stored_name])

    if (storageError) {
      console.error('Storage deletion error:', storageError)
    }

    // Delete from database
    const { error: dbError } = await supabaseAdmin
      .from('files')
      .delete()
      .eq('id', fileId)

    if (dbError) {
      return NextResponse.json(
        { error: 'Failed to delete file record' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'File deleted successfully'
    })

  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}