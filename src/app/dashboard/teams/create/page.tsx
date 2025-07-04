'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Card,
  CardContent,
  Button,
  Typography,
  Container,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  useTheme,
  alpha,
  CircularProgress,
  Alert,
  Autocomplete,
  Grid,
  Paper,
  Stack
} from '@mui/material'
import {
  ArrowBack as BackIcon,
  Group as TeamIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material'
import { auth } from '@/lib/auth'

interface Hackathon {
  id: string
  title: string
  status: string
  registration_end: string
  start_date: string
  end_date: string
}

interface TeamFormData {
  name: string
  description: string
  hackathon_id: string
  skills_wanted: string[]
  min_team_size: number
  max_team_size: number
  looking_for_members: boolean
}

const COMMON_SKILLS = [
  'React', 'Next.js', 'TypeScript', 'JavaScript', 'Python', 'Node.js',
  'UI/UX Design', 'Figma', 'Mobile Development', 'iOS', 'Android',
  'Backend Development', 'API Design', 'Database Design', 'DevOps',
  'Machine Learning', 'AI', 'Data Science', 'Blockchain', 'Web3',
  'Product Management', 'Marketing', 'Business Development'
]

export default function CreateTeamPage() {
  const theme = useTheme()
  const router = useRouter()
  
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [skillInput, setSkillInput] = useState('')
  
  const [formData, setFormData] = useState<TeamFormData>({
    name: '',
    description: '',
    hackathon_id: '',
    skills_wanted: [],
    min_team_size: 2,
    max_team_size: 5,
    looking_for_members: true
  })

  useEffect(() => {
    fetchAvailableHackathons()
  }, [])

  const fetchAvailableHackathons = async () => {
    try {
      const user = await auth.getCurrentUser()
      if (!user) {
        router.push('/auth/signin')
        return
      }

      // Fetch hackathons that are accepting registrations
      const response = await fetch('/api/hackathons?status=REGISTRATION_OPEN')
      if (response.ok) {
        const data = await response.json()
        setHackathons(data.hackathons || [])
      }
    } catch (error) {
      console.error('Error fetching hackathons:', error)
      setError('Failed to load available hackathons')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof TeamFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills_wanted.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills_wanted: [...prev.skills_wanted, skillInput.trim()]
      }))
      setSkillInput('')
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills_wanted: prev.skills_wanted.filter(skill => skill !== skillToRemove)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.hackathon_id) {
      setError('Please fill in all required fields')
      return
    }

    if (formData.min_team_size > formData.max_team_size) {
      setError('Minimum team size cannot be greater than maximum team size')
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        router.push('/dashboard/teams')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to create team')
      }
    } catch (error) {
      console.error('Error creating team:', error)
      setError('An unexpected error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress size={40} />
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      <Box sx={{ mb: 4 }}>
        <Button
          variant="text"
          startIcon={<BackIcon />}
          onClick={() => router.push('/dashboard/teams')}
          sx={{ mb: 2 }}
        >
          Back to Teams
        </Button>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Create New Team
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Form a team to participate in hackathons and collaborate with other developers
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ 
        boxShadow: 'rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px',
        borderRadius: 2
      }}>
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {/* Team Name */}
              <TextField
                label="Team Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                fullWidth
                placeholder="Enter a catchy team name"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />

              {/* Hackathon Selection */}
              <FormControl fullWidth required>
                <InputLabel>Select Hackathon</InputLabel>
                <Select
                  value={formData.hackathon_id}
                  label="Select Hackathon"
                  onChange={(e) => handleInputChange('hackathon_id', e.target.value)}
                  sx={{
                    borderRadius: 2
                  }}
                >
                  {hackathons.map((hackathon) => (
                    <MenuItem key={hackathon.id} value={hackathon.id}>
                      <Box>
                        <Typography variant="body1">
                          {hackathon.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Starts {new Date(hackathon.start_date).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Team Description */}
              <TextField
                label="Team Description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                multiline
                rows={3}
                fullWidth
                placeholder="Describe your team's goals, approach, or what you're looking for in teammates"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />

              {/* Team Size */}
              <Grid container spacing={2}>
                <Grid size={6}>
                  <TextField
                    label="Minimum Team Size"
                    type="number"
                    value={formData.min_team_size}
                    onChange={(e) => handleInputChange('min_team_size', parseInt(e.target.value) || 1)}
                    inputProps={{ min: 1, max: 10 }}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                </Grid>
                <Grid size={6}>
                  <TextField
                    label="Maximum Team Size"
                    type="number"
                    value={formData.max_team_size}
                    onChange={(e) => handleInputChange('max_team_size', parseInt(e.target.value) || 5)}
                    inputProps={{ min: 1, max: 10 }}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                </Grid>
              </Grid>

              {/* Skills Wanted */}
              <Box>
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                  Skills Looking For
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Add skills you're looking for in potential team members
                </Typography>
                
                <Autocomplete
                  freeSolo
                  options={COMMON_SKILLS}
                  value={skillInput}
                  onChange={(_, newValue) => {
                    if (typeof newValue === 'string') {
                      setSkillInput(newValue)
                    }
                  }}
                  onInputChange={(_, newInputValue) => {
                    setSkillInput(newInputValue)
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Add Skill"
                      placeholder="Type a skill and press Enter"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddSkill()
                        }
                      }}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <Button
                            size="small"
                            onClick={handleAddSkill}
                            disabled={!skillInput.trim()}
                            sx={{ mr: 1 }}
                          >
                            Add
                          </Button>
                        )
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  )}
                />

                {formData.skills_wanted.length > 0 && (
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      mt: 2, 
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.primary.main, 0.02)
                    }}
                  >
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Skills Added:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {formData.skills_wanted.map((skill, index) => (
                        <Chip
                          key={index}
                          label={skill}
                          onDelete={() => handleRemoveSkill(skill)}
                          color="primary"
                          variant="outlined"
                          size="small"
                          deleteIcon={<DeleteIcon />}
                        />
                      ))}
                    </Box>
                  </Paper>
                )}
              </Box>

              {/* Looking for Members Toggle */}
              <FormControl fullWidth>
                <InputLabel>Team Status</InputLabel>
                <Select
                  value={formData.looking_for_members ? 'open' : 'closed'}
                  label="Team Status"
                  onChange={(e) => handleInputChange('looking_for_members', e.target.value === 'open')}
                  sx={{
                    borderRadius: 2
                  }}
                >
                  <MenuItem value="open">
                    <Box>
                      <Typography variant="body1">Open to new members</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Others can find and join your team
                      </Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="closed">
                    <Box>
                      <Typography variant="body1">Private team</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Only you can invite members
                      </Typography>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>

              {/* Submit Button */}
              <Box sx={{ display: 'flex', gap: 2, pt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => router.push('/dashboard/teams')}
                  sx={{ 
                    borderRadius: 2,
                    flex: 1
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={submitting}
                  startIcon={submitting ? <CircularProgress size={20} /> : <TeamIcon />}
                  sx={{ 
                    borderRadius: 2,
                    flex: 1,
                    boxShadow: 'rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px'
                  }}
                >
                  {submitting ? 'Creating Team...' : 'Create Team'}
                </Button>
              </Box>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Container>
  )
}