import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { auth } from '@/lib/auth'
import { supabase } from '@/lib/supabase.server'

// GET - Fetch specific schedule event
export async function GET(
  request: NextRequest, 
  { params }: any
) {
  try {
    const awaparams = await params
    const sb = await supabase()
    const currentUser = await auth.getCurrentUser(sb)
    if (!currentUser || !auth.hasRole(currentUser, 'ORGANIZER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: event, error } = await sb
      .from('schedule_events')
      .select(`
        *,
        hackathons!inner(
          id,
          title,
          organizer_id
        )
      `)
      .eq('id', awaparams.id)
      .eq('hackathons.organizer_id', currentUser.id)
      .single()

    if (error || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json({ event })

  } catch (error) {
    console.error('Error fetching schedule event:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update schedule event
export async function PUT(
  request: NextRequest, 
  { params }:any
) {
  try {
    const awaparams = await params
    const sb = await supabase()
    const currentUser = await auth.getCurrentUser(sb)
    if (!currentUser || !auth.hasRole(currentUser, 'ORGANIZER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      startTime,
      endTime,
      eventType,
      status,
      location,
      isVirtual,
      capacity,
      facilitatorId
    } = body

    // Verify the event belongs to the current user's hackathon
    const { data: existingEvent, error: fetchError } = await sb
      .from('schedule_events')
      .select(`
        id,
        hackathons!inner(
          organizer_id
        )
      `)
      .eq('id', awaparams.id)
      .eq('hackathons.organizer_id', currentUser.id)
      .single()

    if (fetchError || !existingEvent) {
      return NextResponse.json({ error: 'Event not found or access denied' }, { status: 404 })
    }

    // Update the event
    const { data: updatedEvent, error } = await sb
      .from('schedule_events')
      .update({
        title,
        description,
        start_time: startTime,
        end_time: endTime,
        event_type: eventType,
        status,
        location,
        is_virtual: isVirtual,
        capacity,
        facilitator_id: facilitatorId,
        updated_at: new Date().toISOString()
      })
      .eq('id', awaparams.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating schedule event:', error)
      return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
    }

    return NextResponse.json({ event: updatedEvent })

  } catch (error) {
    console.error('Error in schedule event PUT API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete schedule event
export async function DELETE(
  request: NextRequest, 
  { params }:any
) {
  try {
    const awaparams = await params
    const sb = await supabase()
    const currentUser = await auth.getCurrentUser(sb)
    if (!currentUser || !auth.hasRole(currentUser, 'ORGANIZER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the event belongs to the current user's hackathon
    const { data: existingEvent, error: fetchError } = await sb
      .from('schedule_events')
      .select(`
        id,
        hackathons!inner(
          organizer_id
        )
      `)
      .eq('id', awaparams.id)
      .eq('hackathons.organizer_id', currentUser.id)
      .single()

    if (fetchError || !existingEvent) {
      return NextResponse.json({ error: 'Event not found or access denied' }, { status: 404 })
    }

    // Delete the event
    const { error } = await sb
      .from('schedule_events')
      .delete()
      .eq('id', awaparams.id)

    if (error) {
      console.error('Error deleting schedule event:', error)
      return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error in schedule event DELETE API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}