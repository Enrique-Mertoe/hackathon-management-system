import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabase } from '@/lib/supabase.server'
import { executeAIDataRequest, AIDataRequest, DATABASE_SCHEMA } from '@/lib/ai-data-service'

export async function POST(request: NextRequest) {
  try {
    const sb = await supabase()
    // Get current user
    const { user, error: authError } = await auth.getSession(sb)
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { dataRequests } = await request.json()
    
    if (!dataRequests || !Array.isArray(dataRequests)) {
      return NextResponse.json(
        { error: 'dataRequests array is required' },
        { status: 400 }
      )
    }

    const results = []

    for (const dataRequest of dataRequests as AIDataRequest[]) {
      try {
        // Add security filters based on user role and ownership
        const secureRequest = addSecurityFilters(dataRequest, user)
        
        const data = await executeAIDataRequest(secureRequest)
        
        results.push({
          table: dataRequest.table,
          caption: dataRequest.caption,
          data,
          success: true
        })
      } catch (error) {
        console.error(`Error executing data request for ${dataRequest.table}:`, error)
        results.push({
          table: dataRequest.table,
          caption: dataRequest.caption,
          error: error instanceof Error ? error.message : 'Unknown error',
          success: false
        })
      }
    }

    return NextResponse.json({
      results,
      schema: DATABASE_SCHEMA // Include schema for AI reference
    })

  } catch (error) {
    console.error('Error in AI data API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Add security filters based on user role and data access permissions
function addSecurityFilters(request: AIDataRequest, user: any): AIDataRequest {
  const secureRequest = { ...request }

  // For organizers, filter data to their own hackathons and related data
  if (user.role === 'ORGANIZER') {
    switch (request.table) {
      case 'hackathons':
        // Only show hackathons created by this organizer
        secureRequest.filters = [...request.filters, ['organizer_id', user.id]]
        break
        
      case 'hackathon_registrations':
        // Only show registrations for their hackathons
        secureRequest.select = [...request.select]
        if (!secureRequest.select.includes('hackathons!inner(organizer_id)')) {
          secureRequest.select.push('hackathons!inner(organizer_id)')
        }
        secureRequest.filters = [...request.filters, ['hackathons.organizer_id', user.id]]
        break
        
      case 'teams':
        // Only show teams from their hackathons
        secureRequest.select = [...request.select]
        if (!secureRequest.select.includes('hackathons!inner(organizer_id)')) {
          secureRequest.select.push('hackathons!inner(organizer_id)')
        }
        secureRequest.filters = [...request.filters, ['hackathons.organizer_id', user.id]]
        break
        
      case 'team_members':
        // Only show team members from their hackathons
        secureRequest.select = [...request.select]
        if (!secureRequest.select.includes('teams!inner(hackathons!inner(organizer_id))')) {
          secureRequest.select.push('teams!inner(hackathons!inner(organizer_id))')
        }
        secureRequest.filters = [...request.filters, ['teams.hackathons.organizer_id', user.id]]
        break
        
      case 'participant_feedback':
        // Only show feedback for their hackathons
        secureRequest.select = [...request.select]
        if (!secureRequest.select.includes('hackathons!inner(organizer_id)')) {
          secureRequest.select.push('hackathons!inner(organizer_id)')
        }
        secureRequest.filters = [...request.filters, ['hackathons.organizer_id', user.id]]
        break
        
      case 'hackathon_views':
        // Only show views for their hackathons
        secureRequest.select = [...request.select]
        if (!secureRequest.select.includes('hackathons!inner(organizer_id)')) {
          secureRequest.select.push('hackathons!inner(organizer_id)')
        }
        secureRequest.filters = [...request.filters, ['hackathons.organizer_id', user.id]]
        break
        
      case 'users':
        // For privacy, limit user data access
        secureRequest.select = secureRequest.select.filter(col => 
          !['email', 'stripe_customer_id', 'preferences'].includes(col)
        )
        break
    }
  }

  // For participants, even more restrictive access
  if (user.role === 'PARTICIPANT') {
    switch (request.table) {
      case 'hackathons':
        // Only show published/active hackathons
        secureRequest.filters = [...request.filters, ['status', 'in', ['PUBLISHED', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'ACTIVE', 'JUDGING', 'COMPLETED']]]
        break
        
      case 'users':
        // Very limited user data for participants
        secureRequest.select = secureRequest.select.filter(col => 
          ['id', 'username', 'full_name', 'avatar_url', 'github_username', 'skills', 'role'].includes(col)
        )
        break
        
      default:
        // For most other tables, participants shouldn't have direct access
        secureRequest.filters = [...request.filters, ['id', 'is', null]] // Return no results
    }
  }

  return secureRequest
}