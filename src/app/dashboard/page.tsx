'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/auth'
import type { AuthUser } from '@/lib/auth'

// Import role-specific dashboard components
import ParticipantDashboard from './participant'
import OrganizerDashboard from './organizer'
import MentorDashboard from './mentor'
import AdminDashboard from './admin'
import JudgeDashboard from './judge'

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

  const renderRoleDashboard = () => {
    switch (user.role) {
      case 'PARTICIPANT':
        return <ParticipantDashboard user={user} />
      case 'ORGANIZER':
        return <OrganizerDashboard user={user} />
      case 'MENTOR':
        return <MentorDashboard user={user} />
      case 'ADMIN':
        return <AdminDashboard user={user} />
      case 'JUDGE':
        return <JudgeDashboard user={user} />
      default:
        return <ParticipantDashboard user={user} />
    }
  }

  return (
    <div className="min-h-screen rounded-tl-2xl bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderRoleDashboard()}
      </div>
    </div>
  )
}