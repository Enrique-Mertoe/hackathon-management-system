import { NextRequest, NextResponse } from 'next/server'
import { supabase} from '@/lib/supabase'
import { auth } from '@/lib/auth'
import {supabaseAdmin} from "@/lib/supabase.admin";

// GET /api/hackathons - List hackathons with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const theme = searchParams.get('theme')
    const difficulty = searchParams.get('difficulty')
    const featured = searchParams.get('featured')
    const search = searchParams.get('search')
    
    const offset = (page - 1) * limit

    let query = supabase
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

    // Only show published hackathons for public access
    query = query.in('status', ['PUBLISHED', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'ACTIVE', 'JUDGING', 'COMPLETED'])

    const { data: hackathons, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
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
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/hackathons - Create new hackathon (organizers only)
export async function POST(request: NextRequest) {
  try {
    const user = await auth.getCurrentUser()
    
    if (!user || !auth.hasRole(user, 'ORGANIZER')) {
      return NextResponse.json(
        { error: 'Unauthorized - Organizer role required' },
        { status: 403 }
      )
    }

    const hackathonData = await request.json()

    // Validate required fields
    const requiredFields = ['title', 'description', 'registration_start', 'registration_end', 'start_date', 'end_date', 'timezone']
    for (const field of requiredFields) {
      if (!hackathonData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
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

    const { data: hackathon, error } = await supabaseAdmin
      .from('hackathons')
      .insert({
        ...hackathonData,
        slug,
        status: 'DRAFT'
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Hackathon created successfully',
      hackathon
    })

  } catch (error) {
    console.error('Error creating hackathon:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}