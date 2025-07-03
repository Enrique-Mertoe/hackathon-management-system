'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  Chip,
  CircularProgress,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Avatar,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import {
  ArrowBack as BackIcon,
  AutoAwesome as AIIcon,
  Lightbulb as IdeaIcon,
  Refresh as RefreshIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Share as ShareIcon,
  Code as CodeIcon,
  School as DifficultyIcon,
  Timer as TimerIcon,
  TrendingUp as ImpactIcon,
  Build as FeasibilityIcon,
  Star as InnovationIcon,
  Add as AddIcon
} from '@mui/icons-material'
import { auth } from '@/lib/auth'
import type { AuthUser } from '@/lib/auth'
import { hackathonAI } from '@/lib/hackathon-ai-service'
import type { ProjectIdea } from '@/lib/hackathon-ai-service'

export default function AIProjectIdeasPage() {
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'))
  
  const [user, setUser] = useState<AuthUser | null>(null)
  const [projectIdeas, setProjectIdeas] = useState<ProjectIdea[]>([])
  const [loading, setLoading] = useState(false)
  const [bookmarkedIdeas, setBookmarkedIdeas] = useState<Set<string>>(new Set())
  const [customizeDialogOpen, setCustomizeDialogOpen] = useState(false)
  const [filters, setFilters] = useState({
    theme: 'AI Innovation',
    difficulty: 'INTERMEDIATE',
    skillsAvailable: [] as string[],
    timeframe: '48 hours',
    count: 6
  })

  const availableSkills = [
    'React', 'Node.js', 'Python', 'AI/ML', 'Database', 'UI/UX Design',
    'Mobile Development', 'API Development', 'Data Analysis', 'DevOps',
    'Blockchain', 'IoT', 'AR/VR', 'Cloud Computing', 'Cybersecurity'
  ]

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await auth.getCurrentUser()
        setUser(currentUser)
        // Load initial project ideas
        generateProjectIdeas()
      } catch (error) {
        console.error('Error checking auth:', error)
      }
    }

    checkAuth()
  }, [])

  const generateProjectIdeas = async () => {
    setLoading(true)
    try {
      const ideas = await hackathonAI.generateProjectIdeas(
        filters.theme,
        filters.skillsAvailable.length > 0 ? filters.skillsAvailable : availableSkills.slice(0, 8),
        filters.difficulty,
        filters.timeframe,
        filters.count
      )
      setProjectIdeas(ideas)
    } catch (error) {
      console.error('Error generating project ideas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBookmark = (ideaTitle: string) => {
    const newBookmarked = new Set(bookmarkedIdeas)
    if (newBookmarked.has(ideaTitle)) {
      newBookmarked.delete(ideaTitle)
    } else {
      newBookmarked.add(ideaTitle)
    }
    setBookmarkedIdeas(newBookmarked)
  }

  const handleShareIdea = (idea: ProjectIdea) => {
    const shareText = `Check out this hackathon project idea: ${idea.title}\n\n${idea.description}\n\nDifficulty: ${idea.difficulty}\nSkills needed: ${idea.required_skills.join(', ')}`
    
    if (navigator.share) {
      navigator.share({
        title: idea.title,
        text: shareText,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(shareText)
      // TODO: Show toast notification
    }
  }

  const handleCustomGenerate = () => {
    setCustomizeDialogOpen(false)
    generateProjectIdeas()
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER': return 'success'
      case 'INTERMEDIATE': return 'warning'
      case 'ADVANCED': return 'error'
      default: return 'default'
    }
  }

  if (loading && projectIdeas.length === 0) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default'
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={40} sx={{ mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            Generating AI-powered project ideas...
          </Typography>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="xl" sx={{ py: { xs: 1, sm: 2, md: 3 }, px: { xs: 1, sm: 2 } }}>
        {/* Header */}
        <Box sx={{ mb: { xs: 2, md: 3 } }}>
          <Button
            variant="text"
            startIcon={<BackIcon />}
            onClick={() => router.push('/dashboard')}
            sx={{ mb: { xs: 1, md: 2 } }}
            size={isSmall ? "small" : "medium"}
          >
            Back to Dashboard
          </Button>
          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2
          }}>
            <Box>
              <Typography 
                variant={isSmall ? "h4" : isMobile ? "h3" : "h2"} 
                component="h1" 
                fontWeight="bold" 
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <IdeaIcon color="primary" sx={{ fontSize: 'inherit' }} />
                AI Project Ideas
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Get AI-powered project suggestions tailored to your hackathon theme and skills
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setCustomizeDialogOpen(true)}
                size={isSmall ? "small" : "medium"}
              >
                Customize
              </Button>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={generateProjectIdeas}
                disabled={loading}
                size={isSmall ? "small" : "medium"}
              >
                {loading ? 'Generating...' : 'Generate New Ideas'}
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Current Parameters */}
        <Card sx={{ boxShadow: 1, borderRadius: 2, mb: 3 }}>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Current Parameters
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip label={`Theme: ${filters.theme}`} size="small" color="primary" />
              <Chip label={`Difficulty: ${filters.difficulty}`} size="small" color={getDifficultyColor(filters.difficulty) as any} />
              <Chip label={`Timeframe: ${filters.timeframe}`} size="small" color="info" />
              <Chip label={`Ideas: ${filters.count}`} size="small" color="secondary" />
              {filters.skillsAvailable.length > 0 && (
                <Chip 
                  label={`Skills: ${filters.skillsAvailable.slice(0, 3).join(', ')}${filters.skillsAvailable.length > 3 ? '...' : ''}`} 
                  size="small" 
                  variant="outlined" 
                />
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Project Ideas Grid */}
        <Grid container spacing={{ xs: 2, md: 3 }}>
          {projectIdeas.map((idea, index) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={index}>
              <Card sx={{ boxShadow: 2, borderRadius: 2, height: '100%', position: 'relative' }}>
                <CardContent sx={{ p: { xs: 2, md: 3 }, pb: 1 }}>
                  {/* Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        variant={isSmall ? "h6" : "h5"} 
                        fontWeight="bold" 
                        gutterBottom
                        sx={{ lineHeight: 1.3 }}
                      >
                        {idea.title}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
                        <Chip 
                          label={idea.difficulty} 
                          size="small" 
                          color={getDifficultyColor(idea.difficulty) as any}
                        />
                        <Chip 
                          label={idea.category} 
                          size="small" 
                          variant="outlined"
                          color="primary"
                        />
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <IconButton 
                        size="small"
                        onClick={() => handleBookmark(idea.title)}
                        color={bookmarkedIdeas.has(idea.title) ? 'primary' : 'default'}
                      >
                        {bookmarkedIdeas.has(idea.title) ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                      </IconButton>
                      <IconButton 
                        size="small"
                        onClick={() => handleShareIdea(idea)}
                      >
                        <ShareIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Description */}
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ mb: 2, lineHeight: 1.6 }}
                  >
                    {idea.description}
                  </Typography>

                  {/* Skills Required */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                      Skills Required:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {idea.required_skills.slice(0, 4).map((skill, skillIndex) => (
                        <Chip 
                          key={skillIndex} 
                          label={skill} 
                          size="small" 
                          variant="outlined" 
                          color="info"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      ))}
                      {idea.required_skills.length > 4 && (
                        <Chip 
                          label={`+${idea.required_skills.length - 4} more`} 
                          size="small" 
                          variant="outlined"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      )}
                    </Box>
                  </Box>

                  {/* Metrics */}
                  <Box sx={{ mb: 2 }}>
                    <Grid container spacing={1}>
                      <Grid size={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <FeasibilityIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            Feasibility
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={idea.technical_feasibility * 10} 
                          sx={{ height: 4, borderRadius: 2 }}
                          color="success"
                        />
                      </Grid>
                      <Grid size={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <InnovationIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            Innovation
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={idea.innovation_score * 10} 
                          sx={{ height: 4, borderRadius: 2 }}
                          color="secondary"
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Footer Info */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <TimerIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {idea.estimated_time}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="primary" fontWeight="medium">
                      {idea.potential_impact.length > 30 ? 
                        `${idea.potential_impact.substring(0, 30)}...` : 
                        idea.potential_impact
                      }
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Loading overlay for regeneration */}
        {loading && projectIdeas.length > 0 && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
          >
            <Box sx={{ textAlign: 'center', bgcolor: 'background.paper', p: 4, borderRadius: 2 }}>
              <CircularProgress size={40} sx={{ mb: 2 }} />
              <Typography variant="body1">
                Generating new project ideas...
              </Typography>
            </Box>
          </Box>
        )}
      </Container>

      {/* Customize Dialog */}
      <Dialog 
        open={customizeDialogOpen} 
        onClose={() => setCustomizeDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isSmall}
      >
        <DialogTitle>Customize Project Ideas</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <TextField
              fullWidth
              label="Hackathon Theme"
              value={filters.theme}
              onChange={(e) => setFilters(prev => ({ ...prev, theme: e.target.value }))}
              placeholder="e.g., Climate Change, FinTech, HealthTech"
            />
            
            <Grid container spacing={2}>
              <Grid size={6}>
                <FormControl fullWidth>
                  <InputLabel>Difficulty Level</InputLabel>
                  <Select
                    value={filters.difficulty}
                    onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value as any }))}
                    label="Difficulty Level"
                  >
                    <MenuItem value="BEGINNER">Beginner</MenuItem>
                    <MenuItem value="INTERMEDIATE">Intermediate</MenuItem>
                    <MenuItem value="ADVANCED">Advanced</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="Timeframe"
                  value={filters.timeframe}
                  onChange={(e) => setFilters(prev => ({ ...prev, timeframe: e.target.value }))}
                  placeholder="e.g., 48 hours, 1 week"
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="Number of Ideas"
              type="number"
              value={filters.count}
              onChange={(e) => setFilters(prev => ({ ...prev, count: parseInt(e.target.value) || 6 }))}
              inputProps={{ min: 1, max: 12 }}
            />

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Available Skills (select relevant skills):
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {availableSkills.map((skill) => (
                  <Chip
                    key={skill}
                    label={skill}
                    size="small"
                    clickable
                    color={filters.skillsAvailable.includes(skill) ? 'primary' : 'default'}
                    variant={filters.skillsAvailable.includes(skill) ? 'filled' : 'outlined'}
                    onClick={() => {
                      setFilters(prev => ({
                        ...prev,
                        skillsAvailable: prev.skillsAvailable.includes(skill)
                          ? prev.skillsAvailable.filter(s => s !== skill)
                          : [...prev.skillsAvailable, skill]
                      }))
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCustomizeDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleCustomGenerate} 
            variant="contained"
            startIcon={<AIIcon />}
          >
            Generate Ideas
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}