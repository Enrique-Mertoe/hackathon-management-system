import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@/lib/ai-service'

export async function POST(request: NextRequest) {
  console.log('Copilot API called')
  
  try {
    const body = await request.json()
    console.log('Request body received:', { 
      message: body.message?.substring(0, 100),
      fullMessage: body.message,
      formContext: Object.keys(body.formContext || {}),
      conversationHistory: body.conversationHistory?.length || 0
    })
    
    const { message, formContext, conversationHistory } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      )
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { error: 'Message is too long. Please keep it under 2000 characters.' },
        { status: 400 }
      )
    }

    console.log('Processing AI query...')
    const result = await aiService.processUserQuery(
      message,
      formContext || {},
      conversationHistory || []
    )

    console.log('AI response generated successfully')
    return NextResponse.json(result)

  } catch (error) {
    console.error('Copilot API Error:', error)
    console.error('Error details:', {
      //@ts-ignore
      message: error.message,
      //@ts-ignore
      stack: error.stack,
      //@ts-ignore
      name: error.name
    })

    // Handle specific error types
    //@ts-ignore
    if (error.message.includes('API key') || error.message.includes('not initialized')) {
      return NextResponse.json(
        { error: 'AI service is not properly configured. Please check the Gemini API key.' },
        { status: 503 }
      )
    }
    //@ts-ignore
    if (error.message.includes('rate limit')) {
      return NextResponse.json(
        { error: 'AI service is temporarily unavailable. Please try again in a moment.' },
        { status: 429 }
      )
    }
    //@ts-ignore
    if (error.message.includes('quota') || error.message.includes('billing')) {
      return NextResponse.json(
        { error: 'AI service quota exceeded. Please check your Gemini billing.' },
        { status: 402 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Internal server error. Please try again.',
        //@ts-ignore
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

// Optional: Add GET endpoint for health check
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    service: 'AI Copilot',
    timestamp: new Date().toISOString()
  })
}