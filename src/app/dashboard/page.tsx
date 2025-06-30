'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { auth } from '@/lib/auth'
import type { AuthUser } from '@/lib/auth'

export default function DashboardPage() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      try {
        const currentUser = await auth.getCurrentUser()
        if (!currentUser) {
          router.push('/auth/signin')
          return
        }
        setUser(currentUser)
      } catch (error) {
        console.error('Error fetching user:', error)
        router.push('/auth/signin')
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const getRoleActions = () => {
    switch (user.role) {
      case 'ORGANIZER':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Create Hackathon</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Organize a new hackathon and manage participants
                </p>
                <Button className="w-full">Create New</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>My Hackathons</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  View and manage your organized hackathons
                </p>
                <Button variant="secondary" className="w-full">View All</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Track participation and engagement metrics
                </p>
                <Button variant="ghost" className="w-full">View Analytics</Button>
              </CardContent>
            </Card>
          </div>
        )
      
      case 'PARTICIPANT':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Discover Hackathons</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Find hackathons that match your interests and skills
                </p>
                <Button className="w-full">Explore</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>My Registrations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  View hackathons you've registered for
                </p>
                <Button variant="secondary" className="w-full">View All</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Find Teams</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Connect with other participants and form teams
                </p>
                <Button variant="ghost" className="w-full">Browse Teams</Button>
              </CardContent>
            </Card>
          </div>
        )
        
      case 'MENTOR':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Available Hackathons</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  View hackathons where you can mentor participants
                </p>
                <Button className="w-full">Browse</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>My Mentoring</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Manage teams and participants you're mentoring
                </p>
                <Button variant="secondary" className="w-full">View All</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Access mentoring resources and guidelines
                </p>
                <Button variant="ghost" className="w-full">View Resources</Button>
              </CardContent>
            </Card>
          </div>
        )
        
      case 'ADMIN':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  View comprehensive platform statistics
                </p>
                <Button className="w-full">View Analytics</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Manage users and organization verification
                </p>
                <Button variant="secondary" className="w-full">Manage Users</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Moderation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Review and moderate platform content
                </p>
                <Button variant="ghost" className="w-full">Moderate</Button>
              </CardContent>
            </Card>
          </div>
        )
        
      default:
        return (
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">Welcome to HackHub! Your dashboard will be customized based on your role.</p>
            </CardContent>
          </Card>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {user.full_name}!
          </h1>
          <p className="text-muted-foreground">
            {user.role.charAt(0) + user.role.slice(1).toLowerCase()} Dashboard
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Profile Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {user.email_verified ? 'Verified' : 'Pending'}
              </div>
              <p className="text-muted-foreground text-sm">
                Email verification status
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Role</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
              </div>
              <p className="text-muted-foreground text-sm">
                Your current role
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Member Since</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {new Date(user.created_at).toLocaleDateString()}
              </div>
              <p className="text-muted-foreground text-sm">
                Account creation date
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {Array.isArray(user.skills) ? user.skills.length : 0}
              </div>
              <p className="text-muted-foreground text-sm">
                Skills listed
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Quick Actions</h2>
          {getRoleActions()}
        </div>
      </div>
    </div>
  )
}