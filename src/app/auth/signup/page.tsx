'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { auth } from '@/lib/auth'

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-center">Create your account</CardTitle>
          <CardDescription className="text-center">
            Join HackHub to discover amazing hackathons
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className={`p-3 rounded text-sm ${
                isRateLimited 
                  ? 'bg-warning/10 border border-warning/20 text-warning' 
                  : 'bg-destructive/10 border border-destructive/20 text-destructive'
              }`}>
                {error}
                {isRateLimited && (
                  <div className="mt-2 text-xs">
                    ⏱️ You can try again in {rateLimitCountdown} seconds
                  </div>
                )}
              </div>
            )}
            
            <Input
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
            
            <Input
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              required
            />
            
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />

            <Select
              label="Account Type"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="PARTICIPANT">Participant</option>
              <option value="ORGANIZER">Organizer</option>
              <option value="MENTOR">Mentor</option>
            </Select>
            
            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              required
            />
            
            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
            />
            
            <Button
              type="submit"
              className="w-full"
              disabled={loading || isRateLimited}
            >
              {loading 
                ? 'Creating account...' 
                : isRateLimited 
                  ? `Wait ${rateLimitCountdown}s to try again`
                  : 'Create Account'
              }
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/auth/signin" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}