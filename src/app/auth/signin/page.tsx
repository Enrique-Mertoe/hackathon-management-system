'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { auth } from '@/lib/auth'
import Image from 'next/image'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md animate-fade-in">
        <Card className="shadow-2xl border-0 rounded-2xl p-4 !bg-black/70">
          <CardHeader>
            <div className="flex flex-col items-center mb-2">
              <Image src="/logo.png" alt="HackHub Logo" width={100} height={100} className="mb-4 rounded-full shadow-lg" />
            </div>
            <CardTitle className="text-center text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription className="text-center">
              Sign in to your HackHub account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm font-medium mb-2">
                  {error}
                </div>
              )}
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              <Button
                type="submit"
                className="w-full py-2 text-base rounded-lg shadow-md hover:shadow-lg transition"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
            <div className="mt-6 text-center space-y-2">
              <Link href="/auth/reset-password" className="text-sm text-primary font-medium hover:underline">
                Forgot your password?
              </Link>
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link href="/auth/signup" className="text-primary font-semibold hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}