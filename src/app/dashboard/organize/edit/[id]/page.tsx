'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Box,
  Button,
  Card,
  CardContent,
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
  IconButton,
  Tooltip,
  Checkbox,
  CardMedia
} from '@mui/material'
import {
  AutoAwesome as AIIcon,
  ArrowBack as BackIcon,
  Save as SaveIcon,
  CloudUpload as UploadIcon,
  Image as ImageIcon,
  Delete as DeleteIcon
} from '@mui/icons-material'
import { auth } from '@/lib/auth'
import type { AuthUser } from '@/lib/auth'
import { CopilotSidepanel } from '@/components/ai/copilot-sidepanel'
import type { FormSuggestion } from '@/components/ai/copilot-sidepanel'

interface EditHackathon {
  id: string
  title: string
  description: string
  theme: string
  difficulty_level: string
  registration_start: string
  registration_end: string
  start_date: string
  end_date: string
  timezone: string
  location: string
  is_virtual: boolean
  max_participants: string
  min_team_size: string
  max_team_size: string
  prize_pool: string
  rules: string
  poster_url?: string
  requirements: {
    skills: string[]
    tools: string[]
    experience_level: string
  }
  judging_criteria: {
    innovation: number
    technical_implementation: number
    design: number
    presentation: number
  }
}

export default function EditHackathonPage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [error, setError] = useState('')
  const [copilotOpen, setCopilotOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  
  const [formData, setFormData] = useState<EditHackathon>({
    id: '',
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
    poster_url: '',
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

  const [posterFile, setPosterFile] = useState<File | null>(null)
  const [posterPreview, setPosterPreview] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await auth.getCurrentUser()
        if (!currentUser || !auth.hasRole(currentUser, 'ORGANIZER')) {
          router.push('/auth/signin')
          return
        }
        setUser(currentUser)
        await fetchHackathon()
      } catch (error) {
        console.error('Error checking auth:', error)
        router.push('/auth/signin')
      } finally {
        setPageLoading(false)
      }
    }

    checkAuth()
  }, [router, params.id])

  const fetchHackathon = async () => {
    try {
      // Mock data - replace with actual API call
      const mockHackathon: EditHackathon = {
        id: params.id as string,
        title: 'AI Innovation Challenge',
        description: 'Build innovative AI solutions that solve real-world problems',
        theme: 'Artificial Intelligence',
        difficulty_level: 'INTERMEDIATE',
        registration_start: '2024-02-01T09:00',
        registration_end: '2024-02-10T23:59',
        start_date: '2024-02-15T10:00',
        end_date: '2024-02-17T18:00',
        timezone: 'UTC',
        location: 'Virtual Event',
        is_virtual: true,
        max_participants: '200',
        min_team_size: '2',
        max_team_size: '4',
        prize_pool: '10000',
        rules: 'Standard hackathon rules apply...',
        poster_url: '',
        requirements: {
          skills: ['Python', 'Machine Learning'],
          tools: ['Jupyter', 'TensorFlow'],
          experience_level: 'Intermediate'
        },
        judging_criteria: {
          innovation: 30,
          technical_implementation: 30,
          design: 20,
          presentation: 20
        }
      }
      setFormData(mockHackathon)
      if (mockHackathon.poster_url) {
        setPosterPreview(mockHackathon.poster_url)
      }
    } catch (error) {
      console.error('Error fetching hackathon:', error)
      setError('Failed to load hackathon data')
    }
  }

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

      const response = await fetch(`/api/hackathons/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(hackathonData)
      })

      const data = await response.json()

      if (response.ok) {
        router.push(`/dashboard/organize/${params.id}`)
      } else {
        setError(data.error || 'Failed to update hackathon')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleApplySuggestions = (suggestions: FormSuggestion[]) => {
    console.log('Edit suggestions received:', suggestions)
    const updates: any = {}
    
    suggestions.forEach(suggestion => {
      if (suggestion.field in formData) {
        updates[suggestion.field] = suggestion.value
      }
    })

    setFormData(prev => ({ ...prev, ...updates }))
    
    if (Object.keys(updates).length > 0) {
      setError('')
    }
  }

  const handlePosterUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Poster file size must be less than 5MB')
        return
      }
      
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file')
        return
      }

      setPosterFile(file)
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setPosterPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      
      setError('')
    }
  }

  const handleRemovePoster = () => {
    setPosterFile(null)
    setPosterPreview(null)
    setFormData(prev => ({...prev, poster_url: ''}))
  }

  const handleGetEditingHelp = () => {
    setEditMode(true)
    setCopilotOpen(true)
  }

  if (pageLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <CircularProgress size={40} />
      </Box>
    )
  }

  if (!user) {
    return null
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Button
              variant="text"
              startIcon={<BackIcon />}
              onClick={() => router.push(`/dashboard/organize/${params.id}`)}
              sx={{ mb: 2 }}
            >
              Back to Hackathon
            </Button>
            <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
              Edit Hackathon
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Update your hackathon details and settings
            </Typography>
          </Box>
          <Tooltip title="Get AI help with editing your hackathon">
            <IconButton
              onClick={handleGetEditingHelp}
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
          <Card sx={{ boxShadow: 2, borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Basic Information
              </Typography>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 8 }}>
                  <Grid container spacing={3}>
                    <Grid size={4}>
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
                        required
                      />
                    </Grid>
                    <Grid size={4}>
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
                      />
                    </Grid>
                    <Grid size={4}>
                      <FormControl fullWidth>
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
                        label="Description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        multiline
                        rows={4}
                        required
                      />
                    </Grid>
                  </Grid>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                      Hackathon Poster
                    </Typography>
                    
                    {posterPreview ? (
                      <Card sx={{ position: 'relative', mb: 2 }}>
                        <CardMedia
                          component="img"
                          height={200}
                          image={posterPreview}
                          alt="Poster preview"
                          sx={{ objectFit: 'cover', borderRadius: 1 }}
                        />
                        <IconButton
                          onClick={handleRemovePoster}
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            bgcolor: 'rgba(0,0,0,0.5)',
                            color: 'white',
                            '&:hover': {
                              bgcolor: 'rgba(0,0,0,0.7)'
                            }
                          }}
                          size="small"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Card>
                    ) : (
                      <Box
                        sx={{
                          height: 200,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '2px dashed',
                          borderColor: 'grey.300',
                          borderRadius: 1,
                          mb: 2
                        }}
                      >
                        <Box sx={{ textAlign: 'center' }}>
                          <ImageIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            No poster uploaded
                          </Typography>
                        </Box>
                      </Box>
                    )}

                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<UploadIcon />}
                      fullWidth
                      size="small"
                    >
                      {posterPreview ? 'Change Poster' : 'Upload Poster'}
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handlePosterUpload}
                      />
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card sx={{ boxShadow: 2, borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Schedule
              </Typography>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
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
                    label="Timezone"
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleChange}
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
                      label="Location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                    />
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Other sections similar to create page... */}
          
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
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Container>

      {/* AI Copilot Sidepanel */}
      <CopilotSidepanel
        isOpen={copilotOpen}
        onClose={() => {
          setCopilotOpen(false)
          setEditMode(false)
        }}
        currentUser={user}
        onApplySuggestions={handleApplySuggestions}
        formContext={formData}
        editMode={editMode}
      />
    </Box>
  )
}