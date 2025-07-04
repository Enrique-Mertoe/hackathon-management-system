import { NextRequest, NextResponse } from 'next/server'
import {supabase} from "@/lib/supabase.server";
import { auth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {

    const sb = await supabase()
    // Get current user
    const user = await auth.getCurrentUser(sb)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const teamData = await request.json()

    // Validate required fields
    const requiredFields = ['name', 'hackathon_id']
    for (const field of requiredFields) {
      if (!teamData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
    }

    // Validate team size constraints
    if (teamData.min_team_size > teamData.max_team_size) {
      return NextResponse.json(
        { error: 'Minimum team size cannot be greater than maximum team size' },
        { status: 400 }
      )
    }

    // Check if hackathon exists and is accepting registrations
    const { data: hackathon, error: hackathonError } = await sb
      .from('hackathons')
      .select('id, title, status, registration_end')
      .eq('id', teamData.hackathon_id)
      .single()

    if (hackathonError || !hackathon) {
      return NextResponse.json(
        { error: 'Hackathon not found' },
        { status: 404 }
      )
    }

    // Check if hackathon is still accepting registrations
    const now = new Date().toISOString()
    if (hackathon.registration_end < now) {
      return NextResponse.json(
        { error: 'Registration period for this hackathon has ended' },
        { status: 400 }
      )
    }

    if (!['REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'ACTIVE'].includes(hackathon.status)) {
      return NextResponse.json(
        { error: 'This hackathon is not accepting team registrations' },
        { status: 400 }
      )
    }

    // Check if user is already part of a team for this hackathon
    const { data: existingTeamMembership } = await sb
      .from('team_members')
      .select(`
        teams!inner(
          hackathon_id
        )
      `)
      .eq('user_id', user.id)
      .eq('teams.hackathon_id', teamData.hackathon_id)

    if (existingTeamMembership && existingTeamMembership.length > 0) {
      return NextResponse.json(
        { error: 'You are already part of a team for this hackathon' },
        { status: 400 }
      )
    }

    // Check if user is registered for the hackathon
    const { data: registration } = await sb
      .from('hackathon_registrations')
      .select('id')
      .eq('hackathon_id', teamData.hackathon_id)
      .eq('user_id', user.id)
      .single()

    if (!registration) {
      return NextResponse.json(
        { error: 'You must be registered for the hackathon to create a team' },
        { status: 400 }
      )
    }

    // Create the team
    const { data: team, error: teamError } = await sb
      .from('teams')
      .insert({
        name: teamData.name,
        description: teamData.description || null,
        hackathon_id: teamData.hackathon_id,
        leader_id: user.id,
        skills_wanted: teamData.skills_wanted || [],
        min_team_size: teamData.min_team_size || 2,
        max_team_size: teamData.max_team_size || 5,
        looking_for_members: teamData.looking_for_members !== false,
        status: 'RECRUITING',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (teamError) {
      console.error('Error creating team:', teamError)
      return NextResponse.json(
        { error: 'Failed to create team' },
        { status: 500 }
      )
    }

    // Add the creator as the team leader
    const { error: memberError } = await sb
      .from('team_members')
      .insert({
        team_id: team.id,
        user_id: user.id,
        role: 'LEADER',
        joined_at: new Date().toISOString()
      })

    if (memberError) {
      console.error('Error adding team leader:', memberError)
      // Clean up the team if adding the leader fails
      await sb.from('teams').delete().eq('id', team.id)
      return NextResponse.json(
        { error: 'Failed to create team membership' },
        { status: 500 }
      )
    }

    // Update hackathon registration to include team_id
    await sb
      .from('hackathon_registrations')
      .update({ team_id: team.id })
      .eq('hackathon_id', teamData.hackathon_id)
      .eq('user_id', user.id)

    return NextResponse.json({
      success: true,
      message: `Team "${team.name}" created successfully`,
      team: {
        id: team.id,
        name: team.name,
        description: team.description,
        hackathon_id: team.hackathon_id,
        status: team.status,
        looking_for_members: team.looking_for_members,
        member_count: 1,
        role: 'LEADER'
      }
    })

  } catch (error) {
    console.error('Error in create team API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get current user
    const sb = await supabase()
    const { user, error: authError } = await auth.getSession(sb)
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const offset = parseInt(url.searchParams.get('offset') || '0')
    const hackathon_id = url.searchParams.get('hackathon_id')

    // Build query for teams
    let query = sb
      .from('teams')
      .select(`
        id,
        name,
        description,
        status,
        looking_for_members,
        skills_wanted,
        min_team_size,
        max_team_size,
        created_at,
        hackathons!inner(
          id,
          title,
          status
        ),
        leader:users!teams_leader_id_fkey(
          id,
          username,
          full_name,
          avatar_url
        )
      `)

    // Filter by hackathon if specified
    if (hackathon_id) {
      query = query.eq('hackathon_id', hackathon_id)
    }

    const { data: teams, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching teams:', error)
      return NextResponse.json(
        { error: 'Failed to fetch teams' },
        { status: 500 }
      )
    }

    // Get member counts for each team
    const teamIds = teams?.map(team => team.id) || []
    let memberCounts: Record<string, number> = {}

    if (teamIds.length > 0) {
      const { data: memberCountData } = await sb
        .from('team_members')
        .select('team_id')
        .in('team_id', teamIds)

      memberCounts = memberCountData?.reduce((acc, member) => {
        acc[member.team_id] = (acc[member.team_id] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}
    }

    // Transform the data
    const teamsWithCounts = teams?.map(team => ({
      id: team.id,
      name: team.name,
      description: team.description,
      //@ts-ignore
      hackathon_title: team.hackathons.title,
      //@ts-ignore
      hackathon_id: team.hackathons.id,
      //@ts-ignore
      leader_id: team.leader.id,
      //@ts-ignore
      leader_name: team.leader.full_name,
      //@ts-ignore
      leader_username: team.leader.username,
      //@ts-ignore
      leader_avatar: team.leader.avatar_url,
      status: team.status,
      looking_for_members: team.looking_for_members,
      skills_wanted: team.skills_wanted || [],
      member_count: memberCounts[team.id] || 0,
      max_members: team.max_team_size || 5,
      min_members: team.min_team_size || 1,
      created_at: team.created_at,
      //@ts-ignore
      hackathon_status: team.hackathons.status
    })) || []

    return NextResponse.json({
      teams: teamsWithCounts,
      total: teams?.length || 0,
      limit,
      offset
    })

  } catch (error) {
    console.error('Error in teams API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}