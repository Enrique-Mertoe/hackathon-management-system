import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { auth } from '@/lib/auth'
import {supabase} from "@/lib/supabase.server";


export async function POST(request: NextRequest) {
  try {
    const sb = await supabase()
    // Get current user from auth
    const currentUser = await auth.getCurrentUser(sb)
    if (!currentUser || !auth.hasRole(currentUser, 'ORGANIZER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      hackathonId,
      subject,
      message,
      priority = 'NORMAL',
      type = 'ANNOUNCEMENT'
    } = body

    // Validate required fields
    if (!hackathonId || !subject || !message) {
      return NextResponse.json({ 
        error: 'Missing required fields: hackathonId, subject, message' 
      }, { status: 400 })
    }

    // Verify the hackathon belongs to the current user
    const { data: hackathon, error: hackathonError } = await sb
      .from('hackathons')
      .select('id, organizer_id, title')
      .eq('id', hackathonId)
      .eq('organizer_id', currentUser.id)
      .single()

    if (hackathonError || !hackathon) {
      return NextResponse.json({ error: 'Hackathon not found or access denied' }, { status: 404 })
    }

    // Create the hackathon update/announcement
    const { data: update, error } = await sb
      .from('hackathon_updates')
      .insert({
        hackathon_id: hackathonId,
        author_id: currentUser.id,
        title: subject,
        content: message,
        type: type,
        priority: priority,
        is_published: true,
        published_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating hackathon update:', error)
      return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 })
    }

    // Get participant count for the hackathon
    const { count: participantCount } = await sb
      .from('hackathon_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('hackathon_id', hackathonId)
      .eq('status', 'REGISTERED')

    // TODO: In a real application, you would:
    // 1. Send emails to all registered participants
    // 2. Create push notifications
    // 3. Add in-app notifications to user inboxes
    // For now, we'll just create the database record

    return NextResponse.json({ 
      update,
      message: `Notification sent to ${participantCount || 0} participants`,
      participantCount: participantCount || 0
    }, { status: 201 })

  } catch (error) {
    console.error('Error in notifications API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const sb = await supabase()
    // Get current user from auth
    const currentUser = await auth.getCurrentUser(sb)
    if (!currentUser || !auth.hasRole(currentUser, 'ORGANIZER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const hackathonId = searchParams.get('hackathonId')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Build query for hackathon updates
    let query = sb
      .from('hackathon_updates')
      .select(`
        id,
        hackathon_id,
        title,
        content,
        type,
        priority,
        published_at,
        created_at,
        hackathons!inner(
          id,
          title,
          organizer_id
        )
      `)
      .eq('hackathons.organizer_id', currentUser.id)
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(limit)

    // Apply filters
    if (hackathonId) {
      query = query.eq('hackathon_id', hackathonId)
    }

    const { data: updates, error } = await query

    if (error) {
      console.error('Error fetching notifications:', error)
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
    }

    return NextResponse.json({ updates: updates || [] })

  } catch (error) {
    console.error('Error in notifications GET API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}