'use client'

import React, {useState, useEffect} from 'react'
import Link from 'next/link'
import {AppBar, Toolbar, Button, Box, CircularProgress, useTheme, IconButton} from '@mui/material'
import {Brightness4, Brightness7} from '@mui/icons-material'
import {auth} from '@/lib/auth'
import type {AuthUser} from '@/lib/auth'
import {useAppTheme} from '@/contexts/ThemeContext'
import ProfileDropdown from "@/components/layout/navbar/profile";
import FloatingSearch from "@/components/layout/navbar/search";
import Image from "next/image";

interface NavbarProps {
    onMenuClick?: () => void
}

export const Navbar: React.FC<NavbarProps> = ({onMenuClick: _onMenuClick}) => {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [loading, setLoading] = useState(true)
    const theme = useTheme()
    const { mode, setMode } = useAppTheme()

    const navButtonStyle = {
        borderRadius: '20px',
        border: `1px solid ${theme.palette.primary.light}`,
        backgroundColor: theme.palette.primary.light,
        color: theme.palette.primary.contrastText,
        px: 3,
        py: 0.5,
        '&:hover': {
            backgroundColor: theme.palette.primary.main,
            border: `1px solid ${theme.palette.primary.main}`
        }
    }

    useEffect(() => {
        const getUser = async () => {
            try {
                const currentUser = await auth.getCurrentUser()
                setUser(currentUser)
            } catch (error) {
                console.error('Error fetching user:', error)
            } finally {
                setLoading(false)
            }
        }

        getUser()
    }, [])


    return (
        <AppBar position="fixed" sx={{ backgroundColor: theme.palette.background.paper, boxShadow: 1 }}>
            <Toolbar sx={{ maxWidth: '1280px', mx: 'auto', width: '100%', px: { xs: 2, sm: 3, lg: 4 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                        <Box sx={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Image src="/logo-favicon.ico" alt="HackHub Logo" width={32} height={32} />
                        </Box>
                        <Box sx={{ height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Image src="/logo-text.png" alt="HackHub Logo" width={88} height={32} />
                        </Box>
                    </Link>

                    <Box sx={{ display: { xs: 'none', md: 'flex' }, ml: 5, gap: 1 }}>
                        <Link href="/hackathons" style={{ textDecoration: 'none' }}>
                            <Button variant="outlined" sx={navButtonStyle}>
                                Discover
                            </Button>
                        </Link>
                        {user && user.role === 'ORGANIZER' && (
                            <Link href="/dashboard/organize" style={{ textDecoration: 'none' }}>
                                <Button variant="outlined" sx={navButtonStyle}>
                                    Organize
                                </Button>
                            </Link>
                        )}
                        {user && (
                            <>
                                <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                                    <Button variant="outlined" sx={navButtonStyle}>
                                        Dashboard
                                    </Button>
                                </Link>
                                <Link href="/dashboard/settings" style={{ textDecoration: 'none' }}>
                                    <Button variant="outlined" sx={navButtonStyle}>
                                        Settings
                                    </Button>
                                </Link>
                            </>
                        )}
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {loading ? (
                        <CircularProgress size={24} sx={{ color: theme.palette.primary.main }} />
                    ) : user ? null : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Link href="/auth/signin" style={{ textDecoration: 'none' }}>
                                <Button variant="text" size="small" sx={{ color: theme.palette.text.primary }}>
                                    Sign In
                                </Button>
                            </Link>
                            <Link href="/auth/signup" style={{ textDecoration: 'none' }}>
                                <Button variant="contained" size="small" sx={{ backgroundColor: theme.palette.primary.main, '&:hover': { backgroundColor: theme.palette.primary.dark } }}>
                                    Sign Up
                                </Button>
                            </Link>
                        </Box>
                    )}
                    
                    <IconButton
                        onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
                        color="inherit"
                        sx={{ ml: 1 }}
                    >
                        {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
                    </IconButton>
                    
                    <FloatingSearch/>
                    <ProfileDropdown user={user} isLoading={!user || loading}/>
                </Box>
            </Toolbar>
        </AppBar>
    )
}