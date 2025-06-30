'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { auth } from '@/lib/auth'
import type { AuthUser } from '@/lib/auth'

interface Hackathon {
  id: string
  title: string
  description: string
  status: string
  registration_start: string
  registration_end: string
  start_date: string
  end_date: string
  registration_count: number
  max_participants: number | null
  prize_pool: number | null
  created_at: string
}

export default function OrganizePage() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await auth.getCurrentUser()
        if (!currentUser || !auth.hasRole(currentUser, 'ORGANIZER')) {
          router.push('/auth/signin')
          return
        }
        setUser(currentUser)
        await fetchMyHackathons()
      } catch (error) {
        console.error('Error checking auth:', error)
        router.push('/auth/signin')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const fetchMyHackathons = async () => {
    try {
      // For now, we'll fetch all hackathons. In a real app, you'd filter by organization_id
      const response = await fetch('/api/hackathons?limit=50')
      const data = await response.json()

      if (response.ok) {
        setHackathons(data.hackathons || [])
      } else {
        console.error('Error fetching hackathons:', data.error)
      }
    } catch (error) {
      console.error('Error fetching hackathons:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800'
      case 'PUBLISHED':
        return 'bg-blue-100 text-blue-800'
      case 'REGISTRATION_OPEN':
        return 'bg-green-100 text-green-800'
      case 'REGISTRATION_CLOSED':
        return 'bg-yellow-100 text-yellow-800'
      case 'ACTIVE':
        return 'bg-purple-100 text-purple-800'
      case 'JUDGING':
        return 'bg-orange-100 text-orange-800'
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const filteredHackathons = hackathons.filter(hackathon =>
    hackathon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hackathon.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Organize Hackathons
              </h1>
              <p className="text-muted-foreground">
                Create and manage your hackathon events
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Link href="/organize/create">
                <Button size="lg">
                  Create New Hackathon
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {hackathons.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {hackathons.filter(h => ['REGISTRATION_OPEN', 'ACTIVE'].includes(h.status)).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Participants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {hackathons.reduce((sum, h) => sum + h.registration_count, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Prize Pool
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                ${hackathons.reduce((sum, h) => sum + (h.prize_pool || 0), 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <Input
            placeholder="Search your hackathons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Hackathons List */}
        {filteredHackathons.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">No hackathons yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first hackathon to get started with organizing amazing events.
              </p>
              <Link href="/organize/create">
                <Button>Create Your First Hackathon</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredHackathons.map((hackathon) => (
              <Card key={hackathon.id} className="h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">
                        {hackathon.title}
                      </CardTitle>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(hackathon.status)}`}>
                        {hackathon.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {hackathon.description}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Registration:</span>
                        <div className="font-medium">
                          {formatDate(hackathon.registration_start)} - {formatDate(hackathon.registration_end)}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Event Date:</span>
                        <div className="font-medium">
                          {formatDate(hackathon.start_date)} - {formatDate(hackathon.end_date)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Participants:</span>
                        <div className="font-medium text-primary">
                          {hackathon.registration_count}
                          {hackathon.max_participants && ` / ${hackathon.max_participants}`}
                        </div>
                      </div>
                      {hackathon.prize_pool && (
                        <div>
                          <span className="text-muted-foreground">Prize Pool:</span>
                          <div className="font-medium text-primary">
                            ${hackathon.prize_pool.toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Link href={`/organize/${hackathon.id}`} className="flex-1">
                        <Button variant="secondary" className="w-full">
                          Manage
                        </Button>
                      </Link>
                      <Link href={`/hackathons/${hackathon.id}`} className="flex-1">
                        <Button variant="ghost" className="w-full">
                          View Public
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}