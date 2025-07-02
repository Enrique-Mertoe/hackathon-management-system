'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
  Avatar,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material'
import {
  ArrowBack as BackIcon,
  AutoAwesome as AIIcon,
  GetApp as DownloadIcon,
  Assessment as ReportIcon,
  TrendingUp as TrendingUpIcon,
  Group as GroupIcon,
  Event as EventIcon,
  EmojiEvents as TrophyIcon,
  DateRange as DateIcon,
  BarChart as ChartIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon
} from '@mui/icons-material'
import { auth } from '@/lib/auth'
import type { AuthUser } from '@/lib/auth'
import { CopilotSidepanel } from '@/components/ai/copilot-sidepanel'
import type { FormSuggestion } from '@/components/ai/copilot-sidepanel'

interface ReportData {
  eventSummary: {
    totalEvents: number
    activeEvents: number
    completedEvents: number
    totalParticipants: number
  }
  recentReports: {
    id: string
    title: string
    type: string
    generatedAt: string
    status: string
  }[]
  availableReports: {
    name: string
    description: string
    icon: React.ReactNode
    type: string
  }[]
}

export default function ReportsPage() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copilotOpen, setCopilotOpen] = useState(false)
  const [reportsInsightsMode, setReportsInsightsMode] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await auth.getCurrentUser()
        if (!currentUser || !auth.hasRole(currentUser, 'ORGANIZER')) {
          router.push('/auth/signin')
          return
        }
        setUser(currentUser)
        await fetchReportData()
      } catch (error) {
        console.error('Error checking auth:', error)
        router.push('/auth/signin')
      }
    }

    checkAuth()
  }, [router])

  const fetchReportData = async () => {
    try {
      setLoading(true)
      // Mock data - replace with actual API call
      const mockData: ReportData = {
        eventSummary: {
          totalEvents: 12,
          activeEvents: 3,
          completedEvents: 8,
          totalParticipants: 847
        },
        recentReports: [
          {
            id: '1',
            title: 'Q1 2024 Performance Summary',
            type: 'SUMMARY',
            generatedAt: '2024-01-15',
            status: 'READY'
          },
          {
            id: '2',
            title: 'AI Innovation Challenge Report',
            type: 'EVENT',
            generatedAt: '2024-01-12',
            status: 'READY'
          },
          {
            id: '3',
            title: 'Participant Demographics Analysis',
            type: 'ANALYTICS',
            generatedAt: '2024-01-10',
            status: 'GENERATING'
          }
        ],
        availableReports: [
          {
            name: 'Event Performance Report',
            description: 'Detailed analysis of individual hackathon performance',
            icon: <EventIcon />,
            type: 'EVENT'
          },
          {
            name: 'Participant Analytics',
            description: 'Demographics, engagement, and participation patterns',
            icon: <GroupIcon />,
            type: 'PARTICIPANTS'
          },
          {
            name: 'Financial Summary',
            description: 'Revenue, expenses, and prize distribution analysis',
            icon: <TrophyIcon />,
            type: 'FINANCIAL'
          },
          {
            name: 'Trend Analysis',
            description: 'Performance trends and growth metrics over time',
            icon: <TrendingUpIcon />,
            type: 'TRENDS'
          }
        ]
      }
      setReportData(mockData)
    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGetReportsInsights = () => {
    setReportsInsightsMode(true)
    setCopilotOpen(true)
  }

  const handleApplySuggestions = (suggestions: FormSuggestion[]) => {
    console.log('Reports insights received:', suggestions)
  }

  const handleGenerateReport = (type: string) => {
    console.log('Generating report:', type)
    // Implement report generation logic
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'READY': return { color: 'success' as const }
      case 'GENERATING': return { color: 'warning' as const }
      case 'FAILED': return { color: 'error' as const }
      default: return { color: 'default' as const }
    }
  }

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh'
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Button
              variant="text"
              startIcon={<BackIcon />}
              onClick={() => router.push('/dashboard')}
              sx={{ mb: 2 }}
            >
              Back to Dashboard
            </Button>
            <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
              Reports & Analytics
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Generate comprehensive reports and insights for your hackathons
            </Typography>
          </Box>
          <Tooltip title="Get AI insights on your reports">
            <IconButton
              onClick={handleGetReportsInsights}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                width: 48,
                height: 48,
                '&:hover': {
                  bgcolor: 'primary.dark',
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.2s ease-in-out',
                boxShadow: 2
              }}
            >
              <AIIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Summary Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ boxShadow: 2, borderRadius: 3 }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48, mx: 'auto', mb: 2 }}>
                  <EventIcon />
                </Avatar>
                <Typography variant="h4" fontWeight="bold" color="primary.main">
                  {reportData?.eventSummary.totalEvents || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Events
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ boxShadow: 2, borderRadius: 3 }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: 'success.main', width: 48, height: 48, mx: 'auto', mb: 2 }}>
                  <GroupIcon />
                </Avatar>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {reportData?.eventSummary.totalParticipants || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Participants
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ boxShadow: 2, borderRadius: 3 }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: 'warning.main', width: 48, height: 48, mx: 'auto', mb: 2 }}>
                  <TrendingUpIcon />
                </Avatar>
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                  {reportData?.eventSummary.activeEvents || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Events
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ boxShadow: 2, borderRadius: 3 }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: 'info.main', width: 48, height: 48, mx: 'auto', mb: 2 }}>
                  <ReportIcon />
                </Avatar>
                <Typography variant="h4" fontWeight="bold" color="info.main">
                  {reportData?.recentReports.filter(r => r.status === 'READY').length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ready Reports
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Available Reports */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ boxShadow: 2, borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Generate New Report
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Select a report type to generate comprehensive insights
                </Typography>
                
                <Grid container spacing={2}>
                  {reportData?.availableReports.map((report, index) => (
                    <Grid size={{ xs: 12, md: 6 }} key={index}>
                      <Card 
                        sx={{ 
                          boxShadow: 1, 
                          borderRadius: 2, 
                          cursor: 'pointer',
                          '&:hover': { 
                            boxShadow: 3,
                            transform: 'translateY(-2px)'
                          },
                          transition: 'all 0.2s ease-in-out'
                        }}
                        onClick={() => handleGenerateReport(report.type)}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                            <Avatar sx={{ bgcolor: 'primary.light' }}>
                              {report.icon}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                {report.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {report.description}
                              </Typography>
                              <Button
                                size="small"
                                variant="contained"
                                startIcon={<ChartIcon />}
                              >
                                Generate
                              </Button>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Reports */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ boxShadow: 2, borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Recent Reports
                </Typography>
                
                <List sx={{ p: 0 }}>
                  {reportData?.recentReports.map((report, index) => (
                    <React.Fragment key={report.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <ReportIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={report.title}
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <Chip
                                {...getStatusColor(report.status)}
                                label={report.status}
                                size="small"
                              />
                              <Typography variant="caption" color="text.secondary">
                                {new Date(report.generatedAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                          }
                        />
                        {report.status === 'READY' && (
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <IconButton size="small">
                              <PdfIcon />
                            </IconButton>
                            <IconButton size="small">
                              <ExcelIcon />
                            </IconButton>
                            <IconButton size="small">
                              <DownloadIcon />
                            </IconButton>
                          </Box>
                        )}
                      </ListItem>
                      {index < reportData.recentReports.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>

                <Button
                  fullWidth
                  variant="text"
                  sx={{ mt: 2 }}
                  startIcon={<DateIcon />}
                >
                  View All Reports
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* AI Copilot Sidepanel */}
      <CopilotSidepanel
        isOpen={copilotOpen}
        onClose={() => {
          setCopilotOpen(false)
          setReportsInsightsMode(false)
        }}
        onApplySuggestions={handleApplySuggestions}
        formContext={{ user, reportData }}
        reportsInsightsMode={reportsInsightsMode}
      />
    </Box>
  )
}