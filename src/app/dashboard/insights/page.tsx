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
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material'
import {
  ArrowBack as BackIcon,
  AutoAwesome as AIIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Lightbulb as InsightIcon,
  Warning as WarningIcon,
  CheckCircle as SuccessIcon,
  Info as InfoIcon,
  Star as StarIcon,
  Group as GroupIcon,
  Event as EventIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material'
import { auth } from '@/lib/auth'
import type { AuthUser } from '@/lib/auth'
import { CopilotSidepanel } from '@/components/ai/copilot-sidepanel'
import type { FormSuggestion } from '@/components/ai/copilot-sidepanel'

interface InsightData {
  performanceMetrics: {
    participantRetention: number
    avgEventRating: number
    completionRate: number
    growthRate: number
  }
  insights: {
    id: string
    type: 'SUCCESS' | 'WARNING' | 'INFO' | 'TREND'
    title: string
    description: string
    impact: 'HIGH' | 'MEDIUM' | 'LOW'
    actionable: boolean
  }[]
  recommendations: {
    id: string
    category: string
    title: string
    description: string
    priority: 'HIGH' | 'MEDIUM' | 'LOW'
    estimatedImpact: string
  }[]
  trends: {
    metric: string
    currentValue: number
    previousValue: number
    change: number
    trend: 'UP' | 'DOWN' | 'STABLE'
  }[]
}

export default function InsightsPage() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [insightData, setInsightData] = useState<InsightData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copilotOpen, setCopilotOpen] = useState(false)
  const [deepInsightsMode, setDeepInsightsMode] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await auth.getCurrentUser()
        if (!currentUser || !auth.hasRole(currentUser, 'ORGANIZER')) {
          router.push('/auth/signin')
          return
        }
        setUser(currentUser)
        await fetchInsightData()
      } catch (error) {
        console.error('Error checking auth:', error)
        router.push('/auth/signin')
      }
    }

    checkAuth()
  }, [router])

  const fetchInsightData = async () => {
    try {
      setLoading(true)
      // Mock data - replace with actual API call
      const mockData: InsightData = {
        performanceMetrics: {
          participantRetention: 87,
          avgEventRating: 4.6,
          completionRate: 78,
          growthRate: 23
        },
        insights: [
          {
            id: '1',
            type: 'SUCCESS',
            title: 'High Participant Satisfaction',
            description: 'Your hackathons consistently receive ratings above 4.5/5, indicating excellent participant experience.',
            impact: 'HIGH',
            actionable: false
          },
          {
            id: '2',
            type: 'WARNING',
            title: 'Declining Completion Rates',
            description: 'Project completion rates have dropped 12% in the last quarter. Consider shorter timeframes or better support.',
            impact: 'MEDIUM',
            actionable: true
          },
          {
            id: '3',
            type: 'TREND',
            title: 'Growing AI/ML Interest',
            description: 'AI and Machine Learning themed hackathons show 40% higher registration rates than other themes.',
            impact: 'HIGH',
            actionable: true
          },
          {
            id: '4',
            type: 'INFO',
            title: 'Optimal Team Size',
            description: 'Teams of 3-4 members show the highest success and satisfaction rates across your events.',
            impact: 'MEDIUM',
            actionable: true
          }
        ],
        recommendations: [
          {
            id: '1',
            category: 'Event Planning',
            title: 'Focus on AI/ML Themes',
            description: 'Increase the number of AI/ML focused hackathons to capitalize on high demand and engagement.',
            priority: 'HIGH',
            estimatedImpact: '+30% registration'
          },
          {
            id: '2',
            category: 'Participant Support',
            title: 'Implement Mentorship Program',
            description: 'Add experienced mentors to improve completion rates and project quality.',
            priority: 'MEDIUM',
            estimatedImpact: '+15% completion rate'
          },
          {
            id: '3',
            category: 'Team Formation',
            title: 'Optimize Team Sizes',
            description: 'Set recommended team sizes to 3-4 members and provide team formation assistance.',
            priority: 'MEDIUM',
            estimatedImpact: '+10% satisfaction'
          }
        ],
        trends: [
          {
            metric: 'Registrations',
            currentValue: 847,
            previousValue: 692,
            change: 22.4,
            trend: 'UP'
          },
          {
            metric: 'Completion Rate',
            currentValue: 78,
            previousValue: 85,
            change: -8.2,
            trend: 'DOWN'
          },
          {
            metric: 'Average Rating',
            currentValue: 4.6,
            previousValue: 4.4,
            change: 4.5,
            trend: 'UP'
          },
          {
            metric: 'Retention Rate',
            currentValue: 87,
            previousValue: 89,
            change: -2.2,
            trend: 'DOWN'
          }
        ]
      }
      setInsightData(mockData)
    } catch (error) {
      console.error('Error fetching insight data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGetDeepInsights = () => {
    setDeepInsightsMode(true)
    setCopilotOpen(true)
  }

  const handleApplySuggestions = (suggestions: FormSuggestion[]) => {
    console.log('Deep insights received:', suggestions)
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS': return <SuccessIcon color="success" />
      case 'WARNING': return <WarningIcon color="warning" />
      case 'INFO': return <InfoIcon color="info" />
      case 'TREND': return <TrendingUpIcon color="primary" />
      default: return <InsightIcon />
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'SUCCESS': return 'success.50'
      case 'WARNING': return 'warning.50'
      case 'INFO': return 'info.50'
      case 'TREND': return 'primary.50'
      default: return 'grey.50'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return { color: 'error' as const }
      case 'MEDIUM': return { color: 'warning' as const }
      case 'LOW': return { color: 'success' as const }
      default: return { color: 'default' as const }
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'UP': return <TrendingUpIcon color="success" />
      case 'DOWN': return <TrendingDownIcon color="error" />
      default: return <InsightIcon color="action" />
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
              Performance Insights
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Deep analytics and actionable insights for your hackathon performance
            </Typography>
          </Box>
          <Tooltip title="Get deeper AI-powered insights">
            <IconButton
              onClick={handleGetDeepInsights}
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
        </Box>

        {/* Performance Metrics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ boxShadow: 2, borderRadius: 3 }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: 'success.main', width: 48, height: 48, mx: 'auto', mb: 2 }}>
                  <GroupIcon />
                </Avatar>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {insightData?.performanceMetrics.participantRetention || 0}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Participant Retention
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ boxShadow: 2, borderRadius: 3 }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: 'warning.main', width: 48, height: 48, mx: 'auto', mb: 2 }}>
                  <StarIcon />
                </Avatar>
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                  {insightData?.performanceMetrics.avgEventRating || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Average Rating
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ boxShadow: 2, borderRadius: 3 }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: 'info.main', width: 48, height: 48, mx: 'auto', mb: 2 }}>
                  <ScheduleIcon />
                </Avatar>
                <Typography variant="h4" fontWeight="bold" color="info.main">
                  {insightData?.performanceMetrics.completionRate || 0}%
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
                <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48, mx: 'auto', mb: 2 }}>
                  <TrendingUpIcon />
                </Avatar>
                <Typography variant="h4" fontWeight="bold" color="primary.main">
                  +{insightData?.performanceMetrics.growthRate || 0}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Growth Rate
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Key Insights */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Card sx={{ boxShadow: 2, borderRadius: 3, mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Key Insights
                </Typography>
                
                <Grid container spacing={2}>
                  {insightData?.insights.map((insight) => (
                    <Grid size={12} key={insight.id}>
                      <Card 
                        sx={{ 
                          boxShadow: 1, 
                          borderRadius: 2,
                          bgcolor: getInsightColor(insight.type),
                          border: '1px solid',
                          borderColor: 'divider'
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                            {getInsightIcon(insight.type)}
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Typography variant="subtitle1" fontWeight="bold">
                                  {insight.title}
                                </Typography>
                                <Chip
                                  label={insight.impact}
                                  size="small"
                                  color={insight.impact === 'HIGH' ? 'error' : insight.impact === 'MEDIUM' ? 'warning' : 'success'}
                                />
                                {insight.actionable && (
                                  <Chip
                                    label="Actionable"
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                  />
                                )}
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                {insight.description}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>

            {/* Trends */}
            <Card sx={{ boxShadow: 2, borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Performance Trends
                </Typography>
                
                {insightData?.trends.map((trend, index) => (
                  <Box key={index} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getTrendIcon(trend.trend)}
                        <Typography variant="subtitle2" fontWeight="bold">
                          {trend.metric}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h6" fontWeight="bold">
                          {trend.currentValue}{trend.metric.includes('Rate') ? '%' : ''}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          color={trend.change > 0 ? 'success.main' : 'error.main'}
                        >
                          {trend.change > 0 ? '+' : ''}{trend.change.toFixed(1)}%
                        </Typography>
                      </Box>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(trend.currentValue, 100)}
                      sx={{ height: 8, borderRadius: 4 }}
                      color={trend.trend === 'UP' ? 'success' : trend.trend === 'DOWN' ? 'error' : 'primary'}
                    />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Recommendations */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Card sx={{ boxShadow: 2, borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Recommendations
                </Typography>
                
                <List sx={{ p: 0 }}>
                  {insightData?.recommendations.map((rec, index) => (
                    <ListItem key={rec.id} sx={{ px: 0, pb: 2 }}>
                      <ListItemIcon>
                        <InsightIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {rec.title}
                            </Typography>
                            <Chip
                              {...getPriorityColor(rec.priority)}
                              label={rec.priority}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {rec.description}
                            </Typography>
                            <Typography variant="caption" color="success.main" fontWeight="bold">
                              Expected: {rec.estimatedImpact}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>

                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<EventIcon />}
                  sx={{ mt: 2 }}
                >
                  Implement Recommendations
                </Button>
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
          setDeepInsightsMode(false)
        }}
        currentUser={user}
        onApplySuggestions={handleApplySuggestions}
        formContext={{ user, insightData }}
        deepInsightsMode={deepInsightsMode}
      />
    </Box>
  )
}