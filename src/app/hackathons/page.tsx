'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { usePageCache } from '@/lib/cache'

interface Hackathon {
  id: string
  title: string
  description: string
  theme: string | null
  difficulty_level: string
  status: string
  registration_start: string
  registration_end: string
  start_date: string
  end_date: string
  max_participants: number | null
  prize_pool: number | null
  featured: boolean
  organizations: {
    id: string
    name: string
    logo_url: string | null
    verification_status: string
  } | null
}

export default function HackathonsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('')

  // Create cache parameters
  const cacheParams = {
    search: searchTerm || undefined,
    status: statusFilter || undefined,
    difficulty: difficultyFilter || undefined
  }

  // Use page cache with stale-while-revalidate
  const { 
    data: hackathons = [], 
    loading, 
    error, 
    isStale, 
    mutate 
  } = usePageCache<Hackathon[]>(
    '/hackathons',
    cacheParams,
    async () => {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter) params.append('status', statusFilter)
      if (difficultyFilter) params.append('difficulty', difficultyFilter)

      const response = await fetch(`/api/hackathons?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch hackathons')
      }

      return data.hackathons || []
    },
    {
      ttl: 5 * 60 * 1000, // 5 minutes
      staleTime: 30 * 1000, // 30 seconds
    }
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'REGISTRATION_OPEN':
        return 'bg-green-100 text-green-800'
      case 'REGISTRATION_CLOSED':
        return 'bg-yellow-100 text-yellow-800'
      case 'ACTIVE':
        return 'bg-blue-100 text-blue-800'
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER':
        return 'bg-green-100 text-green-800'
      case 'INTERMEDIATE':
        return 'bg-yellow-100 text-yellow-800'
      case 'ADVANCED':
        return 'bg-orange-100 text-orange-800'
      case 'EXPERT':
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

  if (loading && (!hackathons || hackathons.length === 0)) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Discover Hackathons
              </h1>
              <p className="text-muted-foreground">
                Find the perfect hackathon to showcase your skills and build amazing projects
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isStale && (
                <div className="flex items-center gap-1 text-amber-600 text-sm">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                  <span>Updating...</span>
                </div>
              )}
              {loading && hackathons && hackathons.length > 0 && (
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => mutate()}
                disabled={loading}
              >
                Refresh
              </Button>
            </div>
          </div>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">
                Error loading hackathons: {error.message}
              </p>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search hackathons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">All Statuses</option>
            <option value="REGISTRATION_OPEN">Registration Open</option>
            <option value="REGISTRATION_CLOSED">Registration Closed</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">All Difficulties</option>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
            <option value="EXPERT">Expert</option>
          </select>
        </div>

        {/* Hackathons Grid */}
        {!hackathons || hackathons.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-semibold mb-2">No hackathons found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or check back later for new events.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hackathons.map((hackathon) => (
              <Card key={hackathon.id} className="h-full flex flex-col">
                {hackathon.featured && (
                  <div className="bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-t-lg">
                    ⭐ Featured
                  </div>
                )}
                
                <CardHeader className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-lg line-clamp-2">
                      {hackathon.title}
                    </CardTitle>
                  </div>

                  <div className="flex gap-2 mb-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(hackathon.status)}`}>
                      {hackathon.status.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(hackathon.difficulty_level)}`}>
                      {hackathon.difficulty_level}
                    </span>
                  </div>

                  {hackathon.organizations && (
                    <div className="flex items-center gap-2 mb-3">
                      {hackathon.organizations.logo_url && (
                        <img 
                          src={hackathon.organizations.logo_url} 
                          alt={hackathon.organizations.name}
                          className="w-6 h-6 rounded"
                        />
                      )}
                      <span className="text-sm text-muted-foreground">
                        {hackathon.organizations.name}
                      </span>
                      {hackathon.organizations.verification_status === 'VERIFIED' && (
                        <span className="text-blue-500 text-xs">✓</span>
                      )}
                    </div>
                  )}

                  <CardDescription className="line-clamp-3">
                    {hackathon.description}
                  </CardDescription>

                  {hackathon.theme && (
                    <div className="mt-2">
                      <span className="text-sm font-medium text-primary">
                        Theme: {hackathon.theme}
                      </span>
                    </div>
                  )}
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Registration:</span>
                      <span>{formatDate(hackathon.registration_end)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Event Date:</span>
                      <span>{formatDate(hackathon.start_date)}</span>
                    </div>
                    {hackathon.prize_pool && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Prize Pool:</span>
                        <span className="font-medium text-primary">
                          ${hackathon.prize_pool.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <Link href={`/hackathons/${hackathon.id}`}>
                    <Button className="w-full">
                      View Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}