import {NextRequest, NextResponse} from 'next/server'
import {auth} from '@/lib/auth'
import {supabaseAdmin} from "@/lib/supabase.admin";
import {supabase} from "@/lib/supabase.server";

// GET /api/hackathons - List hackathons with filtering and pagination
export async function GET(request: NextRequest) {
    try {
        const {searchParams} = new URL(request.url)

        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const status = searchParams.get('status')
        const theme = searchParams.get('theme')
        const difficulty = searchParams.get('difficulty')
        const organise = searchParams.get('organise')
        const featured = searchParams.get('featured')
        const search = searchParams.get('search')
        const organizer_id = searchParams.get('organizer_id')

        const offset = (page - 1) * limit

        let query = (await supabase())
            .from('hackathons')
            .select(`
        *,
        organizations (
          id,
          name,
          logo_url,
          verification_status
        )
      `)
        const user = await auth.getCurrentUser((await supabase()))

        if (organise && (!user || !auth.hasRole(user, 'ORGANIZER'))) {
            return NextResponse.json(
                {error: 'Unauthorized - Organizer role required'},
                {status: 403}
            )
        }

        // Filter by organizer if specified (for organizer dashboard)
        if (organizer_id) {
            if (!user || (!auth.hasRole(user, 'ORGANIZER') && user.id !== organizer_id)) {
                return NextResponse.json(
                    {error: 'Unauthorized - Can only view your own hackathons'},
                    {status: 403}
                )
            }
            query = query.eq('organizer_id', organizer_id)
        }

        // Apply filters
        if (status) {
            query = query.eq('status', status)
        }

        if (theme) {
            query = query.eq('theme', theme)
        }

        if (difficulty) {
            query = query.eq('difficulty_level', difficulty)
        }

        if (featured === 'true') {
            query = query.eq('featured', true)
        }

        if (search) {
            query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
        }

        const statuses = ['PUBLISHED', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'ACTIVE', 'JUDGING', 'COMPLETED']
        if (organise)
            statuses.push('DRAFT')
        // Only show published hackathons for public access
        query = query.in('status', statuses)

        const {data: hackathons, error, count} = await query
            .order('created_at', {ascending: false})
            .range(offset, offset + limit - 1)

        if (error) {
            return NextResponse.json(
                {error: error.message},
                {status: 500}
            )
        }

        return NextResponse.json({
            hackathons,
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit)
            }
        })

    } catch (error) {
        console.error('Error fetching hackathons:', error)
        return NextResponse.json(
            {error: 'Internal server error'},
            {status: 500}
        )
    }
}

// POST /api/hackathons - Create new hackathon (organizers only)
export async function POST(request: NextRequest) {
    try {
        const user = await auth.getCurrentUser((await supabase()))

        if (!user || !auth.hasRole(user, 'ORGANIZER')) {
            return NextResponse.json(
                {error: 'Unauthorized - Organizer role required'},
                {status: 403}
            )
        }

        const hackathonData = await request.json()

        // Validate required fields
        const requiredFields = ['title', 'description', 'registration_start', 'registration_end', 'start_date', 'end_date', 'timezone']
        for (const field of requiredFields) {
            if (!hackathonData[field]) {
                return NextResponse.json(
                    {error: `${field} is required`},
                    {status: 400}
                )
            }
        }

        // Generate slug from title
        const slug = hackathonData.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-')

        const {data: hackathon, error} = await supabaseAdmin
            .from('hackathons')
            .insert({
                ...hackathonData,
                slug,
                status: 'DRAFT',
                organizer_id: user.id // Ensure organizer_id is set to current user
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json(
                {error: error.message},
                {status: 400}
            )
        }

        return NextResponse.json({
            message: 'Hackathon created successfully',
            hackathon
        })

    } catch (error) {
        console.error('Error creating hackathon:', error)
        return NextResponse.json(
            {error: 'Internal server error'},
            {status: 500}
        )
    }
}