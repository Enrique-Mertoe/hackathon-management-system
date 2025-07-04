'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Card,
  CardContent,
  Button,
  Typography,
  Container,
  Grid,
  Chip,
  useTheme,
  alpha,
  Avatar,
  Paper,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Badge
} from '@mui/material'
import {
  RocketLaunch as RocketIcon,
  BarChart as ChartIcon,
  Group as TeamIcon,
  EmojiEvents as TrophyIcon,
  AutoAwesome as SparkleIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Code as CodeIcon
} from '@mui/icons-material'
import type { AuthUser } from '@/lib/auth'

interface ParticipantStats {
  totalHackathons: number
  activeHackathons: number
  completedHackathons: number
  totalTeams: number
  skillsCount: number
  averageRank: number | null
  totalPrizes: number
}

interface HackathonParticipation {
  id: string
  title: string
  status: string
  start_date: string
  end_date: string
  team_name?: string
  role?: string
  rank?: number
  prize_amount?: number
}

interface TeamMembership {
  id: string
  name: string
  hackathon_title: string
  role: string
  status: string
  member_count: number
}

interface ParticipantDashboardProps {
  user: AuthUser
}

export default function ParticipantDashboard({ user }: ParticipantDashboardProps) {
  const theme = useTheme()
  const router = useRouter()
  
  const [stats, setStats] = useState<ParticipantStats | null>(null)
  const [recentHackathons, setRecentHackathons] = useState<HackathonParticipation[]>([])
  const [recentTeams, setRecentTeams] = useState<TeamMembership[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchParticipantData()
  }, [user])

  const fetchParticipantData = async () => {
    try {
      setLoading(true)
      
      // Fetch participant stats
      const statsResponse = await fetch('/api/participant/stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // Fetch recent hackathon participations
      const hackathonsResponse = await fetch('/api/participant/hackathons?limit=5')
      if (hackathonsResponse.ok) {
        const hackathonsData = await hackathonsResponse.json()
        setRecentHackathons(hackathonsData.participations || [])
      }

      // Fetch recent team memberships
      const teamsResponse = await fetch('/api/participant/teams?limit=3')
      if (teamsResponse.ok) {
        const teamsData = await teamsResponse.json()
        setRecentTeams(teamsData.teams || [])
      }
    } catch (error) {
      console.error('Error fetching participant data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': 
      case 'ongoing': 
        return { color: theme.palette.success.main, background: alpha(theme.palette.success.main, 0.1) }
      case 'completed': 
        return { color: theme.palette.info.main, background: alpha(theme.palette.info.main, 0.1) }
      case 'upcoming': 
        return { color: theme.palette.warning.main, background: alpha(theme.palette.warning.main, 0.1) }
      case 'cancelled': 
        return { color: theme.palette.error.main, background: alpha(theme.palette.error.main, 0.1) }
      default: 
        return { color: theme.palette.text.secondary, background: alpha(theme.palette.text.secondary, 0.1) }
    }
  }

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress size={40} />
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Quick Stats */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 6, md: 3 }}>
            <Card sx={{ borderRadius: 2, p: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" fontWeight="bold" color="text.primary">
                  {stats?.totalHackathons || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Events
                </Typography>
              </Box>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Card sx={{ borderRadius: 2, p: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" fontWeight="bold" color="text.primary">
                  {stats?.totalTeams || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Teams
                </Typography>
              </Box>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Card sx={{ borderRadius: 2, p: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" fontWeight="bold" color="text.primary">
                  {stats?.skillsCount || (Array.isArray(user.skills) ? user.skills.length : 0)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Skills
                </Typography>
              </Box>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Card sx={{ borderRadius: 2, p: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" fontWeight="bold" color={user.email_verified ? 'success.main' : 'warning.main'}>
                  {user.email_verified ? '✓' : '⚠'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user.email_verified ? 'Verified' : 'Pending'}
                </Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ borderRadius: 2, p: 3, cursor: 'pointer' }} onClick={() => router.push('/hackathons')}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <RocketIcon color="primary" />
                <Box>
                  <Typography variant="h6" fontWeight="bold">Explore Hackathons</Typography>
                  <Typography variant="caption" color="text.secondary">Find your next challenge</Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ borderRadius: 2, p: 3, cursor: 'pointer' }} onClick={() => router.push('/teams')}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TeamIcon color="primary" />
                <Box>
                  <Typography variant="h6" fontWeight="bold">Find Teams</Typography>
                  <Typography variant="caption" color="text.secondary">Connect with others</Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* Recent Activity */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Recent Hackathons</Typography>
            <Card sx={{ 
              borderRadius: 2,
              boxShadow: 'rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px'
            }}>
              <CardContent sx={{ p: 0 }}>
                {recentHackathons.length === 0 ? (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      No hackathons yet
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => router.push('/hackathons')}
                    >
                      Explore Hackathons
                    </Button>
                  </Box>
                ) : (
                  <List sx={{ p: 0 }}>
                    {recentHackathons.slice(0, 3).map((hackathon, index) => (
                      <React.Fragment key={hackathon.id}>
                        <ListItem sx={{ px: 2, py: 1 }}>
                          <ListItemText
                            primary={
                              <Typography variant="body2" fontWeight="medium" noWrap>
                                {hackathon.title}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(hackathon.start_date)}
                              </Typography>
                            }
                          />
                          <Chip
                            label={hackathon.status}
                            size="small"
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                        </ListItem>
                        {index < Math.min(recentHackathons.length - 1, 2) && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>My Teams</Typography>
            <Card sx={{ 
              borderRadius: 2,
              boxShadow: 'rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px'
            }}>
              <CardContent sx={{ p: 0 }}>
                {recentTeams.length === 0 ? (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      No teams yet
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => router.push('/teams')}
                    >
                      Find Teams
                    </Button>
                  </Box>
                ) : (
                  <List sx={{ p: 0 }}>
                    {recentTeams.slice(0, 3).map((team, index) => (
                      <React.Fragment key={team.id}>
                        <ListItem sx={{ px: 2, py: 1 }}>
                          <ListItemText
                            primary={
                              <Typography variant="body2" fontWeight="medium" noWrap>
                                {team.name}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="caption" color="text.secondary" noWrap>
                                {team.hackathon_title}
                              </Typography>
                            }
                          />
                        </ListItem>
                        {index < Math.min(recentTeams.length - 1, 2) && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Skills */}
        {Array.isArray(user.skills) && user.skills.length > 0 && (
          <Box>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Skills</Typography>
            <Card sx={{ 
              borderRadius: 2, 
              p: 2,
              boxShadow: 'rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px'
            }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {user.skills.slice(0, 8).map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill?.toString()}
                    size="small"
                    sx={{
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      fontSize: '0.75rem',
                    }}
                  />
                ))}
                {user.skills.length > 8 && (
                  <Chip
                    label={`+${user.skills.length - 8} more`}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.75rem' }}
                  />
                )}
              </Box>
            </Card>
          </Box>
        )}
      </Box>
    </Container>
  )
}