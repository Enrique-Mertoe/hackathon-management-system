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
  Avatar,
  Divider
} from '@mui/material'
import {
  AutoAwesome as AIIcon,
  ArrowBack as BackIcon,
  PersonAdd as RegisterIcon,
  Group as TeamIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  EmojiEvents as PrizeIcon,
  AccessTime as TimeIcon,
  People as ParticipantsIcon,
  Share as ShareIcon,
  BookmarkBorder as BookmarkIcon
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

export default function PublicHackathonPage() {
  const params = useParams()
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'))
  
  const [user, setUser] = useState<AuthUser | null>(null)
  const [hackathon, setHackathon] = useState<Hackathon | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copilotOpen, setCopilotOpen] = useState(false)
  const [analysisMode, setAnalysisMode] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      try {
        const currentUser = await auth.getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error('Error fetching user:', error)
      }
    }

    getUser()
  }, [])

  useEffect(() => {
    const fetchHackathon = async () => {
      if (!params.id) return

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
  }, [params.id])

  const handleAnalyzeWithAI = () => {
    setAnalysisMode(true)
    setCopilotOpen(true)
  }

  const handleApplySuggestions = (suggestions: FormSuggestion[]) => {
    console.log('Analysis suggestions received:', suggestions)
  }

  const handleRegister = () => {
    if (!user) {
      router.push('/auth/signin')
      return
    }
    // TODO: Implement registration logic
    console.log('Register for hackathon')
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: hackathon?.title,
        text: hackathon?.description,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      // TODO: Show toast notification
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

  const canRegister = () => {
    if (!hackathon) return false
    return hackathon.status === 'REGISTRATION_OPEN' && !isRegistered
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

  if (error || !hackathon) {
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
              onClick={() => router.push('/hackathons')}
              startIcon={<BackIcon />}
            >
              Back to Hackathons
            </Button>
          </CardContent>
        </Card>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="xl" sx={{ py: { xs: 1, sm: 2, md: 3 }, px: { xs: 1, sm: 2 } }}>
        {/* Header */}
        <Box sx={{ mb: { xs: 2, md: 3 } }}>
          <Button
            variant="text"
            startIcon={<BackIcon />}
            onClick={() => router.push('/hackathons')}
            sx={{ mb: { xs: 1, md: 2 } }}
            size={isSmall ? "small" : "medium"}
          >
            Back to Hackathons
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
                variant={isSmall ? "h4" : isMobile ? "h3" : "h2"} 
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
                {hackathon.theme && (
                  <Chip 
                    label={hackathon.theme} 
                    color="secondary" 
                    variant="outlined"
                    size={isSmall ? "small" : "medium"}
                  />
                )}
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
              <Tooltip title="Get AI insights and recommendations for this hackathon">
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
                startIcon={!isSmall && <ShareIcon />}
                size={isSmall ? "small" : "medium"}
                onClick={handleShare}
              >
                {isSmall ? 'Share' : 'Share'}
              </Button>
              <Button
                variant="contained"
                startIcon={!isSmall && <RegisterIcon />}
                size={isSmall ? "small" : "medium"}
                onClick={handleRegister}
                disabled={!canRegister()}
              >
                {isRegistered ? 'Registered' : canRegister() ? 'Register' : 'Registration Closed'}
              </Button>
            </Box>
          </Box>
        </Box>

        <Grid container spacing={{ xs: 2, md: 3 }}>
          {/* Main Content */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Grid container spacing={{ xs: 1.5, md: 2 }}>
              {/* Poster */}
              {hackathon.poster_url && (
                <Grid size={12}>
                  <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
                    <CardMedia
                        //@ts-ignore
                      component="img"
                      // height={{ xs: 200, sm: 300, md: 400 }}
                      height={"150"}
                      image={hackathon.poster_url}
                      alt="Hackathon Poster"
                      sx={{ objectFit: 'cover' }}
                    />
                  </Card>
                </Grid>
              )}
              
              {/* Description */}
              <Grid size={12}>
                <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
                  <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <Typography 
                      variant={isSmall ? "subtitle1" : "h6"} 
                      gutterBottom 
                      color="primary" 
                      fontWeight="bold"
                    >
                      About This Hackathon
                    </Typography>
                    <Typography 
                      variant={isSmall ? "body2" : "body1"} 
                      color="text.secondary"
                      sx={{ lineHeight: { xs: 1.5, md: 1.7 }, mb: 3 }}
                    >
                      {hackathon.description}
                    </Typography>

                    {hackathon.rules && (
                      <>
                        <Divider sx={{ my: 3 }} />
                        <Typography 
                          variant={isSmall ? "subtitle2" : "h6"} 
                          gutterBottom 
                          color="primary" 
                          fontWeight="bold"
                        >
                          Rules & Guidelines
                        </Typography>
                        <Typography 
                          variant={isSmall ? "caption" : "body2"} 
                          color="text.secondary" 
                          sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}
                        >
                          {hackathon.rules}
                        </Typography>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Requirements & Judging Criteria */}
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
                    {hackathon.requirements?.skills && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
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
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                    {hackathon.requirements?.experience_level && (
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                          Experience Level
                        </Typography>
                        <Chip 
                          label={hackathon.requirements.experience_level} 
                          size="small" 
                          color="success" 
                        />
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

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
                    {hackathon.judging_criteria && Object.entries(hackathon.judging_criteria).map(([criterion, weight]) => (
                      <Box key={criterion} sx={{ mb: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                            {criterion.replace('_', ' ')}
                          </Typography>
                          <Typography variant="caption" fontWeight="bold">
                            {weight as number}%
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={weight as number} 
                          sx={{ height: 4, borderRadius: 2 }}
                        />
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Sidebar */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Grid container spacing={{ xs: 1.5, md: 2 }}>
              {/* Event Info */}
              <Grid size={{ xs: 12, sm: 6, lg: 12 }}>
                <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
                  <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <Typography 
                      variant={isSmall ? "subtitle1" : "h6"} 
                      gutterBottom 
                      color="primary" 
                      fontWeight="bold"
                    >
                      Event Details
                    </Typography>
                    <Box sx={{ space: 1.5 }}>
                      <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {hackathon.is_virtual ? 'Virtual Event' : hackathon.location}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TeamIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {hackathon.min_team_size} - {hackathon.max_team_size} members per team
                        </Typography>
                      </Box>
                      {hackathon.prize_pool && (
                        <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PrizeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
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
                  <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <Typography 
                      variant={isSmall ? "subtitle1" : "h6"} 
                      gutterBottom 
                      color="primary" 
                      fontWeight="bold"
                    >
                      Important Dates
                    </Typography>
                    <Box sx={{ space: 1.5 }}>
                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">
                          Registration Period
                        </Typography>
                        <Typography variant="body2">
                          {formatDate(hackathon.registration_start)} - {formatDate(hackathon.registration_end)}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">
                          Hackathon Duration
                        </Typography>
                        <Typography variant="body2">
                          {formatDate(hackathon.start_date)} - {formatDate(hackathon.end_date)}
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