'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            {verified ? (
              <span className="text-2xl">✅</span>
            ) : (
              <span className="text-2xl">📧</span>
            )}
          </div>
          <CardTitle>
            {verified ? 'Email Verified!' : 'Check Your Email'}
          </CardTitle>
          <CardDescription>
            {verified 
              ? 'Your email has been successfully verified.'
              : 'We sent a verification link to your email address.'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {message && (
            <div className="p-3 bg-success/10 border border-success/20 rounded text-success text-sm text-center">
              {message}
            </div>
          )}
          
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm text-center">
              {error}
            </div>
          )}

          {!verified && (
            <>
              <div className="text-center text-sm text-muted-foreground">
                <p className="mb-2">
                  Click the verification link in your email to activate your account.
                </p>
                <p>
                  Didn't receive an email? Check your spam folder or request a new one.
                </p>
              </div>
              
              <Button
                onClick={resendVerification}
                disabled={loading}
                variant="secondary"
                className="w-full"
              >
                {loading ? 'Sending...' : 'Resend Verification Email'}
              </Button>
            </>
          )}

          {verified && (
            <Button
              onClick={() => router.push('/dashboard')}
              className="w-full"
            >
              Go to Dashboard
            </Button>
          )}
          
          <div className="text-center">
            <Link href="/auth/signin" className="text-sm text-primary hover:underline">
              Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VerifyEmailForm />
    </Suspense>
  )
}