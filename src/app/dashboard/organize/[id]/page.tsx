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
  CircularProgress
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
  Announcement as AnnouncementIcon
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
  const [user, setUser] = useState<AuthUser | null>(null)
  const [hackathon, setHackathon] = useState<Hackathon | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copilotOpen, setCopilotOpen] = useState(false)
  const [analysisMode, setAnalysisMode] = useState(false)

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
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            variant="text"
            startIcon={<BackIcon />}
            onClick={() => router.push('/dashboard/organize')}
            sx={{ mb: 2 }}
          >
            Back to Organize
          </Button>
          
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 3 }}>
            <Box>
              <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
                {hackathon.title}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Chip 
                  label={hackathon.status.replace('_', ' ')} 
                  {...getStatusColor(hackathon.status)}
                  size="small"
                />
                <Typography variant="body2" color="text.secondary">
                  <ParticipantsIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                  {hackathon.registration_count} registered
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
              <Tooltip title="Analyze with AI - Get insights, tech recommendations, and preparation tips">
                <IconButton
                  onClick={handleAnalyzeWithAI}
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    width: 48,
                    height: 48,
                    '&:hover': {
                      bgcolor: 'primary.dark',
                      transform: 'scale(1.05)'
                    },
                    transition: 'all 0.2s ease-in-out',
                    boxShadow: 2
                  }}
                >
                  <AIIcon />
                </IconButton>
              </Tooltip>
              <Button
                variant="outlined"
                startIcon={<ViewIcon />}
                size="small"
              >
                View Public
              </Button>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                size="small"
              >
                Edit
              </Button>
            </Box>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Main Content - Left Side */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Grid container spacing={2}>
              {/* Poster Section */}
              {hackathon.poster_url && (
                <Grid size={12}>
                  <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
                    <CardMedia
                      component="img"
                      height={200}
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
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                      Overview
                    </Typography>
                    <Box sx={{ space: 2 }}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                          Description
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {hackathon.description}
                        </Typography>
                      </Box>
                      
                      {hackathon.theme && (
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                            Theme
                          </Typography>
                          <Chip label={hackathon.theme} color="secondary" variant="outlined" size="small" />
                        </Box>
                      )}

                      {hackathon.rules && (
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                            Rules & Guidelines
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
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
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                        Requirements
                      </Typography>
                      <Box sx={{ space: 2 }}>
                        {hackathon.requirements.skills && hackathon.requirements.skills.length > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                              Skills
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {hackathon.requirements.skills.map((skill: string, index: number) => (
                                <Chip key={index} label={skill} size="small" color="info" variant="outlined" />
                              ))}
                            </Box>
                          </Box>
                        )}
                        
                        {hackathon.requirements.tools && hackathon.requirements.tools.length > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                              Tools
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {hackathon.requirements.tools.map((tool: string, index: number) => (
                                <Chip key={index} label={tool} size="small" color="warning" variant="outlined" />
                              ))}
                            </Box>
                          </Box>
                        )}

                        {hackathon.requirements.experience_level && (
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                              Experience Level
                            </Typography>
                            <Chip 
                              label={hackathon.requirements.experience_level} 
                              size="small" 
                              color="success" 
                              variant="filled" 
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
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                        Judging Criteria
                      </Typography>
                      <Box sx={{ space: 1 }}>
                        {Object.entries(hackathon.judging_criteria).map(([criterion, weight]) => (
                          <Box key={criterion} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="body2" fontWeight="medium" sx={{ textTransform: 'capitalize' }}>
                              {criterion.replace('_', ' ')}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={weight as number} 
                                sx={{ width: 60, height: 6, borderRadius: 3 }}
                              />
                              <Typography variant="body2" color="text.secondary" fontWeight="bold">
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
            <Grid container spacing={2}>
              {/* Event Details */}
              <Grid size={{ xs: 12, sm: 6, lg: 12 }}>
                <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                      <EventIcon sx={{ fontSize: 20, mr: 1, verticalAlign: 'middle' }} />
                      Event Details
                    </Typography>
                    <Box sx={{ space: 2 }}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">
                          Difficulty
                        </Typography>
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {hackathon.difficulty_level.toLowerCase()}
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">
                          <LocationIcon sx={{ fontSize: 12, mr: 0.5 }} />
                          Location
                        </Typography>
                        <Typography variant="body2">
                          {hackathon.is_virtual ? 'Virtual Event' : hackathon.location}
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">
                          <TeamIcon sx={{ fontSize: 12, mr: 0.5 }} />
                          Team Size
                        </Typography>
                        <Typography variant="body2">
                          {hackathon.min_team_size} - {hackathon.max_team_size} members
                        </Typography>
                      </Box>

                      {hackathon.max_participants && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="text.secondary" fontWeight="bold">
                            Max Participants
                          </Typography>
                          <Typography variant="body2">
                            {hackathon.max_participants.toLocaleString()}
                          </Typography>
                        </Box>
                      )}

                      {hackathon.prize_pool && (
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight="bold">
                            <PrizeIcon sx={{ fontSize: 12, mr: 0.5 }} />
                            Prize Pool
                          </Typography>
                          <Typography variant="h6" color="primary" fontWeight="bold">
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
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                      <TimeIcon sx={{ fontSize: 20, mr: 1, verticalAlign: 'middle' }} />
                      Timeline
                    </Typography>
                    <Box sx={{ space: 2 }}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">
                          Registration Opens
                        </Typography>
                        <Typography variant="body2">
                          {formatDate(hackathon.registration_start)}
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">
                          Registration Closes
                        </Typography>
                        <Typography variant="body2">
                          {formatDate(hackathon.registration_end)}
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">
                          Event Starts
                        </Typography>
                        <Typography variant="body2">
                          {formatDate(hackathon.start_date)}
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">
                          Event Ends
                        </Typography>
                        <Typography variant="body2">
                          {formatDate(hackathon.end_date)}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">
                          Timezone
                        </Typography>
                        <Typography variant="body2">
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
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                      Quick Actions
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid size={6}>
                        <Button
                          fullWidth
                          variant="outlined"
                          size="small"
                          startIcon={<ParticipantsIcon />}
                          sx={{ fontSize: '0.75rem' }}
                        >
                          Registrations
                        </Button>
                      </Grid>
                      <Grid size={6}>
                        <Button
                          fullWidth
                          variant="outlined"
                          size="small"
                          startIcon={<TeamIcon />}
                          sx={{ fontSize: '0.75rem' }}
                        >
                          Teams
                        </Button>
                      </Grid>
                      <Grid size={6}>
                        <Button
                          fullWidth
                          variant="outlined"
                          size="small"
                          startIcon={<AnnouncementIcon />}
                          sx={{ fontSize: '0.75rem' }}
                        >
                          Updates
                        </Button>
                      </Grid>
                      <Grid size={6}>
                        <Button
                          fullWidth
                          variant="outlined"
                          size="small"
                          startIcon={<AnalyticsIcon />}
                          sx={{ fontSize: '0.75rem' }}
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