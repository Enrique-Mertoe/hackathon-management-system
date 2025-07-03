import { GoogleGenerativeAI } from '@google/generative-ai'

export interface FormSuggestion {
  field: string
  value: any
  reason: string
  confidence: number
}

export interface AIResponse {
  response: string
  suggestions: FormSuggestion[]
  confidence: number
}

export interface FormContext {
  title?: string
  description?: string
  theme?: string
  difficulty_level?: string
  registration_start?: string
  registration_end?: string
  start_date?: string
  end_date?: string
  timezone?: string
  location?: string
  is_virtual?: boolean
  max_participants?: string
  min_team_size?: string
  max_team_size?: string
  prize_pool?: string
  rules?: string
}

export interface ConversationMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
}

class AIService {
  private genAI: GoogleGenerativeAI | null = null
  private model: any = null
  private isInitialized = false

  constructor() {
    // Always try to initialize on server-side
    this.initializeGemini()
  }

  private initializeGemini() {
    // Only initialize on server-side
    if (typeof window !== 'undefined') {
      return
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.warn('Gemini API key not found. AI features will be disabled.')
      return
    }

    try {
      this.genAI = new GoogleGenerativeAI(apiKey)
      this.model = this.genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash',
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1500,
        }
      })
      this.isInitialized = true
      console.log('Gemini AI service initialized successfully')
    } catch (error) {
      console.error('Failed to initialize Gemini AI service:', error)
    }
  }

  private getSystemPrompt(): string {
    return `You are an expert hackathon organizer and AI assistant for HackHub, a comprehensive hackathon management platform. You help users create successful hackathons through natural conversation and smart suggestions.

CONVERSATION STYLE:
- Be friendly, helpful, and conversational
- Respond naturally to greetings, thanks, questions, and casual conversation
- Only provide form suggestions when the user is actively asking for help with hackathon planning
- For general conversation (like "thank you", "hello", "how are you"), just respond conversationally without form suggestions

WHEN TO PROVIDE FORM SUGGESTIONS:
✅ User asks for help designing/planning a hackathon
✅ User requests specific advice about titles, themes, dates, etc.
✅ User asks to improve or modify existing hackathon details
✅ User asks for recommendations or suggestions

❌ General greetings, thanks, casual conversation
❌ Questions about the platform itself
❌ Non-hackathon related topics

AVAILABLE FORM FIELDS:
- title: Creative, engaging hackathon title
- description: Detailed description of goals and expectations
- theme: Technology focus (AI/ML, Web3, Sustainability, FinTech, etc.)
- difficulty_level: BEGINNER | INTERMEDIATE | ADVANCED | EXPERT
- registration_start/end: ISO datetime for registration period
- start_date/end_date: ISO datetime for event period
- timezone: Standard timezone (UTC, EST, PST, etc.)
- location: Physical venue address
- is_virtual: boolean - true for virtual, false for in-person
- max_participants: Number or null for unlimited
- min_team_size/max_team_size: Team size constraints
- prize_pool: Total prize money in USD
- rules: Comprehensive rules and guidelines

RESPONSE FORMAT:
Always respond with ONLY valid JSON (no markdown code blocks):
{
  "response": "Your natural, conversational response",
  "suggestions": [
    {
      "field": "field_name",
      "value": "suggested_value", 
      "reason": "Explanation for this suggestion",
      "confidence": 0.85
    }
    // Only include suggestions when relevant to the conversation
    // Leave empty array [] for casual conversation
  ]
}

EXAMPLES:

User: "thank you"
Response: {
  "response": "You're welcome! I'm here whenever you need help with your hackathon planning.",
  "suggestions": []
}

User: "hello"
Response: {
  "response": "Hi there! I'm your hackathon planning assistant. How can I help you create an amazing event today?",
  "suggestions": []
}

User: "help me design a fintech hackathon"
Response: {
  "response": "I'd love to help you design a fintech hackathon! Let me suggest some ideas...",
  "suggestions": [{"field": "title", "value": "FinTech Innovation Challenge", ...}]
}

GUIDELINES FOR SUGGESTIONS:
1. Only suggest fields when the user is actively seeking hackathon planning help
2. Use current date/time context for scheduling suggestions
3. Provide realistic and practical suggestions
4. Confidence scores: 0.9+ = very confident, 0.7-0.9 = confident, 0.5-0.7 = moderate
5. For dates, use ISO format: YYYY-MM-DDTHH:MM:SS
6. Consider industry standards and best practices

CURRENT CONTEXT:
- Platform: HackHub - Professional hackathon management
- Current date: ${new Date().toISOString()}
- Focus: Natural conversation with smart hackathon planning assistance`
  }

  private generateUserPrompt(
    message: string, 
    formContext: FormContext, 
    conversationHistory: ConversationMessage[]
  ): string {
    const contextStr = Object.entries(formContext)
      .filter(([_, value]) => value !== undefined && value !== '' && value !== 'INTERMEDIATE' && value !== 'UTC' && value !== true && value !== '1' && value !== '5')
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n')

    const historyStr = conversationHistory
      .slice(-3) // Last 3 messages for context
      .map(msg => `${msg.type}: ${msg.content}`)
      .join('\n')

    // Detect if this is casual conversation
    const casualPhrases = ['thank you', 'thanks', 'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'how are you', 'what\'s up', 'bye', 'goodbye', 'see you']
    const isCasual = casualPhrases.some(phrase => message.toLowerCase().includes(phrase.toLowerCase())) && message.length < 50

    return `CURRENT FORM DATA:
${contextStr || 'No form data filled yet'}

CONVERSATION HISTORY:
${historyStr || 'This is the start of our conversation'}

USER MESSAGE:
"${message}"

MESSAGE TYPE: ${isCasual ? 'CASUAL_CONVERSATION' : 'PLANNING_REQUEST'}

CRITICAL INSTRUCTION: 
- If MESSAGE TYPE is CASUAL_CONVERSATION, respond warmly but provide NO form suggestions (empty suggestions array)
- Only provide form suggestions when the user is actively asking for hackathon planning help
- Don't assume the user wants suggestions just because form data exists

Respond with valid JSON in the specified format.`
  }

  async processUserQuery(
    message: string,
    formContext: FormContext = {},
    conversationHistory: ConversationMessage[] = []
  ): Promise<AIResponse> {
    if (!this.isInitialized || !this.model) {
      throw new Error('AI service not initialized. Please check your Gemini API key.')
    }

    try {
      const systemPrompt = this.getSystemPrompt()
      const userPrompt = this.generateUserPrompt(message, formContext, conversationHistory)
      
      const fullPrompt = `${systemPrompt}\n\n${userPrompt}`

      const result = await this.model.generateContent(fullPrompt)
      const response = await result.response
      const responseText = response.text()

      if (!responseText) {
        throw new Error('No response from AI')
      }

      // Try to extract JSON from the response
      let parsedResponse
      try {
        // Remove markdown code blocks if present
        let cleanText = responseText.trim()
        
        // Remove ```json and ``` if present
        if (cleanText.startsWith('```json')) {
          cleanText = cleanText.replace(/^```json\s*/i, '').replace(/\s*```$/, '')
        } else if (cleanText.startsWith('```')) {
          cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '')
        }
        
        // Look for JSON in the response
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[0])
        } else {
          parsedResponse = JSON.parse(cleanText)
        }
      } catch (parseError) {
        console.error('Failed to parse JSON response:', responseText)
        console.error('Parse error:', parseError)
        // Return a fallback response
        return {
          response: responseText || "I understand you want help with your hackathon. Could you please be more specific about what you'd like assistance with?",
          suggestions: [],
          confidence: 0.3
        }
      }
      
      // Validate response format
      if (!parsedResponse.response) {
        parsedResponse.response = "I'd be happy to help you with your hackathon planning!"
      }
      
      if (!Array.isArray(parsedResponse.suggestions)) {
        parsedResponse.suggestions = []
      }

      // Validate and sanitize suggestions
      const validatedSuggestions = parsedResponse.suggestions
        .filter((suggestion: any) => 
          suggestion.field && 
          suggestion.value !== undefined && 
          typeof suggestion.confidence === 'number'
        )
        .map((suggestion: any) => ({
          field: suggestion.field,
          value: this.sanitizeFieldValue(suggestion.field, suggestion.value),
          reason: suggestion.reason || `Suggested value for ${suggestion.field}`,
          confidence: Math.min(Math.max(suggestion.confidence, 0), 1) // Clamp between 0-1
        }))

      return {
        response: parsedResponse.response,
        suggestions: validatedSuggestions,
        confidence: this.calculateOverallConfidence(validatedSuggestions)
      }

    } catch (error) {
      console.error('AI Service Error:', error)
      //@ts-ignore
      if (error.message.includes('API key') || error.message.includes('not initialized')) {
        throw new Error('AI service configuration error. Please check Gemini API key.')
      }
      //@ts-ignore
      if (error.message.includes('quota') || error.message.includes('rate limit')) {
        throw new Error('AI service is temporarily unavailable. Please try again in a moment.')
      }

      // Fallback response for any other errors
      return {
        response: "I apologize, but I'm having trouble processing your request right now. Could you please rephrase your question or try being more specific about what you'd like help with?",
        suggestions: [],
        confidence: 0.1
      }
    }
  }

  private sanitizeFieldValue(field: string, value: any): any {
    switch (field) {
      case 'difficulty_level':
        const validDifficulties = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']
        return validDifficulties.includes(value) ? value : 'INTERMEDIATE'
      
      case 'is_virtual':
        return Boolean(value)
      
      case 'max_participants':
      case 'min_team_size':
      case 'max_team_size':
      case 'prize_pool':
        const num = parseInt(value)
        return isNaN(num) ? null : Math.max(0, num)
      
      case 'registration_start':
      case 'registration_end':
      case 'start_date':
      case 'end_date':
        // Validate ISO date format
        try {
          const date = new Date(value)
          return isNaN(date.getTime()) ? null : value
        } catch {
          return null
        }
      
      default:
        // String fields - sanitize
        return typeof value === 'string' ? value.trim() : String(value).trim()
    }
  }

  private calculateOverallConfidence(suggestions: FormSuggestion[]): number {
    if (suggestions.length === 0) return 0.5
    
    const average = suggestions.reduce((sum, s) => sum + s.confidence, 0) / suggestions.length
    return Math.round(average * 100) / 100
  }

  // Utility method for generating hackathon ideas
  async generateHackathonIdeas(theme?: string, duration?: string): Promise<string[]> {
    if (!this.isInitialized || !this.model) {
      return [
        'AI Innovation Challenge 2024',
        'Sustainable Tech Hackathon',
        'FinTech Future Builder',
        'Web3 Developer Sprint',
        'HealthTech Solutions'
      ]
    }

    try {
      const prompt = `Generate 5 creative hackathon title ideas${theme ? ` focused on ${theme}` : ''}${duration ? ` lasting ${duration}` : ''}. Return as a JSON object with an "ideas" array containing the titles.`
      
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const responseText = response.text()

      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return parsed.ideas || parsed.titles || []
      }
      
      return []
    } catch (error) {
      console.error('Error generating ideas:', error)
      return [
        'Innovation Challenge 2024',
        'Tech for Good Hackathon',
        'Developer Sprint',
        'Creative Coding Competition',
        'Future Builder Challenge'
      ]
    }
  }
}

// Singleton instance
export const aiService = new AIService()
export default aiService