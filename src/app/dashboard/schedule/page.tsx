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
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Snackbar,
  Alert
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
import { ModernCopilot } from '@/components/ai/modern-copilot'

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
  const [addEventOpen, setAddEventOpen] = useState(false)
  const [notifyOpen, setNotifyOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success' | 'error'}>({open: false, message: '', severity: 'success'})
  const [notification, setNotification] = useState({
    hackathonId: '',
    subject: '',
    message: '',
    priority: 'NORMAL'
  })
  const [newEvent, setNewEvent] = useState({
    hackathonId: '',
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    eventType: 'WORKSHOP',
    location: '',
    isVirtual: true,
    capacity: ''
  })
  const [organizerHackathons, setOrganizerHackathons] = useState<any[]>([])

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
        await fetchOrganizerHackathons()
      } catch (error) {
        console.error('Error checking auth:', error)
        router.push('/auth/signin')
      }
    }

    void checkAuth()
  }, [router])

  const fetchOrganizerHackathons = async () => {
    try {
      const response = await fetch('/api/hackathons?organizer=true')
      if (response.ok) {
        const data = await response.json()
        setOrganizerHackathons(data.hackathons || [])
      }
    } catch (error) {
      console.error('Error fetching organizer hackathons:', error)
    }
  }

  const fetchScheduleData = async () => {
    try {
      setLoading(true)
      
      // Fetch schedule events from API
      const [eventsResponse, upcomingResponse] = await Promise.all([
        fetch('/api/schedule/events'),
        fetch('/api/schedule/upcoming')
      ])

      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json()
        setScheduleEvents(eventsData.events || [])
      } else {
        console.error('Failed to fetch schedule events:', eventsResponse.statusText)
        setScheduleEvents([])
      }

      if (upcomingResponse.ok) {
        const upcomingData = await upcomingResponse.json()
        setUpcomingEvents(upcomingData.events || [])
      } else {
        console.error('Failed to fetch upcoming events:', upcomingResponse.statusText)
        setUpcomingEvents([])
      }
    } catch (error) {
      console.error('Error fetching schedule data:', error)
      setScheduleEvents([])
      setUpcomingEvents([])
    } finally {
      setLoading(false)
    }
  }

  const handleGetScheduleInsights = () => {
    setCopilotOpen(true)
  }

  const handleAddEvent = () => {
    setAddEventOpen(true)
  }

  const handleCloseAddEvent = () => {
    setAddEventOpen(false)
    setNewEvent({
      hackathonId: '',
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      eventType: 'WORKSHOP',
      location: '',
      isVirtual: true,
      capacity: ''
    })
  }

  const handleSaveEvent = async () => {
    if (!newEvent.hackathonId || !newEvent.title || !newEvent.startTime || !newEvent.endTime) {
      setSnackbar({open: true, message: 'Please fill in all required fields', severity: 'error'})
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/schedule/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hackathonId: newEvent.hackathonId,
          title: newEvent.title,
          description: newEvent.description,
          startTime: newEvent.startTime,
          endTime: newEvent.endTime,
          eventType: newEvent.eventType,
          location: newEvent.location,
          isVirtual: newEvent.isVirtual,
          capacity: newEvent.capacity ? parseInt(newEvent.capacity) : null
        })
      })

      if (response.ok) {
        setSnackbar({open: true, message: 'Event created successfully!', severity: 'success'})
        handleCloseAddEvent()
        await fetchScheduleData() // Refresh the data
      } else {
        const error = await response.json()
        setSnackbar({open: true, message: error.error || 'Failed to create event', severity: 'error'})
      }
    } catch (error) {
      console.error('Error creating event:', error)
      setSnackbar({open: true, message: 'Failed to create event', severity: 'error'})
    } finally {
      setSaving(false)
    }
  }

  const handleViewCalendar = () => {
    router.push('/dashboard/schedule/calendar')
  }

  const handleScheduleTemplates = () => {
    router.push('/dashboard/schedule/templates')
  }

  const handleNotifyParticipants = () => {
    setNotifyOpen(true)
  }

  const handleCloseNotify = () => {
    setNotifyOpen(false)
    setNotification({
      hackathonId: '',
      subject: '',
      message: '',
      priority: 'NORMAL'
    })
  }

  const handleSendNotification = async () => {
    if (!notification.hackathonId || !notification.subject || !notification.message) {
      setSnackbar({open: true, message: 'Please fill in all required fields', severity: 'error'})
      return
    }

    setSending(true)
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hackathonId: notification.hackathonId,
          subject: notification.subject,
          message: notification.message,
          priority: notification.priority,
          type: 'ANNOUNCEMENT'
        })
      })

      if (response.ok) {
        setSnackbar({open: true, message: 'Notification sent successfully!', severity: 'success'})
        handleCloseNotify()
      } else {
        const error = await response.json()
        setSnackbar({open: true, message: error.error || 'Failed to send notification', severity: 'error'})
      }
    } catch (error) {
      console.error('Error sending notification:', error)
      setSnackbar({open: true, message: 'Failed to send notification', severity: 'error'})
    } finally {
      setSending(false)
    }
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
              onClick={handleAddEvent}
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

      {/* AI Copilot */}
      <ModernCopilot
        isOpen={copilotOpen}
        onClose={() => {
          setCopilotOpen(false)
        }}
        currentUser={user}
        page="schedule-management"
        data={{
          scheduleEvents,
          upcomingEvents,
          user
        }}
      />

      {/* Add Event Dialog */}
      <Dialog open={addEventOpen} onClose={handleCloseAddEvent} maxWidth="md" fullWidth>
        <DialogTitle>Add New Schedule Event</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={12}>
              <FormControl fullWidth>
                <InputLabel>Hackathon *</InputLabel>
                <Select
                  value={newEvent.hackathonId}
                  label="Hackathon *"
                  onChange={(e) => setNewEvent({...newEvent, hackathonId: e.target.value})}
                >
                  {organizerHackathons.map((hackathon) => (
                    <MenuItem key={hackathon.id} value={hackathon.id}>
                      {hackathon.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid size={6}>
              <TextField
                fullWidth
                label="Event Title *"
                value={newEvent.title}
                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
              />
            </Grid>
            
            <Grid size={6}>
              <FormControl fullWidth>
                <InputLabel>Event Type</InputLabel>
                <Select
                  value={newEvent.eventType}
                  label="Event Type"
                  onChange={(e) => setNewEvent({...newEvent, eventType: e.target.value})}
                >
                  <MenuItem value="REGISTRATION">Registration</MenuItem>
                  <MenuItem value="KICKOFF">Kickoff</MenuItem>
                  <MenuItem value="WORKSHOP">Workshop</MenuItem>
                  <MenuItem value="DEADLINE">Deadline</MenuItem>
                  <MenuItem value="JUDGING">Judging</MenuItem>
                  <MenuItem value="AWARDS">Awards</MenuItem>
                  <MenuItem value="BREAK">Break</MenuItem>
                  <MenuItem value="NETWORKING">Networking</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid size={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={2}
                value={newEvent.description}
                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
              />
            </Grid>
            
            <Grid size={6}>
              <TextField
                fullWidth
                label="Start Time *"
                type="datetime-local"
                value={newEvent.startTime}
                onChange={(e) => setNewEvent({...newEvent, startTime: e.target.value})}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid size={6}>
              <TextField
                fullWidth
                label="End Time *"
                type="datetime-local"
                value={newEvent.endTime}
                onChange={(e) => setNewEvent({...newEvent, endTime: e.target.value})}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid size={8}>
              <TextField
                fullWidth
                label="Location"
                value={newEvent.location}
                onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
              />
            </Grid>
            
            <Grid size={4}>
              <TextField
                fullWidth
                label="Capacity"
                type="number"
                value={newEvent.capacity}
                onChange={(e) => setNewEvent({...newEvent, capacity: e.target.value})}
              />
            </Grid>
            
            <Grid size={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={newEvent.isVirtual}
                    onChange={(e) => setNewEvent({...newEvent, isVirtual: e.target.checked})}
                  />
                }
                label="Virtual Event"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddEvent}>Cancel</Button>
          <Button 
            onClick={handleSaveEvent} 
            variant="contained" 
            disabled={saving}
          >
            {saving ? <CircularProgress size={20} /> : 'Save Event'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notify Participants Dialog */}
      <Dialog open={notifyOpen} onClose={handleCloseNotify} maxWidth="md" fullWidth>
        <DialogTitle>Notify Participants</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={12}>
              <FormControl fullWidth>
                <InputLabel>Hackathon *</InputLabel>
                <Select
                  value={notification.hackathonId}
                  label="Hackathon *"
                  onChange={(e) => setNotification({...notification, hackathonId: e.target.value})}
                >
                  {organizerHackathons.map((hackathon) => (
                    <MenuItem key={hackathon.id} value={hackathon.id}>
                      {hackathon.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid size={8}>
              <TextField
                fullWidth
                label="Subject *"
                value={notification.subject}
                onChange={(e) => setNotification({...notification, subject: e.target.value})}
                placeholder="e.g., Schedule Update: Workshop Time Changed"
              />
            </Grid>
            
            <Grid size={4}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={notification.priority}
                  label="Priority"
                  onChange={(e) => setNotification({...notification, priority: e.target.value})}
                >
                  <MenuItem value="LOW">Low</MenuItem>
                  <MenuItem value="NORMAL">Normal</MenuItem>
                  <MenuItem value="HIGH">High</MenuItem>
                  <MenuItem value="URGENT">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid size={12}>
              <TextField
                fullWidth
                label="Message *"
                multiline
                rows={6}
                value={notification.message}
                onChange={(e) => setNotification({...notification, message: e.target.value})}
                placeholder="Enter your message to participants..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNotify}>Cancel</Button>
          <Button 
            onClick={handleSendNotification} 
            variant="contained" 
            disabled={sending}
          >
            {sending ? <CircularProgress size={20} /> : 'Send Notification'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({...snackbar, open: false})}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({...snackbar, open: false})}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}