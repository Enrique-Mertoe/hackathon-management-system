import {NextRequest, NextResponse} from 'next/server'
import {auth} from '@/lib/auth'
import {supabase} from "@/lib/supabase.server";

export async function PATCH(
    request: NextRequest,
    {params}: any
) {
    try {
        const hackathonId = (await params).id
        const sb = await supabase()
        // Get current user
        const user = await auth.getCurrentUser(sb)
        if (!user) {
            return NextResponse.json(
                {error: 'Unauthorized'},
                {status: 401}
            )
        }
        // Check if user is an organizer
        if (user.role !== 'ORGANIZER') {
            return NextResponse.json(
                {error: 'Access denied. Organizer role required.'},
                {status: 403}
            )
        }

        const {status} = await request.json()

        if (!status) {
            return NextResponse.json(
                {error: 'Status is required'},
                {status: 400}
            )
        }

        // Validate status transition
        const validStatuses = [
            'DRAFT',
            'PUBLISHED',
            'REGISTRATION_OPEN',
            'REGISTRATION_CLOSED',
            'ACTIVE',
            'JUDGING',
            'COMPLETED',
            'CANCELLED'
        ]

        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                {error: 'Invalid status'},
                {status: 400}
            )
        }

        // Get current hackathon
        const {data: hackathon, error: hackathonError} = await sb
            .from('hackathons')
            .select('id, status, organizer_id, registration_start, registration_end, start_date, end_date')
            .eq('id', hackathonId)
            .single()

        if (hackathonError || !hackathon) {
            return NextResponse.json(
                {error: 'Hackathon not found'},
                {status: 404}
            )
        }

        // Check if user owns this hackathon
        if (hackathon.organizer_id !== user.id && user.role !== 'ORGANIZER') {
            return NextResponse.json(
                {error: 'Access denied. You can only update your own hackathons.'},
                {status: 403}
            )
        }

        // Validate status transitions
        const currentStatus = hackathon.status
        const now = new Date()
        const registrationStart = new Date(hackathon.registration_start)
        const registrationEnd = new Date(hackathon.registration_end)
        const eventStart = new Date(hackathon.start_date)
        const eventEnd = new Date(hackathon.end_date)

        // Define valid transitions
        const validTransitions: Record<string, string[]> = {
            'DRAFT': ['PUBLISHED'],
            'PUBLISHED': ['REGISTRATION_OPEN', 'CANCELLED'],
            'REGISTRATION_OPEN': ['REGISTRATION_CLOSED', 'CANCELLED'],
            'REGISTRATION_CLOSED': ['ACTIVE', 'CANCELLED'],
            'ACTIVE': ['JUDGING', 'COMPLETED', 'CANCELLED'],
            'JUDGING': ['COMPLETED', 'CANCELLED'],
            'COMPLETED': [],
            'CANCELLED': []
        }

        if (!validTransitions[currentStatus]?.includes(status)) {
            return NextResponse.json(
                {error: `Cannot transition from ${currentStatus} to ${status}`},
                {status: 400}
            )
        }

        // Additional validation for specific transitions
        if (status === 'REGISTRATION_OPEN') {
            if (now > registrationEnd) {
                return NextResponse.json(
                    {error: 'Cannot open registration after registration end date'},
                    {status: 400}
                )
            }
        }

        if (status === 'ACTIVE') {
            if (now < eventStart) {
                return NextResponse.json(
                    {error: 'Cannot activate event before start date'},
                    {status: 400}
                )
            }
        }

        // Update hackathon status
        const {data: updatedHackathon, error: updateError} = await sb
            .from('hackathons')
            .update({
                status,
                updated_at: new Date().toISOString()
            })
            .eq('id', hackathonId)
            .select()
            .single()

        if (updateError) {
            console.error('Error updating hackathon status:', updateError)
            return NextResponse.json(
                {error: 'Failed to update hackathon status'},
                {status: 500}
            )
        }

        return NextResponse.json({
            success: true,
            message: `Hackathon status updated to ${status}`,
            hackathon: updatedHackathon
        })

    } catch (error) {
        console.error('Error in hackathon status API:', error)
        return NextResponse.json(
            {error: 'Internal server error'},
            {status: 500}
        )
    }
}