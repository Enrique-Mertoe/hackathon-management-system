'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  Box,
  Container,
  Paper,
  CircularProgress,
  Typography,
  useTheme,
  alpha
} from '@mui/material'

export default function AuthCallback() {
  const router = useRouter()
  const theme = useTheme()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          router.push('/auth/signin?error=callback_failed')
          return
        }

        if (data.session) {
          // Check if user profile exists
          const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.session.user.id)
            .single()

          if (profileError && profileError.code === 'PGRST116') {
            // User profile doesn't exist, create it
            const { error: createError } = await supabase
              .from('users')
              .insert({
                id: data.session.user.id,
                email: data.session.user.email!,
                username: data.session.user.user_metadata?.full_name?.replace(/\s+/g, '').toLowerCase() || 
                         data.session.user.email?.split('@')[0] || 'user',
                full_name: data.session.user.user_metadata?.full_name || 'Google User',
                role: 'PARTICIPANT',
                email_verified: true,
                avatar_url: data.session.user.user_metadata?.avatar_url,
              })

            if (createError) {
              console.error('Error creating user profile:', createError)
              router.push('/auth/signin?error=profile_creation_failed')
              return
            }
          }

          // Redirect to dashboard
          router.push('/dashboard')
        } else {
          router.push('/auth/signin')
        }
      } catch (error) {
        console.error('Unexpected error:', error)
        router.push('/auth/signin?error=unexpected_error')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        px: 2,
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={12}
          sx={{
            borderRadius: 2,
            overflow: 'hidden',
            background: alpha(theme.palette.background.paper, 0.9),
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            p: 4,
            textAlign: 'center',
          }}
        >
          <CircularProgress size={40} sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.primary" gutterBottom>
            Signing you in...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please wait while we complete your authentication
          </Typography>
        </Paper>
      </Container>
    </Box>
  )
}