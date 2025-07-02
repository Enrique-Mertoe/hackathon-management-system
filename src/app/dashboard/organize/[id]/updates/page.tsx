'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  Chip,
  CircularProgress,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
  Avatar,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'
import {
  ArrowBack as BackIcon,
  Announcement as AnnouncementIcon,
  Add as AddIcon,
  Schedule as ScheduleIcon,
  PriorityHigh as PriorityIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon
} from '@mui/icons-material'
import { auth } from '@/lib/auth'
import type { AuthUser } from '@/lib/auth'

interface Update {
  id: string
  title: string
  content: string
  type: 'ANNOUNCEMENT' | 'SCHEDULE_CHANGE' | 'RESOURCE' | 'REMINDER'
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  author_name: string
  published_at: string
  is_published: boolean
}

export default function UpdatesManagementPage() {
  const params = useParams()
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'))
  
  const [user, setUser] = useState<AuthUser | null>(null)
  const [updates, setUpdates] = useState<Update[]>([])
  const [loading, setLoading] = useState(true)
  const [hackathonTitle, setHackathonTitle] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newUpdate, setNewUpdate] = useState({
    title: '',
    content: '',
    type: 'ANNOUNCEMENT' as const,
    priority: 'NORMAL' as const
  })

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await auth.getCurrentUser()
        if (!currentUser || !auth.hasRole(currentUser, 'ORGANIZER')) {
          router.push('/auth/signin')
          return
        }
        setUser(currentUser)
        await fetchUpdates()
      } catch (error) {
        console.error('Error checking auth:', error)
        router.push('/auth/signin')
      }
    }

    checkAuth()
  }, [router, params.id])

  const fetchUpdates = async () => {
    try {
      setLoading(true)
      // Mock data - replace with actual API call
      const mockUpdates: Update[] = [
        {
          id: '1',
          title: 'Welcome to AI Innovation Challenge!',
          content: 'Welcome to our hackathon! We\'re excited to see what amazing AI solutions you\'ll build. Don\'t forget to check the resource section for helpful APIs and documentation.',
          type: 'ANNOUNCEMENT',
          priority: 'HIGH',
          author_name: 'Sarah Johnson',
          published_at: '2024-02-01T10:00:00Z',
          is_published: true
        },
        {
          id: '2',
          title: 'Schedule Update: Workshop Time Changed',
          content: 'The Machine Learning workshop has been moved from 2:00 PM to 3:00 PM to avoid conflicts with the networking session.',
          type: 'SCHEDULE_CHANGE',
          priority: 'NORMAL',
          author_name: 'Mike Chen',
          published_at: '2024-02-02T14:30:00Z',
          is_published: true
        },
        {
          id: '3',
          title: 'New Resources Available',
          content: 'We\'ve added new API documentation and code examples to help with your projects. Check out the resource section for TensorFlow tutorials and dataset links.',
          type: 'RESOURCE',
          priority: 'NORMAL',
          author_name: 'Sarah Johnson',
          published_at: '2024-02-03T09:15:00Z',
          is_published: true
        },
        {
          id: '4',
          title: 'Submission Deadline Reminder',
          content: 'Reminder: Project submissions are due tomorrow at 6:00 PM. Make sure to test your demo and prepare your presentation slides!',
          type: 'REMINDER',
          priority: 'URGENT',
          author_name: 'Alex Rodriguez',
          published_at: '2024-02-04T16:45:00Z',
          is_published: true
        }
      ]
      
      setUpdates(mockUpdates)
      setHackathonTitle('AI Innovation Challenge')
    } catch (error) {
      console.error('Error fetching updates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUpdate = async () => {
    // TODO: Implement API call
    const newUpdateItem: Update = {
      id: Date.now().toString(),
      ...newUpdate,
      author_name: user?.full_name || 'Unknown',
      published_at: new Date().toISOString(),
      is_published: true
    }
    
    setUpdates([newUpdateItem, ...updates])
    setCreateDialogOpen(false)
    setNewUpdate({
      title: '',
      content: '',
      type: 'ANNOUNCEMENT',
      priority: 'NORMAL'
    })
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ANNOUNCEMENT': return { color: 'primary' as const }
      case 'SCHEDULE_CHANGE': return { color: 'warning' as const }
      case 'RESOURCE': return { color: 'info' as const }
      case 'REMINDER': return { color: 'secondary' as const }
      default: return { color: 'default' as const }
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return { color: 'error' as const }
      case 'HIGH': return { color: 'warning' as const }
      case 'NORMAL': return { color: 'info' as const }
      case 'LOW': return { color: 'success' as const }
      default: return { color: 'default' as const }
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ANNOUNCEMENT': return <AnnouncementIcon />
      case 'SCHEDULE_CHANGE': return <ScheduleIcon />
      case 'RESOURCE': return <ViewIcon />
      case 'REMINDER': return <PriorityIcon />
      default: return <AnnouncementIcon />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
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

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="xl" sx={{ py: { xs: 1, sm: 2, md: 3 }, px: { xs: 1, sm: 2 } }}>
        {/* Header */}
        <Box sx={{ mb: { xs: 2, md: 3 } }}>
          <Button
            variant="text"
            startIcon={<BackIcon />}
            onClick={() => router.push(`/dashboard/organize/${params.id}`)}
            sx={{ mb: { xs: 1, md: 2 } }}
            size={isSmall ? "small" : "medium"}
          >
            Back to Hackathon
          </Button>
          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2
          }}>
            <Box>
              <Typography 
                variant={isSmall ? "h5" : isMobile ? "h4" : "h3"} 
                component="h1" 
                fontWeight="bold" 
                gutterBottom
              >
                Updates & Announcements
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {hackathonTitle} • {updates.length} updates published
              </Typography>
            </Box>
            
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
              size={isSmall ? "small" : "medium"}
            >
              New Update
            </Button>
          </Box>
        </Box>

        {/* Stats Summary */}
        <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 3 }}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
              <CardContent sx={{ p: { xs: 2, md: 3 }, textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold" color="primary.main">
                  {updates.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Updates
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
              <CardContent sx={{ p: { xs: 2, md: 3 }, textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                  {updates.filter(u => u.priority === 'HIGH' || u.priority === 'URGENT').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  High Priority
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
              <CardContent sx={{ p: { xs: 2, md: 3 }, textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold" color="info.main">
                  {updates.filter(u => u.type === 'ANNOUNCEMENT').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Announcements
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
              <CardContent sx={{ p: { xs: 2, md: 3 }, textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold" color="secondary.main">
                  {updates.filter(u => u.type === 'REMINDER').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Reminders
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Updates List */}
        <Grid container spacing={{ xs: 2, md: 3 }}>
          {updates.map((update) => (
            <Grid size={{ xs: 12, lg: 6 }} key={update.id}>
              <Card sx={{ boxShadow: 2, borderRadius: 2, height: '100%' }}>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  {/* Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                      <Avatar sx={{ bgcolor: getTypeColor(update.type).color + '.main', width: 32, height: 32 }}>
                        {getTypeIcon(update.type)}
                      </Avatar>
                      <Box>
                        <Typography 
                          variant={isSmall ? "subtitle2" : "subtitle1"} 
                          fontWeight="bold"
                          sx={{ lineHeight: 1.3 }}
                        >
                          {update.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          By {update.author_name} • {formatDate(update.published_at)}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton size="small">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Tags */}
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip 
                      label={update.type.replace('_', ' ')} 
                      {...getTypeColor(update.type)}
                      size="small"
                      variant="outlined"
                    />
                    <Chip 
                      label={update.priority} 
                      {...getPriorityColor(update.priority)}
                      size="small"
                    />
                  </Box>

                  {/* Content */}
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ lineHeight: 1.6 }}
                  >
                    {update.content}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="add update"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            display: { xs: 'block', sm: 'none' }
          }}
          onClick={() => setCreateDialogOpen(true)}
        >
          <AddIcon />
        </Fab>
      </Container>

      {/* Create Update Dialog */}
      <Dialog 
        open={createDialogOpen} 
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isSmall}
      >
        <DialogTitle>Create New Update</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              fullWidth
              label="Title"
              value={newUpdate.title}
              onChange={(e) => setNewUpdate({ ...newUpdate, title: e.target.value })}
              required
            />
            
            <Grid container spacing={2}>
              <Grid size={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={newUpdate.type}
                    onChange={(e) => setNewUpdate({ ...newUpdate, type: e.target.value as any })}
                    label="Type"
                  >
                    <MenuItem value="ANNOUNCEMENT">Announcement</MenuItem>
                    <MenuItem value="SCHEDULE_CHANGE">Schedule Change</MenuItem>
                    <MenuItem value="RESOURCE">Resource</MenuItem>
                    <MenuItem value="REMINDER">Reminder</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={newUpdate.priority}
                    onChange={(e) => setNewUpdate({ ...newUpdate, priority: e.target.value as any })}
                    label="Priority"
                  >
                    <MenuItem value="LOW">Low</MenuItem>
                    <MenuItem value="NORMAL">Normal</MenuItem>
                    <MenuItem value="HIGH">High</MenuItem>
                    <MenuItem value="URGENT">Urgent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            <TextField
              fullWidth
              label="Content"
              value={newUpdate.content}
              onChange={(e) => setNewUpdate({ ...newUpdate, content: e.target.value })}
              multiline
              rows={4}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateUpdate} 
            variant="contained"
            startIcon={<SendIcon />}
            disabled={!newUpdate.title || !newUpdate.content}
          >
            Publish Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}