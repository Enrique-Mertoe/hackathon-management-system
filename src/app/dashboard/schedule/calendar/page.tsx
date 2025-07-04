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
  CircularProgress
} from '@mui/material'
import {
  ArrowBack as BackIcon,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material'
import { auth } from '@/lib/auth'
import type { AuthUser } from '@/lib/auth'

export default function ScheduleCalendarPage() {
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
            Schedule Calendar
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Calendar view of your hackathon schedules
          </Typography>
        </Box>

        {/* Coming Soon Card */}
        <Grid container spacing={3}>
          <Grid size={12}>
            <Card sx={{ boxShadow: 2, borderRadius: 3, textAlign: 'center', py: 6 }}>
              <CardContent>
                <CalendarIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  Calendar View Coming Soon
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
                  We're working on a comprehensive calendar view to help you visualize and manage your hackathon schedules. 
                  This feature will include drag-and-drop scheduling, conflict detection, and integration with popular calendar applications.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Button 
                    variant="contained" 
                    onClick={() => router.push('/dashboard/schedule')}
                  >
                    Return to Schedule Management
                  </Button>
                  <Button 
                    variant="outlined"
                    onClick={() => router.push('/dashboard')}
                  >
                    Go to Dashboard
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}