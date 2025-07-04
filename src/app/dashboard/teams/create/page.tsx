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
  Group as TeamIcon
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
  { title: 'React', category: 'Frontend' },
  { title: 'Next.js', category: 'Frontend' },
  { title: 'TypeScript', category: 'Frontend' },
  { title: 'JavaScript', category: 'Frontend' },
  { title: 'Vue.js', category: 'Frontend' },
  { title: 'Angular', category: 'Frontend' },
  { title: 'HTML/CSS', category: 'Frontend' },
  { title: 'Tailwind CSS', category: 'Frontend' },
  { title: 'Python', category: 'Backend' },
  { title: 'Node.js', category: 'Backend' },
  { title: 'Java', category: 'Backend' },
  { title: 'C#', category: 'Backend' },
  { title: 'Go', category: 'Backend' },
  { title: 'Rust', category: 'Backend' },
  { title: 'PHP', category: 'Backend' },
  { title: 'Ruby', category: 'Backend' },
  { title: 'UI/UX Design', category: 'Design' },
  { title: 'Figma', category: 'Design' },
  { title: 'Adobe Creative Suite', category: 'Design' },
  { title: 'Sketch', category: 'Design' },
  { title: 'Prototyping', category: 'Design' },
  { title: 'Mobile Development', category: 'Mobile' },
  { title: 'iOS', category: 'Mobile' },
  { title: 'Android', category: 'Mobile' },
  { title: 'React Native', category: 'Mobile' },
  { title: 'Flutter', category: 'Mobile' },
  { title: 'Swift', category: 'Mobile' },
  { title: 'Kotlin', category: 'Mobile' },
  { title: 'Backend Development', category: 'Backend' },
  { title: 'API Design', category: 'Backend' },
  { title: 'Database Design', category: 'Backend' },
  { title: 'PostgreSQL', category: 'Backend' },
  { title: 'MongoDB', category: 'Backend' },
  { title: 'Redis', category: 'Backend' },
  { title: 'DevOps', category: 'Infrastructure' },
  { title: 'Docker', category: 'Infrastructure' },
  { title: 'Kubernetes', category: 'Infrastructure' },
  { title: 'AWS', category: 'Infrastructure' },
  { title: 'Google Cloud', category: 'Infrastructure' },
  { title: 'Azure', category: 'Infrastructure' },
  { title: 'CI/CD', category: 'Infrastructure' },
  { title: 'Machine Learning', category: 'AI/ML' },
  { title: 'AI', category: 'AI/ML' },
  { title: 'Data Science', category: 'AI/ML' },
  { title: 'Deep Learning', category: 'AI/ML' },
  { title: 'TensorFlow', category: 'AI/ML' },
  { title: 'PyTorch', category: 'AI/ML' },
  { title: 'Computer Vision', category: 'AI/ML' },
  { title: 'NLP', category: 'AI/ML' },
  { title: 'Blockchain', category: 'Web3' },
  { title: 'Web3', category: 'Web3' },
  { title: 'Solidity', category: 'Web3' },
  { title: 'Ethereum', category: 'Web3' },
  { title: 'Smart Contracts', category: 'Web3' },
  { title: 'DeFi', category: 'Web3' },
  { title: 'Product Management', category: 'Business' },
  { title: 'Marketing', category: 'Business' },
  { title: 'Business Development', category: 'Business' },
  { title: 'Project Management', category: 'Business' },
  { title: 'Sales', category: 'Business' },
  { title: 'Content Writing', category: 'Business' },
  { title: 'Data Analysis', category: 'Analytics' },
  { title: 'Business Intelligence', category: 'Analytics' },
  { title: 'Excel/Sheets', category: 'Analytics' },
  { title: 'Tableau', category: 'Analytics' },
  { title: 'Power BI', category: 'Analytics' }
]

export default function CreateTeamPage() {
  const theme = useTheme()
  const router = useRouter()
  
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hackathonSelectOpen, setHackathonSelectOpen] = useState(false)
  const [hackathonLoading, setHackathonLoading] = useState(false)
  const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(null)
  
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

  // Update selected hackathon when formData.hackathon_id changes
  useEffect(() => {
    if (formData.hackathon_id && hackathons.length > 0) {
      const hackathon = hackathons.find(h => h.id === formData.hackathon_id)
      setSelectedHackathon(hackathon || null)
    }
  }, [formData.hackathon_id, hackathons])

  const fetchAvailableHackathons = async () => {
    try {
      const user = await auth.getCurrentUser()
      if (!user) {
        router.push('/auth/signin')
        return
      }

      // Fetch hackathons that are accepting registrations
      const response = await fetch('/api/hackathons?status=PUBLISHED')
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

  const handleHackathonSelectOpen = () => {
    setHackathonSelectOpen(true)
    if (hackathons.length === 0) {
      setHackathonLoading(true)
      fetchAvailableHackathons().finally(() => {
        setHackathonLoading(false)
      })
    }
  }

  const handleHackathonSelectClose = () => {
    setHackathonSelectOpen(false)
  }

  const handleInputChange = (field: keyof TeamFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
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
              <Autocomplete
                fullWidth
                open={hackathonSelectOpen}
                onOpen={handleHackathonSelectOpen}
                onClose={handleHackathonSelectClose}
                options={hackathons}
                loading={hackathonLoading}
                value={selectedHackathon}
                onChange={(_, newValue) => {
                  setSelectedHackathon(newValue)
                  handleInputChange('hackathon_id', newValue?.id || '')
                }}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                getOptionLabel={(option) => option.title}
                noOptionsText={
                  hackathonLoading ? "Loading hackathons..." : 
                  "No hackathons available for registration"
                }
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Box>
                      <Typography variant="body1">
                        {option.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Starts {new Date(option.start_date).toLocaleDateString()} • 
                        Ends {new Date(option.end_date).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Hackathon *"
                    placeholder="Choose a hackathon to create a team for"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <React.Fragment>
                          {hackathonLoading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </React.Fragment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                )}
                sx={{
                  '& .MuiAutocomplete-popper': {
                    '& .MuiPaper-root': {
                      borderRadius: 2,
                      boxShadow: 'rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px'
                    }
                  }
                }}
              />

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
                    slotProps={{ htmlInput: { min: 1, max: 10 } }}
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
                    slotProps={{ htmlInput: { min: 1, max: 10 } }}
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
                  Select skills you're looking for in potential team members
                </Typography>
                
                <Autocomplete
                  multiple
                  limitTags={3}
                  options={COMMON_SKILLS}
                  groupBy={(option) => option.category}
                  getOptionLabel={(option) => option.title}
                  value={COMMON_SKILLS.filter(skill => formData.skills_wanted.includes(skill.title))}
                  onChange={(_, newValue) => {
                    const skillTitles = newValue.map(skill => skill.title)
                    handleInputChange('skills_wanted', skillTitles)
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Skills"
                      placeholder="Choose skills you're looking for..."
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  )}
                  renderTags={(tagValue, getTagProps) =>
                    tagValue.map((option, index) => (
                      <Chip
                        label={option.title}
                        {...getTagProps({ index })}
                        key={option.title}
                        color="primary"
                        variant="outlined"
                        size="small"
                        sx={{
                          borderRadius: 1,
                          '& .MuiChip-deleteIcon': {
                            fontSize: 16
                          }
                        }}
                      />
                    ))
                  }
                  sx={{
                    '& .MuiAutocomplete-popper': {
                      '& .MuiPaper-root': {
                        borderRadius: 2,
                        boxShadow: 'rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px'
                      }
                    }
                  }}
                />
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