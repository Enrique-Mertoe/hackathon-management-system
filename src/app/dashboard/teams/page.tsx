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
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Badge,
  CircularProgress
} from '@mui/material'
import {
  Group as TeamIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  EmojiEvents as TrophyIcon,
  Pending as PendingIcon,
  Check as ActiveIcon
} from '@mui/icons-material'

interface Team {
  id: string
  name: string
  description: string
  hackathon_title: string
  hackathon_id: string
  leader_id: string
  status: string
  looking_for_members: boolean
  skills_wanted: string[]
  member_count: number
  max_members: number
  created_at: string
}

interface UserTeam {
  id: string
  name: string
  description: string
  hackathon_title: string
  role: string
  status: string
  member_count: number
}

export default function TeamsPage() {
  const theme = useTheme()
  const router = useRouter()
  
  const [availableTeams, setAvailableTeams] = useState<Team[]>([])
  const [userTeams, setUserTeams] = useState<UserTeam[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchTeamsData()
  }, [])

  const fetchTeamsData = async () => {
    try {
      setLoading(true)
      
      // Fetch user's teams
      const userTeamsResponse = await fetch('/api/teams/user')
      if (userTeamsResponse.ok) {
        const userTeamsData = await userTeamsResponse.json()
        setUserTeams(userTeamsData.teams || [])
      }

      // Fetch available teams (teams looking for members)
      const availableTeamsResponse = await fetch('/api/teams/available')
      if (availableTeamsResponse.ok) {
        const availableTeamsData = await availableTeamsResponse.json()
        setAvailableTeams(availableTeamsData.teams || [])
      }
    } catch (error) {
      console.error('Error fetching teams data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinTeam = async (teamId: string) => {
    try {
      const response = await fetch(`/api/teams/${teamId}/join`, {
        method: 'POST',
      })
      
      if (response.ok) {
        // Refresh data
        await fetchTeamsData()
      }
    } catch (error) {
      console.error('Error joining team:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'recruiting':
        return <PendingIcon color="warning" />
      case 'full':
      case 'competing':
        return <ActiveIcon color="success" />
      default:
        return <TeamIcon color="primary" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'recruiting':
        return { color: theme.palette.warning.main, background: alpha(theme.palette.warning.main, 0.1) }
      case 'full':
      case 'competing':
        return { color: theme.palette.success.main, background: alpha(theme.palette.success.main, 0.1) }
      case 'submitted':
        return { color: theme.palette.info.main, background: alpha(theme.palette.info.main, 0.1) }
      default:
        return { color: theme.palette.text.secondary, background: alpha(theme.palette.text.secondary, 0.1) }
    }
  }

  const filteredTeams = availableTeams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         team.hackathon_title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || team.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress size={40} />
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" fontWeight="bold">
            Teams
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push('/dashboard/teams/create')}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              boxShadow: 'rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px'
            }}
          >
            Create Team
          </Button>
        </Box>

        {/* My Teams */}
        <Box>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            My Teams ({userTeams.length})
          </Typography>
          
          {userTeams.length === 0 ? (
            <Card sx={{ 
              borderRadius: 2, 
              p: 4, 
              textAlign: 'center',
              boxShadow: 'rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px'
            }}>
              <TeamIcon sx={{ fontSize: 48, color: theme.palette.text.secondary, mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No teams yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Join an existing team or create your own to start collaborating
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => router.push('/dashboard/teams/create')}
                sx={{ borderRadius: 2 }}
              >
                Create Your First Team
              </Button>
            </Card>
          ) : (
            <Grid container spacing={2}>
              {userTeams.map((team) => (
                <Grid key={team.id}  sx={{xs:12,md:6}}>
                  <Card sx={{ 
                    borderRadius: 2,
                    boxShadow: 'rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px',
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)'
                    }
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getStatusIcon(team.status)}
                          <Typography variant="h6" fontWeight="bold">
                            {team.name}
                          </Typography>
                        </Box>
                        <Chip
                          label={team.role}
                          size="small"
                          sx={{
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            fontSize: '0.75rem'
                          }}
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {team.hackathon_title}
                      </Typography>
                      
                      {team.description && (
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          {team.description}
                        </Typography>
                      )}
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PersonIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                          <Typography variant="caption" color="text.secondary">
                            {team.member_count} members
                          </Typography>
                        </Box>
                        <Chip
                          label={team.status}
                          size="small"
                          sx={{
                            ...getStatusColor(team.status),
                            fontSize: '0.7rem',
                            height: 20
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* Available Teams */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              Available Teams ({filteredTeams.length})
            </Typography>
          </Box>

          {/* Filters */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              placeholder="Search teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              sx={{ flex: 1 }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: theme.palette.text.secondary, mr: 1 }} />
              }}
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="recruiting">Recruiting</MenuItem>
                <MenuItem value="full">Full</MenuItem>
                <MenuItem value="competing">Competing</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Teams List */}
          {filteredTeams.length === 0 ? (
            <Card sx={{ 
              borderRadius: 2, 
              p: 4, 
              textAlign: 'center',
              boxShadow: 'rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px'
            }}>
              <SearchIcon sx={{ fontSize: 48, color: theme.palette.text.secondary, mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No teams found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search or filters
              </Typography>
            </Card>
          ) : (
            <Card sx={{ 
              borderRadius: 2,
              boxShadow: 'rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px'
            }}>
              <List sx={{ p: 0 }}>
                {filteredTeams.map((team, index) => (
                  <React.Fragment key={team.id}>
                    <ListItem sx={{ px: 3, py: 2 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ 
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main
                        }}>
                          <TeamIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="body1" fontWeight="medium">
                              {team.name}
                            </Typography>
                            <Chip
                              label={team.status}
                              size="small"
                              sx={{
                                ...getStatusColor(team.status),
                                fontSize: '0.75rem',
                                height: 20
                              }}
                            />
                            {team.looking_for_members && (
                              <Chip
                                label="Looking for members"
                                size="small"
                                color="success"
                                variant="outlined"
                                sx={{ fontSize: '0.75rem', height: 20 }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {team.hackathon_title}
                            </Typography>
                            {team.description && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                {team.description.length > 100 
                                  ? `${team.description.substring(0, 100)}...`
                                  : team.description
                                }
                              </Typography>
                            )}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <PersonIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
                                <Typography variant="caption" color="text.secondary">
                                  {team.member_count}/{team.max_members} members
                                </Typography>
                              </Box>
                              {team.skills_wanted && team.skills_wanted.length > 0 && (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                  {team.skills_wanted.slice(0, 3).map((skill, idx) => (
                                    <Chip
                                      key={idx}
                                      label={skill}
                                      size="small"
                                      sx={{
                                        fontSize: '0.7rem',
                                        height: 18,
                                        backgroundColor: alpha(theme.palette.info.main, 0.1),
                                        color: theme.palette.info.main
                                      }}
                                    />
                                  ))}
                                  {team.skills_wanted.length > 3 && (
                                    <Typography variant="caption" color="text.secondary">
                                      +{team.skills_wanted.length - 3} more
                                    </Typography>
                                  )}
                                </Box>
                              )}
                            </Box>
                          </Box>
                        }
                      />
                      {team.looking_for_members && team.member_count < team.max_members && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleJoinTeam(team.id)}
                          sx={{ 
                            borderRadius: 1,
                            textTransform: 'none'
                          }}
                        >
                          Join Team
                        </Button>
                      )}
                    </ListItem>
                    {index < filteredTeams.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Card>
          )}
        </Box>
      </Box>
    </Container>
  )
}