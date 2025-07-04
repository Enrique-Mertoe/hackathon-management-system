import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase.server'
import { auth } from '@/lib/auth'

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

    // Get user's teams with hackathon details
    const { data: teams, error } = await sb
      .from('team_members')
      .select(`
        id,
        role,
        joined_at,
        teams!inner(
          id,
          name,
          description,
          status,
          hackathons!inner(
            id,
            title,
            status
          )
        )
      `)
      .eq('user_id', user.id)
      .order('joined_at', { ascending: false })

    if (error) {
      console.error('Error fetching user teams:', error)
      return NextResponse.json(
        { error: 'Failed to fetch teams' },
        { status: 500 }
      )
    }

    // Transform the data to a more usable format
    const userTeams = teams?.map(teamMember => ({
      //@ts-ignore
      id: teamMember.teams.id,
      //@ts-ignore
      name: teamMember.teams.name,
      //@ts-ignore
      description: teamMember.teams.description,
      //@ts-ignore
      hackathon_title: teamMember.teams.hackathons.title,
      //@ts-ignore
      hackathon_id: teamMember.teams.hackathons.id,
      role: teamMember.role,
      //@ts-ignore
      status: teamMember.teams.status,
      member_count: 0, // Will be populated by a separate query if needed
      joined_at: teamMember.joined_at
    })) || []

    // Get member counts for each team
    if (userTeams.length > 0) {
      const teamIds = userTeams.map(team => team.id)
      const { data: memberCounts } = await sb
        .from('team_members')
        .select('team_id')
        .in('team_id', teamIds)

      // Count members for each team
      const memberCountMap = memberCounts?.reduce((acc, member) => {
        acc[member.team_id] = (acc[member.team_id] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      // Update member counts
      userTeams.forEach(team => {
        team.member_count = memberCountMap[team.id] || 0
      })
    }

    return NextResponse.json({
      teams: userTeams,
      total: userTeams.length
    })

  } catch (error) {
    console.error('Error in user teams API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}