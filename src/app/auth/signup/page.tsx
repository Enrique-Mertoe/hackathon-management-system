'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Box,
  Button,
  TextField,
  Card,
  CardContent,
  Typography,
  Container,
  Alert,
  Avatar,
  useTheme,
  alpha,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider
} from '@mui/material'
import { PersonAdd as PersonAddIcon } from '@mui/icons-material'
import { auth } from '@/lib/auth'
import Image from 'next/image'

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    fullName: '',
    role: 'PARTICIPANT' as const
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rateLimitCountdown, setRateLimitCountdown] = useState(0)
  const router = useRouter()

  // Handle rate limit countdown
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (rateLimitCountdown > 0) {
      interval = setInterval(() => {
        setRateLimitCountdown(prev => {
          if (prev <= 1) {
            setError('')
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [rateLimitCountdown])

  const isRateLimited = rateLimitCountdown > 0

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const { error } = await auth.signUp(formData.email, formData.password, {
        username: formData.username,
        full_name: formData.fullName,
        role: formData.role
      })
      
      if (error) {
        // Handle rate limiting error specifically
        const errorMessage = (error as any).message || String(error)
        if (errorMessage.includes('For security purposes, you can only request this after')) {
          const seconds = errorMessage.match(/after (\d+) seconds/)?.[1]
          const waitTime = seconds ? parseInt(seconds) : 10
          setRateLimitCountdown(waitTime)
          setError(`Too many signup attempts. Please wait ${waitTime} seconds before trying again.`)
        } else {
          setError(errorMessage)
        }
      } else {
        router.push('/auth/verify-email')
      }
    } catch (err) {
      console.log(err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')

    try {
      const { error } = await auth.signInWithGoogle()
      
      if (error) {
        setError(error.message)
        setLoading(false)
      }
      // Don't set loading to false here as user will be redirected
    } catch (err) {
      setError('An unexpected error occurred')
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
                  backgroundColor: theme.palette.primary.main,
                  boxShadow: theme.shadows[6],
                }}
              >
                <Image src="/logo-favicon.ico" alt="HackHub Logo" width={40} height={40} />
              </Avatar>
              <Typography variant="h5" fontWeight="bold" color="text.primary" gutterBottom>
                Create your account
              </Typography>
              <Typography variant="body1" color="text.secondary" textAlign="center">
                Join HackHub to discover amazing hackathons
              </Typography>
            </Box>

            {/* Form */}
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
              {error && (
                <Alert 
                  severity={isRateLimited ? "warning" : "error"} 
                  sx={{ mb: 2 }}
                >
                  {error}
                  {isRateLimited && (
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      ⏱️ You can try again in {rateLimitCountdown} seconds
                    </Typography>
                  )}
                </Alert>
              )}
              
              <TextField
                fullWidth
                name="fullName"
                label="Full Name"
                value={formData.fullName}
                //@ts-ignore
                onChange={handleChange}
                required
                size="small"
                sx={{ mb: 2 }}
                variant="outlined"
              />
              
              <TextField
                fullWidth
                name="username"
                label="Username"
                value={formData.username}
                //@ts-ignore
                onChange={handleChange}
                required
                size="small"
                sx={{ mb: 2 }}
                variant="outlined"
              />
              
              <TextField
                fullWidth
                type="email"
                name="email"
                label="Email Address"
                value={formData.email}
                //@ts-ignore
                onChange={handleChange}
                required
                size="small"
                sx={{ mb: 2 }}
                variant="outlined"
              />
              
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel id="role-label">Role</InputLabel>
                <Select
                  labelId="role-label"
                  name="role"
                  value={formData.role}
                  label="Role"
                  //@ts-ignore
                  onChange={handleChange}
                >
                  <MenuItem value="PARTICIPANT">Participant</MenuItem>
                  <MenuItem value="ORGANIZER">Organizer</MenuItem>
                  <MenuItem value="MENTOR">Mentor</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                type="password"
                name="password"
                label="Password"
                value={formData.password}
                //@ts-ignore
                onChange={handleChange}
                required
                size="small"
                sx={{ mb: 2 }}
                variant="outlined"
              />
              
              <TextField
                fullWidth
                type="password"
                name="confirmPassword"
                label="Confirm Password"
                value={formData.confirmPassword}
                //@ts-ignore
                onChange={handleChange}
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
                disabled={loading || isRateLimited}
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
                {loading 
                  ? 'Creating account...' 
                  : isRateLimited 
                    ? `Wait ${rateLimitCountdown}s to try again`
                    : 'Create Account'
                }
              </Button>

              {/* Divider */}
              <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
                <Divider sx={{ flex: 1 }} />
                <Typography variant="caption" color="text.secondary" sx={{ px: 2 }}>
                  or
                </Typography>
                <Divider sx={{ flex: 1 }} />
              </Box>

              {/* Google Sign In */}
              <Button
                fullWidth
                variant="outlined"
                size="medium"
                disabled={loading || isRateLimited}
                startIcon={
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                }
                onClick={handleGoogleSignIn}
                sx={{
                  py: 1,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  borderRadius: 1,
                  textTransform: 'none',
                  borderColor: theme.palette.divider,
                  color: theme.palette.text.primary,
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                  },
                }}
              >
                Continue with Google
              </Button>
            </Box>

            {/* Links */}
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Already have an account?{' '}
                <Link 
                  href="/auth/signin" 
                  style={{ 
                    color: theme.palette.primary.main, 
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                >
                  Sign in
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}