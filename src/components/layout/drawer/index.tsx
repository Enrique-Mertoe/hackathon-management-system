'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { auth } from '@/lib/auth'
import type { AuthUser } from '@/lib/auth'
import {
  Box,
  Drawer as MuiDrawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  Explore as ExploreIcon,
  Groups as GroupsIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
  Logout as LogoutIcon,
  Business as BusinessIcon,
  Analytics as AnalyticsIcon,
  Gavel as GavelIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function Drawer({ isOpen, onClose }: DrawerProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null)
  const pathname = usePathname()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const drawerWidth = isMobile ? 280 : 88
  const maxVisibleItems = isMobile ? 8 : 4

  useEffect(() => {
    const getUser = async () => {
      try {
        const currentUser = await auth.getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error('Error fetching user:', error)
      }
    }

    void getUser()
  }, [])

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: <DashboardIcon />,
      requireAuth: true
    },
    {
      name: 'Discover',
      href: '/discover',
      icon: <ExploreIcon />
    },
    {
      name: 'Teams',
      href: '/dashboard/teams',
      icon: <GroupsIcon />
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: <SettingsIcon />,
      requireAuth: true
    }
  ]

  const organizationItems = [
    {
      name: 'Organize',
      href: '/dashboard/organize',
      icon: <BusinessIcon />,
      requireRole: ['ORGANIZER', 'ADMIN']
    },
    {
      name: 'Analytics',
      href: '/dashboard/analytics',
      icon: <AnalyticsIcon />,
      requireRole: ['ORGANIZER', 'ADMIN']
    },
    {
      name: 'Judging',
      href: '/judging',
      icon: <GavelIcon />,
      requireRole: ['JUDGE', 'ADMIN']
    }
  ]

  const authItems = user ? [
    {
      name: 'Profile',
      href: '/dashboard/profile',
      icon: <PersonIcon />
    },
    {
      name: 'Sign Out',
      href: '/auth/signout',
      icon: <LogoutIcon />
    }
  ] : [
    {
      name: 'Sign In',
      href: '/auth/signin',
      icon: <LoginIcon />
    },
    {
      name: 'Sign Up',
      href: '/auth/signup',
      icon: <PersonAddIcon />
    }
  ]
  const shouldShowItem = (item: any) => {
    // if (item.requireAuth && !user) return false
    // if (item.requireRole && (!user || !item.requireRole.includes(user.role))) return false
    return true
  }

  const shouldShowOrganization = () => {
    return user && (user.role === 'ORGANIZER' || user.role === 'ADMIN' || user.role === 'JUDGE')
  }
  // Combine all items and separate visible from overflow
  const allItems = [
    ...navItems.filter(shouldShowItem),
    ...organizationItems.filter(shouldShowItem),
    ...authItems
  ]
  
  const visibleItems = allItems.slice(0, maxVisibleItems)
  const overflowItems = allItems.slice(maxVisibleItems)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setMenuAnchorEl(null)
  }

  const handleMenuItemClick = (href: string) => {
    handleMenuClose()
    onClose()
  }



  const isActive = (href: string) => {
    return pathname === href
  }

  const renderNavItem = (item: any) => (
    <ListItem key={item.name} disablePadding>
      <Link href={item.href} onClick={onClose} style={{ textDecoration: 'none', width: '100%' }}>
        <Tooltip title={!isMobile ? item.name : ''} placement="right">
          <ListItemButton
            selected={isActive(item.href)}
            sx={{
              flexDirection: isMobile ? 'row' : 'column',
              justifyContent: 'center',
              minHeight: isMobile ? 48 : 64,
              px: isMobile ? 3 : 1,
              py: isMobile ? 1.5 : 1,
              borderRadius: 1,
              mx: 1,
              my: 0.5,
              '&.Mui-selected': {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                },
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: isMobile ? 40 : 'auto',
                mr: isMobile ? 2 : 0,
                mb: isMobile ? 0 : 0.5,
                justifyContent: 'center',
                color: isActive(item.href) ? 'inherit' : theme.palette.text.secondary,
              }}
            >
              {item.icon}
            </ListItemIcon>
            {isMobile && (
              <ListItemText
                primary={item.name}
                slotProps={{
                  primary: {
                    sx: {
                      fontSize: 14,
                      fontWeight: isActive(item.href) ? 600 : 500,
                    }
                  }
                }}
              />
            )}
            {!isMobile && (
              <Typography
                variant="caption"
                sx={{
                  fontSize: 10,
                  fontWeight: isActive(item.href) ? 600 : 500,
                  textAlign: 'center',
                  lineHeight: 1.2,
                }}
              >
                {item.name}
              </Typography>
            )}
          </ListItemButton>
        </Tooltip>
      </Link>
    </ListItem>
  )

  const drawerContent = (
    <Box sx={{ width: "100%", height: '100%' }}>
      <List sx={{pb: 1 }}>
        {/* Visible Navigation Items */}
        {visibleItems.map(renderNavItem)}

        {/* Overflow Menu */}
        {overflowItems.length > 0 && (
          <ListItem disablePadding>
            <Tooltip title={!isMobile ? 'More' : ''} placement="right">
              <ListItemButton
                onClick={handleMenuOpen}
                sx={{
                  flexDirection: isMobile ? 'row' : 'column',
                  justifyContent: 'center',
                  minHeight: isMobile ? 48 : 64,
                  px: isMobile ? 3 : 1,
                  py: isMobile ? 1.5 : 1,
                  borderRadius: 1,
                  mx: 1,
                  my: 0.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: isMobile ? 40 : 'auto',
                    mr: isMobile ? 2 : 0,
                    mb: isMobile ? 0 : 0.5,
                    justifyContent: 'center',
                    color: theme.palette.text.secondary,
                  }}
                >
                  <MoreVertIcon />
                </ListItemIcon>
                {isMobile && (
                  <ListItemText
                    primary="More"
                    slotProps={{
                      primary: {
                        sx: {
                          fontSize: 14,
                          fontWeight: 500,
                        }
                      }
                    }}
                  />
                )}
                {!isMobile && (
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: 10,
                      fontWeight: 500,
                      textAlign: 'center',
                      lineHeight: 1.2,
                    }}
                  >
                    More
                  </Typography>
                )}
              </ListItemButton>
            </Tooltip>
          </ListItem>
        )}
      </List>

      {/* Overflow Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: isMobile ? 'left' : 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: isMobile ? 'right' : 'left',
        }}
      >
        {overflowItems.map((item) => (
          <MenuItem
            key={item.name}
            onClick={() => handleMenuItemClick(item.href)}
            selected={isActive(item.href)}
          >
            <Link href={item.href} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', width: '100%' }}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.name} />
            </Link>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  )

  return (
    <>
      {/* Mobile drawer */}
      {isMobile && (
        <MuiDrawer
          variant="temporary"
          open={true}
          onClose={onClose}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
        >
          {drawerContent}
        </MuiDrawer>
      )}

      {/* Desktop drawer */}
      {!isMobile && (
        <MuiDrawer
          variant="permanent"
          open
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              position: 'fixed',
              top: 0,
              zIndex: theme.zIndex.appBar - 1,
              pt: 10, // Account for navbar height
              height: 'calc(100vh)',
              overflow: 'auto',
            },
          }}
        >
          {drawerContent}
        </MuiDrawer>
      )}
    </>
  )
}

export default Drawer