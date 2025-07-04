// AI Conversation persistence and context management

export interface ConversationMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  dataResults?: any[]
  executionError?: string
  metadata?: {
    page?: string
    tokens?: number
    dataRequestCount?: number
  }
}

export interface ConversationSession {
  id: string
  userId: string
  page: string
  messages: ConversationMessage[]
  context: Record<string, any>
  createdAt: Date
  updatedAt: Date
  tokenCount: number
  maxTokens: number
}

class ConversationStore {
  private sessions: Map<string, ConversationSession> = new Map()
  private readonly MAX_TOKENS = 12000 // Keep well under model limits
  private readonly CLEANUP_INTERVAL = 30 * 60 * 1000 // 30 minutes
  private readonly SESSION_TIMEOUT = 2 * 60 * 60 * 1000 // 2 hours

  constructor() {
    // Cleanup old sessions periodically
    setInterval(() => this.cleanupOldSessions(), this.CLEANUP_INTERVAL)
  }

  // Get or create conversation session
  getSession(userId: string, page: string): ConversationSession {
    const sessionId = `${userId}-${page}`
    
    let session = this.sessions.get(sessionId)
    
    if (!session || this.isSessionExpired(session)) {
      session = this.createNewSession(userId, page)
      this.sessions.set(sessionId, session)
    }
    
    return session
  }

  // Add message to conversation
  addMessage(
    userId: string, 
    page: string, 
    message: Omit<ConversationMessage, 'id' | 'timestamp'>
  ): ConversationSession {
    const session = this.getSession(userId, page)
    
    const newMessage: ConversationMessage = {
      ...message,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    }

    // Estimate token count (rough approximation: 1 token ≈ 4 characters)
    const messageTokens = Math.ceil(message.content.length / 4)
    
    // Add message
    session.messages.push(newMessage)
    session.tokenCount += messageTokens
    session.updatedAt = new Date()

    // Manage token limits
    this.manageTokenLimits(session)

    return session
  }

  // Update session context
  updateContext(userId: string, page: string, context: Record<string, any>): void {
    const session = this.getSession(userId, page)
    session.context = { ...session.context, ...context }
    session.updatedAt = new Date()
  }

  // Get conversation history for AI context
  getConversationHistory(userId: string, page: string, maxMessages: number = 10): ConversationMessage[] {
    const session = this.getSession(userId, page)
    
    // Return recent messages, prioritizing important ones
    return this.selectRelevantMessages(session.messages, maxMessages)
  }

  // Get conversation summary for context
  getConversationSummary(userId: string, page: string): string {
    const session = this.getSession(userId, page)
    
    if (session.messages.length === 0) return ''

    // Create a summary of the conversation topics
    const topics = new Set<string>()
    const keywords = new Set<string>()

    session.messages.forEach(msg => {
      if (msg.type === 'user') {
        // Extract potential topics from user messages
        const words = msg.content.toLowerCase().split(/\s+/)
        words.forEach(word => {
          if (word.length > 4 && !this.isStopWord(word)) {
            keywords.add(word)
          }
        })

        // Identify common topics
        if (msg.content.toLowerCase().includes('participant')) topics.add('participants')
        if (msg.content.toLowerCase().includes('team')) topics.add('teams')
        if (msg.content.toLowerCase().includes('analytic')) topics.add('analytics')
        if (msg.content.toLowerCase().includes('trend')) topics.add('trends')
        if (msg.content.toLowerCase().includes('hackathon')) topics.add('hackathons')
        if (msg.content.toLowerCase().includes('registration')) topics.add('registration')
        if (msg.content.toLowerCase().includes('prize')) topics.add('prizes')
      }
    })

    const topicsList = Array.from(topics).slice(0, 5).join(', ')
    const keywordsList = Array.from(keywords).slice(0, 8).join(', ')

    return `Conversation topics: ${topicsList}. Key terms discussed: ${keywordsList}. Total messages: ${session.messages.length}.`
  }

  // Clear conversation
  clearConversation(userId: string, page: string): void {
    const sessionId = `${userId}-${page}`
    this.sessions.delete(sessionId)
  }

  // Private helper methods
  private createNewSession(userId: string, page: string): ConversationSession {
    return {
      id: `${userId}-${page}`,
      userId,
      page,
      messages: [],
      context: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      tokenCount: 0,
      maxTokens: this.MAX_TOKENS
    }
  }

  private isSessionExpired(session: ConversationSession): boolean {
    const now = Date.now()
    const sessionAge = now - session.updatedAt.getTime()
    return sessionAge > this.SESSION_TIMEOUT
  }

  private manageTokenLimits(session: ConversationSession): void {
    // If we're approaching token limits, remove oldest messages
    while (session.tokenCount > session.maxTokens && session.messages.length > 2) {
      const removedMessage = session.messages.shift()
      if (removedMessage) {
        const messageTokens = Math.ceil(removedMessage.content.length / 4)
        session.tokenCount -= messageTokens
      }
    }

    // Keep at least the last 10 messages for context continuity
    if (session.messages.length > 50) {
      // Remove messages from the middle, keep recent and early context
      const toKeep = 10
      const recentMessages = session.messages.slice(-toKeep)
      const earlyMessages = session.messages.slice(0, 2) // Keep first 2 for context
      
      session.messages = [...earlyMessages, ...recentMessages]
      
      // Recalculate token count
      session.tokenCount = session.messages.reduce((total, msg) => {
        return total + Math.ceil(msg.content.length / 4)
      }, 0)
    }
  }

  private selectRelevantMessages(messages: ConversationMessage[], maxMessages: number): ConversationMessage[] {
    if (messages.length <= maxMessages) {
      return messages
    }

    // Always include the most recent messages
    const recentMessages = messages.slice(-Math.floor(maxMessages * 0.7))
    
    // Include some important earlier messages (those with data results or key topics)
    const earlierMessages = messages.slice(0, -Math.floor(maxMessages * 0.7))
    const importantEarlier = earlierMessages.filter(msg => 
      msg.dataResults || 
      msg.type === 'user' && (
        msg.content.toLowerCase().includes('analyze') ||
        msg.content.toLowerCase().includes('show') ||
        msg.content.toLowerCase().includes('compare') ||
        msg.content.toLowerCase().includes('trend')
      )
    ).slice(-Math.floor(maxMessages * 0.3))

    return [...importantEarlier, ...recentMessages]
  }

  private cleanupOldSessions(): void {
    const now = Date.now()
    
    for (const [sessionId, session] of this.sessions.entries()) {
      if (this.isSessionExpired(session)) {
        this.sessions.delete(sessionId)
      }
    }
  }

  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'this', 'that', 'these', 'those', 'is', 'are', 'was', 'were', 'be', 'been',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
      'may', 'might', 'can', 'cant', 'wont', 'dont', 'isnt', 'arent', 'wasnt', 'werent'
    ])
    return stopWords.has(word)
  }

  // Get session stats for debugging
  getSessionStats(userId: string, page: string): {
    messageCount: number
    tokenCount: number
    sessionAge: number
    lastActivity: Date
  } {
    const session = this.getSession(userId, page)
    const now = Date.now()
    
    return {
      messageCount: session.messages.length,
      tokenCount: session.tokenCount,
      sessionAge: now - session.createdAt.getTime(),
      lastActivity: session.updatedAt
    }
  }
}

// Export singleton instance
export const conversationStore = new ConversationStore()