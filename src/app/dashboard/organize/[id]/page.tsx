'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Container,
  Grid,
  IconButton,
  LinearProgress,
  Typography,
  Tooltip,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Alert,
  AlertTitle
} from '@mui/material'
import {
  AutoAwesome as AIIcon,
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Group as TeamIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  EmojiEvents as PrizeIcon,
  AccessTime as TimeIcon,
  People as ParticipantsIcon,
  Assessment as AnalyticsIcon,
  Announcement as AnnouncementIcon,
  Publish as PublishIcon
} from '@mui/icons-material'
import { auth } from '@/lib/auth'
import type { AuthUser } from '@/lib/auth'
import { CopilotSidepanel } from '@/components/ai/copilot-sidepanel'
import type { FormSuggestion } from '@/components/ai/copilot-sidepanel'

interface Hackathon {
  id: string
  title: string
  description: string
  theme: string
  difficulty_level: string
  status: string
  registration_start: string
  registration_end: string
  start_date: string
  end_date: string
  timezone: string
  location: string
  is_virtual: boolean
  max_participants: number
  min_team_size: number
  max_team_size: number
  prize_pool: number
  rules: string
  poster_url?: string
  requirements: any
  judging_criteria: any
  registration_count: number
  created_at: string
  updated_at: string
}

export default function OrganizeHackathonPage() {
  const params = useParams()
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'))
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'))
  
  const [user, setUser] = useState<AuthUser | null>(null)
  const [hackathon, setHackathon] = useState<Hackathon | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copilotOpen, setCopilotOpen] = useState(false)
  const [analysisMode, setAnalysisMode] = useState(false)
  const [publishing, setPublishing] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      try {
        const currentUser = await auth.getCurrentUser()
        if (!currentUser) {
          router.push('/auth/signin')
          return
        }
        if (currentUser.role !== 'ORGANIZER' && currentUser.role !== 'ADMIN') {
          router.push('/dashboard')
          return
        }
        setUser(currentUser)
      } catch (error) {
        console.error('Error fetching user:', error)
        router.push('/auth/signin')
      }
    }

    getUser()
  }, [router])

  useEffect(() => {
    const fetchHackathon = async () => {
      if (!params.id || !user) return

      try {
        const response = await fetch(`/api/hackathons/${params.id}`)
        if (!response.ok) {
          if (response.status === 404) {
            setError('Hackathon not found')
          } else {
            setError('Failed to load hackathon')
          }
          return
        }
        
        const data = await response.json()
        setHackathon(data)
      } catch (error) {
        console.error('Error fetching hackathon:', error)
        setError('Failed to load hackathon')
      } finally {
        setLoading(false)
      }
    }

    fetchHackathon()
  }, [params.id, user])

  const handleAnalyzeWithAI = () => {
    setAnalysisMode(true)
    setCopilotOpen(true)
  }

  const handleApplySuggestions = (suggestions: FormSuggestion[]) => {
    // For analysis mode, we might want to handle suggestions differently
    // For now, we'll log them
    console.log('Analysis suggestions received:', suggestions)
  }

  const handleRegistrations = () => {
    router.push(`/dashboard/participants?hackathon=${hackathon?.id}`)
  }

  const handleTeams = () => {
    // TODO: Create teams management page
    router.push(`/dashboard/organize/${hackathon?.id}/teams`)
  }

  const handleUpdates = () => {
    // TODO: Create updates/announcements page
    router.push(`/dashboard/organize/${hackathon?.id}/updates`)
  }

  const handleAnalytics = () => {
    router.push(`/dashboard/analytics?hackathon=${hackathon?.id}`)
  }

  const handlePublish = async () => {
    if (!hackathon) return
    
    setPublishing(true)
    try {
      const response = await fetch(`/api/hackathons/${hackathon.id}/publish`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        setHackathon(prev => prev ? { ...prev, status: 'PUBLISHED' } : null)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to publish hackathon')
      }
    } catch (error) {
      console.error('Error publishing hackathon:', error)
      setError('Failed to publish hackathon')
    } finally {
      setPublishing(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return { color: 'default' as const }
      case 'PUBLISHED': return { color: 'info' as const }
      case 'REGISTRATION_OPEN': return { color: 'success' as const }
      case 'REGISTRATION_CLOSED': return { color: 'warning' as const }
      case 'ACTIVE': return { color: 'secondary' as const }
      case 'JUDGING': return { color: 'primary' as const }
      case 'COMPLETED': return { color: 'success' as const, variant: 'filled' as const }
      case 'CANCELLED': return { color: 'error' as const }
      default: return { color: 'default' as const }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default'
        }}
      >
        <CircularProgress size={40} />
      </Box>
    )
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default'
        }}
      >
        <Card sx={{ maxWidth: 400, width: '100%', mx: 2 }}>
          <CardContent sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h5" color="error" gutterBottom>
              Error
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {error}
            </Typography>
            <Button
              variant="contained"
              onClick={() => router.push('/dashboard/organize')}
              startIcon={<BackIcon />}
            >
              Back to Organize
            </Button>
          </CardContent>
        </Card>
      </Box>
    )
  }

  if (!hackathon) {
    return null
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="xl" sx={{ py: { xs: 1, sm: 2, md: 3 }, px: { xs: 1, sm: 2 } }}>
        {/* Header */}
        <Box sx={{ mb: { xs: 2, md: 3 } }}>
          <Button
            variant="text"
            startIcon={<BackIcon />}
            onClick={() => router.push('/dashboard/organize')}
            sx={{ mb: { xs: 1, md: 2 } }}
            size={isSmall ? "small" : "medium"}
          >
            Back to Organize
          </Button>
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            justifyContent: 'space-between', 
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 2, md: 3 }
          }}>
            <Box sx={{ flex: 1, width: '100%' }}>
              <Typography 
                variant={isSmall ? "h5" : isMobile ? "h4" : "h3"} 
                component="h1" 
                fontWeight="bold" 
                gutterBottom
                sx={{ 
                  lineHeight: { xs: 1.2, md: 1.3 },
                  wordBreak: 'break-word'
                }}
              >
                {hackathon.title}
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: { xs: 1, md: 2 }, 
                mb: 2,
                flexWrap: 'wrap'
              }}>
                <Chip 
                  label={hackathon.status.replace('_', ' ')} 
                  {...getStatusColor(hackathon.status)}
                  size={isSmall ? "small" : "medium"}
                />
                <Typography variant={isSmall ? "caption" : "body2"} color="text.secondary">
                  <ParticipantsIcon sx={{ 
                    fontSize: { xs: 14, md: 16 }, 
                    mr: 0.5, 
                    verticalAlign: 'middle' 
                  }} />
                  {hackathon.registration_count} registered
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              gap: { xs: 1, md: 1.5 }, 
              alignItems: 'center',
              width: { xs: '100%', md: 'auto' },
              justifyContent: { xs: 'space-between', md: 'flex-end' }
            }}>
              <Tooltip title="Analyze with AI - Get insights, tech recommendations, and preparation tips">
                <IconButton
                  onClick={handleAnalyzeWithAI}
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    width: { xs: 40, md: 48 },
                    height: { xs: 40, md: 48 },
                    '&:hover': {
                      bgcolor: 'primary.dark',
                      transform: 'scale(1.05)'
                    },
                    transition: 'all 0.2s ease-in-out',
                    boxShadow: 2
                  }}
                >
                  <AIIcon sx={{ fontSize: { xs: 20, md: 24 } }} />
                </IconButton>
              </Tooltip>
              <Button
                variant="outlined"
                startIcon={!isSmall && <ViewIcon />}
                size={isSmall ? "small" : "medium"}
                sx={{ minWidth: { xs: 'auto', sm: 'auto' } }}
                onClick={() => router.push(`/hackathons/${hackathon.id}`)}
              >
                {isSmall ? 'View' : 'View Public'}
              </Button>
              <Button
                variant="contained"
                startIcon={!isSmall && <EditIcon />}
                size={isSmall ? "small" : "medium"}
                sx={{ minWidth: { xs: 'auto', sm: 'auto' } }}
                onClick={() => router.push(`/dashboard/organize/edit/${hackathon.id}`)}
              >
                Edit
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Draft Status Alert */}
        {hackathon.status === 'DRAFT' && (
          <Alert 
            severity="warning" 
            sx={{ mb: { xs: 2, md: 3 }, borderRadius: 2 }}
            action={
              <Button
                variant="contained"
                size="small"
                startIcon={<PublishIcon />}
                onClick={handlePublish}
                disabled={publishing}
                sx={{ ml: 1 }}
              >
                {publishing ? 'Publishing...' : 'Publish'}
              </Button>
            }
          >
            <AlertTitle>This hackathon is in draft mode</AlertTitle>
            Your hackathon is currently saved as a draft and is not visible to participants. Click "Publish" to make it discoverable on the platform.
          </Alert>
        )}

        <Grid container spacing={{ xs: 2, md: 3 }}>
          {/* Main Content - Left Side */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Grid container spacing={{ xs: 1.5, md: 2 }}>
              {/* Poster Section */}
              {hackathon.poster_url && (
                <Grid size={12}>
                  <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
                    <CardMedia
                        //@ts-ignore
                      component="img"
                      height={{ xs: 150, sm: 200, md: 250 }}
                      image={hackathon.poster_url}
                      alt="Hackathon Poster"
                      sx={{ objectFit: 'cover' }}
                    />
                  </Card>
                </Grid>
              )}
              
              {/* Overview */}
              <Grid size={12}>
                <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
                  <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <Typography 
                      variant={isSmall ? "subtitle1" : "h6"} 
                      gutterBottom 
                      color="primary" 
                      fontWeight="bold"
                    >
                      Overview
                    </Typography>
                    <Box sx={{ space: 2 }}>
                      <Box sx={{ mb: { xs: 2, md: 3 } }}>
                        <Typography 
                          variant={isSmall ? "caption" : "subtitle2"} 
                          fontWeight="bold" 
                          gutterBottom
                          sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
                        >
                          Description
                        </Typography>
                        <Typography 
                          variant={isSmall ? "caption" : "body2"} 
                          color="text.secondary"
                          sx={{ lineHeight: { xs: 1.4, md: 1.6 } }}
                        >
                          {hackathon.description}
                        </Typography>
                      </Box>
                      
                      {hackathon.theme && (
                        <Box sx={{ mb: { xs: 2, md: 3 } }}>
                          <Typography 
                            variant={isSmall ? "caption" : "subtitle2"} 
                            fontWeight="bold" 
                            gutterBottom
                            sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
                          >
                            Theme
                          </Typography>
                          <Chip 
                            label={hackathon.theme} 
                            color="secondary" 
                            variant="outlined" 
                            size={isSmall ? "small" : "medium"} 
                          />
                        </Box>
                      )}

                      {hackathon.rules && (
                        <Box>
                          <Typography 
                            variant={isSmall ? "caption" : "subtitle2"} 
                            fontWeight="bold" 
                            gutterBottom
                            sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
                          >
                            Rules & Guidelines
                          </Typography>
                          <Typography 
                            variant={isSmall ? "caption" : "body2"} 
                            color="text.secondary" 
                            sx={{ 
                              whiteSpace: 'pre-wrap',
                              lineHeight: { xs: 1.4, md: 1.6 },
                              fontSize: { xs: '0.75rem', md: '0.875rem' }
                            }}
                          >
                            {hackathon.rules}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Requirements */}
              {hackathon.requirements && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card sx={{ boxShadow: 2, borderRadius: 2, height: '100%' }}>
                    <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                      <Typography 
                        variant={isSmall ? "subtitle1" : "h6"} 
                        gutterBottom 
                        color="primary" 
                        fontWeight="bold"
                      >
                        Requirements
                      </Typography>
                      <Box sx={{ space: 2 }}>
                        {hackathon.requirements.skills && hackathon.requirements.skills.length > 0 && (
                          <Box sx={{ mb: { xs: 1.5, md: 2 } }}>
                            <Typography 
                              variant={isSmall ? "caption" : "subtitle2"} 
                              fontWeight="bold" 
                              gutterBottom
                              sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
                            >
                              Skills
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {hackathon.requirements.skills.map((skill: string, index: number) => (
                                <Chip 
                                  key={index} 
                                  label={skill} 
                                  size="small" 
                                  color="info" 
                                  variant="outlined" 
                                  sx={{ fontSize: { xs: '0.7rem', md: '0.75rem' } }}
                                />
                              ))}
                            </Box>
                          </Box>
                        )}
                        
                        {hackathon.requirements.tools && hackathon.requirements.tools.length > 0 && (
                          <Box sx={{ mb: { xs: 1.5, md: 2 } }}>
                            <Typography 
                              variant={isSmall ? "caption" : "subtitle2"} 
                              fontWeight="bold" 
                              gutterBottom
                              sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
                            >
                              Tools
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {hackathon.requirements.tools.map((tool: string, index: number) => (
                                <Chip 
                                  key={index} 
                                  label={tool} 
                                  size="small" 
                                  color="warning" 
                                  variant="outlined" 
                                  sx={{ fontSize: { xs: '0.7rem', md: '0.75rem' } }}
                                />
                              ))}
                            </Box>
                          </Box>
                        )}

                        {hackathon.requirements.experience_level && (
                          <Box>
                            <Typography 
                              variant={isSmall ? "caption" : "subtitle2"} 
                              fontWeight="bold" 
                              gutterBottom
                              sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
                            >
                              Experience Level
                            </Typography>
                            <Chip 
                              label={hackathon.requirements.experience_level} 
                              size="small" 
                              color="success" 
                              variant="filled" 
                              sx={{ fontSize: { xs: '0.7rem', md: '0.75rem' } }}
                            />
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Judging Criteria */}
              {hackathon.judging_criteria && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card sx={{ boxShadow: 2, borderRadius: 2, height: '100%' }}>
                    <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                      <Typography 
                        variant={isSmall ? "subtitle1" : "h6"} 
                        gutterBottom 
                        color="primary" 
                        fontWeight="bold"
                      >
                        Judging Criteria
                      </Typography>
                      <Box sx={{ space: 1 }}>
                        {Object.entries(hackathon.judging_criteria).map(([criterion, weight]) => (
                          <Box 
                            key={criterion} 
                            sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center', 
                              mb: { xs: 1.5, md: 1 },
                              flexDirection: { xs: 'column', sm: 'row' },
                              gap: { xs: 0.5, sm: 1 }
                            }}
                          >
                            <Typography 
                              variant={isSmall ? "caption" : "body2"} 
                              fontWeight="medium" 
                              sx={{ 
                                textTransform: 'capitalize',
                                fontSize: { xs: '0.75rem', md: '0.875rem' },
                                width: { xs: '100%', sm: 'auto' }
                              }}
                            >
                              {criterion.replace('_', ' ')}
                            </Typography>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 1,
                              width: { xs: '100%', sm: 'auto' },
                              justifyContent: { xs: 'space-between', sm: 'flex-end' }
                            }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={weight as number} 
                                sx={{ 
                                  width: { xs: 80, md: 60 }, 
                                  height: { xs: 4, md: 6 }, 
                                  borderRadius: 3 
                                }}
                              />
                              <Typography 
                                variant={isSmall ? "caption" : "body2"} 
                                color="text.secondary" 
                                fontWeight="bold"
                                sx={{ fontSize: { xs: '0.7rem', md: '0.875rem' } }}
                              >
                                {weight as number}%
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Grid>

          {/* Sidebar - Right Side */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Grid container spacing={{ xs: 1.5, md: 2 }}>
              {/* Event Details */}
              <Grid size={{ xs: 12, sm: 6, lg: 12 }}>
                <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
                  <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <Typography 
                      variant={isSmall ? "subtitle1" : "h6"} 
                      gutterBottom 
                      color="primary" 
                      fontWeight="bold"
                      sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                    >
                      <EventIcon sx={{ fontSize: { xs: 18, md: 20 } }} />
                      Event Details
                    </Typography>
                    <Box sx={{ space: 2 }}>
                      <Box sx={{ mb: { xs: 1.5, md: 2 } }}>
                        <Typography 
                          variant="caption" 
                          color="text.secondary" 
                          fontWeight="bold"
                          sx={{ 
                            textTransform: 'uppercase', 
                            letterSpacing: 0.5,
                            fontSize: { xs: '0.65rem', md: '0.75rem' }
                          }}
                        >
                          Difficulty
                        </Typography>
                        <Typography 
                          variant={isSmall ? "caption" : "body2"} 
                          sx={{ 
                            textTransform: 'capitalize',
                            display: 'block',
                            fontSize: { xs: '0.8rem', md: '0.875rem' }
                          }}
                        >
                          {hackathon.difficulty_level.toLowerCase()}
                        </Typography>
                      </Box>

                      <Box sx={{ mb: { xs: 1.5, md: 2 } }}>
                        <Typography 
                          variant="caption" 
                          color="text.secondary" 
                          fontWeight="bold"
                          sx={{ 
                            textTransform: 'uppercase', 
                            letterSpacing: 0.5,
                            fontSize: { xs: '0.65rem', md: '0.75rem' },
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5
                          }}
                        >
                          <LocationIcon sx={{ fontSize: { xs: 10, md: 12 } }} />
                          Location
                        </Typography>
                        <Typography 
                          variant={isSmall ? "caption" : "body2"}
                          sx={{ 
                            display: 'block',
                            fontSize: { xs: '0.8rem', md: '0.875rem' }
                          }}
                        >
                          {hackathon.is_virtual ? 'Virtual Event' : hackathon.location}
                        </Typography>
                      </Box>

                      <Box sx={{ mb: { xs: 1.5, md: 2 } }}>
                        <Typography 
                          variant="caption" 
                          color="text.secondary" 
                          fontWeight="bold"
                          sx={{ 
                            textTransform: 'uppercase', 
                            letterSpacing: 0.5,
                            fontSize: { xs: '0.65rem', md: '0.75rem' },
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5
                          }}
                        >
                          <TeamIcon sx={{ fontSize: { xs: 10, md: 12 } }} />
                          Team Size
                        </Typography>
                        <Typography 
                          variant={isSmall ? "caption" : "body2"}
                          sx={{ 
                            display: 'block',
                            fontSize: { xs: '0.8rem', md: '0.875rem' }
                          }}
                        >
                          {hackathon.min_team_size} - {hackathon.max_team_size} members
                        </Typography>
                      </Box>

                      {hackathon.max_participants && (
                        <Box sx={{ mb: { xs: 1.5, md: 2 } }}>
                          <Typography 
                            variant="caption" 
                            color="text.secondary" 
                            fontWeight="bold"
                            sx={{ 
                              textTransform: 'uppercase', 
                              letterSpacing: 0.5,
                              fontSize: { xs: '0.65rem', md: '0.75rem' }
                            }}
                          >
                            Max Participants
                          </Typography>
                          <Typography 
                            variant={isSmall ? "caption" : "body2"}
                            sx={{ 
                              display: 'block',
                              fontSize: { xs: '0.8rem', md: '0.875rem' }
                            }}
                          >
                            {hackathon.max_participants.toLocaleString()}
                          </Typography>
                        </Box>
                      )}

                      {hackathon.prize_pool && (
                        <Box>
                          <Typography 
                            variant="caption" 
                            color="text.secondary" 
                            fontWeight="bold"
                            sx={{ 
                              textTransform: 'uppercase', 
                              letterSpacing: 0.5,
                              fontSize: { xs: '0.65rem', md: '0.75rem' },
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5
                            }}
                          >
                            <PrizeIcon sx={{ fontSize: { xs: 10, md: 12 } }} />
                            Prize Pool
                          </Typography>
                          <Typography 
                            variant={isSmall ? "subtitle1" : "h6"} 
                            color="primary" 
                            fontWeight="bold"
                            sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}
                          >
                            {formatCurrency(hackathon.prize_pool)}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Timeline */}
              <Grid size={{ xs: 12, sm: 6, lg: 12 }}>
                <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
                  <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <Typography 
                      variant={isSmall ? "subtitle1" : "h6"} 
                      gutterBottom 
                      color="primary" 
                      fontWeight="bold"
                      sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                    >
                      <TimeIcon sx={{ fontSize: { xs: 18, md: 20 } }} />
                      Timeline
                    </Typography>
                    <Box sx={{ space: 2 }}>
                      <Box sx={{ mb: { xs: 1.5, md: 2 } }}>
                        <Typography 
                          variant="caption" 
                          color="text.secondary" 
                          fontWeight="bold"
                          sx={{ 
                            textTransform: 'uppercase', 
                            letterSpacing: 0.5,
                            fontSize: { xs: '0.65rem', md: '0.75rem' }
                          }}
                        >
                          Registration Opens
                        </Typography>
                        <Typography 
                          variant={isSmall ? "caption" : "body2"}
                          sx={{ 
                            display: 'block',
                            fontSize: { xs: '0.75rem', md: '0.875rem' },
                            lineHeight: 1.4
                          }}
                        >
                          {formatDate(hackathon.registration_start)}
                        </Typography>
                      </Box>

                      <Box sx={{ mb: { xs: 1.5, md: 2 } }}>
                        <Typography 
                          variant="caption" 
                          color="text.secondary" 
                          fontWeight="bold"
                          sx={{ 
                            textTransform: 'uppercase', 
                            letterSpacing: 0.5,
                            fontSize: { xs: '0.65rem', md: '0.75rem' }
                          }}
                        >
                          Registration Closes
                        </Typography>
                        <Typography 
                          variant={isSmall ? "caption" : "body2"}
                          sx={{ 
                            display: 'block',
                            fontSize: { xs: '0.75rem', md: '0.875rem' },
                            lineHeight: 1.4
                          }}
                        >
                          {formatDate(hackathon.registration_end)}
                        </Typography>
                      </Box>

                      <Box sx={{ mb: { xs: 1.5, md: 2 } }}>
                        <Typography 
                          variant="caption" 
                          color="text.secondary" 
                          fontWeight="bold"
                          sx={{ 
                            textTransform: 'uppercase', 
                            letterSpacing: 0.5,
                            fontSize: { xs: '0.65rem', md: '0.75rem' }
                          }}
                        >
                          Event Starts
                        </Typography>
                        <Typography 
                          variant={isSmall ? "caption" : "body2"}
                          sx={{ 
                            display: 'block',
                            fontSize: { xs: '0.75rem', md: '0.875rem' },
                            lineHeight: 1.4
                          }}
                        >
                          {formatDate(hackathon.start_date)}
                        </Typography>
                      </Box>

                      <Box sx={{ mb: { xs: 1.5, md: 2 } }}>
                        <Typography 
                          variant="caption" 
                          color="text.secondary" 
                          fontWeight="bold"
                          sx={{ 
                            textTransform: 'uppercase', 
                            letterSpacing: 0.5,
                            fontSize: { xs: '0.65rem', md: '0.75rem' }
                          }}
                        >
                          Event Ends
                        </Typography>
                        <Typography 
                          variant={isSmall ? "caption" : "body2"}
                          sx={{ 
                            display: 'block',
                            fontSize: { xs: '0.75rem', md: '0.875rem' },
                            lineHeight: 1.4
                          }}
                        >
                          {formatDate(hackathon.end_date)}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography 
                          variant="caption" 
                          color="text.secondary" 
                          fontWeight="bold"
                          sx={{ 
                            textTransform: 'uppercase', 
                            letterSpacing: 0.5,
                            fontSize: { xs: '0.65rem', md: '0.75rem' }
                          }}
                        >
                          Timezone
                        </Typography>
                        <Typography 
                          variant={isSmall ? "caption" : "body2"}
                          sx={{ 
                            display: 'block',
                            fontSize: { xs: '0.75rem', md: '0.875rem' }
                          }}
                        >
                          {hackathon.timezone}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Quick Actions */}
              <Grid size={12}>
                <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
                  <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <Typography 
                      variant={isSmall ? "subtitle1" : "h6"} 
                      gutterBottom 
                      color="primary" 
                      fontWeight="bold"
                    >
                      Quick Actions
                    </Typography>
                    <Grid container spacing={{ xs: 0.5, md: 1 }}>
                      <Grid size={6}>
                        <Button
                          fullWidth
                          variant="outlined"
                          size={isSmall ? "small" : "medium"}
                          startIcon={!isSmall && <ParticipantsIcon />}
                          onClick={handleRegistrations}
                          sx={{ 
                            fontSize: { xs: '0.65rem', md: '0.75rem' },
                            py: { xs: 0.5, md: 1 },
                            minHeight: { xs: 32, md: 36 }
                          }}
                        >
                          {isSmall ? 'Registrations' : 'Registrations'}
                        </Button>
                      </Grid>
                      <Grid size={6}>
                        <Button
                          fullWidth
                          variant="outlined"
                          size={isSmall ? "small" : "medium"}
                          startIcon={!isSmall && <TeamIcon />}
                          onClick={handleTeams}
                          sx={{ 
                            fontSize: { xs: '0.65rem', md: '0.75rem' },
                            py: { xs: 0.5, md: 1 },
                            minHeight: { xs: 32, md: 36 }
                          }}
                        >
                          Teams
                        </Button>
                      </Grid>
                      <Grid size={6}>
                        <Button
                          fullWidth
                          variant="outlined"
                          size={isSmall ? "small" : "medium"}
                          startIcon={!isSmall && <AnnouncementIcon />}
                          onClick={handleUpdates}
                          sx={{ 
                            fontSize: { xs: '0.65rem', md: '0.75rem' },
                            py: { xs: 0.5, md: 1 },
                            minHeight: { xs: 32, md: 36 }
                          }}
                        >
                          Updates
                        </Button>
                      </Grid>
                      <Grid size={6}>
                        <Button
                          fullWidth
                          variant="outlined"
                          size={isSmall ? "small" : "medium"}
                          startIcon={!isSmall && <AnalyticsIcon />}
                          onClick={handleAnalytics}
                          sx={{ 
                            fontSize: { xs: '0.65rem', md: '0.75rem' },
                            py: { xs: 0.5, md: 1 },
                            minHeight: { xs: 32, md: 36 }
                          }}
                        >
                          Analytics
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>

      {/* AI Copilot Sidepanel */}
      <CopilotSidepanel
        isOpen={copilotOpen}
        onClose={() => {
          setCopilotOpen(false)
          setAnalysisMode(false)
        }}
        onApplySuggestions={handleApplySuggestions}
        formContext={hackathon}
        analysisMode={analysisMode}
      />
    </Box>
  )
}