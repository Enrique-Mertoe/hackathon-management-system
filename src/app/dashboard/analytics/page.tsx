'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
  LinearProgress,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material'
import {
  ArrowBack as BackIcon,
  AutoAwesome as AIIcon,
  TrendingUp as TrendingUpIcon,
  Group as GroupIcon,
  Event as EventIcon,
  EmojiEvents as TrophyIcon,
  AccessTime as TimeIcon,
  Analytics as AnalyticsIcon,
  GetApp as DownloadIcon
} from '@mui/icons-material'
import { auth } from '@/lib/auth'
import type { AuthUser } from '@/lib/auth'
import { CopilotSidepanel } from '@/components/ai/copilot-sidepanel'
import type { FormSuggestion } from '@/components/ai/copilot-sidepanel'

interface AnalyticsData {
  totalViews: number
  registrations: number
  completionRate: number
  avgRating: number
  popularThemes: string[]
  monthlyStats: { month: string; events: number; participants: number }[]
  topHackathons: { name: string; participants: number; rating: number }[]
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copilotOpen, setCopilotOpen] = useState(false)
  const [analyticsInsightsMode, setAnalyticsInsightsMode] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await auth.getCurrentUser()
        if (!currentUser || !auth.hasRole(currentUser, 'ORGANIZER')) {
          router.push('/auth/signin')
          return
        }
        setUser(currentUser)
        await fetchAnalytics()
      } catch (error) {
        console.error('Error checking auth:', error)
        router.push('/auth/signin')
      }
    }

    checkAuth()
  }, [router])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      // Mock data - replace with actual API call
      const mockData: AnalyticsData = {
        totalViews: 12450,
        registrations: 847,
        completionRate: 78,
        avgRating: 4.6,
        popularThemes: ['AI/ML', 'Web3', 'Sustainability', 'FinTech', 'HealthTech'],
        monthlyStats: [
          { month: 'Jan', events: 2, participants: 156 },
          { month: 'Feb', events: 1, participants: 89 },
          { month: 'Mar', events: 3, participants: 234 },
          { month: 'Apr', events: 2, participants: 167 },
          { month: 'May', events: 4, participants: 298 }
        ],
        topHackathons: [
          { name: 'AI Innovation Challenge', participants: 156, rating: 4.8 },
          { name: 'Sustainable Tech Hack', participants: 134, rating: 4.7 },
          { name: 'FinTech Future', participants: 98, rating: 4.5 }
        ]
      }
      setAnalytics(mockData)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGetAnalyticsInsights = () => {
    setAnalyticsInsightsMode(true)
    setCopilotOpen(true)
  }

  const handleApplySuggestions = (suggestions: FormSuggestion[]) => {
    console.log('Analytics insights received:', suggestions)
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
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Button
              variant="text"
              startIcon={<BackIcon />}
              onClick={() => router.push('/dashboard')}
              sx={{ mb: 2 }}
            >
              Back to Dashboard
            </Button>
            <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
              Analytics & Insights
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Track your hackathon performance and gain valuable insights
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Tooltip title="Get AI insights on your analytics data">
              <IconButton
                onClick={handleGetAnalyticsInsights}
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
              variant="contained"
              startIcon={<DownloadIcon />}
              size="small"
            >
              Export Report
            </Button>
          </Box>
        </Box>

        {/* Key Metrics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ boxShadow: 2, borderRadius: 3 }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48, mx: 'auto', mb: 2 }}>
                  <TrendingUpIcon />
                </Avatar>
                <Typography variant="h4" fontWeight="bold" color="primary.main">
                  {analytics?.totalViews.toLocaleString() || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Views
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
                  {analytics?.registrations || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Registrations
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ boxShadow: 2, borderRadius: 3 }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: 'warning.main', width: 48, height: 48, mx: 'auto', mb: 2 }}>
                  <TimeIcon />
                </Avatar>
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                  {analytics?.completionRate || 0}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completion Rate
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ boxShadow: 2, borderRadius: 3 }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: 'info.main', width: 48, height: 48, mx: 'auto', mb: 2 }}>
                  <TrophyIcon />
                </Avatar>
                <Typography variant="h4" fontWeight="bold" color="info.main">
                  {analytics?.avgRating || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Avg Rating
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Popular Themes */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ boxShadow: 2, borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Popular Themes
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                  {analytics?.popularThemes.map((theme, index) => (
                    <Chip
                      key={index}
                      label={theme}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Monthly Performance */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ boxShadow: 2, borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Monthly Performance
                </Typography>
                {analytics?.monthlyStats.map((stat, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">{stat.month}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stat.participants} participants
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(stat.participants / 300) * 100}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Top Performing Hackathons */}
          <Grid size={12}>
            <Card sx={{ boxShadow: 2, borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Top Performing Hackathons
                </Typography>
                <TableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Event Name</TableCell>
                        <TableCell align="right">Participants</TableCell>
                        <TableCell align="right">Rating</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {analytics?.topHackathons.map((hackathon, index) => (
                        <TableRow key={index}>
                          <TableCell component="th" scope="row">
                            {hackathon.name}
                          </TableCell>
                          <TableCell align="right">{hackathon.participants}</TableCell>
                          <TableCell align="right">
                            <Chip
                              label={hackathon.rating}
                              color="success"
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Button size="small" variant="outlined">
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* AI Copilot Sidepanel */}
      <CopilotSidepanel
        isOpen={copilotOpen}
        onClose={() => {
          setCopilotOpen(false)
          setAnalyticsInsightsMode(false)
        }}
        onApplySuggestions={handleApplySuggestions}
        formContext={{ user, analytics }}
        analyticsInsightsMode={analyticsInsightsMode}
      />
    </Box>
  )
}