'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Chip,
  CircularProgress,
  Divider,
  Slide,
  Alert
} from '@mui/material'
import {
  Close as CloseIcon,
  Send as SendIcon,
  AutoAwesome as AIIcon,
  Lightbulb as IdeaIcon
} from '@mui/icons-material'

interface CopilotMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  suggestions?: FormSuggestion[]
}

export interface FormSuggestion {
  field: string
  value: any
  reason: string
  confidence: number
}

interface CopilotSidepanelProps {
  isOpen: boolean
  onClose: () => void
  onApplySuggestions: (suggestions: FormSuggestion[]) => void
  formContext: any
  posterGenerationMode?: boolean
  analysisMode?: boolean
  organizerInsightsMode?: boolean
  analyticsInsightsMode?: boolean
  participantInsightsMode?: boolean
  reportsInsightsMode?: boolean
  scheduleInsightsMode?: boolean
  deepInsightsMode?: boolean
  editMode?: boolean
}

const PREDEFINED_PROMPTS = [
  "Suggest a title and theme for a 48-hour AI hackathon in November",
  "Help me plan a beginner-friendly web development hackathon",
  "Create a sustainable technology hackathon with good prizes",
  "Design a hackathon for university students focusing on fintech",
  "Plan a virtual hackathon for blockchain developers"
]

const POSTER_GENERATION_PROMPTS = [
  "Generate a vibrant poster for an AI hackathon with modern design",
  "Create a poster for a sustainability-focused tech event",
  "Design a minimalist poster for a university coding competition",
  "Generate a futuristic poster for a blockchain hackathon",
  "Create an engaging poster for a beginner-friendly coding event"
]

const ANALYSIS_PROMPTS = [
  "Analyze this hackathon and suggest the best tech stack for building solutions",
  "What programming languages and frameworks would be most suitable for this challenge?",
  "Help me understand if I have the right skills to succeed in this hackathon",
  "Create a preparation timeline based on the hackathon dates and requirements",
  "Suggest relevant past projects or open-source repositories that could help",
  "What tools and resources would be most helpful for this type of hackathon?",
  "Explain what this hackathon is really looking for in simple terms",
  "How can I make my project stand out in this competition?",
  "What are the key judging criteria I should focus on?",
  "Suggest similar hackathons or competitions I should consider"
]

const ORGANIZER_INSIGHTS_PROMPTS = [
  "Analyze my hackathon performance and suggest improvements for future events",
  "How can I increase participant engagement and retention in my hackathons?",
  "What are the current trends in hackathon themes and formats I should consider?",
  "Suggest marketing strategies to attract more diverse participants to my events",
  "Help me optimize my hackathon timeline and schedule for better outcomes",
  "What prize structures and incentives work best for different types of hackathons?",
  "How can I improve my judging process and criteria for fairer evaluation?",
  "Suggest ways to build a community around my hackathon events",
  "What partnerships and sponsorships should I pursue for my next hackathon?",
  "Help me identify potential risks and challenges in my upcoming hackathons"
]

const SCHEDULE_INSIGHTS_PROMPTS = [
  "Optimize my hackathon timeline for maximum participant engagement",
  "What's the ideal schedule structure for a 48-hour hackathon?",
  "Suggest workshop timing and topics that would benefit participants most",
  "How can I schedule events to accommodate different time zones effectively?",
  "What are the best practices for hackathon kick-off and closing ceremonies?",
  "Help me plan mentor availability and one-on-one session scheduling",
  "Suggest break times and meal schedules for optimal productivity",
  "How should I structure judging periods and presentation schedules?",
  "What buffer time should I include for technical difficulties or delays?",
  "Help me create a schedule template for future hackathons"
]

export function CopilotSidepanel({ 
  isOpen, 
  onClose, 
  onApplySuggestions, 
  formContext,
  posterGenerationMode = false,
  analysisMode = false,
  organizerInsightsMode = false,
  analyticsInsightsMode = false,
  participantInsightsMode = false,
  reportsInsightsMode = false,
  scheduleInsightsMode = false,
  deepInsightsMode = false,
  editMode = false
}: CopilotSidepanelProps) {
  const [messages, setMessages] = useState<CopilotMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [pendingSuggestions, setPendingSuggestions] = useState<FormSuggestion[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return

    const userMessage: CopilotMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          formContext,
          conversationHistory: messages.slice(-5) // Last 5 messages for context
        })
      })

      const data = await response.json()

      console.log(

      )

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get AI response')
      }

      const aiMessage: CopilotMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.response,
        timestamp: new Date(),
        suggestions: data.suggestions
      }

      setMessages(prev => [...prev, aiMessage])

    } catch (error) {
      const errorMessage: CopilotMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        //@ts-ignore
        content: `Sorry, I encountered an error: ${error.message}. Please try again.`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }


  const handlePredefinedPrompt = (prompt: string) => {
    setInputValue(prompt)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <Slide direction="left" in={isOpen} mountOnEnter unmountOnExit>
      <Paper
        elevation={6}
        sx={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: 400,
          height: '100vh',
          zIndex: 1300,
          display: 'flex',
          flexDirection: 'column',
          borderTopLeftRadius: 8,
          borderBottomLeftRadius: 8,
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AIIcon fontSize="small" />
            <Typography variant="subtitle1" fontWeight="600">
              HackHub AI
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            sx={{ color: 'inherit', p: 0.5 }}
            size="small"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>


        {/* Messages */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            p: 1.5,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5
          }}
        >
          {messages.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <AIIcon sx={{ fontSize: 32, color: 'text.secondary', mb: 1 }} />
              <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ fontSize: '0.9rem' }}>
                Your hackathon assistant
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.75rem' }}>
                Ask me anything about hackathon planning
              </Typography>
              
              <Typography variant="caption" sx={{ mb: 1.5, fontWeight: 600, display: 'block' }}>
                {posterGenerationMode ? 'Poster generation examples:' : 
                 analysisMode ? 'Analysis examples:' : 
                 organizerInsightsMode ? 'Organizer insights examples:' : 
                 scheduleInsightsMode ? 'Schedule optimization examples:' :
                 'Quick examples:'}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {(posterGenerationMode ? POSTER_GENERATION_PROMPTS : 
                  analysisMode ? ANALYSIS_PROMPTS : 
                  organizerInsightsMode ? ORGANIZER_INSIGHTS_PROMPTS : 
                  scheduleInsightsMode ? SCHEDULE_INSIGHTS_PROMPTS :
                  PREDEFINED_PROMPTS).slice(0, 3).map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outlined"
                    size="small"
                    onClick={() => handlePredefinedPrompt(prompt)}
                    sx={{ 
                      textTransform: 'none', 
                      justifyContent: 'flex-start',
                      fontSize: '0.7rem',
                      py: 0.5,
                      px: 1
                    }}
                  >
                    {prompt.length > 40 ? prompt.substring(0, 40) + '...' : prompt}
                  </Button>
                ))}
              </Box>
            </Box>
          )}

          {messages.map((message) => (
            <Box
              key={message.id}
              sx={{
                display: 'flex',
                justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                mb: 1
              }}
            >
              <Box
                sx={{
                  maxWidth: '80%',
                  p: 2,
                  borderRadius: 3,
                  bgcolor: message.type === 'user' ? 'primary.main' : 'grey.100',
                  color: message.type === 'user' ? 'primary.contrastText' : 'text.primary'
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem' }}>
                  {message.content}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'block', 
                    mt: 1, 
                    opacity: 0.7,
                    textAlign: message.type === 'user' ? 'right' : 'left',
                    fontSize: '0.65rem'
                  }}
                >
                  {formatTime(message.timestamp)}
                </Typography>
                
                {message.suggestions && message.suggestions.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 'bold', fontSize: '0.65rem' }}>
                        Click to apply suggestions:
                      </Typography>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => {
                          //@ts-ignore
                          onApplySuggestions(message.suggestions)
                          // Remove applied suggestions from pending
                          setPendingSuggestions(prev => 
                            prev.filter(pending =>
                                //@ts-ignore
                              !message.suggestions.some(applied => applied.field === pending.field)
                            )
                          )
                          // Add success message
                          const successMessage: CopilotMessage = {
                            id: (Date.now() + 2).toString(),
                            type: 'ai',
                            //@ts-ignore
                            content: `✅ Applied ${message.suggestions.length} suggestions to your form!`,
                            timestamp: new Date()
                          }
                          setMessages(prev => [...prev, successMessage])
                        }}
                        startIcon={<IdeaIcon fontSize="small" />}
                        sx={{ fontSize: '0.6rem', px: 1, py: 0.25, minHeight: 24 }}
                      >
                        Apply All {message.suggestions.length}
                      </Button>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {message.suggestions.map((suggestion, index) => (
                        <Chip
                          key={index}
                          label={`${suggestion.field}: ${typeof suggestion.value === 'string' && suggestion.value.length > 20 
                            ? suggestion.value.substring(0, 20) + '...' 
                            : suggestion.value}`}
                          size="small"
                          color="primary"
                          variant="outlined"
                          onClick={() => {
                            onApplySuggestions([suggestion])
                            // Remove this suggestion from pending
                            setPendingSuggestions(prev => prev.filter(s => s.field !== suggestion.field))
                            // Add success message
                            const successMessage: CopilotMessage = {
                              id: (Date.now() + 2).toString(),
                              type: 'ai',
                              content: `✅ Applied ${suggestion.field} suggestion!`,
                              timestamp: new Date()
                            }
                            setMessages(prev => [...prev, successMessage])
                          }}
                          sx={{ 
                            fontSize: '0.6rem',
                            cursor: 'pointer',
                            '&:hover': {
                              bgcolor: 'primary.main',
                              color: 'white'
                            }
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          ))}

          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: 'grey.100',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <CircularProgress size={12} />
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  Thinking...
                </Typography>
              </Box>
            </Box>
          )}

          <div ref={messagesEndRef} />
        </Box>

        <Divider />

        {/* Input */}
        <Box sx={{ p: 1.5 }}>
          <Box sx={{ display: 'flex', gap: 0.5, mb: 1.5, flexWrap: 'wrap' }}>
            {(posterGenerationMode ? POSTER_GENERATION_PROMPTS : 
              analysisMode ? ANALYSIS_PROMPTS : 
              organizerInsightsMode ? ORGANIZER_INSIGHTS_PROMPTS : 
              scheduleInsightsMode ? SCHEDULE_INSIGHTS_PROMPTS :
              PREDEFINED_PROMPTS).slice(3).map((prompt, index) => (
              <Chip
                key={index}
                label={prompt.split(' ').slice(0, 2).join(' ') + '...'}
                size="small"
                onClick={() => handlePredefinedPrompt(prompt)}
                sx={{ 
                  cursor: 'pointer',
                  fontSize: '0.65rem',
                  height: 24
                }}
              />
            ))}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <TextField
              fullWidth
              multiline
              maxRows={2}
              placeholder="Ask about your hackathon..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage(inputValue)
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  fontSize: '0.8rem'
                },
                '& .MuiOutlinedInput-input': {
                  py: 1
                }
              }}
            />
            <Button
              variant="contained"
              onClick={() => handleSendMessage(inputValue)}
              disabled={!inputValue.trim() || isLoading}
              sx={{
                minWidth: 36,
                width: 36,
                height: 36,
                borderRadius: '8px',
                p: 0
              }}
            >
              <SendIcon fontSize="small" />
            </Button>
          </Box>
        </Box>
      </Paper>
    </Slide>
  )
}