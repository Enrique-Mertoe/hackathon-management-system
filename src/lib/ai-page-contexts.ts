// Page-specific AI context and prompts for different parts of the application

export interface AIPageContext {
  page: string
  mode: 'analytics' | 'form-assistance' | 'insights' | 'general'
  prompts: string[]
  context: Record<string, any>
}

// Organizer Dashboard Context
export const getOrganizerDashboardContext = (hackathons: any[]): AIPageContext => ({
  page: 'organizer-dashboard',
  mode: 'analytics',
  prompts: [
    "Which of my hackathons have the most participants?",
    "Show me participation trends over time",
    "What types of hackathons are most popular?",
    "Compare prize pools across my events",
    "Which hackathons need more promotion?",
    "Analyze team formation patterns",
    "Show registration timing insights",
    "Identify my most successful events"
  ],
  context: {
    hackathons: hackathons.map(h => ({
      id: h.id,
      title: h.title,
      status: h.status,
      registration_count: h.registration_count,
      prize_pool: h.prize_pool,
      start_date: h.start_date,
      end_date: h.end_date,
      theme: h.theme,
      difficulty_level: h.difficulty_level
    })),
    totalHackathons: hackathons.length,
    activeHackathons: hackathons.filter(h => ['REGISTRATION_OPEN', 'ACTIVE', 'JUDGING'].includes(h.status)).length,
    totalParticipants: hackathons.reduce((sum, h) => sum + h.registration_count, 0),
    totalPrizePool: hackathons.reduce((sum, h) => sum + (h.prize_pool || 0), 0),
    statusBreakdown: hackathons.reduce((acc, h) => {
      acc[h.status] = (acc[h.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }
})

// Hackathon Creation Context
export const getHackathonCreationContext = (formData: any): AIPageContext => ({
  page: 'hackathon-creation',
  mode: 'form-assistance',
  prompts: [
    "Suggest a title and theme for a 48-hour AI hackathon",
    "Help me plan a beginner-friendly web development hackathon",
    "Create a sustainable technology hackathon with good prizes",
    "Design a hackathon for university students focusing on fintech",
    "Plan a virtual hackathon for blockchain developers",
    "Suggest judging criteria for an innovation challenge",
    "Help me set appropriate team sizes and timelines",
    "Generate a poster concept for my hackathon"
  ],
  context: {
    formData,
    currentFields: Object.keys(formData),
    completedFields: Object.entries(formData).filter(([_, value]) => 
      value !== '' && value !== null && value !== undefined
    ).map(([key, _]) => key),
    missingFields: Object.entries(formData).filter(([_, value]) => 
      value === '' || value === null || value === undefined
    ).map(([key, _]) => key)
  }
})

// Individual Hackathon Management Context
export const getHackathonManagementContext = (hackathon: any): AIPageContext => ({
  page: 'hackathon-management',
  mode: 'insights',
  prompts: [
    "Analyze this hackathon's performance so far",
    "What tech stack would be best for this challenge?",
    "Help me understand if I have the right skills for this",
    "Create a preparation timeline for participants",
    "Suggest relevant resources and tools",
    "What are the key judging criteria to focus on?",
    "How can participants make their projects stand out?",
    "Analyze registration and team formation patterns",
    "Provide event optimization recommendations"
  ],
  context: {
    hackathon: {
      id: hackathon.id,
      title: hackathon.title,
      description: hackathon.description,
      theme: hackathon.theme,
      difficulty_level: hackathon.difficulty_level,
      status: hackathon.status,
      registration_count: hackathon.registration_count,
      max_participants: hackathon.max_participants,
      min_team_size: hackathon.min_team_size,
      max_team_size: hackathon.max_team_size,
      prize_pool: hackathon.prize_pool,
      requirements: hackathon.requirements,
      judging_criteria: hackathon.judging_criteria,
      is_virtual: hackathon.is_virtual,
      location: hackathon.location,
      start_date: hackathon.start_date,
      end_date: hackathon.end_date,
      registration_start: hackathon.registration_start,
      registration_end: hackathon.registration_end
    },
    isOrganizer: true,
    canManage: true
  }
})

// Participant Dashboard Context
export const getParticipantDashboardContext = (registrations: any[], user: any): AIPageContext => ({
  page: 'participant-dashboard',
  mode: 'insights',
  prompts: [
    "Show me upcoming hackathons that match my skills",
    "Help me find team members for upcoming events",
    "Analyze my participation history and performance",
    "Recommend hackathons based on my experience level",
    "What skills should I develop for future hackathons?",
    "Show me popular hackathons with good prize pools",
    "Help me prepare for my next hackathon",
    "Find virtual vs in-person events near me"
  ],
  context: {
    user: {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      skills: user.skills,
      role: user.role,
      location: user.location
    },
    registrations: registrations.map(r => ({
      hackathon_id: r.hackathon_id,
      status: r.status,
      registered_at: r.registered_at,
      hackathon: r.hackathon
    })),
    activeRegistrations: registrations.filter(r => 
      ['REGISTRATION_OPEN', 'ACTIVE', 'JUDGING'].includes(r.hackathon?.status)
    ).length,
    completedHackathons: registrations.filter(r => 
      r.hackathon?.status === 'COMPLETED'
    ).length
  }
})

// Team Management Context
export const getTeamManagementContext = (team: any, hackathon: any): AIPageContext => ({
  page: 'team-management',
  mode: 'insights',
  prompts: [
    "Help me find the right team members for this hackathon",
    "Analyze our team's skill composition",
    "Suggest project ideas based on our team's expertise",
    "What roles should each team member take?",
    "How can we optimize our team collaboration?",
    "Recommend communication tools and workflows",
    "Help us prepare a winning strategy",
    "Analyze successful teams from similar hackathons"
  ],
  context: {
    team: {
      id: team.id,
      name: team.name,
      description: team.description,
      status: team.status,
      looking_for_members: team.looking_for_members,
      skills_wanted: team.skills_wanted,
      min_team_size: team.min_team_size,
      max_team_size: team.max_team_size
    },
    hackathon: {
      id: hackathon.id,
      title: hackathon.title,
      theme: hackathon.theme,
      difficulty_level: hackathon.difficulty_level,
      requirements: hackathon.requirements,
      judging_criteria: hackathon.judging_criteria
    },
    members: team.members || [],
    isLeader: team.leader_id === team.current_user_id
  }
})

// Analytics Dashboard Context
export const getAnalyticsDashboardContext = (analytics: any): AIPageContext => ({
  page: 'analytics-dashboard',
  mode: 'analytics',
  prompts: [
    "Analyze overall platform performance trends",
    "Show me the most popular hackathon themes",
    "Compare participant engagement across events",
    "Identify peak registration periods",
    "Analyze team formation success rates",
    "Show geographic participation patterns",
    "Compare virtual vs in-person event success",
    "Identify top-performing organizers and events"
  ],
  context: {
    analytics: analytics,
    timeframe: analytics.timeframe || 'last-30-days',
    metrics: analytics.metrics || {},
    trends: analytics.trends || {}
  }
})

// Public Hackathon Browse Context
export const getHackathonBrowseContext = (hackathons: any[], filters: any): AIPageContext => ({
  page: 'hackathon-browse',
  mode: 'general',
  prompts: [
    "Help me find hackathons that match my skill level",
    "Show me upcoming events with good prize pools",
    "Recommend hackathons for beginners",
    "Find virtual hackathons I can participate in",
    "Suggest hackathons based on my interests",
    "Show me the most popular ongoing events",
    "Help me filter events by technology stack",
    "Find hackathons with team formation support"
  ],
  context: {
    hackathons: hackathons.map(h => ({
      id: h.id,
      title: h.title,
      theme: h.theme,
      difficulty_level: h.difficulty_level,
      status: h.status,
      registration_count: h.registration_count,
      prize_pool: h.prize_pool,
      is_virtual: h.is_virtual,
      location: h.location,
      registration_end: h.registration_end,
      start_date: h.start_date
    })),
    filters: filters,
    totalCount: hackathons.length,
    themes: [...new Set(hackathons.map(h => h.theme).filter(Boolean))],
    difficultyLevels: [...new Set(hackathons.map(h => h.difficulty_level))],
    locations: [...new Set(hackathons.map(h => h.location).filter(Boolean))]
  }
})

// Get appropriate context based on page
export const getAIContextForPage = (
  page: string, 
  data: any = {}
): AIPageContext => {
  switch (page) {
    case 'organizer-dashboard':
      return getOrganizerDashboardContext(data.hackathons || [])
    
    case 'hackathon-creation':
      return getHackathonCreationContext(data.formData || {})
    
    case 'hackathon-management':
      return getHackathonManagementContext(data.hackathon || {})
    
    case 'participant-dashboard':
      return getParticipantDashboardContext(data.registrations || [], data.user || {})
    
    case 'team-management':
      return getTeamManagementContext(data.team || {}, data.hackathon || {})
    
    case 'analytics-dashboard':
      return getAnalyticsDashboardContext(data.analytics || {})
    
    case 'hackathon-browse':
      return getHackathonBrowseContext(data.hackathons || [], data.filters || {})
    
    default:
      return {
        page: 'general',
        mode: 'general',
        prompts: [
          "How can I get started with hackathons?",
          "What makes a successful hackathon?",
          "Help me understand the platform features",
          "Show me tips for hackathon participation",
          "Explain the judging process",
          "How do team formations work?",
          "What are the benefits of organizing hackathons?",
          "Help me choose between virtual and in-person events"
        ],
        context: data
      }
  }
}