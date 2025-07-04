import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {supabase} from "@/lib/supabase.server";

export async function GET(request: NextRequest) {
  try {
    const sb = await supabase()
    const user = await auth.getCurrentUser(sb)
    if (!user || !auth.hasRole(user, 'ORGANIZER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // For now, return mock data - replace with actual database queries
    const stats = {
      totalHackathons: 5,
      activeHackathons: 2,
      totalParticipants: 247,
      totalPrizePool: 25000,
      draftHackathons: 1,
      completedHackathons: 2,
      avgParticipationRate: 85,
      eventSuccessRate: 92
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching organizer stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}