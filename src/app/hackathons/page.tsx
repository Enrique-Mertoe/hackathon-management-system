'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Avatar,
  Badge,
  CardMedia
} from '@mui/material'
import {
  Star,
  Refresh,
  Search,
  CalendarToday,
  MonetizationOn,
  Verified,
  Image
} from '@mui/icons-material'
import { usePageCache } from '@/lib/cache'

interface Hackathon {
  id: string
  title: string
  description: string
  theme: string | null
  difficulty_level: string
  status: string
  registration_start: string
  registration_end: string
  start_date: string
  end_date: string
  max_participants: number | null
  prize_pool: number | null
  featured: boolean
  poster_url: string | null
  organizations: {
    id: string
    name: string
    logo_url: string | null
    verification_status: string
  } | null
}

export default function HackathonsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('')

  // Create cache parameters
  const cacheParams = {
    search: searchTerm || undefined,
    status: statusFilter || undefined,
    difficulty: difficultyFilter || undefined
  }

  // Use page cache with stale-while-revalidate
  const { 
    data: hackathons = [], 
    loading, 
    error, 
    isStale, 
    mutate 
  } = usePageCache<Hackathon[]>(
    '/hackathons',
    cacheParams,
    async () => {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter) params.append('status', statusFilter)
      if (difficultyFilter) params.append('difficulty', difficultyFilter)

      const response = await fetch(`/api/hackathons?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch hackathons')
      }

      return data.hackathons || []
    },
    {
      ttl: 5 * 60 * 1000, // 5 minutes
      staleTime: 30 * 1000, // 30 seconds
    }
  )

  const getStatusColor = (status: string): 'success' | 'warning' | 'info' | 'default' => {
    switch (status) {
      case 'REGISTRATION_OPEN':
        return 'success'
      case 'REGISTRATION_CLOSED':
        return 'warning'
      case 'ACTIVE':
        return 'info'
      case 'COMPLETED':
        return 'default'
      default:
        return 'default'
    }
  }

  const getDifficultyColor = (difficulty: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (difficulty) {
      case 'BEGINNER':
        return 'success'
      case 'INTERMEDIATE':
        return 'warning'
      case 'ADVANCED':
        return 'warning'
      case 'EXPERT':
        return 'error'
      default:
        return 'default'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading && (!hackathons || hackathons.length === 0)) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh' }}>
            <CircularProgress size={48} />
          </Box>
        </Container>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Discover Hackathons
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Find the perfect hackathon to showcase your skills and build amazing projects
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {isStale && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ 
                    width: 8, 
                    height: 8, 
                    bgcolor: 'warning.main', 
                    borderRadius: '50%',
                    animation: 'pulse 2s infinite'
                  }} />
                  <Typography variant="body2" color="warning.main">
                    Updating...
                  </Typography>
                </Box>
              )}
              {loading && hackathons && hackathons.length > 0 && (
                <CircularProgress size={16} />
              )}
              <Button 
                variant="outlined" 
                size="small"
                startIcon={<Refresh />}
                onClick={() => mutate()}
                disabled={loading}
              >
                Refresh
              </Button>
            </Box>
          </Box>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Error loading hackathons: {error.message}
            </Alert>
          )}
        </Box>

        {/* Filters */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              placeholder="Search hackathons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                }
              }}
            />
          </Grid>
          
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="REGISTRATION_OPEN">Registration Open</MenuItem>
                <MenuItem value="REGISTRATION_CLOSED">Registration Closed</MenuItem>
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth>
              <InputLabel>Difficulty</InputLabel>
              <Select
                value={difficultyFilter}
                label="Difficulty"
                onChange={(e) => setDifficultyFilter(e.target.value)}
              >
                <MenuItem value="">All Difficulties</MenuItem>
                <MenuItem value="BEGINNER">Beginner</MenuItem>
                <MenuItem value="INTERMEDIATE">Intermediate</MenuItem>
                <MenuItem value="ADVANCED">Advanced</MenuItem>
                <MenuItem value="EXPERT">Expert</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Hackathons Grid */}
        {!hackathons || hackathons.length === 0 ? (
          <Card>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ mb: 1 }}>No hackathons found</Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search criteria or check back later for new events.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {hackathons.map((hackathon) => (
              <Grid key={hackathon.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Card sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  position: 'relative',
                  boxShadow: 'rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px',
                  '&:hover': {
                    boxShadow: 'rgba(50, 50, 93, 0.35) 0px 4px 8px -1px, rgba(0, 0, 0, 0.4) 0px 2px 5px -1px'
                  },
                  transition: 'box-shadow 0.2s ease-in-out'
                }}>
                  {hackathon.featured && (
                    <Box sx={{ 
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.75rem',
                      fontWeight: 'medium',
                      zIndex: 2,
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <Star sx={{ fontSize: 12, mr: 0.5 }} />
                      Featured
                    </Box>
                  )}
                  
                  {/* Poster Image */}
                  {hackathon.poster_url ? (
                    <CardMedia
                      component="img"
                      height="140"
                      image={hackathon.poster_url}
                      alt={`${hackathon.title} poster`}
                      sx={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <Box
                      sx={{
                        height: 140,
                        bgcolor: 'grey.100',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'grey.400'
                      }}
                    >

                      <Image sx={{ fontSize: 32 }} alt="No poster available" />
                    </Box>
                  )}
                  
                  <CardContent sx={{ flexGrow: 1, pb: 1, p: 2 }}>
                    <Typography variant="h6" component="h3" sx={{ mb: 1.5, lineHeight: 1.2, fontSize: '1rem' }}>
                      {hackathon.title}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 0.5, mb: 1.5, flexWrap: 'wrap' }}>
                      <Chip 
                        label={hackathon.status.replace('_', ' ')}
                        color={getStatusColor(hackathon.status)}
                        size="small"
                        sx={{ fontSize: '0.7rem', height: 20 }}
                      />
                      <Chip 
                        label={hackathon.difficulty_level}
                        color={getDifficultyColor(hackathon.difficulty_level)}
                        size="small"
                        sx={{ fontSize: '0.7rem', height: 20 }}
                      />
                    </Box>

                    {hackathon.organizations && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                        {hackathon.organizations.logo_url && (
                          <Avatar 
                            src={hackathon.organizations.logo_url} 
                            alt={hackathon.organizations.name}
                            sx={{ width: 20, height: 20 }}
                          />
                        )}
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                          {hackathon.organizations.name}
                        </Typography>
                        {hackathon.organizations.verification_status === 'VERIFIED' && (
                          <Verified sx={{ fontSize: 14, color: 'primary.main' }} />
                        )}
                      </Box>
                    )}

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.85rem', lineHeight: 1.3 }}>
                      {hackathon.description.length > 80 ? `${hackathon.description.substring(0, 80)}...` : hackathon.description}
                    </Typography>

                    {hackathon.theme && (
                      <Typography variant="body2" color="primary.main" sx={{ fontWeight: 'medium', mb: 1.5, fontSize: '0.8rem' }}>
                        Theme: {hackathon.theme}
                      </Typography>
                    )}

                    <Box sx={{ mt: 'auto' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        <CalendarToday sx={{ fontSize: 12, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                          Reg: {formatDate(hackathon.registration_end)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        <CalendarToday sx={{ fontSize: 12, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                          Event: {formatDate(hackathon.start_date)}
                        </Typography>
                      </Box>
                      {hackathon.prize_pool && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                          <MonetizationOn sx={{ fontSize: 12, color: 'primary.main' }} />
                          <Typography variant="body2" color="primary.main" sx={{ fontWeight: 'medium', fontSize: '0.75rem' }}>
                            ${hackathon.prize_pool.toLocaleString()}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>

                  <CardActions sx={{ p: 1.5, pt: 0 }}>
                    <Link href={`/hackathons/${hackathon.id}`} style={{ width: '100%' }}>
                      <Button variant="contained" fullWidth size="small">
                        View Details
                      </Button>
                    </Link>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  )
}