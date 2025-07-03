'use client'

import React, {useState, useEffect} from 'react'
import {useRouter} from 'next/navigation'
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
    Tooltip,
    CardMedia,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    Divider,
    useTheme,
    useMediaQuery
} from '@mui/material'
import {
    AutoAwesome as AIIcon,
    CloudUpload as UploadIcon,
    Image as ImageIcon,
    Delete as DeleteIcon,
    Preview as PreviewIcon,
    Close as CloseIcon,
    Event as EventIcon,
    Group as GroupIcon,
    EmojiEvents as PrizeIcon
} from '@mui/icons-material'
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider'
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs'
import {DateTimePicker} from '@mui/x-date-pickers/DateTimePicker'
import dayjs, {Dayjs} from 'dayjs'
import {auth} from '@/lib/auth'
import type {AuthUser} from '@/lib/auth'
import {CopilotSidepanel} from '@/components/ai/copilot-sidepanel'
//@ts-ignore
import type {FormSuggestion} from '@/components/ai/copilot-sidepanel'

export default function CreateHackathonPage() {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [loading, setLoading] = useState(false)
    const [pageLoading, setPageLoading] = useState(true)
    const [error, setError] = useState('')
    const [copilotOpen, setCopilotOpen] = useState(false)
    const router = useRouter()
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        theme: '',
        difficulty_level: 'INTERMEDIATE',
        registration_start: null as Dayjs | null,
        registration_end: null as Dayjs | null,
        start_date: null as Dayjs | null,
        end_date: null as Dayjs | null,
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
    const [posterGenerationMode, setPosterGenerationMode] = useState(false)
    const [previewOpen, setPreviewOpen] = useState(false)

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
        const {name, value, type} = e.target

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
        const {name, value} = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleDateChange = (name: string, value: Dayjs | null) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const uploadPosterFile = async (): Promise<string | null> => {
        if (!posterFile) return null

        try {
            const formData = new FormData()
            formData.append('file', posterFile)
            formData.append('type', 'poster')

            const uploadResponse = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })

            if (!uploadResponse.ok) {
                throw new Error('Failed to upload poster')
            }

            const uploadData = await uploadResponse.json()
            return uploadData.url
        } catch (error) {
            console.error('Error uploading poster:', error)
            throw new Error('Failed to upload poster file')
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            // Upload poster file first if one is selected
            let posterUrl = formData.poster_url
            if (posterFile) {
                setError('Uploading poster...')
                posterUrl = await uploadPosterFile()
            }

            const hackathonData = {
                ...formData,
                poster_url: posterUrl || '',
                registration_start: formData.registration_start?.toISOString() || '',
                registration_end: formData.registration_end?.toISOString() || '',
                start_date: formData.start_date?.toISOString() || '',
                end_date: formData.end_date?.toISOString() || '',
                max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
                min_team_size: parseInt(formData.min_team_size),
                max_team_size: parseInt(formData.max_team_size),
                prize_pool: formData.prize_pool ? parseFloat(formData.prize_pool) : null,
                requirements: formData.requirements,
                judging_criteria: formData.judging_criteria
            }

            setError('Creating hackathon...')
            const response = await fetch('/api/hackathons', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(hackathonData)
            })

            const data = await response.json()

            if (response.ok) {
                router.push(`/dashboard/organize/${data.hackathon.id}`)
            } else {
                setError(data.error || 'Failed to create hackathon')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred')
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
                // Handle date fields specially
                if (['registration_start', 'registration_end', 'start_date', 'end_date'].includes(suggestion.field)) {
                    updates[suggestion.field] = dayjs(suggestion.value)
                } else {
                    updates[suggestion.field] = suggestion.value
                }
                console.log(`Adding update: ${suggestion.field} = ${suggestion.value}`)
            }
        })

        console.log('Applying updates:', updates)
        setFormData(prev => ({...prev, ...updates}))

        // Show a brief success notification
        if (Object.keys(updates).length > 0) {
            setError('') // Clear any previous errors
        }
    }

    const handlePosterUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setError('Poster file size must be less than 5MB')
                return
            }

            if (!file.type.startsWith('image/')) {
                setError('Please upload a valid image file')
                return
            }

            setPosterFile(file)

            // Create preview
            const reader = new FileReader()
            reader.onload = (e) => {
                setPosterPreview(e.target?.result as string)
            }
            reader.readAsDataURL(file)

            setError('') // Clear any errors
        }
    }

    const handleRemovePoster = () => {
        setPosterFile(null)
        setPosterPreview(null)
        setFormData(prev => ({...prev, poster_url: ''}))
    }

    const handleGeneratePosterWithAI = () => {
        setPosterGenerationMode(true)
        setCopilotOpen(true)
    }

    const isFormValid = () => {
        return (
            formData.title.trim() !== '' &&
            formData.description.trim() !== '' &&
            formData.registration_start !== null &&
            formData.registration_end !== null &&
            formData.start_date !== null &&
            formData.end_date !== null &&
            formData.min_team_size.trim() !== '' &&
            formData.max_team_size.trim() !== ''
        )
    }

    const handlePreview = () => {
        setPreviewOpen(true)
    }

    const formatDateForDisplay = (date: Dayjs | null) => {
        if (!date) return 'Not set'
        return date.format('MMM DD, YYYY at h:mm A')
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
                <CircularProgress size={32}/>
            </Box>
        )
    }

    if (!user) {
        return null
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{minHeight: '100vh', bgcolor: 'background.default'}}>
                <Container maxWidth="lg" sx={{py: 4}}>
                    <Box sx={{mb: 4, display: 'flex', alignItems: 'start', justifyContent: 'space-between'}}>
                        <Box>
                            <Typography variant="h6" component="h4" fontWeight="bold" gutterBottom>
                                Create New Hackathon
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Set up your hackathon event and start attracting participants
                            </Typography>
                        </Box>
                        <Tooltip title="HackHub AI Copilot - Get smart suggestions for your hackathon">
                            <IconButton
                                onClick={() => setCopilotOpen(true)}
                                sx={{
                                    position: 'relative',
                                    background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
                                    color: 'white',
                                    width: 64,
                                    height: 64,
                                    overflow: 'hidden',
                                    '&:before': {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        background: 'linear-gradient(135deg, #ff8a50 0%, #ff6b35 50%, #f7931e 100%)',
                                        opacity: 0,
                                        transition: 'opacity 0.3s ease',
                                        zIndex: 0
                                    },
                                    '&:after': {
                                        content: '""',
                                        position: 'absolute',
                                        top: '-50%',
                                        left: '-50%',
                                        width: '200%',
                                        height: '200%',
                                        background: 'conic-gradient(from 0deg, transparent, rgba(255,255,255,0.3), transparent)',
                                        animation: 'spin 3s linear infinite',
                                        opacity: 0.7
                                    },
                                    '&:hover': {
                                        transform: 'scale(1.1) translateY(-2px)',
                                        boxShadow: '0 20px 40px rgba(255, 107, 53, 0.4), 0 0 30px rgba(247, 147, 30, 0.3)',
                                        '&:before': {
                                            opacity: 0.8
                                        }
                                    },
                                    '&:active': {
                                        transform: 'scale(1.05) translateY(0px)'
                                    },
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: '0 10px 25px rgba(255, 107, 53, 0.3), 0 0 20px rgba(247, 147, 30, 0.2)',
                                    animation: 'pulse 2s ease-in-out infinite alternate',
                                    '& > *': {
                                        position: 'relative',
                                        zIndex: 2
                                    },
                                    '@keyframes spin': {
                                        '0%': {
                                            transform: 'rotate(0deg)'
                                        },
                                        '100%': {
                                            transform: 'rotate(360deg)'
                                        }
                                    },
                                    '@keyframes pulse': {
                                        '0%': {
                                            boxShadow: '0 10px 25px rgba(255, 107, 53, 0.3), 0 0 20px rgba(247, 147, 30, 0.2)'
                                        },
                                        '100%': {
                                            boxShadow: '0 15px 35px rgba(255, 107, 53, 0.4), 0 0 25px rgba(247, 147, 30, 0.3)'
                                        }
                                    }
                                }}
                            >
                                <AIIcon
                                    fontSize="large"
                                    sx={{
                                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                                        animation: 'glow 2s ease-in-out infinite alternate',
                                        '@keyframes glow': {
                                            '0%': {
                                                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3)) drop-shadow(0 0 8px rgba(255,255,255,0.3))'
                                            },
                                            '100%': {
                                                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3)) drop-shadow(0 0 12px rgba(255,255,255,0.5))'
                                            }
                                        }
                                    }}
                                />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    <Box component="form" onSubmit={handleSubmit}
                         sx={{display: 'flex', flexDirection: 'column', gap: 4}}>
                        {error && (
                            <Alert severity="error" sx={{mb: 2}}>
                                {error}
                            </Alert>
                        )}

                        {/* Basic Information */}
                        <Card className={"rounded-lg !shadow-none border border-gray-200"}>
                            <CardContent sx={{p: 3}}>


                                <Grid container spacing={2}>
                                    {/* Left Column - Form Fields */}
                                    <Grid size={{xs: 12, md: 8}}>
                                        <Grid size={12}>
                                            <Typography variant="h5" component="h2" gutterBottom>
                                                Basic Information
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{mb: 3}}>
                                                Essential details about your hackathon
                                            </Typography>
                                        </Grid>
                                        <Grid container spacing={2}>
                                            {/* Title, Theme, Difficulty in a row */}
                                            <Grid size={{xs: 12, md: 4}}>
                                                <TextField
                                                    fullWidth
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: '4px'
                                                        }
                                                    }}
                                                    label="Hackathon Title"
                                                    name="title"
                                                    size="small"
                                                    value={formData.title}
                                                    onChange={handleChange}
                                                    placeholder="e.g., AI Innovation Challenge 2024"
                                                    required
                                                />
                                            </Grid>
                                            <Grid size={{xs: 12, md: 4}}>
                                                <TextField
                                                    size="small"
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
                                            <Grid size={{xs: 12, md: 4}}>
                                                <FormControl fullWidth sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: '4px'
                                                    }
                                                }}>
                                                    <InputLabel>Difficulty Level</InputLabel>
                                                    <Select
                                                        size="small"
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

                                            {/* Description field - separate row with proper spacing */}
                                            <Grid size={12}>
                                                <TextField
                                                    size="small"
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
                                    </Grid>

                                    {/* Right Column - Poster Section */}
                                    <Grid size={{xs: 12, md: 4}}>
                                        <Box sx={{width: '100%'}}>
                                            <Typography variant="h6" gutterBottom sx={{mb: 2}}>
                                                Hackathon Poster
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
                                                Upload an image or generate one with AI
                                            </Typography>

                                            {posterPreview ? (
                                                <Card sx={{position: 'relative', mb: 2}}>
                                                    <CardMedia
                                                        component="img"
                                                        height={200}
                                                        image={posterPreview}
                                                        alt="Poster preview"
                                                        sx={{objectFit: 'cover', borderRadius: 1}}
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
                                                        <DeleteIcon fontSize="small"/>
                                                    </IconButton>
                                                </Card>
                                            ) : (
                                                <Paper
                                                    sx={{
                                                        height: 200,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        bgcolor: 'grey.50',
                                                        border: '2px dashed',
                                                        borderColor: 'grey.300',
                                                        mb: 2,
                                                        borderRadius: 1
                                                    }}
                                                >
                                                    <Box sx={{textAlign: 'center', p: 2}}>
                                                        <ImageIcon sx={{fontSize: 48, color: 'grey.400', mb: 1}}/>
                                                        <Typography variant="body2" color="text.secondary">
                                                            No poster uploaded
                                                        </Typography>
                                                    </Box>
                                                </Paper>
                                            )}

                                            <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
                                                <Button
                                                    variant="outlined"
                                                    component="label"
                                                    startIcon={<UploadIcon/>}
                                                    fullWidth
                                                    size="small"
                                                    sx={{fontSize: '0.75rem'}}
                                                >
                                                    Upload Poster
                                                    <input
                                                        type="file"
                                                        hidden
                                                        accept="image/*"
                                                        onChange={handlePosterUpload}
                                                    />
                                                </Button>

                                                <Button
                                                    variant="contained"
                                                    startIcon={<AIIcon/>}
                                                    fullWidth
                                                    size="small"
                                                    onClick={handleGeneratePosterWithAI}
                                                    sx={{fontSize: '0.75rem'}}
                                                >
                                                    Generate with AI
                                                </Button>
                                            </Box>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>

                        <Grid container spacing={2}>
                            {/* Schedule */}
                            <Grid size={{xs: 12, md: 6}}>
                                <Card className={"rounded-lg !shadow-none border border-gray-200"}>
                                    <CardContent sx={{p: 3}}>
                                        <Typography variant="h5" component="h2" gutterBottom>
                                            Schedule
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{mb: 3}}>
                                            Set up registration and event dates
                                        </Typography>

                                        <Grid container spacing={3}>
                                            <Grid size={{xs: 12, md: 6}}>
                                                <DateTimePicker
                                                    label="Registration Start"
                                                    value={formData.registration_start}
                                                    onChange={(value) => handleDateChange('registration_start', value)}
                                                    slotProps={{
                                                        textField: {
                                                            fullWidth: true,
                                                            required: true,
                                                            sx: {
                                                                '& .MuiOutlinedInput-root': {
                                                                    borderRadius: '4px'
                                                                }
                                                            }
                                                        }
                                                    }}
                                                />
                                            </Grid>

                                            <Grid size={{xs: 12, md: 6}}>
                                                <DateTimePicker
                                                    label="Registration End"
                                                    value={formData.registration_end}
                                                    onChange={(value) => handleDateChange('registration_end', value)}

                                                    //@ts-ignore
                                                    minDateTime={formData.registration_start}
                                                    slotProps={{
                                                        textField: {
                                                            fullWidth: true,
                                                            required: true,
                                                            sx: {
                                                                '& .MuiOutlinedInput-root': {
                                                                    borderRadius: '4px'
                                                                }
                                                            }
                                                        }
                                                    }}
                                                />
                                            </Grid>

                                            <Grid size={{xs: 12, md: 6}}>
                                                <DateTimePicker
                                                    label="Event Start Date"
                                                    value={formData.start_date}
                                                    onChange={(value) => handleDateChange('start_date', value)}
                                                    //@ts-ignore
                                                    minDateTime={formData.registration_end}
                                                    slotProps={{
                                                        textField: {
                                                            fullWidth: true,
                                                            required: true,
                                                            sx: {
                                                                '& .MuiOutlinedInput-root': {
                                                                    borderRadius: '4px'
                                                                }
                                                            }
                                                        }
                                                    }}
                                                />
                                            </Grid>

                                            <Grid size={{xs: 12, md: 6}}>
                                                <DateTimePicker
                                                    label="Event End Date"
                                                    value={formData.end_date}
                                                    onChange={(value) => handleDateChange('end_date', value)}
                                                    //@ts-ignore
                                                    minDateTime={formData.start_date}
                                                    slotProps={{
                                                        textField: {
                                                            fullWidth: true,
                                                            required: true,
                                                            sx: {
                                                                '& .MuiOutlinedInput-root': {
                                                                    borderRadius: '4px'
                                                                }
                                                            }
                                                        }
                                                    }}
                                                />
                                            </Grid>

                                            <Grid size={{xs: 12, md: 6}}>
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

                                            <Grid size={{xs: 12, md: 6}}>
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
                            </Grid>

                            {/* Participants & Teams */}
                            <Grid size={{xs: 12, md: 6}}>
                                <Card>
                                    <CardContent sx={{p: 3}}>
                                        <Typography variant="h5" component="h2" gutterBottom>
                                            Participants & Teams
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{mb: 3}}>
                                            Configure participation limits and team structure
                                        </Typography>

                                        <Grid container spacing={3}>
                                            <Grid size={{xs: 12, md: 4}}>
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

                                            <Grid size={{xs: 12, md: 4}}>
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
                                                        htmlInput: {min: 1}
                                                    }}
                                                    required
                                                />
                                            </Grid>

                                            <Grid size={{xs: 12, md: 4}}>
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
                                                        htmlInput: {min: 1}
                                                    }}
                                                    required
                                                />
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>

                        {/* Prize & Rules */}
                        <Card>
                            <CardContent sx={{p: 3}}>
                                <Typography variant="h5" component="h2" gutterBottom>
                                    Prize & Rules
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{mb: 3}}>
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
                                                htmlInput: {step: 0.01}
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
                        <div className="flex w-full items-center justify-end">
                            <div className={"grid w-full sm:w-auto grid-cols-2 gap-2 md:grid-cols-3"}>
                                <Button
                                    className={"col-span-1 sm:col-span-1"}
                                    disabled={!isFormValid()}
                                    variant="outlined"
                                    size="medium"
                                    startIcon={<PreviewIcon />}
                                    onClick={handlePreview}
                                >
                                    Preview
                                </Button>
                                <Button
                                    className={"col-span-1 sm:col-span-1"}
                                    variant="outlined"
                                    size="medium"
                                    onClick={() => router.back()}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className={"col-span-2 sm:col-span-1"}
                                    variant="contained"
                                    size="medium"
                                    type="submit"
                                    disabled={loading}
                                    startIcon={loading ? <CircularProgress size={20}/> : null}
                                >
                                    {loading ? 'Creating...' : 'Create Hackathon'}
                                </Button>
                            </div>
                        </div>
                    </Box>
                </Container>

                {/* Preview Dialog */}
                <Dialog 
                    open={previewOpen} 
                    onClose={() => setPreviewOpen(false)}
                    maxWidth="sm"
                    fullWidth
                    fullScreen={fullScreen}
                    PaperProps={{
                        sx: { borderRadius: {sm: 3} }
                    }}
                >
                    <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PreviewIcon color="primary" />
                            <Typography variant="h6" fontWeight="bold">
                                Hackathon Preview
                            </Typography>
                        </Box>
                        <IconButton onClick={() => setPreviewOpen(false)} size="small">
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    
                    <DialogContent sx={{ pt: 1 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {/* Header */}
                            <Box sx={{ textAlign: 'center', mb: 2 }}>
                                {posterPreview && (
                                    <Box sx={{ mb: 2 }}>
                                        <img
                                            src={posterPreview}
                                            alt="Hackathon poster"
                                            style={{
                                                width: '100%',
                                                maxWidth: '200px',
                                                height: '120px',
                                                objectFit: 'cover',
                                                borderRadius: '8px'
                                            }}
                                        />
                                    </Box>
                                )}
                                <Typography variant="h5" fontWeight="bold" gutterBottom>
                                    {formData.title || 'Untitled Hackathon'}
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
                                    {formData.theme && (
                                        <Chip label={formData.theme} color="primary" size="small" />
                                    )}
                                    <Chip 
                                        label={formData.difficulty_level} 
                                        color="secondary" 
                                        size="small" 
                                    />
                                    <Chip 
                                        label={formData.is_virtual ? 'Virtual' : 'In-Person'} 
                                        color="info" 
                                        size="small" 
                                    />
                                </Box>
                            </Box>

                            {/* Description */}
                            <Box>
                                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                    {formData.description || 'No description provided'}
                                </Typography>
                            </Box>

                            <Divider />

                            {/* Key Details */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <EventIcon color="action" fontSize="small" />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            Registration Period
                                        </Typography>
                                        <Typography variant="body2" fontWeight="medium">
                                            {formatDateForDisplay(formData.registration_start)} → {formatDateForDisplay(formData.registration_end)}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <EventIcon color="action" fontSize="small" />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            Event Duration
                                        </Typography>
                                        <Typography variant="body2" fontWeight="medium">
                                            {formatDateForDisplay(formData.start_date)} → {formatDateForDisplay(formData.end_date)}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <GroupIcon color="action" fontSize="small" />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            Team Requirements
                                        </Typography>
                                        <Typography variant="body2" fontWeight="medium">
                                            {formData.min_team_size} - {formData.max_team_size} members
                                            {formData.max_participants && ` • Max ${formData.max_participants} participants`}
                                        </Typography>
                                    </Box>
                                </Box>

                                {formData.prize_pool && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <PrizeIcon color="action" fontSize="small" />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                Prize Pool
                                            </Typography>
                                            <Typography variant="body2" fontWeight="medium" color="success.main">
                                                ${Number(formData.prize_pool).toLocaleString()}
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}

                                {!formData.is_virtual && formData.location && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <EventIcon color="action" fontSize="small" />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                Location
                                            </Typography>
                                            <Typography variant="body2" fontWeight="medium">
                                                {formData.location}
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}

                                {formData.rules && (
                                    <>
                                        <Divider />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                                Rules & Guidelines
                                            </Typography>
                                            <Typography variant="body2" sx={{ 
                                                fontSize: '0.8rem', 
                                                lineHeight: 1.5,
                                                maxHeight: 80,
                                                overflow: 'auto'
                                            }}>
                                                {formData.rules}
                                            </Typography>
                                        </Box>
                                    </>
                                )}
                            </Box>
                        </Box>
                    </DialogContent>
                    
                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button onClick={() => setPreviewOpen(false)} variant="outlined">
                            Close Preview
                        </Button>
                        <Button 
                            onClick={() => {
                                setPreviewOpen(false)
                                // Optionally scroll to submit button or perform submit
                            }}
                            variant="contained"
                        >
                            Looks Good!
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* AI Copilot Sidepanel */}
                <CopilotSidepanel
                    isOpen={copilotOpen}
                    onClose={() => {
                        setCopilotOpen(false)
                        setPosterGenerationMode(false)
                    }}
                    currentUser={user}
                    onApplySuggestions={handleApplySuggestions}
                    formContext={formData}
                    posterGenerationMode={posterGenerationMode}
                />
            </Box>
        </LocalizationProvider>
    )
}