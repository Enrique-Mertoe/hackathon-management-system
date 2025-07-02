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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material'
import {
  ArrowBack as BackIcon,
  AutoAwesome as AIIcon,
  Search as SearchIcon,
  Group as GroupIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  FilterList as FilterIcon
} from '@mui/icons-material'
import { auth } from '@/lib/auth'
import type { AuthUser } from '@/lib/auth'
import { CopilotSidepanel } from '@/components/ai/copilot-sidepanel'
import type { FormSuggestion } from '@/components/ai/copilot-sidepanel'

interface Participant {
  id: string
  name: string
  email: string
  hackathon: string
  status: string
  registeredAt: string
  team?: string
  skills: string[]
  experience: string
}

export default function ParticipantsPage() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [filteredParticipants, setFilteredParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [copilotOpen, setCopilotOpen] = useState(false)
  const [participantInsightsMode, setParticipantInsightsMode] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await auth.getCurrentUser()
        if (!currentUser || !auth.hasRole(currentUser, 'ORGANIZER')) {
          router.push('/auth/signin')
          return
        }
        setUser(currentUser)
        await fetchParticipants()
      } catch (error) {
        console.error('Error checking auth:', error)
        router.push('/auth/signin')
      }
    }

    checkAuth()
  }, [router])

  const fetchParticipants = async () => {
    try {
      setLoading(true)
      // Mock data - replace with actual API call
      const mockParticipants: Participant[] = [
        {
          id: '1',
          name: 'Alice Johnson',
          email: 'alice@example.com',
          hackathon: 'AI Innovation Challenge',
          status: 'REGISTERED',
          registeredAt: '2024-01-15',
          team: 'Team Alpha',
          skills: ['React', 'Python', 'Machine Learning'],
          experience: 'INTERMEDIATE'
        },
        {
          id: '2',
          name: 'Bob Smith',
          email: 'bob@example.com',
          hackathon: 'Sustainable Tech Hack',
          status: 'CHECKED_IN',
          registeredAt: '2024-01-12',
          team: 'EcoCoders',
          skills: ['Node.js', 'IoT', 'Solar Energy'],
          experience: 'ADVANCED'
        },
        {
          id: '3',
          name: 'Carol Davis',
          email: 'carol@example.com',
          hackathon: 'FinTech Future',
          status: 'REGISTERED',
          registeredAt: '2024-01-10',
          skills: ['Blockchain', 'Smart Contracts', 'DeFi'],
          experience: 'EXPERT'
        }
      ]
      setParticipants(mockParticipants)
      setFilteredParticipants(mockParticipants)
    } catch (error) {
      console.error('Error fetching participants:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let filtered = participants.filter(participant =>
      participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.hackathon.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (statusFilter !== 'all') {
      filtered = filtered.filter(participant => participant.status === statusFilter)
    }

    setFilteredParticipants(filtered)
  }, [searchTerm, statusFilter, participants])

  const handleGetParticipantInsights = () => {
    setParticipantInsightsMode(true)
    setCopilotOpen(true)
  }

  const handleApplySuggestions = (suggestions: FormSuggestion[]) => {
    console.log('Participant insights received:', suggestions)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'REGISTERED': return { color: 'info' as const }
      case 'CHECKED_IN': return { color: 'success' as const }
      case 'WAITLISTED': return { color: 'warning' as const }
      case 'CANCELLED': return { color: 'error' as const }
      default: return { color: 'default' as const }
    }
  }

  const getExperienceColor = (experience: string) => {
    switch (experience) {
      case 'BEGINNER': return { color: 'success' as const }
      case 'INTERMEDIATE': return { color: 'info' as const }
      case 'ADVANCED': return { color: 'warning' as const }
      case 'EXPERT': return { color: 'error' as const }
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
              Participants Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage and analyze your hackathon participants
            </Typography>
          </Box>
          <Tooltip title="Get AI insights on participant data">
            <IconButton
              onClick={handleGetParticipantInsights}
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

        {/* Summary Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ boxShadow: 2, borderRadius: 3 }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48, mx: 'auto', mb: 2 }}>
                  <GroupIcon />
                </Avatar>
                <Typography variant="h4" fontWeight="bold" color="primary.main">
                  {participants.length}
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
                <Avatar sx={{ bgcolor: 'success.main', width: 48, height: 48, mx: 'auto', mb: 2 }}>
                  <SchoolIcon />
                </Avatar>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {participants.filter(p => p.status === 'CHECKED_IN').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Checked In
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ boxShadow: 2, borderRadius: 3 }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: 'warning.main', width: 48, height: 48, mx: 'auto', mb: 2 }}>
                  <WorkIcon />
                </Avatar>
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                  {participants.filter(p => p.team).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  In Teams
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ boxShadow: 2, borderRadius: 3 }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: 'info.main', width: 48, height: 48, mx: 'auto', mb: 2 }}>
                  <FilterIcon />
                </Avatar>
                <Typography variant="h4" fontWeight="bold" color="info.main">
                  {Math.round((participants.filter(p => p.status === 'CHECKED_IN').length / participants.length) * 100) || 0}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Attendance Rate
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Card sx={{ boxShadow: 2, borderRadius: 3, mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  placeholder="Search participants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Status Filter</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="Status Filter"
                    sx={{ borderRadius: 3 }}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="REGISTERED">Registered</MenuItem>
                    <MenuItem value="CHECKED_IN">Checked In</MenuItem>
                    <MenuItem value="WAITLISTED">Waitlisted</MenuItem>
                    <MenuItem value="CANCELLED">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<EmailIcon />}
                  onClick={() => {/* Implement bulk email */}}
                >
                  Send Email
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Participants Table */}
        <Card sx={{ boxShadow: 2, borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Participants ({filteredParticipants.length})
            </Typography>
            
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Participant</TableCell>
                    <TableCell>Hackathon</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Team</TableCell>
                    <TableCell>Experience</TableCell>
                    <TableCell>Skills</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredParticipants.map((participant) => (
                    <TableRow key={participant.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.light' }}>
                            {participant.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {participant.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {participant.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{participant.hackathon}</TableCell>
                      <TableCell>
                        <Chip
                          {...getStatusColor(participant.status)}
                          label={participant.status.replace('_', ' ')}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{participant.team || 'No Team'}</TableCell>
                      <TableCell>
                        <Chip
                          {...getExperienceColor(participant.experience)}
                          label={participant.experience}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {participant.skills.slice(0, 2).map((skill, index) => (
                            <Chip
                              key={index}
                              label={skill}
                              size="small"
                              variant="outlined"
                              color="primary"
                            />
                          ))}
                          {participant.skills.length > 2 && (
                            <Chip
                              label={`+${participant.skills.length - 2}`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton size="small">
                            <EmailIcon />
                          </IconButton>
                          <IconButton size="small">
                            <PhoneIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Container>

      {/* AI Copilot Sidepanel */}
      <CopilotSidepanel
        isOpen={copilotOpen}
        onClose={() => {
          setCopilotOpen(false)
          setParticipantInsightsMode(false)
        }}
        onApplySuggestions={handleApplySuggestions}
        formContext={{ user, participants, filteredParticipants }}
        participantInsightsMode={participantInsightsMode}
      />
    </Box>
  )
}