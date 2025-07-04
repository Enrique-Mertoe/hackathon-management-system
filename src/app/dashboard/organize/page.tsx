'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  TextField,
  Chip,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Avatar,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'
import {
  Add as AddIcon,
  Event as EventIcon,
  Group as GroupIcon,
  EmojiEvents as PrizeIcon,
  Visibility as ViewIcon,
  Settings as ManageIcon,
  Search as SearchIcon,
  AutoAwesome as AIIcon
} from '@mui/icons-material'
import { auth } from '@/lib/auth'
import type { AuthUser } from '@/lib/auth'
import { ModernCopilot } from '@/components/ai/modern-copilot'

interface Hackathon {
  id: string
  title: string
  description: string
  status: string
  registration_start: string
  registration_end: string
  start_date: string
  end_date: string
  registration_count: number
  max_participants: number | null
  prize_pool: number | null
  organizer_id: string
  created_at: string
}

export default function OrganizePage() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [copilotOpen, setCopilotOpen] = useState(false)
  const router = useRouter()
  const theme = useTheme()
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'))

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await auth.getCurrentUser()
        if (!currentUser || !auth.hasRole(currentUser, 'ORGANIZER')) {
          router.push('/auth/signin')
          return
        }
        setUser(currentUser)
        await fetchMyHackathons(currentUser.id)
      } catch (error) {
        console.error('Error checking auth:', error)
        router.push('/auth/signin')
      } finally {
        setLoading(false)
      }
    }

    void checkAuth()
  }, [router])

  const fetchMyHackathons = async (organizerId: string) => {
    try {
      // Fetch ALL hackathons created by this organizer (including drafts)
      const response = await fetch(`/api/hackathons?limit=50&organizer_id=${organizerId}&organise=true`)
      const data = await response.json()

      if (response.ok) {
        // API already filters by organizer_id and includes all statuses when organise=true
        setHackathons(data.hackathons || [])
      } else {
        console.error('Error fetching hackathons:', data.error)
      }
    } catch (error) {
      console.error('Error fetching hackathons:', error)
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
      month: 'short',
      day: 'numeric'
    })
  }

  const filteredHackathons = hackathons.filter(hackathon => {
    const matchesSearch = hackathon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hackathon.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || hackathon.status === statusFilter
    return matchesSearch && matchesStatus
  })

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

  if (!user) {
    return null
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 }, px: { xs: 1, sm: 2 } }}>
        {/* Header */}
        <Box sx={{ mb: { xs: 3, md: 4 } }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'space-between',
            gap: { xs: 2, sm: 0 }
          }}>
            <Box>
              <Typography 
                variant={isSmall ? "h4" : "h3"} 
                component="h1" 
                fontWeight="bold" 
                gutterBottom
              >
                Organize Hackathons
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Create and manage your hackathon events
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignSelf: { xs: 'stretch', sm: 'center' } }}>
              <Button
                variant="outlined"
                size={isSmall ? "medium" : "large"}
                startIcon={<AIIcon />}
                onClick={() => setCopilotOpen(true)}
                sx={{ minWidth: 'auto' }}
              >
                {isSmall ? '' : 'AI Analytics'}
              </Button>
              <Button
                variant="contained"
                size={isSmall ? "medium" : "large"}
                startIcon={<AddIcon />}
                onClick={() => router.push('/dashboard/organize/create')}
              >
                Create New Hackathon
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Quick Stats */}
        <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 3, md: 4 } }}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card sx={{ boxShadow: 2, borderRadius: 2, textAlign: 'center', height: '100%' }}>
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 1, width: 40, height: 40 }}>
                  <EventIcon />
                </Avatar>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  Total Events
                </Typography>
                <Typography variant={isSmall ? "h5" : "h4"} fontWeight="bold" color="primary.main">
                  {hackathons.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 6, sm: 3 }}>
            <Card sx={{ boxShadow: 2, borderRadius: 2, textAlign: 'center', height: '100%' }}>
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 1, width: 40, height: 40 }}>
                  <EventIcon />
                </Avatar>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  Active Events
                </Typography>
                <Typography variant={isSmall ? "h5" : "h4"} fontWeight="bold" color="success.main">
                  {hackathons.filter(h => ['REGISTRATION_OPEN', 'ACTIVE', 'JUDGING'].includes(h.status)).length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 6, sm: 3 }}>
            <Card sx={{ boxShadow: 2, borderRadius: 2, textAlign: 'center', height: '100%' }}>
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Avatar sx={{ bgcolor: 'info.main', mx: 'auto', mb: 1, width: 40, height: 40 }}>
                  <GroupIcon />
                </Avatar>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  Total Participants
                </Typography>
                <Typography variant={isSmall ? "h5" : "h4"} fontWeight="bold" color="info.main">
                  {hackathons.reduce((sum, h) => sum + h.registration_count, 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 6, sm: 3 }}>
            <Card sx={{ boxShadow: 2, borderRadius: 2, textAlign: 'center', height: '100%' }}>
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 1, width: 40, height: 40 }}>
                  <PrizeIcon />
                </Avatar>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  Total Prize Pool
                </Typography>
                <Typography variant={isSmall ? "h5" : "h4"} fontWeight="bold" color="warning.main">
                  ${hackathons.reduce((sum, h) => sum + (h.prize_pool || 0), 0).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Search and Filters */}
        <Box sx={{ mb: { xs: 2, md: 3 } }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 8, md: 6 }}>
              <TextField
                placeholder="Search your hackathons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="outlined"
                size={isSmall ? "small" : "medium"}
                fullWidth
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    )
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4, md: 3 }}>
              <FormControl fullWidth size={isSmall ? "small" : "medium"}>
                <InputLabel>Filter by Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Filter by Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="ALL">All Statuses</MenuItem>
                  <MenuItem value="DRAFT">Draft</MenuItem>
                  <MenuItem value="PUBLISHED">Published</MenuItem>
                  <MenuItem value="REGISTRATION_OPEN">Registration Open</MenuItem>
                  <MenuItem value="REGISTRATION_CLOSED">Registration Closed</MenuItem>
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="JUDGING">Judging</MenuItem>
                  <MenuItem value="COMPLETED">Completed</MenuItem>
                  <MenuItem value="CANCELLED">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        {/* Hackathons List */}
        {filteredHackathons.length === 0 ? (
          <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
            <CardContent sx={{ p: { xs: 4, md: 6 }, textAlign: 'center' }}>
              <Avatar 
                sx={{ 
                  width: 64, 
                  height: 64, 
                  bgcolor: 'primary.light', 
                  mx: 'auto', 
                  mb: 2,
                  fontSize: '2rem'
                }}
              >
                {hackathons.length === 0 ? '🚀' : '🔍'}
              </Avatar>
              <Typography variant="h6" fontWeight="semibold" gutterBottom>
                {hackathons.length === 0 ? 'No hackathons yet' : 'No hackathons match your filters'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {hackathons.length === 0 
                  ? 'Create your first hackathon to get started with organizing amazing events.'
                  : 'Try adjusting your search terms or filters to find the hackathons you\'re looking for.'
                }
              </Typography>
              {hackathons.length === 0 && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => router.push('/dashboard/organize/create')}
                >
                  Create Your First Hackathon
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={{ xs: 2, md: 3 }}>
            {filteredHackathons.map((hackathon) => (
              <Grid size={{ xs: 12, lg: 6 }} key={hackathon.id}>
                <Card sx={{ boxShadow: 2, borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ p: { xs: 2, md: 3 }, flexGrow: 1 }}>
                    {/* Header */}
                    <Box sx={{ mb: 2 }}>
                      <Typography 
                        variant={isSmall ? "h6" : "h5"} 
                        fontWeight="bold" 
                        gutterBottom
                        sx={{ lineHeight: 1.3 }}
                      >
                        {hackathon.title}
                      </Typography>
                      <Chip 
                        label={hackathon.status.replace('_', ' ')} 
                        {...getStatusColor(hackathon.status)}
                        size="small"
                        sx={{ mb: 1 }}
                      />
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          lineHeight: 1.5
                        }}
                      >
                        {hackathon.description}
                      </Typography>
                    </Box>

                    {/* Details Grid */}
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid size={12}>
                        <Typography variant="caption" color="text.secondary">
                          Registration Period
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {formatDate(hackathon.registration_start)} - {formatDate(hackathon.registration_end)}
                        </Typography>
                      </Grid>
                      <Grid size={12}>
                        <Typography variant="caption" color="text.secondary">
                          Event Period
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {formatDate(hackathon.start_date)} - {formatDate(hackathon.end_date)}
                        </Typography>
                      </Grid>
                      <Grid size={6}>
                        <Typography variant="caption" color="text.secondary">
                          Participants
                        </Typography>
                        <Typography variant="body2" fontWeight="medium" color="primary">
                          {hackathon.registration_count}
                          {hackathon.max_participants && ` / ${hackathon.max_participants}`}
                        </Typography>
                      </Grid>
                      {hackathon.prize_pool && (
                        <Grid size={6}>
                          <Typography variant="caption" color="text.secondary">
                            Prize Pool
                          </Typography>
                          <Typography variant="body2" fontWeight="medium" color="primary">
                            ${hackathon.prize_pool.toLocaleString()}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                      <Button
                        variant="contained"
                        startIcon={<ManageIcon />}
                        onClick={() => router.push(`/dashboard/organize/${hackathon.id}`)}
                        sx={{ flex: 1 }}
                        size={isSmall ? "small" : "medium"}
                      >
                        Manage
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<ViewIcon />}
                        onClick={() => router.push(`/hackathons/${hackathon.id}`)}
                        sx={{ flex: 1 }}
                        size={isSmall ? "small" : "medium"}
                      >
                        View Public
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* AI Copilot */}
      <ModernCopilot
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        currentUser={user}
        page="organizer-dashboard"
        data={{
          hackathons: hackathons
        }}
      />
    </Box>
  )
}