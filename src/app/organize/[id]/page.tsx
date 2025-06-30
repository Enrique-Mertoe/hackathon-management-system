'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { auth } from '@/lib/auth'
import type { AuthUser } from '@/lib/auth'

interface Hackathon {
  id: string
  title: string
  description: string
  theme: string
  difficulty_level: string
  status: string
  registration_start: string
  registration_end: string
  start_date: string
  end_date: string
  timezone: string
  location: string
  is_virtual: boolean
  max_participants: number
  min_team_size: number
  max_team_size: number
  prize_pool: number
  rules: string
  requirements: any
  judging_criteria: any
  registration_count: number
  created_at: string
  updated_at: string
}

export default function OrganizeHackathonPage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [hackathon, setHackathon] = useState<Hackathon | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const getUser = async () => {
      try {
        const currentUser = await auth.getCurrentUser()
        if (!currentUser) {
          router.push('/auth/signin')
          return
        }
        if (currentUser.role !== 'ORGANIZER' && currentUser.role !== 'ADMIN') {
          router.push('/dashboard')
          return
        }
        setUser(currentUser)
      } catch (error) {
        console.error('Error fetching user:', error)
        router.push('/auth/signin')
      }
    }

    getUser()
  }, [router])

  useEffect(() => {
    const fetchHackathon = async () => {
      if (!params.id || !user) return

      try {
        const response = await fetch(`/api/hackathons/${params.id}`)
        if (!response.ok) {
          if (response.status === 404) {
            setError('Hackathon not found')
          } else {
            setError('Failed to load hackathon')
          }
          return
        }
        
        const data = await response.json()
        setHackathon(data)
      } catch (error) {
        console.error('Error fetching hackathon:', error)
        setError('Failed to load hackathon')
      } finally {
        setLoading(false)
      }
    }

    fetchHackathon()
  }, [params.id, user])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800'
      case 'PUBLISHED': return 'bg-blue-100 text-blue-800'
      case 'REGISTRATION_OPEN': return 'bg-green-100 text-green-800'
      case 'REGISTRATION_CLOSED': return 'bg-yellow-100 text-yellow-800'
      case 'ACTIVE': return 'bg-purple-100 text-purple-800'
      case 'JUDGING': return 'bg-orange-100 text-orange-800'
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-destructive mb-2">Error</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => router.push('/organize')}>
              Back to Organize
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!hackathon) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button
              variant="ghost"
              onClick={() => router.push('/organize')}
              className="mb-4"
            >
              ← Back to Organize
            </Button>
            <h1 className="text-3xl font-bold text-foreground">{hackathon.title}</h1>
            <div className="flex items-center gap-4 mt-2">
              <Badge className={getStatusColor(hackathon.status)}>
                {hackathon.status.replace('_', ' ')}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {hackathon.registration_count} registered
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              View Public Page
            </Button>
            <Button>
              Edit Hackathon
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground">{hackathon.description}</p>
                  </div>
                  
                  {hackathon.theme && (
                    <div>
                      <h3 className="font-semibold mb-2">Theme</h3>
                      <p className="text-muted-foreground">{hackathon.theme}</p>
                    </div>
                  )}

                  {hackathon.rules && (
                    <div>
                      <h3 className="font-semibold mb-2">Rules</h3>
                      <p className="text-muted-foreground whitespace-pre-wrap">{hackathon.rules}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            {hackathon.requirements && (
              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {hackathon.requirements.skills && hackathon.requirements.skills.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Required Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {hackathon.requirements.skills.map((skill: string, index: number) => (
                            <Badge key={index} variant="secondary">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {hackathon.requirements.tools && hackathon.requirements.tools.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Required Tools</h3>
                        <div className="flex flex-wrap gap-2">
                          {hackathon.requirements.tools.map((tool: string, index: number) => (
                            <Badge key={index} variant="outline">{tool}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {hackathon.requirements.experience_level && (
                      <div>
                        <h3 className="font-semibold mb-2">Experience Level</h3>
                        <p className="text-muted-foreground">{hackathon.requirements.experience_level}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Judging Criteria */}
            {hackathon.judging_criteria && (
              <Card>
                <CardHeader>
                  <CardTitle>Judging Criteria</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(hackathon.judging_criteria).map(([criterion, weight]) => (
                      <div key={criterion} className="flex justify-between items-center">
                        <span className="font-medium capitalize">
                          {criterion.replace('_', ' ')}
                        </span>
                        <span className="text-muted-foreground">{
                          weight as any
                        }%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Details */}
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">Difficulty</h3>
                  <p className="capitalize">{hackathon.difficulty_level.toLowerCase()}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">Location</h3>
                  <p>{hackathon.is_virtual ? 'Virtual Event' : hackathon.location}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">Team Size</h3>
                  <p>{hackathon.min_team_size} - {hackathon.max_team_size} members</p>
                </div>

                {hackathon.max_participants && (
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground mb-1">Max Participants</h3>
                    <p>{hackathon.max_participants.toLocaleString()}</p>
                  </div>
                )}

                {hackathon.prize_pool && (
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground mb-1">Prize Pool</h3>
                    <p className="text-lg font-semibold text-primary">
                      {formatCurrency(hackathon.prize_pool)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">Registration Opens</h3>
                  <p className="text-sm">{formatDate(hackathon.registration_start)}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">Registration Closes</h3>
                  <p className="text-sm">{formatDate(hackathon.registration_end)}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">Event Starts</h3>
                  <p className="text-sm">{formatDate(hackathon.start_date)}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">Event Ends</h3>
                  <p className="text-sm">{formatDate(hackathon.end_date)}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">Timezone</h3>
                  <p className="text-sm">{hackathon.timezone}</p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline">
                  View Registrations
                </Button>
                <Button className="w-full" variant="outline">
                  Manage Teams
                </Button>
                <Button className="w-full" variant="outline">
                  Send Update
                </Button>
                <Button className="w-full" variant="outline">
                  Download Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}