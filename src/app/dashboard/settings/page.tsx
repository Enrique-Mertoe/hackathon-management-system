'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  IconButton,
  CircularProgress,
  Divider
} from '@mui/material'
import {
  Person,
  Settings,
  Palette,
  Notifications,
  Lock,
  Warning,
  Close,
  Add
} from '@mui/icons-material'
import { auth } from '@/lib/auth'
import type { AuthUser } from '@/lib/auth'

interface SettingsTab {
  id: string
  name: string
  icon: React.ReactNode
}

const tabs: SettingsTab[] = [
  { id: 'profile', name: 'Profile', icon: <Person /> },
  { id: 'account', name: 'Account', icon: <Settings /> },
  { id: 'preferences', name: 'Preferences', icon: <Palette /> },
  { id: 'notifications', name: 'Notifications', icon: <Notifications /> },
  { id: 'privacy', name: 'Privacy', icon: <Lock /> },
  { id: 'danger', name: 'Danger Zone', icon: <Warning /> },
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

  // Danger zone states
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

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
          //@ts-ignore
          skills: Array.isArray(currentUser.skills) ? currentUser.skills : []
        })

        setAccountData({
          email: currentUser.email || '',
          //@ts-ignore
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

  const handleDeleteAccount = async () => {
    if (!user || deleteConfirmation !== 'DELETE') return
    
    setIsDeleting(true)
    setError('')
    
    try {
      const { error } = await auth.deleteAccount(user.id)
      
      if (error) {
        setError(error.message || 'Failed to delete account')
      } else {
        // Account deleted successfully, sign out and redirect
        await auth.signOut()
        router.push('/')
      }
    } catch (err) {
      setError('Failed to delete account')
    } finally {
      setIsDeleting(false)
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={profileData.full_name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Username"
                  value={profileData.username}
                  onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="Bio"
              multiline
              rows={3}
              value={profileData.bio}
              onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Tell us about yourself..."
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Location"
                  value={profileData.location}
                  onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., San Francisco, CA"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Timezone"
                  value={profileData.timezone}
                  onChange={(e) => setProfileData(prev => ({ ...prev, timezone: e.target.value }))}
                  placeholder="e.g., PST, UTC"
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="GitHub Username"
                  value={profileData.github_username}
                  onChange={(e) => setProfileData(prev => ({ ...prev, github_username: e.target.value }))}
                  placeholder="your-github-username"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="LinkedIn URL"
                  value={profileData.linkedin_url}
                  onChange={(e) => setProfileData(prev => ({ ...prev, linkedin_url: e.target.value }))}
                  placeholder="https://linkedin.com/in/..."
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="Website URL"
              value={profileData.website_url}
              onChange={(e) => setProfileData(prev => ({ ...prev, website_url: e.target.value }))}
              placeholder="https://yoursite.com"
            />

            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium' }}>Skills</Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  size="small"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill..."
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  sx={{ flexGrow: 1 }}
                />
                <Button variant="contained" onClick={addSkill} startIcon={<Add />}>
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {profileData.skills.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    onDelete={() => removeSkill(skill)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          </Box>
        )

      case 'account':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={accountData.email}
                  onChange={(e) => setAccountData(prev => ({ ...prev, email: e.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Role"
                  value={accountData.role.charAt(0) + accountData.role.slice(1).toLowerCase()}
                  disabled
                  InputProps={{ readOnly: true }}
                />
              </Grid>
            </Grid>

            <Alert severity={accountData.email_verified ? 'success' : 'warning'}>
              Email {accountData.email_verified ? 'verified' : 'not verified'}
            </Alert>

            <Divider />
            
            <Typography variant="h6" sx={{ mb: 2 }}>Change Password</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Current Password"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
              />
              <TextField
                fullWidth
                label="New Password"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
              />
              <TextField
                fullWidth
                label="Confirm New Password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              />
              <Button 
                variant="outlined"
                onClick={handlePasswordUpdate}
                disabled={saving}
                sx={{ alignSelf: 'flex-start' }}
              >
                {saving ? 'Updating...' : 'Update Password'}
              </Button>
            </Box>
          </Box>
        )

      case 'preferences':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Theme</InputLabel>
                  <Select
                    value={preferences.theme}
                    label="Theme"
                    onChange={(e) => setPreferences(prev => ({ ...prev, theme: e.target.value }))}
                  >
                    <MenuItem value="light">Light</MenuItem>
                    <MenuItem value="dark">Dark</MenuItem>
                    <MenuItem value="system">System</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={preferences.language}
                    label="Language"
                    onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="es">Spanish</MenuItem>
                    <MenuItem value="fr">French</MenuItem>
                    <MenuItem value="de">German</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Preferred Difficulty</InputLabel>
                  <Select
                    value={preferences.difficulty_preference}
                    label="Preferred Difficulty"
                    onChange={(e) => setPreferences(prev => ({ ...prev, difficulty_preference: e.target.value }))}
                  >
                    <MenuItem value="BEGINNER">Beginner</MenuItem>
                    <MenuItem value="INTERMEDIATE">Intermediate</MenuItem>
                    <MenuItem value="ADVANCED">Advanced</MenuItem>
                    <MenuItem value="EXPERT">Expert</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Preferred Team Size"
                  type="number"
                  InputProps={{ inputProps: { min: 1, max: 10 } }}
                  value={preferences.team_size_preference}
                  onChange={(e) => setPreferences(prev => ({ ...prev, team_size_preference: parseInt(e.target.value) || 3 }))}
                />
              </Grid>
            </Grid>

            <FormControl fullWidth>
              <InputLabel>Notification Frequency</InputLabel>
              <Select
                value={preferences.notification_frequency}
                label="Notification Frequency"
                onChange={(e) => setPreferences(prev => ({ ...prev, notification_frequency: e.target.value }))}
              >
                <MenuItem value="instant">Instant</MenuItem>
                <MenuItem value="daily">Daily Digest</MenuItem>
                <MenuItem value="weekly">Weekly Summary</MenuItem>
                <MenuItem value="never">Never</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )

      case 'notifications':
        return (
          <List>
            {Object.entries(notifications).map(([key, value]) => (
              <ListItem key={key} divider>
                <ListItemText
                  primary={key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  secondary={getNotificationDescription(key)}
                />
                <ListItemSecondaryAction>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={value}
                        onChange={(e) => setNotifications(prev => ({ ...prev, [key]: e.target.checked }))}
                        color="primary"
                      />
                    }
                    label=""
                  />
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )

      case 'privacy':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Profile Visibility</InputLabel>
              <Select
                value={privacy.profile_visibility}
                label="Profile Visibility"
                onChange={(e) => setPrivacy(prev => ({ ...prev, profile_visibility: e.target.value }))}
              >
                <MenuItem value="public">Public</MenuItem>
                <MenuItem value="members">Members Only</MenuItem>
                <MenuItem value="private">Private</MenuItem>
              </Select>
            </FormControl>

            <List>
              {Object.entries(privacy).filter(([key]) => key !== 'profile_visibility').map(([key, value]) => (
                <ListItem key={key} divider>
                  <ListItemText
                    primary={key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    secondary={getPrivacyDescription(key)}
                  />
                  <ListItemSecondaryAction>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={value as boolean}
                          onChange={(e) => setPrivacy(prev => ({ ...prev, [key]: e.target.checked }))}
                          color="primary"
                        />
                      }
                      label=""
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>
        )

      case 'danger':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Alert severity="error" icon={<Warning />}>
              <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                Danger Zone
              </Typography>
              <Typography variant="body2">
                These actions are irreversible. Please proceed with caution.
              </Typography>
            </Alert>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Paper sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                <Typography variant="h6" sx={{ mb: 1 }}>Export Account Data</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Download a copy of all your account data including profile, hackathons, and activity.
                </Typography>
                <Button variant="outlined" size="small">
                  Export Data
                </Button>
              </Paper>

              <Paper sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                <Typography variant="h6" sx={{ mb: 1 }}>Deactivate Account</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Temporarily disable your account. You can reactivate it by signing in again.
                </Typography>
                <Button variant="outlined" size="small">
                  Deactivate Account
                </Button>
              </Paper>

              <Paper sx={{ p: 2, border: '1px solid #f44336', borderColor: 'error.main' }}>
                <Typography variant="h6" color="error" sx={{ mb: 1 }}>Delete Account</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Permanently delete your account and all associated data. This action cannot be undone.
                </Typography>
                <Button 
                  variant="contained" 
                  color="error"
                  size="small"
                  onClick={() => setShowDeleteModal(true)}
                >
                  Delete Account
                </Button>
              </Paper>
            </Box>

            {/* Delete Confirmation Modal */}
            <Dialog
              open={showDeleteModal}
              onClose={() => {
                setShowDeleteModal(false)
                setDeleteConfirmation('')
              }}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle color="error">Delete Account</DialogTitle>
              <DialogContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  This will permanently delete your account and all associated data including:
                </Typography>
                <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                  <Typography component="li" variant="body2" color="text.secondary">
                    Your profile and personal information
                  </Typography>
                  <Typography component="li" variant="body2" color="text.secondary">
                    Hackathon registrations and submissions
                  </Typography>
                  <Typography component="li" variant="body2" color="text.secondary">
                    Team memberships and created teams
                  </Typography>
                  <Typography component="li" variant="body2" color="text.secondary">
                    Messages and communication history
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 2 }}>
                  To confirm deletion, type "DELETE" in the field below:
                </Typography>
                <TextField
                  fullWidth
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="Type DELETE to confirm"
                  size="small"
                />
              </DialogContent>
              <DialogActions>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setShowDeleteModal(false)
                    setDeleteConfirmation('')
                  }}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmation !== 'DELETE' || isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Account'}
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!user) {
    return null
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default',borderRadius:2 }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
            Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your account preferences and profile information
          </Typography>
        </Box>

        {/* Settings Navigation */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            {tabs.map((tab) => (
              <Tab
                key={tab.id}
                value={tab.id}
                //@ts-ignore
                icon={tab.icon}
                label={tab.name}
                iconPosition="start"
                sx={{ 
                  textTransform: 'none',
                  fontWeight: 'medium',
                  minHeight: 56
                }}
              />
            ))}
          </Tabs>
        </Paper>

        {/* Settings Content */}
        <Paper sx={{ p: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
              {tabs.find(tab => tab.id === activeTab)?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {activeTab === 'profile' && 'Update your profile information and skills'}
              {activeTab === 'account' && 'Manage your account settings and security'}
              {activeTab === 'preferences' && 'Customize your platform experience'}
              {activeTab === 'notifications' && 'Control how you receive notifications'}
              {activeTab === 'privacy' && 'Manage your privacy and visibility settings'}
              {activeTab === 'danger' && 'Dangerous actions that permanently affect your account'}
            </Typography>
          </Box>

          {message && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {message}
            </Alert>
          )}
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {renderTabContent()}

          {activeTab !== 'danger' && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
              <Button 
                variant="contained"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  )
}