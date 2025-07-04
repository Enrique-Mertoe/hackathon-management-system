import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { auth } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const teamId = params.id

    // Get current user
    const { user, error: authError } = await auth.getSession()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if team exists and is looking for members
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select(`
        id,
        name,
        looking_for_members,
        status,
        max_team_size,
        hackathon_id,
        hackathons!inner(
          id,
          status,
          registration_end
        )
      `)
      .eq('id', teamId)
      .single()

    if (teamError || !team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      )
    }

    // Check if team is still looking for members
    if (!team.looking_for_members) {
      return NextResponse.json(
        { error: 'Team is not currently looking for members' },
        { status: 400 }
      )
    }

    // Check if hackathon is still accepting registrations
    const now = new Date().toISOString()
    //@ts-ignore
    if (team.hackathons.registration_end < now) {
      return NextResponse.json(
        { error: 'Registration period for this hackathon has ended' },
        { status: 400 }
      )
    }

    // Check if user is already a member of this team
    const { data: existingMembership } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', teamId)
      .eq('user_id', user.id)
      .single()

    if (existingMembership) {
      return NextResponse.json(
        { error: 'You are already a member of this team' },
        { status: 400 }
      )
    }

    // Check if user is already in another team for this hackathon
    const { data: existingTeamMembership } = await supabase
      .from('team_members')
      .select(`
        teams!inner(
          hackathon_id
        )
      `)
      .eq('user_id', user.id)
      .eq('teams.hackathon_id', team.hackathon_id)

    if (existingTeamMembership && existingTeamMembership.length > 0) {
      return NextResponse.json(
        { error: 'You are already part of a team for this hackathon' },
        { status: 400 }
      )
    }

    // Check current team size
    const { data: currentMembers, count: memberCount } = await supabase
      .from('team_members')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', teamId)

    if (memberCount && memberCount >= team.max_team_size) {
      return NextResponse.json(
        { error: 'Team is already full' },
        { status: 400 }
      )
    }

    // Check if user is registered for the hackathon
    const { data: registration } = await supabase
      .from('hackathon_registrations')
      .select('id')
      .eq('hackathon_id', team.hackathon_id)
      .eq('user_id', user.id)
      .single()

    if (!registration) {
      return NextResponse.json(
        { error: 'You must be registered for the hackathon to join a team' },
        { status: 400 }
      )
    }

    // Add user to team
    const { data: newMembership, error: joinError } = await supabase
      .from('team_members')
      .insert({
        team_id: teamId,
        user_id: user.id,
        role: 'MEMBER',
        joined_at: new Date().toISOString()
      })
      .select()
      .single()

    if (joinError) {
      console.error('Error joining team:', joinError)
      return NextResponse.json(
        { error: 'Failed to join team' },
        { status: 500 }
      )
    }

    // Update team registration to include team_id
    await supabase
      .from('hackathon_registrations')
      .update({ team_id: teamId })
      .eq('hackathon_id', team.hackathon_id)
      .eq('user_id', user.id)

    // Check if team is now full and update looking_for_members status
    const newMemberCount = (memberCount || 0) + 1
    if (newMemberCount >= team.max_team_size) {
      await supabase
        .from('teams')
        .update({ 
          looking_for_members: false,
          status: 'FULL'
        })
        .eq('id', teamId)
    }

    return NextResponse.json({
      success: true,
      message: `Successfully joined team "${team.name}"`,
      membership: newMembership
    })

  } catch (error) {
    console.error('Error in join team API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}