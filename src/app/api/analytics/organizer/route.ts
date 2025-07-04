import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase.server'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
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

    // Check if user is an organizer
    if (user.role !== 'ORGANIZER') {
      return NextResponse.json(
        { error: 'Access denied. Organizer role required.' },
        { status: 403 }
      )
    }

    const url = new URL(request.url)
    const period = url.searchParams.get('period') || '6months' // 6months, 1year, all
    
    // Calculate date range
    const now = new Date()
    let startDate: Date
    
    switch (period) {
      case '1year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        break
      case 'all':
        startDate = new Date('2020-01-01') // Platform start date
        break
      default: // 6months
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
    }

    // Get organizer's hackathons
    const { data: hackathons, error: hackathonsError } = await sb
      .from('hackathons')
      .select(`
        id,
        title,
        view_count,
        registration_count,
        start_date,
        end_date,
        status,
        created_at
      `)
      .eq('organizer_id', user.id)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })

    if (hackathonsError) {
      console.error('Error fetching hackathons:', hackathonsError)
      return NextResponse.json(
        { error: 'Failed to fetch hackathons' },
        { status: 500 }
      )
    }

    const hackathonIds = hackathons?.map(h => h.id) || []

    // Get total views across all hackathons
    const totalViews = hackathons?.reduce((sum, h) => sum + (h.view_count || 0), 0) || 0

    // Get total registrations
    const totalRegistrations = hackathons?.reduce((sum, h) => sum + (h.registration_count || 0), 0) || 0

    // Get completion rates
    let completionRate = 0
    if (hackathonIds.length > 0) {
      const { data: completionData } = await sb
        .from('hackathon_registrations')
        .select('completed')
        .in('hackathon_id', hackathonIds)

      if (completionData && completionData.length > 0) {
        const completedCount = completionData.filter(r => r.completed).length
        completionRate = Math.round((completedCount / completionData.length) * 100)
      }
    }

    // Get average rating
    let avgRating = 0
    if (hackathonIds.length > 0) {
      const { data: ratingData } = await sb
        .from('participant_feedback')
        .select('rating')
        .in('hackathon_id', hackathonIds)

      if (ratingData && ratingData.length > 0) {
        const totalRating = ratingData.reduce((sum, r) => sum + r.rating, 0)
        avgRating = parseFloat((totalRating / ratingData.length).toFixed(1))
      }
    }

    // Get popular themes from hackathons
    //@ts-ignore
    const themes = hackathons?.map(h => h.theme).filter(Boolean) || []
    const themeCount = themes.reduce((acc, theme) => {
      acc[theme] = (acc[theme] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const popularThemes = Object.entries(themeCount)
        //@ts-ignore
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([theme]) => theme)

    // Get monthly stats for the last 6 months
    const monthlyStats = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      
      const monthHackathons = hackathons?.filter(h => {
        const createdAt = new Date(h.created_at)
        return createdAt >= monthStart && createdAt <= monthEnd
      }) || []

      const monthRegistrations = monthHackathons.reduce((sum, h) => sum + (h.registration_count || 0), 0)

      monthlyStats.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        events: monthHackathons.length,
        participants: monthRegistrations
      })
    }

    // Get top performing hackathons
    const topHackathons = hackathons
      ?.map(h => ({
        id: h.id,
        name: h.title,
        participants: h.registration_count || 0,
        views: h.view_count || 0,
        rating: 0 // Will be filled below
      }))
      .sort((a, b) => b.participants - a.participants)
      .slice(0, 5) || []

    // Get ratings for top hackathons
    if (topHackathons.length > 0) {
      const topHackathonIds = topHackathons.map(h => h.id)
      const { data: topRatings } = await sb
        .from('participant_feedback')
        .select('hackathon_id, rating')
        .in('hackathon_id', topHackathonIds)

      // Calculate average rating for each hackathon
      const hackathonRatings = topRatings?.reduce((acc, r) => {
        if (!acc[r.hackathon_id]) {
          acc[r.hackathon_id] = { total: 0, count: 0 }
        }
        acc[r.hackathon_id].total += r.rating
        acc[r.hackathon_id].count += 1
        return acc
      }, {} as Record<string, { total: number; count: number }>) || {}

      topHackathons.forEach(h => {
        const rating = hackathonRatings[h.id]
        h.rating = rating ? parseFloat((rating.total / rating.count).toFixed(1)) : 0
      })
    }

    // Get recent engagement metrics
    const { data: recentViews } = await sb
      .from('hackathon_views')
      .select('viewed_at')
      .in('hackathon_id', hackathonIds)
      .gte('viewed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days

    const weeklyViews = recentViews?.length || 0

    const analyticsData = {
      totalViews,
      registrations: totalRegistrations,
      completionRate,
      avgRating,
      popularThemes,
      monthlyStats,
      topHackathons,
      totalHackathons: hackathons?.length || 0,
      weeklyViews,
      period,
      summary: {
        totalEvents: hackathons?.length || 0,
        activeEvents: hackathons?.filter(h => h.status === 'ACTIVE').length || 0,
        completedEvents: hackathons?.filter(h => h.status === 'COMPLETED').length || 0,
        draftEvents: hackathons?.filter(h => h.status === 'DRAFT').length || 0
      }
    }

    return NextResponse.json(analyticsData)

  } catch (error) {
    console.error('Error in organizer analytics API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}