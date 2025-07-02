import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase.admin'
import { supabase } from '@/lib/supabase.server'

// PATCH /api/hackathons/[id]/publish - Publish a hackathon (change status from DRAFT to PUBLISHED)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await auth.getCurrentUser(await supabase())
    
    if (!user || !auth.hasRole(user, 'ORGANIZER')) {
      return NextResponse.json(
        { error: 'Unauthorized - Organizer role required' },
        { status: 403 }
      )
    }

    const hackathonId = params.id

    // First, check if the hackathon exists and belongs to an organizer
    const { data: existingHackathon, error: fetchError } = await supabaseAdmin
      .from('hackathons')
      .select('id, status, organizer_id')
      .eq('id', hackathonId)
      .single()

    if (fetchError || !existingHackathon) {
      return NextResponse.json(
        { error: 'Hackathon not found' },
        { status: 404 }
      )
    }

    // Check if the hackathon is in DRAFT status
    if (existingHackathon.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Hackathon is not in draft status' },
        { status: 400 }
      )
    }

    // Update the hackathon status to PUBLISHED
    const { data: hackathon, error } = await supabaseAdmin
      .from('hackathons')
      .update({ 
        status: 'PUBLISHED',
        updated_at: new Date().toISOString()
      })
      .eq('id', hackathonId)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Hackathon published successfully',
      hackathon
    })

  } catch (error) {
    console.error('Error publishing hackathon:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}