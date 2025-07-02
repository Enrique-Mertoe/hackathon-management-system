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
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  CircularProgress,
  LinearProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider
} from '@mui/material'
import {
  Add as AddIcon,
  AutoAwesome as AIIcon,
  Analytics as AnalyticsIcon,
  Event as EventIcon,
  Group as GroupIcon,
  EmojiEvents as TrophyIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as ReportIcon,
  Notifications as NotificationIcon,
  PlayArrow as LaunchIcon
} from '@mui/icons-material'
import type { AuthUser } from '@/lib/auth'
import { CopilotSidepanel } from '@/components/ai/copilot-sidepanel'
import type { FormSuggestion } from '@/components/ai/copilot-sidepanel'

interface Hackathon {
  id: string
  title: string
  status: string
  registration_count: number
  max_participants: number
  start_date: string
  prize_pool: number
  theme: string
}

interface DashboardStats {
  totalHackathons: number
  activeHackathons: number
  totalParticipants: number
  totalPrizePool: number
  draftHackathons: number
  completedHackathons: number
}

interface OrganizerDashboardProps {
  user: AuthUser
}

export default function OrganizerDashboard({ user }: OrganizerDashboardProps) {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentHackathons, setRecentHackathons] = useState<Hackathon[]>([])
  const [loading, setLoading] = useState(true)
  const [copilotOpen, setCopilotOpen] = useState(false)
  const [organizerInsightsMode, setOrganizerInsightsMode] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch organizer stats
      const statsResponse = await fetch('/api/organizer/stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // Fetch recent hackathons
      const hackathonsResponse = await fetch('/api/hackathons?organizer=true&limit=5')
      if (hackathonsResponse.ok) {
        const hackathonsData = await hackathonsResponse.json()
        setRecentHackathons(hackathonsData.hackathons || [])
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGetOrganizerInsights = () => {
    setOrganizerInsightsMode(true)
    setCopilotOpen(true)
  }

  const handleApplySuggestions = (suggestions: FormSuggestion[]) => {
    // For organizer insights, we might not need to apply suggestions
    // But we can log them for future use
    console.log('Organizer insights received:', suggestions)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
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

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh'
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Welcome Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
            Welcome back, {user.email}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your hackathons and inspire innovation
          </Typography>
        </Box>
        <Tooltip title="Get organizer insights and tips from AI">
          <IconButton
            onClick={handleGetOrganizerInsights}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              width: 56,
              height: 56,
              '&:hover': {
                bgcolor: 'primary.dark',
                transform: 'scale(1.05)'
              },
              transition: 'all 0.2s ease-in-out',
              boxShadow: 3
            }}
          >
            <AIIcon fontSize="large" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ boxShadow: 2, borderRadius: 3 }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48, mx: 'auto', mb: 2 }}>
                <EventIcon />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="primary.main">
                {stats?.totalHackathons || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Events
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ boxShadow: 2, borderRadius: 3 }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'success.main', width: 48, height: 48, mx: 'auto', mb: 2 }}>
                <GroupIcon />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {stats?.totalParticipants || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Participants
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ boxShadow: 2, borderRadius: 3 }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'warning.main', width: 48, height: 48, mx: 'auto', mb: 2 }}>
                <TrophyIcon />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {stats?.totalPrizePool ? formatCurrency(stats.totalPrizePool) : '$0'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Prizes
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ boxShadow: 2, borderRadius: 3 }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'info.main', width: 48, height: 48, mx: 'auto', mb: 2 }}>
                <LaunchIcon />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="info.main">
                {stats?.activeHackathons || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Events
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Main Action Card */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ boxShadow: 3, borderRadius: 3, bgcolor: 'primary.50' }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64 }}>
                  <AddIcon fontSize="large" />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Create New Hackathon
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Launch your next innovation event and bring brilliant minds together to solve real-world challenges.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                    <Chip label="AI-Powered Setup" color="primary" size="small" />
                    <Chip label="Global Reach" color="success" size="small" />
                    <Chip label="Real-time Analytics" color="info" size="small" />
                  </Box>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<AddIcon />}
                    onClick={() => router.push('/dashboard/organize/create')}
                    sx={{ boxShadow: 2 }}
                  >
                    Start Creating
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Recent Hackathons */}
          <Card sx={{ boxShadow: 2, borderRadius: 3, mt: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">
                  Recent Hackathons
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ViewIcon />}
                  onClick={() => router.push('/dashboard/organize')}
                >
                  View All
                </Button>
              </Box>
              
              {recentHackathons.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No hackathons yet. Create your first one!
                  </Typography>
                </Box>
              ) : (
                <List sx={{ p: 0 }}>
                  {recentHackathons.map((hackathon, index) => (
                    <React.Fragment key={hackathon.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.light' }}>
                            <EventIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={hackathon.title}
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <Chip 
                                {...getStatusColor(hackathon.status)}
                                label={hackathon.status.replace('_', ' ')}
                                size="small"
                              />
                              <Typography variant="caption" color="text.secondary">
                                {hackathon.registration_count} participants
                              </Typography>
                            </Box>
                          }
                        />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => router.push(`/dashboard/organize/${hackathon.id}`)}
                          >
                            <ViewIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => router.push(`/dashboard/organize/edit/${hackathon.id}`)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Box>
                      </ListItem>
                      {index < recentHackathons.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Grid container spacing={2}>
            {/* Event Pipeline */}
            <Grid size={12}>
              <Card sx={{ boxShadow: 2, borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Event Pipeline
                  </Typography>
                  
                  <Box sx={{ space: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2">Draft</Typography>
                      <Typography variant="h6" color="warning.main" fontWeight="bold">
                        {stats?.draftHackathons || 0}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(stats?.draftHackathons || 0) * 10} 
                      sx={{ mb: 2, height: 6, borderRadius: 3 }}
                      color="warning"
                    />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2">Active</Typography>
                      <Typography variant="h6" color="success.main" fontWeight="bold">
                        {stats?.activeHackathons || 0}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(stats?.activeHackathons || 0) * 10} 
                      sx={{ mb: 2, height: 6, borderRadius: 3 }}
                      color="success"
                    />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2">Completed</Typography>
                      <Typography variant="h6" color="info.main" fontWeight="bold">
                        {stats?.completedHackathons || 0}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(stats?.completedHackathons || 0) * 10} 
                      sx={{ height: 6, borderRadius: 3 }}
                      color="info"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Quick Actions */}
            <Grid size={12}>
              <Card sx={{ boxShadow: 2, borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Quick Actions
                  </Typography>
                  
                  <Grid container spacing={1}>
                    <Grid size={6}>
                      <Button
                        fullWidth
                        variant="outlined"
                        size="small"
                        startIcon={<AnalyticsIcon />}
                        onClick={() => router.push('/dashboard/analytics')}
                        sx={{ fontSize: '0.75rem' }}
                      >
                        Analytics
                      </Button>
                    </Grid>
                    <Grid size={6}>
                      <Button
                        fullWidth
                        variant="outlined"
                        size="small"
                        startIcon={<GroupIcon />}
                        onClick={() => router.push('/dashboard/participants')}
                        sx={{ fontSize: '0.75rem' }}
                      >
                        Participants
                      </Button>
                    </Grid>
                    <Grid size={6}>
                      <Button
                        fullWidth
                        variant="outlined"
                        size="small"
                        startIcon={<ReportIcon />}
                        onClick={() => router.push('/dashboard/reports')}
                        sx={{ fontSize: '0.75rem' }}
                      >
                        Reports
                      </Button>
                    </Grid>
                    <Grid size={6}>
                      <Button
                        fullWidth
                        variant="outlined"
                        size="small"
                        startIcon={<ScheduleIcon />}
                        onClick={() => router.push('/dashboard/schedule')}
                        sx={{ fontSize: '0.75rem' }}
                      >
                        Schedule
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Performance Insights */}
            <Grid size={12}>
              <Card sx={{ boxShadow: 2, borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Performance
                  </Typography>
                  
                  <Box sx={{ space: 2 }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" gutterBottom>
                        Avg. Participation Rate
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={85} 
                        sx={{ height: 8, borderRadius: 4 }}
                        color="success"
                      />
                      <Typography variant="caption" color="text.secondary">
                        85% (Excellent)
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" gutterBottom>
                        Event Success Rate
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={92} 
                        sx={{ height: 8, borderRadius: 4 }}
                        color="primary"
                      />
                      <Typography variant="caption" color="text.secondary">
                        92% (Outstanding)
                      </Typography>
                    </Box>

                    <Button
                      fullWidth
                      variant="text"
                      size="small"
                      startIcon={<TrendingUpIcon />}
                      onClick={() => router.push('/dashboard/insights')}
                      sx={{ mt: 1 }}
                    >
                      View Detailed Insights
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* AI Copilot Sidepanel */}
      <CopilotSidepanel
        isOpen={copilotOpen}
        onClose={() => {
          setCopilotOpen(false)
          setOrganizerInsightsMode(false)
        }}
        onApplySuggestions={handleApplySuggestions}
        formContext={{ user, stats, recentHackathons }}
        organizerInsightsMode={organizerInsightsMode}
      />
    </Container>
  )
}