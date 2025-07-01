'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Container,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Alert,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material'
import { AutoAwesome as AIIcon } from '@mui/icons-material'
import { auth } from '@/lib/auth'
import type { AuthUser } from '@/lib/auth'
import { CopilotSidepanel } from '@/components/ai/copilot-sidepanel'
//@ts-ignore
import type { FormSuggestion } from '@/components/ai/copilot-sidepanel'

export default function CreateHackathonPage() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [error, setError] = useState('')
  const [copilotOpen, setCopilotOpen] = useState(false)
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
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

  const handleApplySuggestions = (suggestions: FormSuggestion[]) => {
    console.log('Form received suggestions:', suggestions)
    const updates: any = {}
    
    suggestions.forEach(suggestion => {
      console.log(`Checking field: ${suggestion.field}, exists in form: ${suggestion.field in formData}`)
      if (suggestion.field in formData) {
        updates[suggestion.field] = suggestion.value
        console.log(`Adding update: ${suggestion.field} = ${suggestion.value}`)
      }
    })

    console.log('Applying updates:', updates)
    setFormData(prev => ({ ...prev, ...updates }))
    
    // Show a brief success notification
    if (Object.keys(updates).length > 0) {
      setError('') // Clear any previous errors
    }
  }

  if (pageLoading) {
    return (
        <Box
            sx={{
              minHeight: '100vh',
              bgcolor: 'white',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
        >
          <CircularProgress size={32} />
        </Box>
    )
  }

  if (!user) {
    return null
  }

  return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
                Create New Hackathon
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Set up your hackathon event and start attracting participants
              </Typography>
            </Box>
            <Tooltip title="Open AI Copilot - Get smart suggestions for your hackathon">
              <IconButton
                onClick={() => setCopilotOpen(true)}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  width: 56,
                  height: 56,
                  '&:hover': {
                    bgcolor: 'primary.dark',
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.2s ease-in-out',
                  boxShadow: 3
                }}
              >
                <AIIcon fontSize="large" />
              </IconButton>
            </Tooltip>
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
            )}

            {/* Basic Information */}
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                  Basic Information
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Essential details about your hackathon
                </Typography>

                <Grid container spacing={3}>
                  <Grid size={3}>
                    <TextField
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '4px'
                          }
                        }}
                        label="Hackathon Title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g., AI Innovation Challenge 2024"
                        required
                    />
                  </Grid>
                  <Grid size={3}>
                    <TextField
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '4px'
                          }
                        }}
                        label="Theme"
                        name="theme"
                        value={formData.theme}
                        onChange={handleChange}
                        placeholder="e.g., Artificial Intelligence, Sustainability"
                    />
                  </Grid>

                  <Grid size={3}>
                    <FormControl fullWidth sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '4px'
                      }
                    }}>
                      <InputLabel>Difficulty Level</InputLabel>
                      <Select
                          name="difficulty_level"
                          value={formData.difficulty_level}
                          onChange={handleSelectChange}
                          label="Difficulty Level"
                      >
                        <MenuItem value="BEGINNER">Beginner</MenuItem>
                        <MenuItem value="INTERMEDIATE">Intermediate</MenuItem>
                        <MenuItem value="ADVANCED">Advanced</MenuItem>
                        <MenuItem value="EXPERT">Expert</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={12}>
                    <TextField
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '4px'
                          }
                        }}
                        label="Description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe your hackathon, its goals, and what participants can expect..."
                        multiline
                        rows={4}
                        required
                    />
                  </Grid>


                </Grid>
              </CardContent>
            </Card>

            {/* Schedule */}
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                  Schedule
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Set up registration and event dates
                </Typography>

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '4px'
                          }
                        }}
                        label="Registration Start"
                        name="registration_start"
                        type="datetime-local"
                        value={formData.registration_start}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                        required
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '4px'
                          }
                        }}
                        label="Registration End"
                        name="registration_end"
                        type="datetime-local"
                        value={formData.registration_end}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                        required
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '4px'
                          }
                        }}
                        label="Event Start Date"
                        name="start_date"
                        type="datetime-local"
                        value={formData.start_date}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                        required
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '4px'
                          }
                        }}
                        label="Event End Date"
                        name="end_date"
                        type="datetime-local"
                        value={formData.end_date}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                        required
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '4px'
                          }
                        }}
                        label="Timezone"
                        name="timezone"
                        value={formData.timezone}
                        onChange={handleChange}
                        placeholder="e.g., UTC, EST, PST"
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControlLabel
                        control={
                          <Checkbox
                              name="is_virtual"
                              checked={formData.is_virtual}
                              onChange={handleChange}
                          />
                        }
                        label="Virtual Event"
                    />
                  </Grid>

                  {!formData.is_virtual && (
                      <Grid size={12}>
                        <TextField
                            fullWidth
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '4px'
                              }
                            }}
                            label="Location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="e.g., San Francisco, CA or University Campus"
                        />
                      </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>

            {/* Participants & Teams */}
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                  Participants & Teams
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Configure participation limits and team structure
                </Typography>

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '4px'
                          }
                        }}
                        label="Max Participants"
                        name="max_participants"
                        type="number"
                        value={formData.max_participants}
                        onChange={handleChange}
                        placeholder="Leave empty for unlimited"
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '4px'
                          }
                        }}
                        label="Min Team Size"
                        name="min_team_size"
                        type="number"
                        value={formData.min_team_size}
                        onChange={handleChange}
                        slotProps={{
                          htmlInput: { min: 1 }
                        }}
                        required
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '4px'
                          }
                        }}
                        label="Max Team Size"
                        name="max_team_size"
                        type="number"
                        value={formData.max_team_size}
                        onChange={handleChange}
                        slotProps={{
                          htmlInput: { min: 1 }
                        }}
                        required
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Prize & Rules */}
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                  Prize & Rules
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Set prize information and event rules
                </Typography>

                <Grid container spacing={3}>
                  <Grid size={12}>
                    <TextField
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '4px'
                          }
                        }}
                        label="Total Prize Pool ($)"
                        name="prize_pool"
                        type="number"
                        value={formData.prize_pool}
                        onChange={handleChange}
                        placeholder="e.g., 10000"
                        slotProps={{
                          htmlInput: { step: 0.01 }
                        }}
                    />
                  </Grid>

                  <Grid size={12}>
                    <TextField
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '4px'
                          }
                        }}
                        label="Rules & Guidelines"
                        name="rules"
                        value={formData.rules}
                        onChange={handleChange}
                        placeholder="Outline the rules, eligibility criteria, and guidelines for participants..."
                        multiline
                        rows={4}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Button
                    fullWidth
                    variant="outlined"
                    size="large"
                    onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    type="submit"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  {loading ? 'Creating...' : 'Create Hackathon'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Container>

        {/* AI Copilot Sidepanel */}
        <CopilotSidepanel
          isOpen={copilotOpen}
          onClose={() => setCopilotOpen(false)}
          onApplySuggestions={handleApplySuggestions}
          formContext={formData}
        />
      </Box>
  )
}