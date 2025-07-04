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
import { PersonAdd as PersonAddIcon, Google as GoogleIcon } from '@mui/icons-material'
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
                startIcon={<GoogleIcon />}
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