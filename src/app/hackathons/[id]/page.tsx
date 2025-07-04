'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { usePageCache } from '@/lib/cache'
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
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert
} from '@mui/material'
import {
  AutoAwesome as AIIcon,
  ArrowBack as BackIcon,
  PersonAdd as RegisterIcon,
  PersonRemove as UnregisterIcon,
  Group as TeamIcon,
  LocationOn as LocationIcon,
  EmojiEvents as PrizeIcon,
  People as ParticipantsIcon,
  Share as ShareIcon,
  Refresh as RefreshIcon,
  Update as UpdateIcon,
  Twitter as TwitterIcon,
  Facebook as FacebookIcon,
  LinkedIn as LinkedInIcon,
  ContentCopy as CopyIcon,
  KeyboardArrowDown as ArrowDownIcon,
  WhatsApp as WhatsAppIcon,
  Telegram as TelegramIcon,
  Reddit as RedditIcon
} from '@mui/icons-material'
import { auth } from '@/lib/auth'
import type { AuthUser } from '@/lib/auth'
import { ModernCopilot } from '@/components/ai/modern-copilot'

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
  const [copilotOpen, setCopilotOpen] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [registrationLoading, setRegistrationLoading] = useState(false)
  const [checkingRegistration, setCheckingRegistration] = useState(false)
  const [shareMenuAnchor, setShareMenuAnchor] = useState<null | HTMLElement>(null)
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success' | 'error'}>({open: false, message: '', severity: 'success'})

  // Use page cache for hackathon data
  const { 
    data: hackathon, 
    loading, 
    error, 
    isStale, 
    mutate 
  } = usePageCache<Hackathon>(
    `/hackathons/${params.id}`,
    undefined, // No additional parameters for detail pages
    async () => {
      if (!params.id) throw new Error('No hackathon ID provided')

      const response = await fetch(`/api/hackathons/${params.id}`)
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Hackathon not found')
        } else {
          throw new Error('Failed to load hackathon')
        }
      }
      
      return await response.json()
    },
    {
      ttl: 10 * 60 * 1000, // 10 minutes for detail pages (longer since they change less frequently)
      staleTime: 2 * 60 * 1000, // 2 minutes stale time for details
    }
  )

  useEffect(() => {
    const getUser = async () => {
      try {
        const currentUser = await auth.getCurrentUser()
        setUser(currentUser)
        
        // Check registration status if user is logged in and hackathon is loaded
        if (currentUser && params.id) {
          await checkRegistrationStatus()
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      }
    }

    getUser()
  }, [params.id])

  // Check registration status when hackathon data loads
  useEffect(() => {
    if (user && hackathon && !checkingRegistration) {
      checkRegistrationStatus()
    }
  }, [user, hackathon])

  // Update meta tags for social sharing
  useEffect(() => {
    if (hackathon) {
      // Update page title
      document.title = `${hackathon.title} | HackHub`
      
      // Update or create meta tags for social sharing
      const updateMetaTag = (name: string, content: string, property?: boolean) => {
        const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`
        let meta = document.querySelector(selector) as HTMLMetaElement
        if (!meta) {
          meta = document.createElement('meta')
          if (property) {
            meta.setAttribute('property', name)
          } else {
            meta.setAttribute('name', name)
          }
          document.head.appendChild(meta)
        }
        meta.setAttribute('content', content)
      }
      
      // Basic meta tags
      updateMetaTag('description', hackathon.description)
      updateMetaTag('keywords', `hackathon, coding, competition, ${hackathon.theme}, programming`)
      
      // Open Graph tags
      updateMetaTag('og:title', hackathon.title, true)
      updateMetaTag('og:description', hackathon.description, true)
      updateMetaTag('og:type', 'website', true)
      updateMetaTag('og:url', window.location.href, true)
      updateMetaTag('og:site_name', 'HackHub', true)
      
      // Add structured data for better engagement
      const structuredDescription = `🚀 ${hackathon.title} • 💰 ${formatCurrency(hackathon.prize_pool || 0)} Prize Pool • 👥 ${hackathon.registration_count} Participants • 📅 ${formatDate(hackathon.start_date)} - ${formatDate(hackathon.end_date)}`
      updateMetaTag('og:description', structuredDescription, true)
      
      if (hackathon.poster_url) {
        updateMetaTag('og:image', hackathon.poster_url, true)
        updateMetaTag('og:image:width', '1200', true)
        updateMetaTag('og:image:height', '630', true)
        updateMetaTag('og:image:alt', `${hackathon.title} - Hackathon Poster`, true)
      }
      
      // Twitter Card tags
      updateMetaTag('twitter:card', hackathon.poster_url ? 'summary_large_image' : 'summary')
      updateMetaTag('twitter:title', hackathon.title)
      updateMetaTag('twitter:description', structuredDescription)
      updateMetaTag('twitter:site', '@HackHub')
      
      if (hackathon.poster_url) {
        updateMetaTag('twitter:image', hackathon.poster_url)
        updateMetaTag('twitter:image:alt', `${hackathon.title} - Hackathon Poster`)
      }
      
      // Additional meta tags for better social sharing
      updateMetaTag('article:author', 'HackHub')
      updateMetaTag('article:section', 'Technology')
      updateMetaTag('article:tag', `hackathon,coding,${hackathon.theme}`)
    }
  }, [hackathon])

  const checkRegistrationStatus = async () => {
    if (!user || !params.id) return
    
    setCheckingRegistration(true)
    try {
      const response = await fetch(`/api/hackathons/${params.id}/register`)
      if (response.ok) {
        const data = await response.json()
        setIsRegistered(data.isRegistered)
      }
    } catch (error) {
      console.error('Error checking registration status:', error)
    } finally {
      setCheckingRegistration(false)
    }
  }

  const handleAnalyzeWithAI = () => {
    setCopilotOpen(true)
  }


  const handleRegister = async () => {
    if (!user) {
      router.push('/auth/signin')
      return
    }

    if (!hackathon) return

    setRegistrationLoading(true)
    try {
      const response = await fetch(`/api/hackathons/${params.id}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (response.ok) {
        setIsRegistered(true)
        setSnackbar({
          open: true,
          message: 'Successfully registered for hackathon!',
          severity: 'success'
        })
        // Refresh hackathon data to get updated registration count
        void mutate()
      } else {
        setSnackbar({
          open: true,
          message: data.error || 'Failed to register for hackathon',
          severity: 'error'
        })
      }
    } catch (error) {
      console.error('Error registering for hackathon:', error)
      setSnackbar({
        open: true,
        message: 'An error occurred while registering',
        severity: 'error'
      })
    } finally {
      setRegistrationLoading(false)
    }
  }

  const handleUnregister = async () => {
    if (!user || !hackathon) return

    setRegistrationLoading(true)
    try {
      const response = await fetch(`/api/hackathons/${params.id}/register`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        setIsRegistered(false)
        setSnackbar({
          open: true,
          message: 'Successfully unregistered from hackathon',
          severity: 'success'
        })
        // Refresh hackathon data to get updated registration count
        void mutate()
      } else {
        setSnackbar({
          open: true,
          message: data.error || 'Failed to unregister from hackathon',
          severity: 'error'
        })
      }
    } catch (error) {
      console.error('Error unregistering from hackathon:', error)
      setSnackbar({
        open: true,
        message: 'An error occurred while unregistering',
        severity: 'error'
      })
    } finally {
      setRegistrationLoading(false)
    }
  }

  const handleShareMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setShareMenuAnchor(event.currentTarget)
  }

  const handleShareMenuClose = () => {
    setShareMenuAnchor(null)
  }

  const handleShare = async (platform: string) => {
    if (!hackathon) return
    
    const url = window.location.href
    const title = hackathon.title
    const description = hackathon.description.length > 120 
      ? hackathon.description.substring(0, 120) + '...' 
      : hackathon.description
    
    // Enhanced text with more details
    const basicText = `🚀 ${title}\n\n${description}\n\n💰 Prize Pool: ${formatCurrency(hackathon.prize_pool || 0)}\n👥 ${hackathon.registration_count} participants registered\n\n#hackathon #coding #innovation`
    
    // Shortened text for platforms with character limits
    const shortText = `🚀 ${title} - ${formatCurrency(hackathon.prize_pool || 0)} prize pool! Join ${hackathon.registration_count} developers in this exciting hackathon! #hackathon #coding`
    
    let shareUrl = ''
    
    switch (platform) {
      case 'twitter':
        // Twitter has 280 character limit, so use shorter text
        const twitterText = shortText.length > 240 ? shortText.substring(0, 240) + '...' : shortText
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodeURIComponent(url)}`
        
        // If there's a poster image, add it as a media parameter (Twitter will fetch it from the URL's Open Graph tags)
        if (hackathon.poster_url) {
          shareUrl += `&via=HackHub`
        }
        break
        
      case 'facebook':
        // Facebook automatically fetches Open Graph data including images
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        
        // Add quote parameter for better engagement
        const facebookQuote = `${title} - ${description}`
        shareUrl += `&quote=${encodeURIComponent(facebookQuote)}`
        break
        
      case 'linkedin':
        // LinkedIn also uses Open Graph data, but we can add summary and source
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
        shareUrl += `&summary=${encodeURIComponent(description)}`
        shareUrl += `&source=HackHub`
        break
        
      case 'copy':
        // Enhanced copy format with all details
        const copyText = `${title}\n\n${hackathon.description}\n\n🎯 Theme: ${hackathon.theme}\n💰 Prize Pool: ${formatCurrency(hackathon.prize_pool || 0)}\n👥 ${hackathon.registration_count} participants\n📅 ${formatDate(hackathon.start_date)} - ${formatDate(hackathon.end_date)}\n\n${url}`
        
        void navigator.clipboard.writeText(copyText).then(() => {
          setSnackbar({
            open: true,
            message: 'Hackathon details copied to clipboard!',
            severity: 'success'
          })
        })
        handleShareMenuClose()
        return
        
      case 'native':
        if (navigator.share) {
          const shareData: ShareData = {
            title: title,
            text: basicText,
            url: url,
          }
          
          // Try to include image file if available and supported
          if (hackathon.poster_url && 'files' in navigator.share) {
            try {
              const response = await fetch(hackathon.poster_url)
              const blob = await response.blob()
              const file = new File([blob], 'hackathon-poster.jpg', { type: blob.type })
              shareData.files = [file]
            } catch (error) {
              console.warn('Could not include image in native share:', error)
            }
          }
          
          void navigator.share(shareData)
        }
        handleShareMenuClose()
        return
        
      case 'whatsapp':
        // WhatsApp sharing with formatted text
        const whatsappText = `🚀 *${title}*\n\n${description}\n\n💰 Prize Pool: *${formatCurrency(hackathon.prize_pool || 0)}*\n👥 ${hackathon.registration_count} participants registered\n📅 ${formatDate(hackathon.start_date)}\n\n${url}`
        shareUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`
        break
        
      case 'telegram':
        // Telegram sharing
        const telegramText = `🚀 ${title}\n\n${description}\n\n💰 Prize Pool: ${formatCurrency(hackathon.prize_pool || 0)}\n👥 ${hackathon.registration_count} participants\n\n${url}`
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(telegramText)}`
        break
        
      case 'reddit':
        // Reddit sharing
        shareUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(`🚀 ${title} - ${formatCurrency(hackathon.prize_pool || 0)} Prize Pool!`)}`
        break
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400')
    }
    
    handleShareMenuClose()
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
    if (!hackathon || !user) return false
    return hackathon.status === 'REGISTRATION_OPEN' && !isRegistered
  }

  const getRegistrationButtonText = () => {
    if (!user) return 'Sign In to Register'
    if (checkingRegistration) return 'Checking...'
    if (registrationLoading) return isRegistered ? 'Unregistering...' : 'Registering...'
    if (isRegistered) return 'Unregister'
    if (hackathon?.status !== 'REGISTRATION_OPEN') return 'Registration Closed'
    return 'Register'
  }

  const getRegistrationButtonColor = () => {
    if (isRegistered) return 'error' as const
    return 'primary' as const
  }

  const getRegistrationButtonIcon = () => {
    if (isRegistered) return <UnregisterIcon />
    return <RegisterIcon />
  }

  if (loading && !hackathon) {
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

  if (error && !hackathon) {
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
              {error?.message || 'Failed to load hackathon'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                onClick={() => mutate()}
                startIcon={<RefreshIcon />}
              >
                Retry
              </Button>
              <Button
                variant="contained"
                onClick={() => router.push('/hackathons')}
                startIcon={<BackIcon />}
              >
                Back to Hackathons
              </Button>
            </Box>
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
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: { xs: 1, md: 2 } }}>
            <Button
              variant="text"
              startIcon={<BackIcon />}
              onClick={() => router.back()}
              size={isSmall ? "small" : "medium"}
            >
              Back
            </Button>
            
            {/* Cache Status Indicators */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {isStale && (
                <Tooltip title="Data is being updated in the background">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <UpdateIcon sx={{ fontSize: 16, color: 'warning.main', animation: 'pulse 2s infinite' }} />
                    <Typography variant="caption" color="warning.main">
                      Updating
                    </Typography>
                  </Box>
                </Tooltip>
              )}
              {loading && hackathon && (
                <CircularProgress size={16} thickness={4} />
              )}
              <Tooltip title="Refresh hackathon data">
                <IconButton
                  onClick={() => mutate()}
                  disabled={loading}
                  size="small"
                  sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}
                >
                  <RefreshIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
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
                endIcon={!isSmall && <ArrowDownIcon />}
                size={isSmall ? "small" : "medium"}
                onClick={handleShareMenuOpen}
              >
                Share
              </Button>
              <Button
                variant="contained"
                color={getRegistrationButtonColor()}
                startIcon={!isSmall && getRegistrationButtonIcon()}
                size={isSmall ? "small" : "medium"}
                onClick={isRegistered ? handleUnregister : handleRegister}
                disabled={(!canRegister() && !isRegistered) || registrationLoading || checkingRegistration}
              >
                {getRegistrationButtonText()}
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

      {/* AI Copilot */}
      <ModernCopilot
        isOpen={copilotOpen}
        onClose={() => {
          setCopilotOpen(false)
        }}
        currentUser={user}
        page={`hackathon-${params.id}`}
        data={{
          hackathon,
          isPublicView: true,
          canRegister: canRegister(),
          isRegistered,
          userRole: user?.role || 'anonymous'
        }}
      />

      {/* Share Menu */}
      <Menu
        anchorEl={shareMenuAnchor}
        open={Boolean(shareMenuAnchor)}
        onClose={handleShareMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {typeof window !== 'undefined' && 'share' in navigator && (
          <MenuItem onClick={() => handleShare('native')}>
            <ListItemIcon>
              <ShareIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Share via...</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={() => handleShare('twitter')}>
          <ListItemIcon>
            <TwitterIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share on Twitter</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleShare('facebook')}>
          <ListItemIcon>
            <FacebookIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share on Facebook</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleShare('linkedin')}>
          <ListItemIcon>
            <LinkedInIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share on LinkedIn</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleShare('whatsapp')}>
          <ListItemIcon>
            <WhatsAppIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share on WhatsApp</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleShare('telegram')}>
          <ListItemIcon>
            <TelegramIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share on Telegram</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleShare('reddit')}>
          <ListItemIcon>
            <RedditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share on Reddit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleShare('copy')}>
          <ListItemIcon>
            <CopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Copy Details</ListItemText>
        </MenuItem>
      </Menu>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}