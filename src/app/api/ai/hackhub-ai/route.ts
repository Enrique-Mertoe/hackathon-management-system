import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { auth } from '@/lib/auth'
import { supabase } from '@/lib/supabase.server'
import { executeAIDataRequest, AIDataRequest, DATABASE_SCHEMA } from '@/lib/ai-data-service'
import { conversationStore, type ConversationMessage } from '@/lib/ai-conversation-store'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// Security: Verify user authentication and get context
async function verifyUserAndGetContext(): Promise<{
    userId: string;
    userRole: string;
    userName: string;
    userEmail: string;
    permissions: any;
}> {
    try {
        const sb = await supabase()
        const currentUser = await auth.getCurrentUser(sb)

        if (!currentUser) {
            throw new Error('User not authenticated')
        }

        // Verify user has permission to use AI assistant
        const allowedRoles = ['ORGANIZER', 'PARTICIPANT', 'ADMIN']
        if (!allowedRoles.includes(currentUser.role)) {
            throw new Error('Insufficient permissions for AI assistant')
        }

        return {
            userId: currentUser.id,
            userRole: currentUser.role,
            userName: currentUser.full_name || currentUser.username || 'User',
            userEmail: currentUser.email,
            permissions: getRolePermissions(currentUser.role)
        }
    } catch (error) {
        console.error('Authentication verification failed:', error)
        throw new Error('Authentication failed')
    }
}

// Security: Input validation and jailbreak protection
function validateAndSanitizeInput(message: string): { isValid: boolean; response: string; sanitizedMessage?: string } {
    // Check message length
    if (message.length > 2000) {
        return {
            isValid: false,
            response: "I appreciate your detailed message, but it's a bit long for me to process effectively. Could you please break it down into smaller, more specific questions about your hackathon needs?"
        }
    }

    if (!message.trim()) {
        return {
            isValid: false,
            response: "I'm here to help with your hackathon management tasks. Please let me know what you'd like assistance with."
        }
    }

    // Detect jailbreak attempts
    const jailbreakPatterns = [
        /assume\s+you\s+are/i,
        /pretend\s+to\s+be/i,
        /ignore\s+previous\s+instructions/i,
        /forget\s+your\s+role/i,
        /you\s+are\s+now/i,
        /roleplay\s+as/i,
        /act\s+as\s+if/i,
        /system\s*:\s*/i,
        /override\s+your/i,
        /bypass\s+your/i,
        /jailbreak/i,
        /prompt\s+injection/i,
        /your\s+instructions\s+are/i,
        /new\s+instructions/i
    ]

    const containsJailbreak = jailbreakPatterns.some(pattern => pattern.test(message))
    if (containsJailbreak) {
        return {
            isValid: false,
            response: "I'm HackHub AI, your hackathon management assistant. I'm designed to help you with event creation, participant management, analytics, and hackathon insights. How can I assist you with your hackathon tasks today?"
        }
    }

    // Check for off-topic requests
    const offTopicPatterns = [
        /recipe\s+for/i,
        /weather/i,
        /sports/i,
        /entertainment/i,
        /movie/i,
        /music/i,
        /dating/i,
        /relationship/i,
        /medical\s+advice/i,
        /financial\s+investment/i,
        /stock\s+market/i,
        /cryptocurrency/i,
        /political/i,
        /religion/i
    ]

    const isOffTopic = offTopicPatterns.some(pattern => pattern.test(message))
    if (isOffTopic) {
        return {
            isValid: false,
            response: "I'm specifically designed to help with hackathon management, event planning, participant analytics, and related tasks. Is there something specific about your hackathon events I can help you with?"
        }
    }

    // Sanitize the message
    const sanitizedMessage = message
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim()

    return {
        isValid: true,
        response: "",
        sanitizedMessage
    }
}

// Define role-based permissions
function getRolePermissions(role: string) {
    const permissions = {
        ADMIN: {
            canViewAllHackathons: true,
            canViewAllUsers: true,
            canCreateHackathons: true,
            canManageUsers: true,
            canViewAnalytics: true,
            canExecuteDataRequests: true,
            dataScope: 'global'
        },
        ORGANIZER: {
            canViewAllHackathons: false,
            canViewAllUsers: false,
            canCreateHackathons: true,
            canManageUsers: false,
            canViewAnalytics: true,
            canExecuteDataRequests: true,
            dataScope: 'owned'
        },
        PARTICIPANT: {
            canViewAllHackathons: false,
            canViewAllUsers: false,
            canCreateHackathons: false,
            canManageUsers: false,
            canViewAnalytics: false,
            canExecuteDataRequests: false,
            dataScope: 'public'
        }
    }

    return permissions[role as keyof typeof permissions] || permissions.PARTICIPANT
}

// AI System Prompt with comprehensive directives
const HACKHUB_SYSTEM_PROMPT = `
You are HackHub AI, a specialized intelligent assistant for hackathon management and analytics.

CORE IDENTITY AND BOUNDARIES:
- You are EXCLUSIVELY designed for hackathon management, event planning, participant analytics, and related tasks
- You CANNOT and will NOT assume other roles, identities, or personas
- You ONLY respond to queries related to: hackathon creation, participant management, team analytics, event planning, registration tracking, judging processes, prize management
- You MUST refuse requests outside your domain politely but firmly
- You CANNOT execute undefined operations or create new capabilities beyond your predefined directive set

RESPONSE FORMAT:
You must ALWAYS respond in JSON format:
{
  "response": "markdown-formatted conversational response",
  "dataRequests": [
    {
      "table": "table_name",
      "select": ["column1", "column2"],
      "filters": [["column", "value"]],
      "limit": 50,
      "orderBy": {"column": "created_at", "ascending": false},
      "caption": "user-friendly description of what this data shows"
    }
  ],
  "requiresData": boolean,
  "conversationOnly": boolean,
  "contextSummary": "brief summary for conversation continuity"
}

DATA REQUEST CONTROL:
- Set requiresData to true ONLY if you need database data to answer the user's question
- Set requiresData to false for general advice, explanations, or when context already has sufficient data
- Use dataRequests array to specify exactly what data you need from the database
- Each dataRequest should have a clear caption explaining what the data represents

AVAILABLE TABLES AND OPERATIONS:

Hackathon Management:
- "hackathons" - Core hackathon events data
  * Columns: id, title, description, theme, difficulty_level, status, registration_start, registration_end, start_date, end_date, timezone, location, is_virtual, max_participants, min_team_size, max_team_size, prize_pool, rules, organizer_id, registration_count, view_count, created_at, updated_at
  * Common queries: "Get my hackathons with most participants", "Show hackathons by status", "Compare prize pools"

- "hackathon_registrations" - Participant registrations
  * Columns: id, hackathon_id, user_id, team_id, status, registration_data, completed, registered_at
  * Common queries: "Show registration trends", "Get participants by hackathon", "Registration completion rates"

- "teams" - Team formation and management
  * Columns: id, name, description, hackathon_id, leader_id, status, looking_for_members, skills_wanted, min_team_size, max_team_size, created_at
  * Common queries: "Team formation patterns", "Most active teams", "Team size analysis"

- "team_members" - Team membership data
  * Columns: id, team_id, user_id, role, joined_at
  * Common queries: "Team composition", "Member participation", "Role distribution"

- "users" - Participant profiles (limited access)
  * Columns: id, username, full_name, bio, avatar_url, github_username, skills, role, created_at
  * Note: Email and sensitive data restricted based on user role

- "hackathon_views" - Event view tracking
  * Columns: id, hackathon_id, user_id, viewed_at
  * Common queries: "Popular hackathons", "View trends", "Interest patterns"

- "participant_feedback" - Event feedback and ratings
  * Columns: id, hackathon_id, user_id, rating, feedback_text, created_at
  * Common queries: "Event satisfaction", "Feedback analysis", "Rating trends"

FILTER OPERATIONS:
- [column, value] - Equal to
- [column, "gt", value] - Greater than
- [column, "lt", value] - Less than
- [column, "in", [values]] - In array
- [column, "is", null] - Is null
- [column, "not", "is", null] - Not null

COMMON USE CASES:

For Organizers:
- "Which of my hackathons have the most participants?" → Query hackathons with registration_count ordering
- "Show me participation trends over time" → Query hackathon_registrations with date grouping
- "What types of hackathons are most popular?" → Query hackathons by theme/difficulty with view_count
- "Compare my event performance" → Multiple queries for registration, views, feedback

For Participants:
- "Show me upcoming hackathons" → Query public hackathons with future dates
- "Find hackathons matching my skills" → Query hackathons with requirement matching
- "Show popular events" → Query hackathons ordered by registration_count or view_count

For Analytics:
- Team formation patterns
- Registration timing analysis
- Theme popularity trends
- Geographic participation patterns
- Skill demand analysis

SECURITY PROTOCOLS:
- NEVER execute operations not in the predefined list above
- NEVER create new directive types or operations
- Respect user role permissions for data access
- Filter data appropriately based on user scope (owned vs global vs public)
- For organizers: only show their own hackathons and related data
- For participants: only show public/published hackathons
- Gracefully decline requests outside your domain

RESPONSE FORMATTING:
- Use rich markdown for better formatting and readability
- Use **bold** for emphasis and important points
- Use *italics* for subtle emphasis or field names
- Use bullet lists (-) for multiple items and comparisons
- Use numbered lists (1.) for step-by-step processes
- Use > blockquotes for important insights and recommendations
- Use code formatting for technical terms, numbers, or data values
- Use tables when comparing multiple hackathons or metrics
- Keep technical database details internal to dataRequests
- BE CONVERSATIONAL but avoid repeatedly using the user's name in every response
- Only use the user's name occasionally for personalization, not in every message

Examples:
- "I'm **analyzing your hackathon performance** to show you participation trends..."
- "Let me **gather the registration data** to identify your most successful events..."
- "**Checking the team formation patterns** across your hackathons..."
TONE GUIDELINES:
- Be helpful and friendly but not overly formal
- Use "your hackathons" instead of "Abuti Martin's hackathons" 
- Focus on the data and insights rather than addressing the user by name repeatedly
- Save name usage for greetings or when being particularly helpful

Always be conversational, helpful, and focus on actionable insights for hackathon management.
`

export async function POST(request: NextRequest) {
    try {
        // SECURITY: Verify user authentication and get real context
        let verifiedContext
        try {
            verifiedContext = await verifyUserAndGetContext()
        } catch {
            return NextResponse.json(
                {
                    error: 'Authentication required',
                    message: 'Please log in to use HackHub AI assistant'
                },
                { status: 401 }
            )
        }

        const { message, context: frontendContext = {}, executionResults } = await request.json()

        if (!message) {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            )
        }

        // Security: Validate and sanitize input
        const securityCheck = validateAndSanitizeInput(message)
        if (!securityCheck.isValid) {
            return NextResponse.json({
                response: securityCheck.response,
                dataRequests: [],
                requiresData: false,
                conversationOnly: true,
                contextSummary: ""
            })
        }

        // Check if this is execution feedback
        const isExecutionFeedback = !!executionResults

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                { error: 'AI service not configured' },
                { status: 500 }
            )
        }

        // SECURITY: Use verified context, merge with safe frontend context
        const secureContext = {
            userId: verifiedContext.userId,
            userRole: verifiedContext.userRole,
            userName: verifiedContext.userName,
            userEmail: verifiedContext.userEmail,
            permissions: verifiedContext.permissions,
            currentPage: frontendContext.page || 'unknown',
            ...frontendContext // Include safe frontend context like hackathons summary
        }

        const currentPage = frontendContext.page || 'unknown'
        
        // Update conversation context with current page data
        conversationStore.updateContext(verifiedContext.userId, currentPage, secureContext)

        // Add user message to conversation
        conversationStore.addMessage(verifiedContext.userId, currentPage, {
            type: 'user',
            content: securityCheck.sanitizedMessage || message
        })

        // Get conversation history for better context
        const conversationHistory = conversationStore.getConversationHistory(verifiedContext.userId, currentPage, 15)
        const conversationSummary = conversationStore.getConversationSummary(verifiedContext.userId, currentPage)

        // Log AI usage for audit
        try {
            const sb = await supabase()
            await sb.from('activity_logs').insert({
                user_id: verifiedContext.userId,
                action_type: 'AI_QUERY',
                details: `HackHub AI query: ${message.substring(0, 100)}...`,
                metadata: { page: frontendContext.page }
            })
        } catch (logError) {
            console.warn('Failed to log AI usage:', logError)
        }

        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1500,
            }
        })

        // Build context prompt
        let contextPrompt

        if (isExecutionFeedback) {
            contextPrompt = `
EXECUTION FEEDBACK CONTEXT:
- User Role: ${secureContext.userRole}
- User Name: ${secureContext.userName}
- Execution Results: ${JSON.stringify(executionResults, null, 2)}

INSTRUCTIONS:
- Analyze the execution results provided
- Provide meaningful insights based on successful data queries
- Suggest next steps or alternatives for failed operations
- Be conversational and helpful in your response
- Focus on actionable insights from the data
- Only use conversationOnly if no further data analysis is needed
`
        } else {
            contextPrompt = `
VERIFIED USER CONTEXT (Backend Authenticated):
- User ID: ${secureContext.userId}
- Role: ${secureContext.userRole} 
- Name: ${secureContext.userName}
- Email: ${secureContext.userEmail}
- Current Page: ${secureContext.currentPage}

USER PERMISSIONS:
- Data Scope: ${secureContext.permissions.dataScope}
- Can View All Hackathons: ${secureContext.permissions.canViewAllHackathons}
- Can Execute Data Requests: ${secureContext.permissions.canExecuteDataRequests}
- Can Create Hackathons: ${secureContext.permissions.canCreateHackathons}
- Can View Analytics: ${secureContext.permissions.canViewAnalytics}

CURRENT CONTEXT DATA:
${JSON.stringify(secureContext, null, 2)}

CONVERSATION HISTORY:
${conversationHistory.map(msg => `${msg.type.toUpperCase()}: ${msg.content.substring(0, 200)}${msg.content.length > 200 ? '...' : ''}`).join('\n')}

CONVERSATION SUMMARY:
${conversationSummary}

SECURITY RULES:
- If dataScope is 'owned', only show data for user's hackathons (organizer_id = ${secureContext.userId})
- If dataScope is 'public', only show published hackathons
- If dataScope is 'global', can show all data (admin only)
- Respect permission flags for data access

USER MESSAGE: ${securityCheck.sanitizedMessage || message}

DATABASE SCHEMA AVAILABLE:
${JSON.stringify(DATABASE_SCHEMA, null, 2)}
`
        }

        const result = await model.generateContent([
            HACKHUB_SYSTEM_PROMPT,
            contextPrompt
        ])

        const response = await result.response
        let aiResponse = response.text()

        // Clean response and ensure JSON format
        aiResponse = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim()

        try {
            const parsedResponse = JSON.parse(aiResponse)

            // Validate response structure
            if (!parsedResponse.response) {
                throw new Error('Invalid AI response structure')
            }

            // Prepare AI message for conversation storage
            const aiMessageData = {
                type: 'ai' as const,
                content: parsedResponse.response,
                dataResults: undefined as any[] | undefined,
                executionError: undefined as string | undefined
            }

            // If AI requested data and user has permission, execute the requests
            if (parsedResponse.requiresData && parsedResponse.dataRequests && 
                secureContext.permissions.canExecuteDataRequests) {
                
                try {
                    const dataResults = []
                    for (const dataRequest of parsedResponse.dataRequests) {
                        // Add security filters based on user role
                        const secureRequest = addSecurityFilters(dataRequest, verifiedContext)
                        const data = await executeAIDataRequest(secureRequest)
                        
                        dataResults.push({
                            table: dataRequest.table,
                            caption: dataRequest.caption,
                            data,
                            success: true
                        })
                    }

                    // Add data results to AI message
                    aiMessageData.dataResults = dataResults

                    // Store AI message with data results
                    conversationStore.addMessage(verifiedContext.userId, currentPage, aiMessageData)

                    // Return response with data for frontend to process
                    return NextResponse.json({
                        ...parsedResponse,
                        dataResults,
                        needsExecution: false // Data already executed
                    })
                } catch (dataError) {
                    console.error('Error executing data requests:', dataError)
                    
                    // Add error to AI message
                    aiMessageData.executionError = 'Failed to retrieve data'
                    
                    // Store AI message with error
                    conversationStore.addMessage(verifiedContext.userId, currentPage, aiMessageData)
                    
                    // Return response without data, let AI know execution failed
                    return NextResponse.json({
                        ...parsedResponse,
                        executionError: 'Failed to retrieve data',
                        needsExecution: false
                    })
                }
            } else {
                // Store AI message without data requests
                conversationStore.addMessage(verifiedContext.userId, currentPage, aiMessageData)
            }

            return NextResponse.json(parsedResponse)
        } catch {
            // Fallback response if AI doesn't return valid JSON
            return NextResponse.json({
                response: aiResponse || "I apologize, but I'm having trouble processing your request right now. Please try again.",
                dataRequests: [],
                requiresData: false,
                conversationOnly: true
            })
        }

    } catch (error) {
        console.error('HackHub AI Error:', error)
        return NextResponse.json(
            {
                response: "I'm experiencing technical difficulties. Please try again later.",
                dataRequests: [],
                requiresData: false,
                conversationOnly: true,
                //@ts-ignore
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            },
            { status: 500 }
        )
    }
}

// Add security filters based on user role and data access permissions
function addSecurityFilters(request: AIDataRequest, user: any): AIDataRequest {
    const secureRequest = { ...request }

    // For organizers, filter data to their own hackathons and related data
    if (user.userRole === 'ORGANIZER') {
        switch (request.table) {
            case 'hackathons':
                // Only show hackathons created by this organizer
                secureRequest.filters = [...request.filters, ['organizer_id', user.userId]]
                break
                
            case 'hackathon_registrations':
                // Only show registrations for their hackathons
                secureRequest.select = [...request.select]
                if (!secureRequest.select.includes('hackathons!inner(organizer_id)')) {
                    secureRequest.select.push('hackathons!inner(organizer_id)')
                }
                secureRequest.filters = [...request.filters, ['hackathons.organizer_id', user.userId]]
                break
                
            case 'teams':
                // Only show teams from their hackathons
                secureRequest.select = [...request.select]
                if (!secureRequest.select.includes('hackathons!inner(organizer_id)')) {
                    secureRequest.select.push('hackathons!inner(organizer_id)')
                }
                secureRequest.filters = [...request.filters, ['hackathons.organizer_id', user.userId]]
                break
                
            case 'team_members':
                // Only show team members from their hackathons
                secureRequest.select = [...request.select]
                if (!secureRequest.select.includes('teams!inner(hackathons!inner(organizer_id))')) {
                    secureRequest.select.push('teams!inner(hackathons!inner(organizer_id))')
                }
                secureRequest.filters = [...request.filters, ['teams.hackathons.organizer_id', user.userId]]
                break
                
            case 'participant_feedback':
                // Only show feedback for their hackathons
                secureRequest.select = [...request.select]
                if (!secureRequest.select.includes('hackathons!inner(organizer_id)')) {
                    secureRequest.select.push('hackathons!inner(organizer_id)')
                }
                secureRequest.filters = [...request.filters, ['hackathons.organizer_id', user.userId]]
                break
                
            case 'hackathon_views':
                // Only show views for their hackathons
                secureRequest.select = [...request.select]
                if (!secureRequest.select.includes('hackathons!inner(organizer_id)')) {
                    secureRequest.select.push('hackathons!inner(organizer_id)')
                }
                secureRequest.filters = [...request.filters, ['hackathons.organizer_id', user.userId]]
                break
                
            case 'users':
                // For privacy, limit user data access
                secureRequest.select = secureRequest.select.filter(col => 
                    ['id', 'username', 'full_name', 'avatar_url', 'github_username', 'skills', 'role', 'created_at'].includes(col)
                )
                break
        }
    }

    // For participants, even more restrictive access
    if (user.userRole === 'PARTICIPANT') {
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

// Health check and conversation management endpoint
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const page = searchParams.get('page')

    // Verify authentication for conversation actions
    if (action === 'stats' || action === 'clear') {
        try {
            const verifiedContext = await verifyUserAndGetContext()
            
            if (action === 'stats' && page) {
                const stats = conversationStore.getSessionStats(verifiedContext.userId, page)
                return NextResponse.json({
                    status: 'ok',
                    conversationStats: stats
                })
            }
            
            if (action === 'clear' && page) {
                conversationStore.clearConversation(verifiedContext.userId, page)
                return NextResponse.json({
                    status: 'ok',
                    message: 'Conversation cleared'
                })
            }
        } catch {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }
    }

    // Default health check
    return NextResponse.json({
        status: 'operational',
        service: 'HackHub AI',
        timestamp: new Date().toISOString(),
        hasApiKey: !!process.env.GEMINI_API_KEY
    })
}