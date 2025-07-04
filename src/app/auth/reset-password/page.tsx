'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Alert,
  Avatar,
  useTheme,
  alpha,
  Paper,
  CircularProgress
} from '@mui/material'
import { Lock as LockIcon, LockReset as LockResetIcon } from '@mui/icons-material'
import { auth } from '@/lib/auth'

function ResetPasswordForm() {
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isResetMode, setIsResetMode] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if this is a password reset callback (has access_token in URL)
    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')
    
    if (accessToken && refreshToken) {
      setIsResetMode(true)
    }
  }, [searchParams])

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { error } = await auth.resetPassword(email)
      
      if (error) {
        setError(error.message)
      } else {
        setMessage('Password reset link sent! Please check your email.')
      }
    } catch (err) {
      setError('Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const { error } = await auth.updatePassword(newPassword)
      
      if (error) {
        setError(error.message)
      } else {
        setMessage('Password updated successfully! Redirecting to dashboard...')
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      }
    } catch (err) {
      setError('Failed to update password')
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
          <Box sx={{ p: 3 }}>
            {/* Logo and Header */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Avatar
                sx={{
                  width: 60,
                  height: 60,
                  mb: 2,
                  backgroundColor: isResetMode ? alpha(theme.palette.warning.main, 0.1) : alpha(theme.palette.primary.main, 0.1),
                  boxShadow: theme.shadows[6],
                }}
              >
                {isResetMode ? (
                  <LockResetIcon sx={{ fontSize: 30, color: theme.palette.warning.main }} />
                ) : (
                  <LockIcon sx={{ fontSize: 30, color: theme.palette.primary.main }} />
                )}
              </Avatar>
              <Typography variant="h5" fontWeight="bold" color="text.primary" gutterBottom>
                {isResetMode ? 'Set New Password' : 'Reset Password'}
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                {isResetMode 
                  ? 'Enter your new password below'
                  : 'Enter your email to receive a password reset link'
                }
              </Typography>
            </Box>

            {/* Messages */}
            {message && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {message}
              </Alert>
            )}
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* Forms */}
            {isResetMode ? (
              <Box component="form" onSubmit={handleUpdatePassword} sx={{ mt: 3 }}>
                <TextField
                  fullWidth
                  type="password"
                  label="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  size="small"
                  sx={{ mb: 2 }}
                  variant="outlined"
                />
                
                <TextField
                  fullWidth
                  type="password"
                  label="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  size="small"
                  sx={{ mb: 3 }}
                  variant="outlined"
                />
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="medium"
                  disabled={loading}
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
                  }}
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </Button>
              </Box>
            ) : (
              <Box component="form" onSubmit={handleRequestReset} sx={{ mt: 3 }}>
                <TextField
                  fullWidth
                  type="email"
                  label="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  size="small"
                  sx={{ mb: 3 }}
                  variant="outlined"
                />
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="medium"
                  disabled={loading}
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
                  }}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </Box>
            )}
            
            {/* Links */}
            <Box sx={{ mt: 2, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 1 }}>
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
              <Typography variant="caption" color="text.secondary">
                Don't have an account?{' '}
                <Link 
                  href="/auth/signup" 
                  style={{ 
                    color: theme.palette.primary.main, 
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                >
                  Sign up
                </Link>
              </Typography>
            </Box>
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordForm />
    </Suspense>
  )
}