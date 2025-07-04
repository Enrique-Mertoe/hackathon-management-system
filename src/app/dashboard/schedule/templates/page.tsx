'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Chip
} from '@mui/material'
import {
  ArrowBack as BackIcon,
  Schedule as TemplateIcon,
  AccessTime as TimeIcon,
  Group as GroupIcon,
  Star as StarIcon
} from '@mui/icons-material'
import { auth } from '@/lib/auth'
import type { AuthUser } from '@/lib/auth'

export default function ScheduleTemplatesPage() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await auth.getCurrentUser()
        if (!currentUser || !auth.hasRole(currentUser, 'ORGANIZER')) {
          router.push('/auth/signin')
          return
        }
        setUser(currentUser)
      } catch (error) {
        console.error('Error checking auth:', error)
        router.push('/auth/signin')
      } finally {
        setLoading(false)
      }
    }

    void checkAuth()
  }, [router])

  // Mock template data for demonstration
  const templates = [
    {
      id: '1',
      name: '48-Hour Hackathon',
      description: 'Standard weekend hackathon with workshops, coding time, and presentations',
      duration: '48 hours',
      difficulty: 'INTERMEDIATE',
      events: 12,
      popular: true
    },
    {
      id: '2', 
      name: '24-Hour Sprint',
      description: 'Intensive one-day hackathon for quick prototyping',
      duration: '24 hours',
      difficulty: 'BEGINNER',
      events: 8,
      popular: false
    },
    {
      id: '3',
      name: 'Week-long Innovation Challenge',
      description: 'Extended hackathon with multiple checkpoints and mentor sessions',
      duration: '7 days',
      difficulty: 'ADVANCED',
      events: 20,
      popular: true
    }
  ]

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
        <Box sx={{ mb: 4 }}>
          <Button
            variant="text"
            startIcon={<BackIcon />}
            onClick={() => router.push('/dashboard/schedule')}
            sx={{ mb: 2 }}
          >
            Back to Schedule Management
          </Button>
          <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
            Schedule Templates
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Pre-built schedule templates to get your hackathon started quickly
          </Typography>
        </Box>

        {/* Templates Grid */}
        <Grid container spacing={3}>
          {templates.map((template) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={template.id}>
              <Card sx={{ 
                boxShadow: 2, 
                borderRadius: 3, 
                height: '100%',
                position: 'relative',
                '&:hover': { 
                  boxShadow: 4,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease-in-out'
                }
              }}>
                {template.popular && (
                  <Chip
                    icon={<StarIcon />}
                    label="Popular"
                    color="primary"
                    size="small"
                    sx={{ 
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      zIndex: 1
                    }}
                  />
                )}
                <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TemplateIcon sx={{ color: 'primary.main', mr: 1 }} />
                    <Typography variant="h6" fontWeight="bold">
                      {template.name}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3, flex: 1 }}>
                    {template.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                    <Chip 
                      icon={<TimeIcon />}
                      label={template.duration}
                      size="small"
                      variant="outlined"
                    />
                    <Chip 
                      icon={<GroupIcon />}
                      label={template.difficulty}
                      size="small"
                      variant="outlined"
                      color={template.difficulty === 'BEGINNER' ? 'success' : 
                             template.difficulty === 'INTERMEDIATE' ? 'warning' : 'error'}
                    />
                    <Chip 
                      label={`${template.events} events`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                      variant="contained" 
                      size="small"
                      fullWidth
                      onClick={() => {
                        // TODO: Implement template application
                        alert('Template functionality coming soon!')
                      }}
                    >
                      Use Template
                    </Button>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => {
                        // TODO: Implement template preview
                        alert('Preview functionality coming soon!')
                      }}
                    >
                      Preview
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Coming Soon Section */}
        <Card sx={{ boxShadow: 2, borderRadius: 3, mt: 4, textAlign: 'center', py: 4 }}>
          <CardContent>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Custom Templates Coming Soon
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Create, save, and share your own schedule templates with the community.
            </Typography>
            <Button 
              variant="outlined"
              onClick={() => router.push('/dashboard/schedule')}
            >
              Return to Schedule Management
            </Button>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}