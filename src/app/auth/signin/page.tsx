'use client'

import React, { useState } from 'react'
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
  Divider
} from '@mui/material'
import { LockOutlined as LockIcon, Google as GoogleIcon } from '@mui/icons-material'
import { auth } from '@/lib/auth'
import Image from 'next/image'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const theme = useTheme()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await auth.signIn(email, password)
      
      if (error) {
        setError(error.message)
      } else {
        window.location.href = '/dashboard' ;
      }
    } catch (err) {
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
                Welcome back
              </Typography>
              <Typography variant="body1" color="text.secondary" textAlign="center">
                Sign in to your HackHub account
              </Typography>
            </Box>

            {/* Form */}
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              
              <TextField
                fullWidth
                type="email"
                label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                size="small"
                sx={{ mb: 2 }}
                variant="outlined"
              />
              
              <TextField
                fullWidth
                type="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                  mb: 2,
                }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
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
                disabled={loading}
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
            <Box sx={{ mt: 3, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link 
                href="/auth/reset-password" 
                style={{ 
                  color: theme.palette.primary.main, 
                  textDecoration: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                }}
              >
                Forgot your password?
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