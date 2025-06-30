'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { auth } from '@/lib/auth'
import type { AuthUser } from '@/lib/auth'

export default function CreateHackathonPage() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    theme: '',
    difficulty_level: 'INTERMEDIATE',
    registration_start: '',
    registration_end: '',
    start_date: '',
    end_date: '',
    timezone: 'UTC',
    location: '',
    is_virtual: true,
    max_participants: '',
    min_team_size: '1',
    max_team_size: '5',
    prize_pool: '',
    rules: '',
    requirements: {
      skills: [],
      tools: [],
      experience_level: 'Any'
    },
    judging_criteria: {
      innovation: 25,
      technical_implementation: 25,
      design: 25,
      presentation: 25
    }
  })

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await auth.getCurrentUser()
        if (!currentUser || !auth.hasRole(currentUser, 'ORGANIZER')) {
          router.push('/auth/signin')
          return
        }
        setUser(currentUser)
      } catch (error) {
        console.error('Error checking auth:', error)
        router.push('/auth/signin')
      } finally {
        setPageLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const hackathonData = {
        ...formData,
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
        min_team_size: parseInt(formData.min_team_size),
        max_team_size: parseInt(formData.max_team_size),
        prize_pool: formData.prize_pool ? parseFloat(formData.prize_pool) : null,
        requirements: formData.requirements,
        judging_criteria: formData.judging_criteria
      }

      const response = await fetch('/api/hackathons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(hackathonData)
      })

      const data = await response.json()

      if (response.ok) {
        router.push(`/organize/${data.hackathon.id}`)
      } else {
        setError(data.error || 'Failed to create hackathon')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (pageLoading) {
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Create New Hackathon
          </h1>
          <p className="text-muted-foreground">
            Set up your hackathon event and start attracting participants
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded text-destructive">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Essential details about your hackathon
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Hackathon Title *"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., AI Innovation Challenge 2024"
                required
              />

              <div>
                <label className="text-sm font-medium mb-2 block">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your hackathon, its goals, and what participants can expect..."
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Theme"
                  name="theme"
                  value={formData.theme}
                  onChange={handleChange}
                  placeholder="e.g., Artificial Intelligence, Sustainability"
                />

                <div>
                  <label className="text-sm font-medium mb-2 block">Difficulty Level</label>
                  <select
                    name="difficulty_level"
                    value={formData.difficulty_level}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                    <option value="EXPERT">Expert</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
              <CardDescription>
                Set up registration and event dates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Registration Start *"
                  name="registration_start"
                  type="datetime-local"
                  value={formData.registration_start}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Registration End *"
                  name="registration_end"
                  type="datetime-local"
                  value={formData.registration_end}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Event Start Date *"
                  name="start_date"
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Event End Date *"
                  name="end_date"
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Timezone"
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleChange}
                  placeholder="e.g., UTC, EST, PST"
                />

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_virtual"
                    name="is_virtual"
                    checked={formData.is_virtual}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="is_virtual" className="text-sm font-medium">
                    Virtual Event
                  </label>
                </div>
              </div>

              {!formData.is_virtual && (
                <Input
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., San Francisco, CA or University Campus"
                />
              )}
            </CardContent>
          </Card>

          {/* Participants & Teams */}
          <Card>
            <CardHeader>
              <CardTitle>Participants & Teams</CardTitle>
              <CardDescription>
                Configure participation limits and team structure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Max Participants"
                  name="max_participants"
                  type="number"
                  value={formData.max_participants}
                  onChange={handleChange}
                  placeholder="Leave empty for unlimited"
                />

                <Input
                  label="Min Team Size"
                  name="min_team_size"
                  type="number"
                  value={formData.min_team_size}
                  onChange={handleChange}
                  min="1"
                  required
                />

                <Input
                  label="Max Team Size"
                  name="max_team_size"
                  type="number"
                  value={formData.max_team_size}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Prize & Rules */}
          <Card>
            <CardHeader>
              <CardTitle>Prize & Rules</CardTitle>
              <CardDescription>
                Set prize information and event rules
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Total Prize Pool ($)"
                name="prize_pool"
                type="number"
                value={formData.prize_pool}
                onChange={handleChange}
                placeholder="e.g., 10000"
                step="0.01"
              />

              <div>
                <label className="text-sm font-medium mb-2 block">Rules & Guidelines</label>
                <textarea
                  name="rules"
                  value={formData.rules}
                  onChange={handleChange}
                  placeholder="Outline the rules, eligibility criteria, and guidelines for participants..."
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Creating...' : 'Create Hackathon'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}