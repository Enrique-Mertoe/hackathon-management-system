'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { auth } from '@/lib/auth'
import type { AuthUser } from '@/lib/auth'

interface SettingsTab {
  id: string
  name: string
  icon: string
}

const tabs: SettingsTab[] = [
  { id: 'profile', name: 'Profile', icon: '👤' },
  { id: 'account', name: 'Account', icon: '⚙️' },
  { id: 'preferences', name: 'Preferences', icon: '🎨' },
  { id: 'notifications', name: 'Notifications', icon: '🔔' },
  { id: 'privacy', name: 'Privacy', icon: '🔒' },
]

export default function SettingsPage() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  // Form states
  const [profileData, setProfileData] = useState({
    full_name: '',
    username: '',
    bio: '',
    avatar_url: '',
    github_username: '',
    linkedin_url: '',
    website_url: '',
    location: '',
    timezone: '',
    skills: [] as string[]
  })

  const [accountData, setAccountData] = useState({
    email: '',
    role: 'PARTICIPANT' as const,
    email_verified: false
  })

  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'en',
    hackathon_types: [] as string[],
    difficulty_preference: 'INTERMEDIATE',
    team_size_preference: 3,
    notification_frequency: 'daily'
  })

  const [notifications, setNotifications] = useState({
    email_notifications: true,
    push_notifications: true,
    hackathon_reminders: true,
    team_updates: true,
    marketing_emails: false,
    weekly_digest: true
  })

  const [privacy, setPrivacy] = useState({
    profile_visibility: 'public',
    show_email: false,
    show_location: true,
    allow_team_invites: true,
    allow_mentor_requests: true
  })

  const [newSkill, setNewSkill] = useState('')
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const currentUser = await auth.getCurrentUser()
        if (!currentUser) {
          router.push('/auth/signin')
          return
        }
        
        setUser(currentUser)
        
        // Populate form data
        setProfileData({
          full_name: currentUser.full_name || '',
          username: currentUser.username || '',
          bio: currentUser.bio || '',
          avatar_url: currentUser.avatar_url || '',
          github_username: currentUser.github_username || '',
          linkedin_url: currentUser.linkedin_url || '',
          website_url: currentUser.website_url || '',
          location: currentUser.location || '',
          timezone: currentUser.timezone || '',
          skills: Array.isArray(currentUser.skills) ? currentUser.skills : []
        })

        setAccountData({
          email: currentUser.email || '',
          role: currentUser.role || 'PARTICIPANT',
          email_verified: currentUser.email_verified || false
        })

        // Load preferences from user.preferences if exists
        if (currentUser.preferences && typeof currentUser.preferences === 'object') {
          const prefs = currentUser.preferences as any
          setPreferences(prev => ({
            ...prev,
            ...prefs
          }))
        }

      } catch (error) {
        console.error('Error loading user data:', error)
        router.push('/auth/signin')
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [router])

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    setError('')

    try {
      if (!user) return

      let updatedData: any = {}

      switch (activeTab) {
        case 'profile':
          updatedData = { ...profileData }
          break
        case 'account':
          updatedData = { email: accountData.email }
          break
        case 'preferences':
          updatedData = { 
            preferences: {
              ...preferences,
              hackathon_types: preferences.hackathon_types,
              team_size_preference: preferences.team_size_preference
            }
          }
          break
        case 'notifications':
        case 'privacy':
          updatedData = { 
            preferences: {
              ...((user.preferences as any) || {}),
              [activeTab]: activeTab === 'notifications' ? notifications : privacy
            }
          }
          break
      }

      const { error } = await auth.updateProfile(user.id, updatedData)

      if (error) {
        setError(error.message || 'Failed to update settings')
      } else {
        setMessage('Settings updated successfully!')
        // Refresh user data
        const updatedUser = await auth.getCurrentUser()
        if (updatedUser) setUser(updatedUser)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setSaving(true)
    setError('')
    setMessage('')

    try {
      const { error } = await auth.updatePassword(passwordData.newPassword)
      
      if (error) {
        setError(error.message || 'Failed to update password')
      } else {
        setMessage('Password updated successfully!')
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      }
    } catch (err) {
      setError('Failed to update password')
    } finally {
      setSaving(false)
    }
  }

  const addSkill = () => {
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }))
      setNewSkill('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }))
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={profileData.full_name}
                onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
              />
              <Input
                label="Username"
                value={profileData.username}
                onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
              />
            </div>

            <Textarea
              label="Bio"
              value={profileData.bio}
              onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Tell us about yourself..."
              rows={3}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Location"
                value={profileData.location}
                onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., San Francisco, CA"
              />
              <Input
                label="Timezone"
                value={profileData.timezone}
                onChange={(e) => setProfileData(prev => ({ ...prev, timezone: e.target.value }))}
                placeholder="e.g., PST, UTC"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="GitHub Username"
                value={profileData.github_username}
                onChange={(e) => setProfileData(prev => ({ ...prev, github_username: e.target.value }))}
                placeholder="your-github-username"
              />
              <Input
                label="LinkedIn URL"
                value={profileData.linkedin_url}
                onChange={(e) => setProfileData(prev => ({ ...prev, linkedin_url: e.target.value }))}
                placeholder="https://linkedin.com/in/..."
              />
            </div>

            <Input
              label="Website URL"
              value={profileData.website_url}
              onChange={(e) => setProfileData(prev => ({ ...prev, website_url: e.target.value }))}
              placeholder="https://yoursite.com"
            />

            <div>
              <label className="text-sm font-medium mb-2 block">Skills</label>
              <div className="flex gap-2 mb-3">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill..."
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                />
                <Button onClick={addSkill} type="button">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profileData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-primary/10 text-primary px-2 py-1 rounded text-sm flex items-center gap-1"
                  >
                    {skill}
                    <button
                      onClick={() => removeSkill(skill)}
                      className="text-primary hover:text-destructive"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )

      case 'account':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                value={accountData.email}
                onChange={(e) => setAccountData(prev => ({ ...prev, email: e.target.value }))}
              />
              <div>
                <label className="text-sm font-medium mb-2 block">Role</label>
                <div className="flex h-10 w-full rounded-md border border-border bg-muted px-3 py-2 text-sm">
                  {accountData.role.charAt(0) + accountData.role.slice(1).toLowerCase()}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-muted rounded">
              <span className={accountData.email_verified ? 'text-success' : 'text-warning'}>
                {accountData.email_verified ? '✅' : '⚠️'}
              </span>
              <span className="text-sm">
                Email {accountData.email_verified ? 'verified' : 'not verified'}
              </span>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Change Password</h3>
              <div className="space-y-4">
                <Input
                  label="Current Password"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                />
                <Input
                  label="New Password"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                />
                <Button 
                  onClick={handlePasswordUpdate}
                  disabled={saving}
                  variant="secondary"
                >
                  {saving ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </div>
          </div>
        )

      case 'preferences':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Theme"
                value={preferences.theme}
                onChange={(e) => setPreferences(prev => ({ ...prev, theme: e.target.value }))}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </Select>
              
              <Select
                label="Language"
                value={preferences.language}
                onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Preferred Difficulty"
                value={preferences.difficulty_preference}
                onChange={(e) => setPreferences(prev => ({ ...prev, difficulty_preference: e.target.value }))}
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
                <option value="EXPERT">Expert</option>
              </Select>

              <Input
                label="Preferred Team Size"
                type="number"
                min="1"
                max="10"
                value={preferences.team_size_preference}
                onChange={(e) => setPreferences(prev => ({ ...prev, team_size_preference: parseInt(e.target.value) || 3 }))}
              />
            </div>

            <Select
              label="Notification Frequency"
              value={preferences.notification_frequency}
              onChange={(e) => setPreferences(prev => ({ ...prev, notification_frequency: e.target.value }))}
            >
              <option value="instant">Instant</option>
              <option value="daily">Daily Digest</option>
              <option value="weekly">Weekly Summary</option>
              <option value="never">Never</option>
            </Select>
          </div>
        )

      case 'notifications':
        return (
          <div className="space-y-4">
            {Object.entries(notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <div className="font-medium">
                    {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {getNotificationDescription(key)}
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setNotifications(prev => ({ ...prev, [key]: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            ))}
          </div>
        )

      case 'privacy':
        return (
          <div className="space-y-6">
            <Select
              label="Profile Visibility"
              value={privacy.profile_visibility}
              onChange={(e) => setPrivacy(prev => ({ ...prev, profile_visibility: e.target.value }))}
            >
              <option value="public">Public</option>
              <option value="members">Members Only</option>
              <option value="private">Private</option>
            </Select>

            <div className="space-y-4">
              {Object.entries(privacy).filter(([key]) => key !== 'profile_visibility').map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">
                      {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {getPrivacyDescription(key)}
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setPrivacy(prev => ({ ...prev, [key]: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const getNotificationDescription = (key: string) => {
    const descriptions: Record<string, string> = {
      email_notifications: 'Receive notifications via email',
      push_notifications: 'Receive push notifications in browser',
      hackathon_reminders: 'Get reminders about upcoming hackathons',
      team_updates: 'Notifications about your team activities',
      marketing_emails: 'Receive promotional emails and updates',
      weekly_digest: 'Weekly summary of platform activity'
    }
    return descriptions[key] || ''
  }

  const getPrivacyDescription = (key: string) => {
    const descriptions: Record<string, string> = {
      show_email: 'Display your email address on your public profile',
      show_location: 'Display your location on your public profile',
      allow_team_invites: 'Allow other users to invite you to teams',
      allow_mentor_requests: 'Allow participants to request mentoring from you'
    }
    return descriptions[key] || ''
  }

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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account preferences and profile information
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <span className="text-lg">{tab.icon}</span>
                      <span className="font-medium">{tab.name}</span>
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>
                  {tabs.find(tab => tab.id === activeTab)?.name}
                </CardTitle>
                <CardDescription>
                  {activeTab === 'profile' && 'Update your profile information and skills'}
                  {activeTab === 'account' && 'Manage your account settings and security'}
                  {activeTab === 'preferences' && 'Customize your platform experience'}
                  {activeTab === 'notifications' && 'Control how you receive notifications'}
                  {activeTab === 'privacy' && 'Manage your privacy and visibility settings'}
                </CardDescription>
              </CardHeader>

              <CardContent>
                {message && (
                  <div className="p-3 bg-success/10 border border-success/20 rounded text-success text-sm mb-6">
                    {message}
                  </div>
                )}
                
                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm mb-6">
                    {error}
                  </div>
                )}

                {renderTabContent()}

                <div className="flex justify-end mt-8 pt-6 border-t">
                  <Button 
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}