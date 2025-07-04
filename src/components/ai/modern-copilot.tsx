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
  Alert,
  Card,
  CardContent,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  alpha
} from '@mui/material'
import {
  Close as CloseIcon,
  Send as SendIcon,
  AutoAwesome as AIIcon,
  Lightbulb as IdeaIcon,
  Login as LoginIcon,
  PersonAdd as SignupIcon,
  Analytics as AnalyticsIcon,
  Assessment as InsightIcon,
  Clear as ClearIcon,
  Info as InfoIcon
} from '@mui/icons-material'
import { getAIContextForPage, type AIPageContext } from '@/lib/ai-page-contexts'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface CopilotMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  dataResults?: any[]
  executionError?: string
}

interface ModernCopilotProps {
  isOpen: boolean
  onClose: () => void
  currentUser?: any
  page: string
  data?: any
}

export function ModernCopilot({ 
  isOpen, 
  onClose, 
  currentUser,
  page,
  data = {}
}: ModernCopilotProps) {
  const [messages, setMessages] = useState<CopilotMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isExecutingData, setIsExecutingData] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [pageContext, setPageContext] = useState<AIPageContext | null>(null)
  const [showStats, setShowStats] = useState(false)
  const [conversationStats, setConversationStats] = useState<any>(null)

  // Initialize page context
  useEffect(() => {
    if (page && data) {
      const context = getAIContextForPage(page, data)
      setPageContext(context)
    }
  }, [page, data])

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
      const response = await fetch('/api/ai/hackhub-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          context: pageContext?.context || {},
          conversationHistory: messages.slice(-5) // Last 5 messages for context
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get AI response')
      }

      const aiMessage: CopilotMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.response,
        timestamp: new Date(),
        dataResults: data.dataResults,
        executionError: data.executionError
      }

      setMessages(prev => [...prev, aiMessage])

      // If AI needs more data and we got execution results, show data execution loading
      if (data.dataResults && data.requiresData) {
        setIsExecutingData(true)
        
        // Add a temporary loading message for data analysis
        const loadingMessage: CopilotMessage = {
          id: (Date.now() + 1.5).toString(),
          type: 'ai',
          content: '**Analyzing the data...**\n\nProcessing your hackathon information to provide detailed insights.',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, loadingMessage])

        setTimeout(async () => {
          try {
            const followUpResponse = await fetch('/api/ai/hackhub-ai', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                message: `EXECUTION_RESULTS: ${JSON.stringify(data.dataResults)}`,
                context: pageContext?.context || {},
                executionResults: data.dataResults
              })
            })

            const followUpData = await followUpResponse.json()
            
            if (followUpResponse.ok) {
              // Remove the loading message and add the real response
              setMessages(prev => prev.filter(msg => msg.id !== loadingMessage.id))
              
              const followUpMessage: CopilotMessage = {
                id: (Date.now() + 2).toString(),
                type: 'ai',
                content: followUpData.response,
                timestamp: new Date()
              }
              setMessages(prev => [...prev, followUpMessage])
            }
          } catch (followUpError) {
            console.error('Follow-up request failed:', followUpError)
            // Remove loading message and show error
            setMessages(prev => prev.filter(msg => msg.id !== loadingMessage.id))
            
            const errorMessage: CopilotMessage = {
              id: (Date.now() + 3).toString(),
              type: 'ai',
              content: 'Sorry, I encountered an issue while analyzing the data. Please try again.',
              timestamp: new Date()
            }
            setMessages(prev => [...prev, errorMessage])
          } finally {
            setIsExecutingData(false)
          }
        }, 800) // Shorter delay for better UX
      }

    } catch (error: any) {
      let errorContent = `Sorry, I encountered an error: ${error.message}. Please try again.`
      
      // Handle authentication errors specifically
      if (error.message?.includes('Authentication required') || error.message?.includes('sign in')) {
        errorContent = 'Please sign in to use the AI assistant. You will be redirected to the login page.'
        setTimeout(() => {
          window.location.href = '/auth/signin'
        }, 2000)
      }

      const errorMessage: CopilotMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: errorContent,
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

  const handleClearConversation = async () => {
    try {
      const response = await fetch(`/api/ai/hackhub-ai?action=clear&page=${page}`)
      if (response.ok) {
        setMessages([])
        setShowStats(false)
        setConversationStats(null)
      }
    } catch (error) {
      console.error('Failed to clear conversation:', error)
    }
  }

  const handleShowStats = async () => {
    try {
      const response = await fetch(`/api/ai/hackhub-ai?action=stats&page=${page}`)
      if (response.ok) {
        const data = await response.json()
        setConversationStats(data.conversationStats)
        setShowStats(true)
      }
    } catch (error) {
      console.error('Failed to get conversation stats:', error)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const theme = useTheme()
  
  // Markdown components for styling with theme awareness
  const markdownComponents = {
    p: ({ children }: any) => (
      <Typography variant="body2" component="div" sx={{ 
        fontSize: '0.8rem', 
        lineHeight: 1.5,
        mb: 1,
        '&:last-child': { mb: 0 }
      }}>
        {children}
      </Typography>
    ),
    strong: ({ children }: any) => (
      <Box component="span" sx={{ 
        fontWeight: 'bold', 
        color: 'primary.main'
      }}>
        {children}
      </Box>
    ),
    em: ({ children }: any) => (
      <Box component="span" sx={{ 
        fontStyle: 'italic',
        color: 'primary.main'
      }}>
        {children}
      </Box>
    ),
    ul: ({ children }: any) => (
      <Box component="ul" sx={{ 
        fontSize: '0.8rem',
        pl: 2,
        mb: 1,
        '&:last-child': { mb: 0 }
      }}>
        {children}
      </Box>
    ),
    ol: ({ children }: any) => (
      <Box component="ol" sx={{ 
        fontSize: '0.8rem',
        pl: 2,
        mb: 1,
        '&:last-child': { mb: 0 }
      }}>
        {children}
      </Box>
    ),
    li: ({ children }: any) => (
      <Box component="li" sx={{ mb: 0.5 }}>
        {children}
      </Box>
    ),
    blockquote: ({ children }: any) => (
      <Alert severity="info" sx={{ 
        fontSize: '0.8rem',
        mb: 1,
        '&:last-child': { mb: 0 },
        '& .MuiAlert-message': {
          fontSize: 'inherit'
        }
      }}>
        {children}
      </Alert>
    ),
    code: ({ children, inline }: any) => (
      inline ? (
        <Box component="code" sx={{ 
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
          color: theme.palette.mode === 'dark' ? 'primary.light' : 'primary.dark',
          px: 0.5,
          py: 0.25,
          borderRadius: 0.5,
          fontSize: '0.75rem',
          fontFamily: 'monospace',
          border: `1px solid ${alpha(theme.palette.divider, 0.3)}`
        }}>
          {children}
        </Box>
      ) : (
        <Box component="pre" sx={{
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          p: 1.5,
          borderRadius: 1,
          fontSize: '0.75rem',
          fontFamily: 'monospace',
          overflow: 'auto',
          mb: 1,
          '&:last-child': { mb: 0 }
        }}>
          <code>{children}</code>
        </Box>
      )
    ),
    table: ({ children }: any) => (
      <Box sx={{ 
        overflow: 'auto',
        mb: 1,
        '&:last-child': { mb: 0 }
      }}>
        <Box component="table" sx={{
          width: '100%',
          fontSize: '0.75rem',
          borderCollapse: 'collapse',
          border: '1px solid',
          borderColor: 'divider'
        }}>
          {children}
        </Box>
      </Box>
    ),
    thead: ({ children }: any) => (
      <Box component="thead" sx={{ 
        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
      }}>
        {children}
      </Box>
    ),
    tbody: ({ children }: any) => (
      <tbody>{children}</tbody>
    ),
    tr: ({ children }: any) => (
      <Box component="tr" sx={{ 
        '&:nth-of-type(even)': { 
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)'
        }
      }}>
        {children}
      </Box>
    ),
    th: ({ children }: any) => (
      <Box component="th" sx={{
        p: 0.75,
        border: '1px solid',
        borderColor: 'divider',
        fontWeight: 'bold',
        textAlign: 'left'
      }}>
        {children}
      </Box>
    ),
    td: ({ children }: any) => (
      <Box component="td" sx={{
        p: 0.75,
        border: '1px solid',
        borderColor: 'divider'
      }}>
        {children}
      </Box>
    )
  }

  // Render data results if available
  const renderDataResults = (dataResults: any[]) => {
    if (!dataResults || dataResults.length === 0) return null

    return (
      <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          📊 Data Analysis Results:
        </Typography>
        {dataResults.map((result, index) => (
          <Card key={index} sx={{ 
            bgcolor: theme.palette.mode === 'dark' 
              ? alpha(theme.palette.background.paper, 0.6)
              : alpha(theme.palette.primary.main, 0.04),
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
          }}>
            <CardContent sx={{ p: 1.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                {result.caption}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                {result.success ? (
                  `✅ Analyzed ${Array.isArray(result.data) ? result.data.length : 'data'} records`
                ) : (
                  `❌ ${result.error}`
                )}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    )
  }

  // Show login prompt if no user is logged in
  const renderLoginPrompt = () => (
    <Box sx={{ p: 3, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <AIIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2, mx: 'auto' }} />
      <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
        HackHub AI Assistant
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
        Get personalized hackathon insights, analytics, and recommendations from our AI assistant.
      </Typography>
      
      <Card sx={{ 
        mb: 3, 
        bgcolor: theme.palette.mode === 'dark' 
          ? alpha(theme.palette.background.paper, 0.6)
          : alpha(theme.palette.primary.main, 0.04),
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
      }}>
        <CardContent sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="primary" fontWeight="600" gutterBottom>
            ✨ What you'll get:
          </Typography>
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              • Personalized hackathon analytics
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              • Participation trend insights
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              • Event optimization suggestions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Data-driven recommendations
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Button
          variant="contained"
          fullWidth
          startIcon={<LoginIcon />}
          onClick={() => {
            window.location.href = '/auth/signin'
          }}
          sx={{ py: 1.5 }}
        >
          Sign In to Continue
        </Button>
        <Button
          variant="outlined"
          fullWidth
          startIcon={<SignupIcon />}
          onClick={() => {
            window.location.href = '/auth/signup'
          }}
          sx={{ py: 1.5 }}
        >
          Create Account
        </Button>
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, opacity: 0.8 }}>
        Join thousands of developers using HackHub AI
      </Typography>
    </Box>
  )

  // Get appropriate icon for the mode
  const getModeIcon = () => {
    switch (pageContext?.mode) {
      case 'analytics':
        return <AnalyticsIcon fontSize="small" />
      case 'insights':
        return <InsightIcon fontSize="small" />
      case 'form-assistance':
        return <IdeaIcon fontSize="small" />
      default:
        return <AIIcon fontSize="small" />
    }
  }

  return (
    <Slide direction="left" in={isOpen} mountOnEnter unmountOnExit>
      <Paper
        elevation={theme.palette.mode === 'dark' ? 12 : 6}
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
          overflow: 'hidden',
          bgcolor: theme.palette.mode === 'dark' 
            ? alpha(theme.palette.background.paper, 0.95)
            : 'background.paper',
          backdropFilter: 'blur(10px)',
          border: theme.palette.mode === 'dark' 
            ? `1px solid ${alpha(theme.palette.divider, 0.2)}` 
            : 'none',
          boxShadow: theme.palette.mode === 'dark'
            ? `0 8px 32px ${alpha(theme.palette.common.black, 0.5)}`
            : `0 8px 32px ${alpha(theme.palette.common.black, 0.15)}`
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
            {getModeIcon()}
            <Box>
              <Typography variant="subtitle1" fontWeight="600">
                HackHub AI
              </Typography>
              {pageContext && (
                <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', lineHeight: 1 }}>
                  {pageContext.mode === 'analytics' ? 'Analytics Mode' :
                   pageContext.mode === 'insights' ? 'Insights Mode' :
                   pageContext.mode === 'form-assistance' ? 'Form Assistant' : 'General Mode'}
                </Typography>
              )}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {currentUser && messages.length > 0 && (
              <>
                <Tooltip title="Conversation Info">
                  <IconButton
                    onClick={handleShowStats}
                    sx={{ color: 'inherit', p: 0.5 }}
                    size="small"
                  >
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Clear Conversation">
                  <IconButton
                    onClick={handleClearConversation}
                    sx={{ color: 'inherit', p: 0.5 }}
                    size="small"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
            <IconButton
              onClick={onClose}
              sx={{ color: 'inherit', p: 0.5 }}
              size="small"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Messages */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            p: currentUser ? 1.5 : 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            bgcolor: theme.palette.mode === 'dark' 
              ? alpha(theme.palette.background.default, 0.3)
              : alpha(theme.palette.background.default, 0.5)
          }}
        >
          {!currentUser ? (
            renderLoginPrompt()
          ) : messages.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              {getModeIcon()}
              <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ fontSize: '0.9rem', mt: 1 }}>
                Your hackathon assistant
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.75rem' }}>
                {pageContext?.mode === 'analytics' ? 'Ask me about your hackathon analytics and trends' :
                 pageContext?.mode === 'insights' ? 'Get insights and recommendations for your hackathons' :
                 pageContext?.mode === 'form-assistance' ? 'I can help you fill out forms and suggest content' :
                 'Ask me anything about hackathon management'}
              </Typography>
              
              <Typography variant="caption" sx={{ mb: 1.5, fontWeight: 600, display: 'block' }}>
                Quick examples:
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {(pageContext?.prompts || []).slice(0, 3).map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outlined"
                    size="small"
                    onClick={() => void handlePredefinedPrompt(prompt)}
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

          {currentUser && messages.map((message) => (
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
                  bgcolor: message.type === 'user' 
                    ? 'primary.main' 
                    : theme.palette.mode === 'dark' 
                      ? alpha(theme.palette.background.paper, 0.8)
                      : alpha(theme.palette.grey[100], 0.9),
                  color: message.type === 'user' 
                    ? 'primary.contrastText' 
                    : 'text.primary',
                  border: message.type === 'ai' 
                    ? `1px solid ${alpha(theme.palette.divider, 0.2)}` 
                    : 'none',
                  boxShadow: message.type === 'ai' 
                    ? `0 1px 3px ${alpha(theme.palette.common.black, 0.1)}` 
                    : 'none'
                }}
              >
                <ReactMarkdown
                  components={markdownComponents}
                  remarkPlugins={[remarkGfm]}
                >
                  {message.content}
                </ReactMarkdown>
                
                {/* Render data results if available */}
                {message.dataResults && renderDataResults(message.dataResults)}
                
                {/* Show execution error if any */}
                {message.executionError && (
                  <Alert severity="warning" sx={{ mt: 1, fontSize: '0.7rem' }}>
                    {message.executionError}
                  </Alert>
                )}
                
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
              </Box>
            </Box>
          ))}

          {currentUser && isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.background.paper, 0.6)
                    : alpha(theme.palette.grey[100], 0.9),
                  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <CircularProgress size={12} color="primary" />
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  Thinking...
                </Typography>
              </Box>
            </Box>
          )}

          {currentUser && isExecutingData && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.primary.main, 0.2)
                    : alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <CircularProgress size={12} color="primary" />
                <Typography variant="caption" color="primary" sx={{ fontSize: '0.7rem', fontWeight: 'medium' }}>
                  📊 Executing data analysis...
                </Typography>
              </Box>
            </Box>
          )}

          <div ref={messagesEndRef} />
        </Box>

        {currentUser && (
          <>
            <Divider sx={{ 
              borderColor: alpha(theme.palette.divider, 0.1),
              bgcolor: alpha(theme.palette.divider, 0.05) 
            }} />
            {/* Input */}
            <Box sx={{ 
              p: 1.5,
              bgcolor: theme.palette.mode === 'dark' 
                ? alpha(theme.palette.background.paper, 0.3)
                : alpha(theme.palette.background.paper, 0.9)
            }}>
              <Box sx={{ display: 'flex', gap: 0.5, mb: 1.5, flexWrap: 'wrap' }}>
                {(pageContext?.prompts || []).slice(3, 6).map((prompt, index) => (
                  <Chip
                    key={index}
                    label={prompt.split(' ').slice(0, 2).join(' ') + '...'}
                    size="small"
                    variant="outlined"
                    onClick={() => void handlePredefinedPrompt(prompt)}
                    sx={{ 
                      cursor: 'pointer',
                      fontSize: '0.65rem',
                      height: 24,
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                      color: 'primary.main',
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        borderColor: alpha(theme.palette.primary.main, 0.5)
                      }
                    }}
                  />
                ))}
              </Box>
              
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <TextField
                  fullWidth
                  multiline
                  maxRows={2}
                  placeholder="Ask about your hackathons..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      void handleSendMessage(inputValue)
                    }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      bgcolor: theme.palette.mode === 'dark' 
                        ? alpha(theme.palette.background.paper, 0.8)
                        : 'background.paper',
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha(theme.palette.primary.main, 0.5)
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                        borderWidth: 2
                      }
                    },
                    '& .MuiOutlinedInput-input': {
                      py: 1
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(theme.palette.divider, 0.3)
                    }
                  }}
                />
                <Button
                  variant="contained"
                  onClick={() => void handleSendMessage(inputValue)}
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
          </>
        )}

        {/* Conversation Stats Dialog */}
        <Dialog
          open={showStats}
          onClose={() => setShowStats(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: theme.palette.mode === 'dark' 
                ? alpha(theme.palette.background.paper, 0.95)
                : 'background.paper',
              backdropFilter: 'blur(10px)',
              border: theme.palette.mode === 'dark' 
                ? `1px solid ${alpha(theme.palette.divider, 0.2)}` 
                : 'none'
            }
          }}
        >
          <DialogTitle>Conversation Statistics</DialogTitle>
          <DialogContent>
            {conversationStats && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      💬 Messages
                    </Typography>
                    <Typography variant="body2">
                      Total: {conversationStats.messageCount} messages
                    </Typography>
                  </CardContent>
                </Card>
                
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      🧠 Context Memory
                    </Typography>
                    <Typography variant="body2">
                      Tokens: ~{conversationStats.tokenCount} / 12,000
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Memory usage: {Math.round((conversationStats.tokenCount / 12000) * 100)}%
                    </Typography>
                  </CardContent>
                </Card>
                
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      ⏱️ Session Duration
                    </Typography>
                    <Typography variant="body2">
                      Active for: {Math.round(conversationStats.sessionAge / (1000 * 60))} minutes
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Last activity: {new Date(conversationStats.lastActivity).toLocaleTimeString()}
                    </Typography>
                  </CardContent>
                </Card>

                <Alert severity="info" sx={{ fontSize: '0.8rem' }}>
                  <strong>🔄 Context Preservation:</strong> Your conversation history is maintained 
                  across messages for better AI understanding. Old messages are automatically 
                  managed to keep conversations efficient.
                </Alert>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowStats(false)}>
              Close
            </Button>
            <Button 
              variant="outlined" 
              color="error" 
              onClick={() => {
                handleClearConversation()
                setShowStats(false)
              }}
            >
              Clear History
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Slide>
  )
}