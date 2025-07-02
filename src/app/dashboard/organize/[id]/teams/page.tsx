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
  Avatar,
  AvatarGroup,
  CircularProgress,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
  LinearProgress
} from '@mui/material'
import {
  ArrowBack as BackIcon,
  Group as TeamIcon,
  Person as PersonIcon,
  Star as StarIcon,
  Assignment as ProjectIcon,
  Link as LinkIcon,
  GitHub as GitHubIcon
} from '@mui/icons-material'
import { auth } from '@/lib/auth'
import type { AuthUser } from '@/lib/auth'

interface Team {
  id: string
  name: string
  description: string
  leader_id: string
  leader_name: string
  member_count: number
  max_members: number
  skills_wanted: string[]
  project_name?: string
  project_description?: string
  repository_url?: string
  status: 'RECRUITING' | 'FULL' | 'COMPETING' | 'SUBMITTED'
  members: {
    id: string
    name: string
    role: string
    avatar_url?: string
  }[]
}

export default function TeamsManagementPage() {
  const params = useParams()
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'))
  
  const [user, setUser] = useState<AuthUser | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [hackathonTitle, setHackathonTitle] = useState('')

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await auth.getCurrentUser()
        if (!currentUser || !auth.hasRole(currentUser, 'ORGANIZER')) {
          router.push('/auth/signin')
          return
        }
        setUser(currentUser)
        await fetchTeams()
      } catch (error) {
        console.error('Error checking auth:', error)
        router.push('/auth/signin')
      }
    }

    checkAuth()
  }, [router, params.id])

  const fetchTeams = async () => {
    try {
      setLoading(true)
      // Mock data - replace with actual API call
      const mockTeams: Team[] = [
        {
          id: '1',
          name: 'AI Innovators',
          description: 'Building next-gen AI solutions for healthcare',
          leader_id: '1',
          leader_name: 'Alice Smith',
          member_count: 3,
          max_members: 4,
          skills_wanted: ['Machine Learning', 'Python'],
          project_name: 'HealthAI Assistant',
          project_description: 'AI-powered medical diagnosis assistant',
          repository_url: 'https://github.com/team/healthai',
          status: 'COMPETING',
          members: [
            { id: '1', name: 'Alice Smith', role: 'LEADER', avatar_url: '' },
            { id: '2', name: 'Bob Johnson', role: 'MEMBER', avatar_url: '' },
            { id: '3', name: 'Carol Davis', role: 'MEMBER', avatar_url: '' }
          ]
        },
        {
          id: '2',
          name: 'Code Ninjas',
          description: 'Fast-paced development team',
          leader_id: '4',
          leader_name: 'David Wilson',
          member_count: 2,
          max_members: 5,
          skills_wanted: ['React', 'Node.js', 'Database'],
          status: 'RECRUITING',
          members: [
            { id: '4', name: 'David Wilson', role: 'LEADER', avatar_url: '' },
            { id: '5', name: 'Emma Brown', role: 'MEMBER', avatar_url: '' }
          ]
        },
        {
          id: '3',
          name: 'Data Wizards',
          description: 'Analytics and visualization experts',
          leader_id: '6',
          leader_name: 'Frank Miller',
          member_count: 4,
          max_members: 4,
          skills_wanted: [],
          project_name: 'EcoTracker',
          project_description: 'Environmental impact tracking platform',
          repository_url: 'https://github.com/team/ecotracker',
          status: 'SUBMITTED',
          members: [
            { id: '6', name: 'Frank Miller', role: 'LEADER', avatar_url: '' },
            { id: '7', name: 'Grace Taylor', role: 'MEMBER', avatar_url: '' },
            { id: '8', name: 'Henry Clark', role: 'MEMBER', avatar_url: '' },
            { id: '9', name: 'Ivy Lewis', role: 'MEMBER', avatar_url: '' }
          ]
        }
      ]
      
      setTeams(mockTeams)
      setHackathonTitle('AI Innovation Challenge')
    } catch (error) {
      console.error('Error fetching teams:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RECRUITING': return { color: 'info' as const }
      case 'FULL': return { color: 'warning' as const }
      case 'COMPETING': return { color: 'secondary' as const }
      case 'SUBMITTED': return { color: 'success' as const }
      default: return { color: 'default' as const }
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'RECRUITING': return 'Looking for Members'
      case 'FULL': return 'Team Full'
      case 'COMPETING': return 'Working on Project'
      case 'SUBMITTED': return 'Project Submitted'
      default: return status
    }
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
          
          <Typography 
            variant={isSmall ? "h5" : isMobile ? "h4" : "h3"} 
            component="h1" 
            fontWeight="bold" 
            gutterBottom
          >
            Teams Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {hackathonTitle} • {teams.length} teams registered
          </Typography>
        </Box>

        {/* Stats Summary */}
        <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 3 }}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
              <CardContent sx={{ p: { xs: 2, md: 3 }, textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold" color="primary.main">
                  {teams.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Teams
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
              <CardContent sx={{ p: { xs: 2, md: 3 }, textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold" color="info.main">
                  {teams.filter(t => t.status === 'RECRUITING').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Recruiting
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
              <CardContent sx={{ p: { xs: 2, md: 3 }, textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold" color="secondary.main">
                  {teams.filter(t => t.status === 'COMPETING').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Competing
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
              <CardContent sx={{ p: { xs: 2, md: 3 }, textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {teams.filter(t => t.status === 'SUBMITTED').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Submitted
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Teams Grid */}
        <Grid container spacing={{ xs: 2, md: 3 }}>
          {teams.map((team) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={team.id}>
              <Card sx={{ boxShadow: 2, borderRadius: 2, height: '100%' }}>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  {/* Team Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        variant={isSmall ? "subtitle1" : "h6"} 
                        fontWeight="bold" 
                        gutterBottom
                      >
                        {team.name}
                      </Typography>
                      <Chip 
                        label={getStatusText(team.status)} 
                        {...getStatusColor(team.status)}
                        size="small"
                      />
                    </Box>
                    <TeamIcon color="action" />
                  </Box>

                  {/* Description */}
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ mb: 2, lineHeight: 1.5 }}
                  >
                    {team.description}
                  </Typography>

                  {/* Team Progress */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Team Size
                      </Typography>
                      <Typography variant="caption" fontWeight="bold">
                        {team.member_count}/{team.max_members}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(team.member_count / team.max_members) * 100} 
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>

                  {/* Members */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                      Team Members
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 32, height: 32 } }}>
                        {team.members.map((member) => (
                          <Avatar key={member.id} sx={{ fontSize: '0.875rem' }}>
                            {member.name.charAt(0)}
                          </Avatar>
                        ))}
                      </AvatarGroup>
                      {team.leader_name && (
                        <Typography variant="caption" color="text.secondary">
                          Led by {team.leader_name}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {/* Skills Wanted */}
                  {team.skills_wanted.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                        Looking for
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {team.skills_wanted.map((skill, index) => (
                          <Chip 
                            key={index} 
                            label={skill} 
                            size="small" 
                            variant="outlined" 
                            color="info"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* Project Info */}
                  {team.project_name && (
                    <Box sx={{ mb: 2, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Project
                      </Typography>
                      <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.5 }}>
                        {team.project_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {team.project_description}
                      </Typography>
                    </Box>
                  )}

                  {/* Actions */}
                  <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<PersonIcon />}
                      sx={{ flex: 1, fontSize: '0.75rem' }}
                    >
                      View Members
                    </Button>
                    {team.repository_url && (
                      <IconButton 
                        size="small" 
                        onClick={() => window.open(team.repository_url, '_blank')}
                      >
                        <GitHubIcon />
                      </IconButton>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  )
}