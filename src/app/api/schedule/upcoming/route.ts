import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { auth } from '@/lib/auth'
import {supabase} from "@/lib/supabase.server";

export async function GET(request: NextRequest) {
  try {
      const sb = await supabase()
    // Get current user from auth
    const currentUser = await auth.getCurrentUser(sb)
    if (!currentUser || !auth.hasRole(currentUser, 'ORGANIZER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    // Get organizer's hackathons with upcoming events
    const { data: hackathons, error: hackathonsError } = await sb
      .from('hackathons')
      .select(`
        id,
        title,
        status,
        start_date,
        registration_end,
        registration_count,
        max_participants
      `)
      .eq('organizer_id', currentUser.id)
      .in('status', ['PUBLISHED', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'ACTIVE'])
      .order('start_date', { ascending: true })
      .limit(limit)

    if (hackathonsError) {
      console.error('Error fetching hackathons:', hackathonsError)
      return NextResponse.json({ error: 'Failed to fetch hackathons' }, { status: 500 })
    }

    // Get next upcoming event for each hackathon
    const upcomingEvents = await Promise.all(
      (hackathons || []).map(async (hackathon) => {
        // Find the next upcoming event for this hackathon
        const { data: nextEvent } = await sb
          .from('schedule_events')
          .select('title, start_time')
          .eq('hackathon_id', hackathon.id)
          .eq('status', 'UPCOMING')
          .gte('start_time', new Date().toISOString())
          .order('start_time', { ascending: true })
          .limit(1)
          .single()

        // Calculate time until next event or hackathon start
        let nextEventTitle = 'Hackathon Start'
        let nextEventTime = new Date(hackathon.start_date)

        if (nextEvent) {
          nextEventTitle = nextEvent.title
          nextEventTime = new Date(nextEvent.start_time)
        }

        const now = new Date()
        const timeDiff = nextEventTime.getTime() - now.getTime()
        const daysUntil = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
        
        let timeUntil = ''
        if (daysUntil === 0) {
          const hoursUntil = Math.ceil(timeDiff / (1000 * 60 * 60))
          timeUntil = hoursUntil <= 0 ? 'Now' : `${hoursUntil}h`
        } else if (daysUntil === 1) {
          timeUntil = 'Tomorrow'
        } else if (daysUntil <= 7) {
          timeUntil = `${daysUntil} days`
        } else if (daysUntil <= 30) {
          const weeksUntil = Math.ceil(daysUntil / 7)
          timeUntil = `${weeksUntil} week${weeksUntil > 1 ? 's' : ''}`
        } else {
          const monthsUntil = Math.ceil(daysUntil / 30)
          timeUntil = `${monthsUntil} month${monthsUntil > 1 ? 's' : ''}`
        }

        // Determine event status
        let eventStatus = hackathon.status
        const registrationEndDate = new Date(hackathon.registration_end)
        
        if (hackathon.status === 'REGISTRATION_OPEN' && now > registrationEndDate) {
          eventStatus = 'REGISTRATION_CLOSED'
        }

        return {
          id: hackathon.id,
          hackathon: hackathon.title,
          nextEvent: nextEventTitle,
          timeUntil,
          status: eventStatus,
          registrationCount: hackathon.registration_count || 0,
          maxParticipants: hackathon.max_participants || 0,
          registrationPercentage: hackathon.max_participants 
            ? Math.round(((hackathon.registration_count || 0) / hackathon.max_participants) * 100)
            : 0
        }
      })
    )

    return NextResponse.json({ events: upcomingEvents })

  } catch (error) {
    console.error('Error in upcoming events API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}