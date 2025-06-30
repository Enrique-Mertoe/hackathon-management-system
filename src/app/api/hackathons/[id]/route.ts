import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {supabase} from "@/lib/supabase.server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const  sp  = (await supabase())
    // Verify authentication
    const user = await auth.getCurrentUser(sp)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = params

    // Fetch hackathon by ID
    const { data: hackathon, error } = await sp
      .from('hackathons')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Hackathon not found' },
          { status: 404 }
        )
      }
      console.error('Error fetching hackathon:', error)
      return NextResponse.json(
        { error: 'Failed to fetch hackathon' },
        { status: 500 }
      )
    }

    // Check if user has permission to view this hackathon
    // For now, we'll allow organizers and admins to view any hackathon
    // You might want to add more specific permissions later
    if (user.role !== 'ORGANIZER' && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

    return NextResponse.json(hackathon)
  } catch (error) {
    console.error('Error in GET /api/hackathons/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const user = await auth.getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user is an organizer or admin
    if (user.role !== 'ORGANIZER' && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only organizers and admins can update hackathons' },
        { status: 403 }
      )
    }

    const { id } = params
    const body = await request.json()
    const  sp  = (await supabase())

    // First check if hackathon exists and user has permission
    const { data: existingHackathon, error: fetchError } = await sp
      .from('hackathons')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Hackathon not found' },
          { status: 404 }
        )
      }
      console.error('Error fetching hackathon:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch hackathon' },
        { status: 500 }
      )
    }

    // For organization-specific permissions, you might want to check
    // if user belongs to the organization that created this hackathon
    // This would require joining with organizations table

    // Update hackathon
    const { data: updatedHackathon, error: updateError } = await sp
      .from('hackathons')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating hackathon:', updateError)
      return NextResponse.json(
        { error: 'Failed to update hackathon' },
        { status: 500 }
      )
    }

    return NextResponse.json(updatedHackathon)
  } catch (error) {
    console.error('Error in PUT /api/hackathons/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const user = await auth.getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user is an organizer or admin
    if (user.role !== 'ORGANIZER' && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only organizers and admins can delete hackathons' },
        { status: 403 }
      )
    }

    const { id } = params
    const  sp  = (await supabase())
    // First check if hackathon exists
    const { data: existingHackathon, error: fetchError } = await sp
      .from('hackathons')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Hackathon not found' },
          { status: 404 }
        )
      }
      console.error('Error fetching hackathon:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch hackathon' },
        { status: 500 }
      )
    }

    // Delete hackathon
    const { error: deleteError } = await sp
      .from('hackathons')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting hackathon:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete hackathon' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Hackathon deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/hackathons/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}