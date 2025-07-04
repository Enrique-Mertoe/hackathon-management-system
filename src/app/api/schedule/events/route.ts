import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { auth } from '@/lib/auth'
import { supabase } from '@/lib/supabase.server'
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
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Build query for schedule events
    let query = sb
      .from('schedule_events')
      .select(`
        id,
        hackathon_id,
        title,
        description,
        start_time,
        end_time,
        event_type,
        status,
        location,
        is_virtual,
        capacity,
        facilitator_id,
        metadata,
        created_at,
        updated_at,
        hackathons!inner(
          id,
          title,
          organizer_id
        )
      `)
      .eq('hackathons.organizer_id', currentUser.id)
      .order('start_time', { ascending: true })
      .limit(limit)

    // Apply filters
    if (hackathonId) {
      query = query.eq('hackathon_id', hackathonId)
    }
    
    if (status) {
      query = query.eq('status', status)
    }

    const { data: scheduleEvents, error } = await query

    if (error) {
      console.error('Error fetching schedule events:', error)
      return NextResponse.json({ error: 'Failed to fetch schedule events' }, { status: 500 })
    }

    // Transform data to match frontend interface
    const transformedEvents = scheduleEvents?.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description || '',
      startTime: event.start_time,
      endTime: event.end_time,
      type: event.event_type,
      status: event.status,
      //@ts-ignore
      hackathon: event.hackathons?.title || 'Unknown Hackathon',
      location: event.location,
      isVirtual: event.is_virtual,
      capacity: event.capacity,
      facilitatorId: event.facilitator_id,
      metadata: event.metadata || {}
    })) || []

    return NextResponse.json({ events: transformedEvents })

  } catch (error) {
    console.error('Error in schedule events API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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
      title,
      description,
      startTime,
      endTime,
      eventType,
      location,
      isVirtual = true,
      capacity,
      facilitatorId
    } = body

    // Validate required fields
    if (!hackathonId || !title || !startTime || !endTime || !eventType) {
      return NextResponse.json({ 
        error: 'Missing required fields: hackathonId, title, startTime, endTime, eventType' 
      }, { status: 400 })
    }

    // Verify the hackathon belongs to the current user
    const { data: hackathon, error: hackathonError } = await sb
      .from('hackathons')
      .select('id, organizer_id')
      .eq('id', hackathonId)
      .eq('organizer_id', currentUser.id)
      .single()

    if (hackathonError || !hackathon) {
      return NextResponse.json({ error: 'Hackathon not found or access denied' }, { status: 404 })
    }

    // Create the schedule event
    const { data: newEvent, error } = await sb
      .from('schedule_events')
      .insert({
        hackathon_id: hackathonId,
        title,
        description,
        start_time: startTime,
        end_time: endTime,
        event_type: eventType,
        location,
        is_virtual: isVirtual,
        capacity,
        facilitator_id: facilitatorId,
        status: 'UPCOMING'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating schedule event:', error)
      return NextResponse.json({ error: 'Failed to create schedule event' }, { status: 500 })
    }

    return NextResponse.json({ event: newEvent }, { status: 201 })

  } catch (error) {
    console.error('Error in schedule events POST API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}