import React, {useState, useRef, useEffect} from 'react';
import {Search, X} from 'lucide-react';
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
    alpha
} from '@mui/material';


interface SearchResult {
    id: number;
    title: string;
    description: string;
    category: string;
}

const FloatingSearch: React.FC = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const theme = useTheme();

    // Mock search data
    const mockData: SearchResult[] = [
        {
            id: 1,
            title: 'Getting Started with React',
            description: 'Learn the basics of React development',
            category: 'Tutorial'
        },
        {
            id: 2,
            title: 'Advanced TypeScript Patterns',
            description: 'Explore complex TypeScript patterns and best practices',
            category: 'Guide'
        },
        {
            id: 3,
            title: 'Tailwind CSS Components',
            description: 'Beautiful pre-built components using Tailwind',
            category: 'Component'
        },
        {
            id: 4,
            title: 'State Management Solutions',
            description: 'Compare different state management libraries',
            category: 'Article'
        },
        {
            id: 5,
            title: 'Performance Optimization',
            description: 'Tips for optimizing React application performance',
            category: 'Guide'
        },
        {
            id: 6,
            title: 'Testing Best Practices',
            description: 'How to write effective tests for your components',
            category: 'Tutorial'
        },
    ];

    // Handle search functionality
    useEffect(() => {
        if (searchQuery.trim()) {
            const filtered = mockData.filter(item =>
                item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setSearchResults(filtered);
        } else {
            setSearchResults([]);
        }
    }, [searchQuery]);

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
            'Tutorial': { backgroundColor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main },
            'Guide': { backgroundColor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main },
            'Component': { backgroundColor: alpha(theme.palette.secondary.main, 0.1), color: theme.palette.secondary.main },
            'Article': { backgroundColor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main },
        };
        return colors[category as keyof typeof colors] || { backgroundColor: alpha(theme.palette.grey[500], 0.1), color: theme.palette.grey[700] };
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
                            placeholder="Search anything..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            variant="outlined"
                            size="small"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search size={20} color={theme.palette.text.secondary} />
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
                                                {searchResults.map((result) => (
                                                    <Box
                                                        key={result.id}
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
                                                                    }}
                                                                >
                                                                    {result.description}
                                                                </Typography>
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
                                                Start searching
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Type to find tutorials, guides, and more
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