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
  Avatar,
  Chip,
  Paper
} from '@mui/material'
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot
} from '@mui/lab'
import {
  ArrowBack as BackIcon,
  AutoAwesome as AIIcon,
  Schedule as ScheduleIcon,
  Event as EventIcon,
  PlayArrow as StartIcon,
  Group as TeamIcon,
  Assessment as JudgeIcon,
  EmojiEvents as AwardIcon,
  Add as AddIcon
} from '@mui/icons-material'
import { auth } from '@/lib/auth'
import type { AuthUser } from '@/lib/auth'
import { CopilotSidepanel } from '@/components/ai/copilot-sidepanel'
import type { FormSuggestion } from '@/components/ai/copilot-sidepanel'

interface ScheduleEvent {
  id: string
  title: string
  description: string
  startTime: string
  endTime: string
  type: 'REGISTRATION' | 'KICKOFF' | 'WORKSHOP' | 'DEADLINE' | 'JUDGING' | 'AWARDS'
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED'
  hackathon: string
}

interface UpcomingEvent {
  id: string
  hackathon: string
  nextEvent: string
  timeUntil: string
  status: string
}

export default function SchedulePage() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [scheduleEvents, setScheduleEvents] = useState<ScheduleEvent[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [copilotOpen, setCopilotOpen] = useState(false)
  const [scheduleInsightsMode, setScheduleInsightsMode] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await auth.getCurrentUser()
        if (!currentUser || !auth.hasRole(currentUser, 'ORGANIZER')) {
          router.push('/auth/signin')
          return
        }
        setUser(currentUser)
        await fetchScheduleData()
      } catch (error) {
        console.error('Error checking auth:', error)
        router.push('/auth/signin')
      }
    }

    checkAuth()
  }, [router])

  const fetchScheduleData = async () => {
    try {
      setLoading(true)
      // Mock data - replace with actual API call
      const mockSchedule: ScheduleEvent[] = [
        {
          id: '1',
          title: 'Registration Opens',
          description: 'Participants can start registering for the hackathon',
          startTime: '2024-02-01T09:00:00',
          endTime: '2024-02-01T10:00:00',
          type: 'REGISTRATION',
          status: 'COMPLETED',
          hackathon: 'AI Innovation Challenge'
        },
        {
          id: '2',
          title: 'Opening Ceremony',
          description: 'Welcome participants and announce challenges',
          startTime: '2024-02-15T10:00:00',
          endTime: '2024-02-15T11:00:00',
          type: 'KICKOFF',
          status: 'UPCOMING',
          hackathon: 'AI Innovation Challenge'
        },
        {
          id: '3',
          title: 'Technical Workshop',
          description: 'Introduction to AI/ML tools and frameworks',
          startTime: '2024-02-15T14:00:00',
          endTime: '2024-02-15T16:00:00',
          type: 'WORKSHOP',
          status: 'UPCOMING',
          hackathon: 'AI Innovation Challenge'
        },
        {
          id: '4',
          title: 'Submission Deadline',
          description: 'Final deadline for project submissions',
          startTime: '2024-02-17T18:00:00',
          endTime: '2024-02-17T18:00:00',
          type: 'DEADLINE',
          status: 'UPCOMING',
          hackathon: 'AI Innovation Challenge'
        },
        {
          id: '5',
          title: 'Judging Period',
          description: 'Judges review and evaluate submissions',
          startTime: '2024-02-17T19:00:00',
          endTime: '2024-02-18T12:00:00',
          type: 'JUDGING',
          status: 'UPCOMING',
          hackathon: 'AI Innovation Challenge'
        },
        {
          id: '6',
          title: 'Awards Ceremony',
          description: 'Announce winners and distribute prizes',
          startTime: '2024-02-18T15:00:00',
          endTime: '2024-02-18T17:00:00',
          type: 'AWARDS',
          status: 'UPCOMING',
          hackathon: 'AI Innovation Challenge'
        }
      ]

      const mockUpcoming: UpcomingEvent[] = [
        {
          id: '1',
          hackathon: 'AI Innovation Challenge',
          nextEvent: 'Opening Ceremony',
          timeUntil: '2 days',
          status: 'REGISTRATION_OPEN'
        },
        {
          id: '2',
          hackathon: 'Sustainable Tech Hack',
          nextEvent: 'Registration Opens',
          timeUntil: '1 week',
          status: 'PLANNING'
        }
      ]

      setScheduleEvents(mockSchedule)
      setUpcomingEvents(mockUpcoming)
    } catch (error) {
      console.error('Error fetching schedule data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGetScheduleInsights = () => {
    setScheduleInsightsMode(true)
    setCopilotOpen(true)
  }

  const handleApplySuggestions = (suggestions: FormSuggestion[]) => {
    console.log('Schedule insights received:', suggestions)
  }

  const handleAddEvent = () => {
    // TODO: Implement add event functionality
    console.log('Add event clicked')
  }

  const handleViewCalendar = () => {
    // TODO: Navigate to calendar view
    console.log('View calendar clicked')
  }

  const handleScheduleTemplates = () => {
    // TODO: Navigate to schedule templates
    console.log('Schedule templates clicked')
  }

  const handleNotifyParticipants = () => {
    // TODO: Implement participant notification
    console.log('Notify participants clicked')
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'REGISTRATION': return <EventIcon />
      case 'KICKOFF': return <StartIcon />
      case 'WORKSHOP': return <TeamIcon />
      case 'DEADLINE': return <ScheduleIcon />
      case 'JUDGING': return <JudgeIcon />
      case 'AWARDS': return <AwardIcon />
      default: return <EventIcon />
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'REGISTRATION': return 'info'
      case 'KICKOFF': return 'success'
      case 'WORKSHOP': return 'primary'
      case 'DEADLINE': return 'warning'
      case 'JUDGING': return 'secondary'
      case 'AWARDS': return 'error'
      default: return 'default'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return { color: 'success' as const }
      case 'ACTIVE': return { color: 'warning' as const }
      case 'UPCOMING': return { color: 'info' as const }
      default: return { color: 'default' as const }
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
              Schedule Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage timelines and schedules for your hackathons
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Tooltip title="Get AI insights on schedule optimization">
              <IconButton
                onClick={handleGetScheduleInsights}
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
              startIcon={<AddIcon />}
              size="small"
            >
              Add Event
            </Button>
          </Box>
        </Box>

        {/* Upcoming Events Summary */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {upcomingEvents.map((event) => (
            <Grid size={{ xs: 12, md: 6 }} key={event.id}>
              <Card sx={{ boxShadow: 2, borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                      <ScheduleIcon />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight="bold">
                        {event.hackathon}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Next: {event.nextEvent} in {event.timeUntil}
                      </Typography>
                      <Chip
                        label={event.status.replace('_', ' ')}
                        color="primary"
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          {/* Timeline */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Card sx={{ boxShadow: 2, borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Event Timeline - AI Innovation Challenge
                </Typography>
                
                <Timeline>
                  {scheduleEvents.map((event, index) => (
                    <TimelineItem key={event.id}>
                      <TimelineSeparator>
                        <TimelineDot color={getEventColor(event.type) as any}>
                          {getEventIcon(event.type)}
                        </TimelineDot>
                        {index < scheduleEvents.length - 1 && <TimelineConnector />}
                      </TimelineSeparator>
                      <TimelineContent>
                        <Paper 
                          elevation={1} 
                          sx={{ 
                            p: 2, 
                            mb: 2, 
                            borderRadius: 2,
                            bgcolor: event.status === 'COMPLETED' ? 'grey.50' : 'background.paper'
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {event.title}
                            </Typography>
                            <Chip
                              {...getStatusColor(event.status)}
                              label={event.status}
                              size="small"
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {event.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDateTime(event.startTime)}
                            {event.endTime !== event.startTime && ` - ${formatDateTime(event.endTime)}`}
                          </Typography>
                        </Paper>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Actions & Statistics */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Grid container spacing={2}>
              {/* Quick Stats */}
              <Grid size={12}>
                <Card sx={{ boxShadow: 2, borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Schedule Overview
                    </Typography>
                    
                    <Box sx={{ space: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="body2">Total Events</Typography>
                        <Typography variant="h6" fontWeight="bold" color="primary.main">
                          {scheduleEvents.length}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="body2">Completed</Typography>
                        <Typography variant="h6" fontWeight="bold" color="success.main">
                          {scheduleEvents.filter(e => e.status === 'COMPLETED').length}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="body2">Upcoming</Typography>
                        <Typography variant="h6" fontWeight="bold" color="info.main">
                          {scheduleEvents.filter(e => e.status === 'UPCOMING').length}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">Active Hackathons</Typography>
                        <Typography variant="h6" fontWeight="bold" color="warning.main">
                          {upcomingEvents.length}
                        </Typography>
                      </Box>
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
                      <Grid size={12}>
                        <Button
                          fullWidth
                          variant="outlined"
                          size="small"
                          startIcon={<AddIcon />}
                          onClick={handleAddEvent}
                          sx={{ mb: 1 }}
                        >
                          Add Schedule Event
                        </Button>
                      </Grid>
                      <Grid size={12}>
                        <Button
                          fullWidth
                          variant="outlined"
                          size="small"
                          startIcon={<EventIcon />}
                          onClick={handleViewCalendar}
                          sx={{ mb: 1 }}
                        >
                          View Calendar
                        </Button>
                      </Grid>
                      <Grid size={12}>
                        <Button
                          fullWidth
                          variant="outlined"
                          size="small"
                          startIcon={<ScheduleIcon />}
                          onClick={handleScheduleTemplates}
                          sx={{ mb: 1 }}
                        >
                          Schedule Templates
                        </Button>
                      </Grid>
                      <Grid size={12}>
                        <Button
                          fullWidth
                          variant="outlined"
                          size="small"
                          startIcon={<TeamIcon />}
                          onClick={handleNotifyParticipants}
                        >
                          Notify Participants
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
          setScheduleInsightsMode(false)
        }}
        currentUser={user}
        onApplySuggestions={handleApplySuggestions}
        formContext={{ user, scheduleEvents, upcomingEvents }}
        scheduleInsightsMode={scheduleInsightsMode}
      />
    </Box>
  )
}