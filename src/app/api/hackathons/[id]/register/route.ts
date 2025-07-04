import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabase } from '@/lib/supabase.server'

export async function POST(
  request: NextRequest,
  { params }: any
) {
  try {
    const sb = await supabase()
    
    // Verify authentication
    const user = await auth.getCurrentUser(sb)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id: hackathonId } = await params

    // Check if hackathon exists and is accepting registrations
    const { data: hackathon, error: hackathonError } = await sb
      .from('hackathons')
      .select('*')
      .eq('id', hackathonId)
      .single()

    if (hackathonError || !hackathon) {
      return NextResponse.json(
        { error: 'Hackathon not found' },
        { status: 404 }
      )
    }

    // Check if registration is open
    if (hackathon.status !== 'REGISTRATION_OPEN') {
      return NextResponse.json(
        { error: 'Registration is not currently open for this hackathon' },
        { status: 400 }
      )
    }

    // Check if registration period is valid
    const now = new Date()
    const registrationStart = new Date(hackathon.registration_start)
    const registrationEnd = new Date(hackathon.registration_end)

    if (now < registrationStart || now > registrationEnd) {
      return NextResponse.json(
        { error: 'Registration period has ended or not yet started' },
        { status: 400 }
      )
    }

    // Check if user is already registered
    const { data: existingRegistration } = await sb
      .from('hackathon_registrations')
      .select('*')
      .eq('hackathon_id', hackathonId)
      .eq('user_id', user.id)
      .single()

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'You are already registered for this hackathon' },
        { status: 400 }
      )
    }

    // Check if hackathon is at capacity
    if (hackathon.max_participants && hackathon.registration_count >= hackathon.max_participants) {
      return NextResponse.json(
        { error: 'This hackathon has reached maximum capacity' },
        { status: 400 }
      )
    }

    // Create registration
    const { data: registration, error: registrationError } = await sb
      .from('hackathon_registrations')
      .insert({
        hackathon_id: hackathonId,
        user_id: user.id,
        status: 'PENDING',
        registration_data: {},
        completed: false,
        registered_at: new Date().toISOString()
      })
      .select()
      .single()

    if (registrationError) {
      console.error('Error creating registration:', registrationError)
      return NextResponse.json(
        { error: 'Failed to register for hackathon' },
        { status: 500 }
      )
    }

    // Update hackathon registration count
    const { error: updateError } = await sb
      .from('hackathons')
      .update({
        registration_count: hackathon.registration_count + 1
      })
      .eq('id', hackathonId)

    if (updateError) {
      console.error('Error updating registration count:', updateError)
      // Note: Registration was created but count update failed
      // This is a minor issue that doesn't affect the user
    }

    // Log the registration activity
    try {
      await sb.from('activity_logs').insert({
        user_id: user.id,
        action_type: 'HACKATHON_REGISTRATION',
        details: `Registered for hackathon: ${hackathon.title}`,
        metadata: { hackathon_id: hackathonId }
      })
    } catch (logError) {
      console.warn('Failed to log registration activity:', logError)
    }

    return NextResponse.json({
      message: 'Successfully registered for hackathon',
      registration,
      hackathon: {
        id: hackathon.id,
        title: hackathon.title
      }
    })
  } catch (error) {
    console.error('Error in POST /api/hackathons/[id]/register:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: any
) {
  try {
    const sb = await supabase()
    
    // Verify authentication
    const user = await auth.getCurrentUser(sb)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id: hackathonId } = await params

    // Check if user is registered
    const { data: registration, error: registrationError } = await sb
      .from('hackathon_registrations')
      .select('*')
      .eq('hackathon_id', hackathonId)
      .eq('user_id', user.id)
      .single()

    if (registrationError || !registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      )
    }

    // Get hackathon details for logging
    const { data: hackathon } = await sb
      .from('hackathons')
      .select('title, registration_count')
      .eq('id', hackathonId)
      .single()

    // Delete registration
    const { error: deleteError } = await sb
      .from('hackathon_registrations')
      .delete()
      .eq('hackathon_id', hackathonId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error deleting registration:', deleteError)
      return NextResponse.json(
        { error: 'Failed to unregister from hackathon' },
        { status: 500 }
      )
    }

    // Update hackathon registration count
    if (hackathon) {
      const { error: updateError } = await sb
        .from('hackathons')
        .update({
          registration_count: Math.max(0, hackathon.registration_count - 1)
        })
        .eq('id', hackathonId)

      if (updateError) {
        console.error('Error updating registration count:', updateError)
      }
    }

    // Log the unregistration activity
    try {
      await sb.from('activity_logs').insert({
        user_id: user.id,
        action_type: 'HACKATHON_UNREGISTRATION',
        details: `Unregistered from hackathon: ${hackathon?.title}`,
        metadata: { hackathon_id: hackathonId }
      })
    } catch (logError) {
      console.warn('Failed to log unregistration activity:', logError)
    }

    return NextResponse.json({
      message: 'Successfully unregistered from hackathon'
    })
  } catch (error) {
    console.error('Error in DELETE /api/hackathons/[id]/register:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to check registration status
export async function GET(
  request: NextRequest,
  { params }: any
) {
  try {
    const sb = await supabase()
    
    // Verify authentication
    const user = await auth.getCurrentUser(sb)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id: hackathonId } = await params

    // Check if user is registered
    const { data: registration, error: registrationError } = await sb
      .from('hackathon_registrations')
      .select('*')
      .eq('hackathon_id', hackathonId)
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({
      isRegistered: !!registration,
      registration: registration || null
    })
  } catch (error) {
    console.error('Error in GET /api/hackathons/[id]/register:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}