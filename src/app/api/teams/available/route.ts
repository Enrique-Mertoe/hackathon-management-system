import {NextRequest, NextResponse} from 'next/server'
import { supabase } from '@/lib/supabase.server'
import {auth} from '@/lib/auth'

export async function GET(request: NextRequest) {
    try {
        const sb = await supabase()
        // Get current user
        const user = await auth.getCurrentUser(sb)
        if (!user) {
            return NextResponse.json(
                {error: 'Unauthorized'},
                {status: 401}
            )
        }

        const url = new URL(request.url)
        const limit = parseInt(url.searchParams.get('limit') || '20')
        const offset = parseInt(url.searchParams.get('offset') || '0')
        const status = url.searchParams.get('status')

        // Build query for teams looking for members
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
          status,
          start_date,
          end_date
        ),
        leader:users!teams_leader_id_fkey(
          id,
          username,
          full_name,
          avatar_url
        )
      `)
            .eq('looking_for_members', true)
            .in('hackathons.status', ['REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'ACTIVE'])

        // Filter by status if provided
        if (status && status !== 'all') {
            query = query.eq('status', status)
        }

        const {data: teams, error} = await query
            .order('created_at', {ascending: false})
            .range(offset, offset + limit - 1)

        if (error) {
            console.error('Error fetching available teams:', error)
            return NextResponse.json(
                {error: 'Failed to fetch teams'},
                {status: 500}
            )
        }

        // Get member counts for each team
        const teamIds = teams?.map(team => team.id) || []
        let memberCounts: Record<string, number> = {}

        if (teamIds.length > 0) {
            const {data: memberCountData} = await sb
                .from('team_members')
                .select('team_id')
                .in('team_id', teamIds)

            memberCounts = memberCountData?.reduce((acc, member) => {
                acc[member.team_id] = (acc[member.team_id] || 0) + 1
                return acc
            }, {} as Record<string, number>) || {}
        }

        // Check which teams the current user is already a member of
        const {data: userMemberships} = await sb
            .from('team_members')
            .select('team_id')
            .eq('user_id', user.id)
            .in('team_id', teamIds)

        const userTeamIds = new Set(userMemberships?.map(m => m.team_id) || [])

        // Transform the data
        const availableTeams = teams?.map(team => ({
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
                hackathon_status: team.hackathons.status,
                //@ts-ignore
                hackathon_start_date: team.hackathons.start_date,
                //@ts-ignore
                hackathon_end_date: team.hackathons.end_date,
                is_member: userTeamIds.has(team.id)
            }))
                .filter(team => !team.is_member) // Only show teams the user is not already a member of
            || []

        // Get total count for pagination
        const {count: totalCount} = await sb
            .from('teams')
            .select('*', {count: 'exact', head: true})
            .eq('looking_for_members', true)
            .in('hackathons.status', ['REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'ACTIVE'])

        return NextResponse.json({
            teams: availableTeams,
            total: totalCount || 0,
            limit,
            offset,
            has_more: (offset + limit) < (totalCount || 0)
        })

    } catch (error) {
        console.error('Error in available teams API:', error)
        return NextResponse.json(
            {error: 'Internal server error'},
            {status: 500}
        )
    }
}