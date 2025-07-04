'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Container,
  Alert,
  Avatar,
  useTheme,
  alpha,
  Paper,
  CircularProgress
} from '@mui/material'
import { Email as EmailIcon, CheckCircle as CheckIcon } from '@mui/icons-material'
import { supabase } from '@/lib/supabase'

function VerifyEmailForm() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [verified, setVerified] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if this is an email confirmation callback
    const handleEmailConfirmation = async () => {
      const { data, error } = await supabase.auth.getSession()
      
      if (data.session) {
        setVerified(true)
        setMessage('Email verified successfully! You can now access your dashboard.')
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard')
        }, 3000)
      }
    }

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setVerified(true)
          setMessage('Email verified successfully! Redirecting to dashboard...')
          
          setTimeout(() => {
            router.push('/dashboard')
          }, 2000)
        }
      }
    )

    handleEmailConfirmation()

    return () => subscription.unsubscribe()
  }, [router])

  const resendVerification = async () => {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('No user found. Please sign up again.')
        return
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email!
      })

      if (error) {
        setError(error.message)
      } else {
        setMessage('Verification email sent! Please check your inbox.')
      }
    } catch (err) {
      setError('Failed to resend verification email')
    } finally {
      setLoading(false)
    }
  }

  const theme = useTheme()

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
          }}
        >
          <Box sx={{ p: 3, textAlign: 'center' }}>
            {/* Icon and Header */}
            <Avatar
              sx={{
                width: 60,
                height: 60,
                mb: 2,
                mx: 'auto',
                backgroundColor: verified ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.primary.main, 0.1),
                boxShadow: theme.shadows[6],
              }}
            >
              {verified ? (
                <CheckIcon sx={{ fontSize: 30, color: theme.palette.success.main }} />
              ) : (
                <EmailIcon sx={{ fontSize: 30, color: theme.palette.primary.main }} />
              )}
            </Avatar>
            
            <Typography variant="h5" fontWeight="bold" color="text.primary" gutterBottom>
              {verified ? 'Email Verified!' : 'Check Your Email'}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {verified 
                ? 'Your email has been successfully verified.'
                : 'We sent a verification link to your email address.'
              }
            </Typography>

            {/* Messages */}
            {message && (
              <Alert severity="success" sx={{ mb: 2, textAlign: 'left' }}>
                {message}
              </Alert>
            )}
            
            {error && (
              <Alert severity="error" sx={{ mb: 2, textAlign: 'left' }}>
                {error}
              </Alert>
            )}

            {/* Actions */}
            {!verified && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                  Click the verification link in your email to activate your account.
                  <br />
                  Didn't receive an email? Check your spam folder or request a new one.
                </Typography>
                
                <Button
                  onClick={resendVerification}
                  disabled={loading}
                  variant="outlined"
                  size="medium"
                  fullWidth
                  sx={{
                    py: 1,
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    borderRadius: 1,
                    textTransform: 'none',
                  }}
                >
                  {loading ? 'Sending...' : 'Resend Verification Email'}
                </Button>
              </Box>
            )}

            {verified && (
              <Button
                onClick={() => router.push('/dashboard')}
                variant="contained"
                size="medium"
                fullWidth
                sx={{
                  py: 1,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  borderRadius: 1,
                  textTransform: 'none',
                  boxShadow: theme.shadows[3],
                  '&:hover': {
                    boxShadow: theme.shadows[6],
                  },
                  mb: 2,
                }}
              >
                Go to Dashboard
              </Button>
            )}
            
            {/* Links */}
            <Link 
              href="/auth/signin" 
              style={{ 
                color: theme.palette.primary.main, 
                textDecoration: 'none',
                fontSize: '0.75rem',
                fontWeight: 500,
              }}
            >
              Back to Sign In
            </Link>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

function LoadingFallback() {
  const theme = useTheme()
  
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
          <CircularProgress size={30} sx={{ mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            Loading...
          </Typography>
        </Paper>
      </Container>
    </Box>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VerifyEmailForm />
    </Suspense>
  )
}