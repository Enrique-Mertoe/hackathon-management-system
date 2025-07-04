import React, {useState, useRef, useEffect, useCallback} from 'react';
import {Search, X, Sparkles} from 'lucide-react';
import {motion} from "framer-motion"
import {
    IconButton,
    TextField,
    Paper,
    Box,
    Typography,
    Chip,
    InputAdornment,
    useTheme,
    alpha,
    CircularProgress,
    Divider
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { hackathonAI } from '@/lib/hackathon-ai-service';

interface SearchResult {
    id: string;
    title: string;
    description: string;
    category: 'Hackathon' | 'Team' | 'User' | 'Project' | 'AI Suggestion';
    type: 'hackathon' | 'team' | 'user' | 'project' | 'ai';
    url?: string;
    metadata?: {
        status?: string;
        date?: string;
        members?: number;
        prize?: number;
        skills?: string[];
    };
}

const FloatingSearch: React.FC = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [showAISuggestions, setShowAISuggestions] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const theme = useTheme();
    const router = useRouter();

    // Search functionality with debouncing
    const performSearch = useCallback(async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            setShowAISuggestions(false);
            return;
        }

        setLoading(true);
        try {
            // Search hackathons, teams, users, and projects in parallel
            const [hackathonsRes, teamsRes, usersRes] = await Promise.allSettled([
                fetch(`/api/search?type=hackathons&q=${encodeURIComponent(query)}&limit=3`),
                fetch(`/api/search?type=teams&q=${encodeURIComponent(query)}&limit=2`),
                fetch(`/api/search?type=users&q=${encodeURIComponent(query)}&limit=2`)
            ]);

            const results: SearchResult[] = [];

            // Process hackathons
            if (hackathonsRes.status === 'fulfilled' && hackathonsRes.value.ok) {
                const hackathons = await hackathonsRes.value.json();
                hackathons.forEach((hackathon: any) => {
                    results.push({
                        id: hackathon.id,
                        title: hackathon.title,
                        description: hackathon.description || hackathon.theme,
                        category: 'Hackathon',
                        type: 'hackathon',
                        url: `/hackathons/${hackathon.id}`,
                        metadata: {
                            status: hackathon.status,
                            date: hackathon.start_date,
                            prize: hackathon.prize_pool
                        }
                    });
                });
            }

            // Process teams
            if (teamsRes.status === 'fulfilled' && teamsRes.value.ok) {
                const teams = await teamsRes.value.json();
                teams.forEach((team: any) => {
                    results.push({
                        id: team.id,
                        title: team.name,
                        description: team.description,
                        category: 'Team',
                        type: 'team',
                        url: `/teams/${team.id}`,
                        metadata: {
                            members: team.current_members?.length || 0,
                            skills: team.skills_needed
                        }
                    });
                });
            }

            // Process users
            if (usersRes.status === 'fulfilled' && usersRes.value.ok) {
                const users = await usersRes.value.json();
                users.forEach((user: any) => {
                    results.push({
                        id: user.id,
                        title: user.full_name || user.username,
                        description: `${user.role} • ${user.skills?.join(', ') || 'No skills listed'}`,
                        category: 'User',
                        type: 'user',
                        url: `/profile/${user.id}`,
                        metadata: {
                            skills: user.skills
                        }
                    });
                });
            }

            // Add AI suggestions if we have some results but want to enhance them
            if (results.length > 0 && results.length < 5) {
                setShowAISuggestions(true);
                try {
                    // Generate AI suggestions based on search query
                    const aiSuggestions = await generateAISuggestions(query);
                    results.push(...aiSuggestions);
                } catch (aiError) {
                    console.warn('AI suggestions failed:', aiError);
                }
            }

            setSearchResults(results);
        } catch (error) {
            console.error('Search failed:', error);
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Debounced search effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            performSearch(searchQuery);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, performSearch]);

    // AI suggestions generator
    const generateAISuggestions = async (query: string): Promise<SearchResult[]> => {
        // Use the existing AI service to generate relevant suggestions
        const suggestions = await hackathonAI.generateProjectIdeas(
            `Search: ${query}`,
            ['JavaScript', 'Python', 'React', 'Node.js'], // Common skills
            'INTERMEDIATE',
            '48 hours',
            2
        );

        return suggestions.map((suggestion, index) => ({
            id: `ai-${index}`,
            title: `💡 ${suggestion.title}`,
            description: suggestion.description,
            category: 'AI Suggestion',
            type: 'ai',
            metadata: {
                skills: suggestion.required_skills
            }
        }));
    };

    // Handle clicking outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsExpanded(false);
                setSearchQuery('');
                setSearchResults([]);
            }
        };


        if (isExpanded) {
            document.body.style.overflow = 'hidden';
            document.addEventListener('mousedown', handleClickOutside);

        } else {
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isExpanded]);

    // Focus input when expanded
    useEffect(() => {
        if (isExpanded && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isExpanded]);

    const handleExpand = () => {
        setIsExpanded(true);
    };

    const handleClose = () => {
        setIsExpanded(false);
        setSearchQuery('');
        setSearchResults([]);
    };

    const getCategoryColor = (category: string) => {
        const colors = {
            'Hackathon': { backgroundColor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main },
            'Team': { backgroundColor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main },
            'User': { backgroundColor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main },
            'Project': { backgroundColor: alpha(theme.palette.secondary.main, 0.1), color: theme.palette.secondary.main },
            'AI Suggestion': { backgroundColor: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.main },
        };
        return colors[category as keyof typeof colors] || { backgroundColor: alpha(theme.palette.grey[500], 0.1), color: theme.palette.grey[700] };
    };

    const handleResultClick = (result: SearchResult) => {
        if (result.url) {
            router.push(result.url);
        }
        handleClose();
    };

    return (
        <Box
            ref={searchRef}
            sx={{
                position: 'relative',
                zIndex: 50,
                transition: 'all 0.3s ease-out',
                width: isExpanded ? 384 : 48,
                height: isExpanded ? 'auto' : 48,
            }}
        >
            {!isExpanded ? (
                <IconButton
                    onClick={handleExpand}
                    sx={{
                        width: 48,
                        height: 48,
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.text.secondary,
                        '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.2),
                            color: theme.palette.primary.main,
                            transform: 'scale(1.05)',
                        },
                        transition: 'all 0.2s ease-in-out',
                    }}
                >
                    <Search size={20} />
                </IconButton>
            ) : (
                <Paper
                    elevation={3}
                    sx={{
                        borderRadius: 2,
                        overflow: 'hidden',
                        backgroundColor: theme.palette.background.paper,
                    }}
                >
                    <Box sx={{ p: 2 }}>
                        <TextField
                            inputRef={inputRef}
                            fullWidth
                            placeholder="Search hackathons, teams, users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            variant="outlined"
                            size="small"
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            {loading ? (
                                                <CircularProgress size={20} sx={{ color: theme.palette.text.secondary }} />
                                            ) : (
                                                <Search size={20} color={theme.palette.text.secondary} />
                                            )}
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={handleClose}
                                                size="small"
                                                sx={{ color: theme.palette.text.secondary }}
                                            >
                                                <X size={16} />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: 'transparent',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'transparent',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'transparent',
                                    },
                                },
                            }}
                        />
                    </Box>

                    {isExpanded && (
                        <motion.div
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1, duration: 0.2, ease: 'easeInOut' }}
                        >
                            <Paper
                                elevation={0}
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    zIndex: -1,
                                    mt: 10,
                                    p: 2,
                                    backgroundColor: theme.palette.background.paper,
                                    border: `1px solid ${theme.palette.divider}`,
                                    borderRadius: 3,
                                    boxShadow: theme.shadows[8],
                                }}
                            >
                                <Box sx={{ maxHeight: 320, overflow: 'auto' }}>
                                    {searchQuery.trim() ? (
                                        searchResults.length > 0 ? (
                                            <Box sx={{ p: 1 }}>
                                                {searchResults.map((result, index) => (
                                                    <Box key={result.id}>
                                                        {result.type === 'ai' && index === searchResults.findIndex(r => r.type === 'ai') && (
                                                            <>
                                                                <Divider sx={{ my: 1 }} />
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1 }}>
                                                                    <Sparkles size={16} color={theme.palette.warning.main} />
                                                                    <Typography variant="caption" color="text.secondary" fontWeight="medium">
                                                                        AI Suggestions
                                                                    </Typography>
                                                                </Box>
                                                            </>
                                                        )}
                                                        <Box
                                                            onClick={() => handleResultClick(result)}
                                                            sx={{
                                                                p: 2,
                                                                borderRadius: 2,
                                                                cursor: 'pointer',
                                                                transition: 'all 0.2s ease-in-out',
                                                                '&:hover': {
                                                                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                                                                },
                                                            }}
                                                        >
                                                            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                                    <Typography
                                                                        variant="body2"
                                                                        fontWeight="medium"
                                                                        sx={{
                                                                            color: theme.palette.text.primary,
                                                                            mb: 0.5,
                                                                            overflow: 'hidden',
                                                                            textOverflow: 'ellipsis',
                                                                            whiteSpace: 'nowrap',
                                                                            '&:hover': {
                                                                                color: theme.palette.primary.main,
                                                                            },
                                                                        }}
                                                                    >
                                                                        {result.title}
                                                                    </Typography>
                                                                    <Typography
                                                                        variant="caption"
                                                                        sx={{
                                                                            color: theme.palette.text.secondary,
                                                                            display: '-webkit-box',
                                                                            WebkitLineClamp: 2,
                                                                            WebkitBoxOrient: 'vertical',
                                                                            overflow: 'hidden',
                                                                            mb: result.metadata ? 0.5 : 0,
                                                                        }}
                                                                    >
                                                                        {result.description}
                                                                    </Typography>
                                                                    {result.metadata && (
                                                                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                                                                            {result.metadata.status && (
                                                                                <Chip
                                                                                    label={result.metadata.status.replace('_', ' ')}
                                                                                    size="small"
                                                                                    variant="outlined"
                                                                                    sx={{ fontSize: '0.7rem', height: 18 }}
                                                                                />
                                                                            )}
                                                                            {result.metadata.members !== undefined && (
                                                                                <Chip
                                                                                    label={`${result.metadata.members} members`}
                                                                                    size="small"
                                                                                    variant="outlined"
                                                                                    sx={{ fontSize: '0.7rem', height: 18 }}
                                                                                />
                                                                            )}
                                                                            {result.metadata.prize && (
                                                                                <Chip
                                                                                    label={`$${result.metadata.prize.toLocaleString()}`}
                                                                                    size="small"
                                                                                    variant="outlined"
                                                                                    sx={{ fontSize: '0.7rem', height: 18 }}
                                                                                />
                                                                            )}
                                                                        </Box>
                                                                    )}
                                                                </Box>
                                                                <Chip
                                                                    label={result.category}
                                                                    size="small"
                                                                    sx={{
                                                                        ml: 1,
                                                                        ...getCategoryColor(result.category),
                                                                    }}
                                                                />
                                                            </Box>
                                                        </Box>
                                                    </Box>
                                                ))}
                                            </Box>
                                        ) : (
                                            <Box sx={{ p: 6, textAlign: 'center' }}>
                                                <Box
                                                    sx={{
                                                        width: 48,
                                                        height: 48,
                                                        backgroundColor: alpha(theme.palette.grey[500], 0.1),
                                                        borderRadius: '50%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        mx: 'auto',
                                                        mb: 2,
                                                    }}
                                                >
                                                    <Search size={24} color={theme.palette.text.secondary} />
                                                </Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    No results found for "{searchQuery}"
                                                </Typography>
                                            </Box>
                                        )
                                    ) : (
                                        <Box sx={{ p: 6, textAlign: 'center' }}>
                                            <Box
                                                sx={{
                                                    width: 48,
                                                    height: 48,
                                                    background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    mx: 'auto',
                                                    mb: 2,
                                                }}
                                            >
                                                <Search size={24} color={theme.palette.info.main} />
                                            </Box>
                                            <Typography variant="body2" fontWeight="medium" color="text.primary" sx={{ mb: 0.5 }}>
                                                Search with AI
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Find hackathons, teams, users, and get AI suggestions
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Paper>
                        </motion.div>
                    )}
                </Paper>
            )}
        </Box>
    );
};

export default FloatingSearch;