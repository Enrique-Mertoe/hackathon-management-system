interface TeamMember {
  id: string
  name: string
  skills: string[]
  experience_level: string
  preferred_role: string
  interests: string[]
  availability: string
  github_profile?: string
  portfolio_url?: string
}

interface Team {
  id: string
  name: string
  description: string
  current_members: TeamMember[]
  skills_needed: string[]
  max_members: number
  project_idea?: string
}

interface ProjectIdea {
  title: string
  description: string
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  required_skills: string[]
  estimated_time: string
  category: string
  potential_impact: string
  technical_feasibility: number // 1-10
  innovation_score: number // 1-10
}

interface HackathonInsight {
  type: 'PARTICIPATION' | 'SKILL_GAP' | 'TREND' | 'RECOMMENDATION'
  title: string
  description: string
  confidence: number // 0-1
  actionable_items: string[]
}

class HackathonAIService {
  private readonly apiKey: string
  private readonly baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || ''
    if (!this.apiKey) {
      console.warn('GEMINI_API_KEY not found. AI features will be limited.')
    }
  }

  async generateTeamRecommendations(
    participant: TeamMember, 
    availableTeams: Team[], 
    hackathonTheme?: string
  ): Promise<{team: Team, compatibility_score: number, reasons: string[]}[]> {
    if (!this.apiKey) {
      return this.getMockTeamRecommendations(participant, availableTeams)
    }

    const prompt = `
You are an AI assistant specializing in hackathon team matching. Analyze the participant and available teams to provide optimal team recommendations.

PARTICIPANT PROFILE:
- Name: ${participant.name}
- Skills: ${participant.skills.join(', ')}
- Experience Level: ${participant.experience_level}
- Preferred Role: ${participant.preferred_role}
- Interests: ${participant.interests.join(', ')}
- Availability: ${participant.availability}

AVAILABLE TEAMS:
${availableTeams.map((team, index) => `
Team ${index + 1}: ${team.name}
- Description: ${team.description}
- Current Members: ${team.current_members.length}/${team.max_members}
- Skills Needed: ${team.skills_needed.join(', ')}
- Project Idea: ${team.project_idea || 'Not specified'}
`).join('\n')}

HACKATHON THEME: ${hackathonTheme || 'General Innovation'}

Provide team recommendations with compatibility scores (0-100) and specific reasons why each team would be a good fit. Consider:
1. Skill complementarity
2. Experience level balance
3. Role availability
4. Interest alignment
5. Team chemistry potential

Format as JSON array with structure:
{
  "team_index": number,
  "compatibility_score": number,
  "reasons": string[],
  "suggested_contribution": string
}

Limit to top 3 recommendations, sorted by compatibility score.`

    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      })

      const data = await response.json()
      const aiResponse = data.candidates[0]?.content?.parts[0]?.text

      if (aiResponse) {
        try {
          const recommendations = JSON.parse(aiResponse.replace(/```json\n?|\n?```/g, ''))
          return recommendations.map((rec: any) => ({
            team: availableTeams[rec.team_index],
            compatibility_score: rec.compatibility_score,
            reasons: rec.reasons
          }))
        } catch (parseError) {
          console.error('Error parsing AI response:', parseError)
          return this.getMockTeamRecommendations(participant, availableTeams)
        }
      }
    } catch (error) {
      console.error('Error calling AI service:', error)
    }

    return this.getMockTeamRecommendations(participant, availableTeams)
  }

  async generateProjectIdeas(
    hackathonTheme: string,
    skillsAvailable: string[],
    difficulty: string,
    timeframe: string,
    count: number = 5
  ): Promise<ProjectIdea[]> {
    if (!this.apiKey) {
      return this.getMockProjectIdeas(hackathonTheme, count)
    }

    const prompt = `
Generate innovative project ideas for a hackathon with the following parameters:

THEME: ${hackathonTheme}
AVAILABLE SKILLS: ${skillsAvailable.join(', ')}
DIFFICULTY LEVEL: ${difficulty}
TIMEFRAME: ${timeframe}
NUMBER OF IDEAS: ${count}

For each project idea, provide:
1. Title (creative and memorable)
2. Description (2-3 sentences explaining the concept)
3. Required skills (specific technologies/skills needed)
4. Estimated development time
5. Category (Web App, Mobile App, AI/ML, Hardware, etc.)
6. Potential impact (who benefits and how)
7. Technical feasibility score (1-10, considering timeframe)
8. Innovation score (1-10, how novel/creative it is)

Focus on:
- Feasible within the timeframe
- Addresses real problems
- Uses available skills effectively
- Has clear demo potential
- Innovative approach to the theme

Format as JSON array with structure:
{
  "title": string,
  "description": string,
  "difficulty": "BEGINNER" | "INTERMEDIATE" | "ADVANCED",
  "required_skills": string[],
  "estimated_time": string,
  "category": string,
  "potential_impact": string,
  "technical_feasibility": number,
  "innovation_score": number
}`

    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      })

      const data = await response.json()
      const aiResponse = data.candidates[0]?.content?.parts[0]?.text

      if (aiResponse) {
        try {
          const ideas = JSON.parse(aiResponse.replace(/```json\n?|\n?```/g, ''))
          return ideas.slice(0, count)
        } catch (parseError) {
          console.error('Error parsing AI response:', parseError)
          return this.getMockProjectIdeas(hackathonTheme, count)
        }
      }
    } catch (error) {
      console.error('Error calling AI service:', error)
    }

    return this.getMockProjectIdeas(hackathonTheme, count)
  }

  async analyzeHackathonInsights(
    participantData: any[],
    teamData: any[],
    submissionData: any[],
    hackathonDetails: any
  ): Promise<HackathonInsight[]> {
    if (!this.apiKey) {
      return this.getMockInsights()
    }

    const prompt = `
Analyze this hackathon data to provide actionable insights for organizers:

HACKATHON DETAILS:
- Theme: ${hackathonDetails.theme}
- Duration: ${hackathonDetails.duration}
- Max Participants: ${hackathonDetails.max_participants}
- Current Registrations: ${participantData.length}

PARTICIPANT ANALYSIS:
- Total Participants: ${participantData.length}
- Skill Distribution: ${this.analyzeSkillDistribution(participantData)}
- Experience Levels: ${this.analyzeExperienceLevels(participantData)}

TEAM FORMATION:
- Teams Formed: ${teamData.length}
- Average Team Size: ${teamData.length > 0 ? (participantData.length / teamData.length).toFixed(1) : 0}
- Skill Coverage: ${this.analyzeTeamSkillCoverage(teamData)}

Provide insights in these categories:
1. PARTICIPATION - registration trends, demographics
2. SKILL_GAP - missing skills, imbalances
3. TREND - patterns in team formation, interests
4. RECOMMENDATION - actionable suggestions

For each insight, include:
- Type
- Title (brief, actionable)
- Description (detailed explanation)
- Confidence level (0-1)
- Specific actionable items

Format as JSON array.`

    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      })

      const data = await response.json()
      const aiResponse = data.candidates[0]?.content?.parts[0]?.text

      if (aiResponse) {
        try {
          return JSON.parse(aiResponse.replace(/```json\n?|\n?```/g, ''))
        } catch (parseError) {
          console.error('Error parsing AI response:', parseError)
          return this.getMockInsights()
        }
      }
    } catch (error) {
      console.error('Error calling AI service:', error)
    }

    return this.getMockInsights()
  }

  // Mock data methods for when AI is unavailable
  private getMockTeamRecommendations(participant: TeamMember, teams: Team[]) {
    return teams.slice(0, 3).map((team, index) => ({
      team,
      compatibility_score: 85 - (index * 10),
      reasons: [
        'Strong skill complementarity with team needs',
        'Good experience level match',
        'Shared interests in project domain'
      ]
    }))
  }

  private getMockProjectIdeas(theme: string, count: number): ProjectIdea[] {
    const ideas = [
      {
        title: `${theme} Assistant AI`,
        description: `An intelligent assistant that helps users navigate ${theme.toLowerCase()} challenges using natural language processing and machine learning.`,
        difficulty: 'INTERMEDIATE' as const,
        required_skills: ['Python', 'AI/ML', 'React', 'API Development'],
        estimated_time: '36-48 hours',
        category: 'AI/ML Application',
        potential_impact: 'Helps newcomers get started and experts optimize their workflow',
        technical_feasibility: 8,
        innovation_score: 7
      },
      {
        title: `Smart ${theme} Dashboard`,
        description: `A real-time analytics dashboard that visualizes trends and insights in the ${theme.toLowerCase()} space with predictive capabilities.`,
        difficulty: 'ADVANCED' as const,
        required_skills: ['React', 'D3.js', 'Node.js', 'Database', 'API Integration'],
        estimated_time: '40-48 hours',
        category: 'Web Application',
        potential_impact: 'Enables data-driven decision making for professionals',
        technical_feasibility: 7,
        innovation_score: 8
      },
      {
        title: `${theme} Mobile Companion`,
        description: `A mobile app that provides on-the-go tools and resources for ${theme.toLowerCase()} enthusiasts with offline capabilities.`,
        difficulty: 'BEGINNER' as const,
        required_skills: ['React Native', 'Mobile Development', 'UI/UX'],
        estimated_time: '24-36 hours',
        category: 'Mobile Application',
        potential_impact: 'Makes resources accessible anytime, anywhere',
        technical_feasibility: 9,
        innovation_score: 6
      }
    ]
    
    return ideas.slice(0, count)
  }

  private getMockInsights(): HackathonInsight[] {
    return [
      {
        type: 'PARTICIPATION',
        title: 'Strong Frontend Developer Representation',
        description: 'Frontend developers make up 40% of registrations, indicating strong interest in UI/UX focused projects.',
        confidence: 0.85,
        actionable_items: [
          'Consider adding more frontend-focused workshops',
          'Ensure adequate design tools and resources',
          'Pair frontend devs with backend developers'
        ]
      },
      {
        type: 'SKILL_GAP',
        title: 'Limited AI/ML Expertise Available',
        description: 'Only 15% of participants have AI/ML skills, which may limit project scope for AI-themed challenges.',
        confidence: 0.92,
        actionable_items: [
          'Add AI/ML tutorial session',
          'Provide pre-built AI APIs and tools',
          'Consider recruiting AI mentors'
        ]
      },
      {
        type: 'RECOMMENDATION',
        title: 'Optimize Team Size Guidelines',
        description: 'Current average team size of 3.2 members is ideal for 48-hour hackathons based on historical data.',
        confidence: 0.78,
        actionable_items: [
          'Encourage teams of 3-4 members',
          'Provide team formation guidance',
          'Consider team-building activities'
        ]
      }
    ]
  }

  private analyzeSkillDistribution(participants: any[]): string {
    // Mock implementation - would analyze actual skill data
    return 'Frontend (40%), Backend (30%), Design (20%), AI/ML (15%)'
  }

  private analyzeExperienceLevels(participants: any[]): string {
    // Mock implementation - would analyze actual experience data
    return 'Beginner (25%), Intermediate (50%), Advanced (25%)'
  }

  private analyzeTeamSkillCoverage(teams: any[]): string {
    // Mock implementation - would analyze team skill coverage
    return 'Most teams have full-stack coverage, 30% lack design skills'
  }
}

export const hackathonAI = new HackathonAIService()
export type { TeamMember, Team, ProjectIdea, HackathonInsight }