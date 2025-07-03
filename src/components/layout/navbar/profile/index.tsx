import React, {useState} from 'react';
import {ChevronDown, User, Settings, HelpCircle, LogOut, Bell, Shield} from 'lucide-react';
import {auth} from '@/lib/auth'
import {
    Avatar,
    Box,
    Button,
    Chip,
    Divider,
    Menu,
    MenuItem,
    Skeleton,
    Typography,
    useTheme,
    alpha,
    Badge
} from '@mui/material';

interface ProfileDropdownProps {
    user?: any;
    isLoading?: boolean;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
                                                             user,
                                                             isLoading = false
                                                         }) => {

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const theme = useTheme();
    const isOpen = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const menuItems = [
        {icon: User, label: 'My Profile', shortcut: '⌘P'},
        {icon: Settings, label: 'Settings', shortcut: '⌘S'},
        {icon: Bell, label: 'Notifications', shortcut: '⌘N', badge: '3'},
        {icon: Shield, label: 'Privacy & Security'},
        {icon: HelpCircle, label: 'Help & Support'},
    ];
    const handleSignOut = async () => {
        try {
            await auth.signOut()
            window.location.href = "/"
        } catch (error) {
            console.error('Error signing out:', error)
        }
    }
    const getInitials = (name: string) => {
        console.log(name, user)
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };
    return (
        <Box>
            {isLoading ? (
                <ProfileSkeleton/>
            ) : (
                <Button
                    onClick={handleClick}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        p: 1,
                        borderRadius: 2,
                        textTransform: 'none',
                        color: theme.palette.text.primary,
                        '&:hover': {
                            backgroundColor: alpha(theme.palette.action.hover, 0.04),
                        },
                        transition: 'all 0.2s ease-in-out',
                    }}
                >
                    <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        badgeContent={
                            <Box
                                sx={{
                                    width: 12,
                                    height: 12,
                                    backgroundColor: theme.palette.success.main,
                                    borderRadius: '50%',
                                    border: `2px solid ${theme.palette.background.paper}`,
                                }}
                            />
                        }
                    >
                        <Avatar
                            src={user?.avatar}
                            sx={{
                                width: 32,
                                height: 32,
                                background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                fontSize: '0.875rem',
                                fontWeight: 500,
                            }}
                        >
                            {getInitials(user?.username || '')}
                        </Avatar>
                    </Badge>

                    <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'left' }}>
                        <Typography variant="body2" fontWeight="medium" color="text.primary">
                            {user?.username?.split(' ')[0]}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {user?.role}
                        </Typography>
                    </Box>

                    <ChevronDown
                        size={16}
                        style={{
                            color: theme.palette.text.secondary,
                            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s ease-in-out',
                        }}
                    />
                </Button>
            )}

            <Menu
                anchorEl={anchorEl}
                open={isOpen}
                onClose={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                slotProps={{
                    paper: {
                        sx: {
                            width: 288,
                            mt: 1,
                            borderRadius: 3,
                            boxShadow: theme.shadows[8],
                            border: `1px solid ${theme.palette.divider}`,
                            overflow: 'visible',
                        },
                    }
                }}
            >
                <Box sx={{ p: 2, backgroundColor: alpha(theme.palette.action.hover, 0.02) }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                            src={user?.avatar}
                            sx={{
                                width: 48,
                                height: 48,
                                background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                fontSize: '1rem',
                                fontWeight: 500,
                            }}
                        >
                            {getInitials(user?.username || '')}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" fontWeight="medium" color="text.primary" noWrap>
                                {user?.username}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>
                                {user?.email}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                <Box
                                    sx={{
                                        width: 8,
                                        height: 8,
                                        backgroundColor: theme.palette.success.main,
                                        borderRadius: '50%',
                                        mr: 1,
                                    }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                    Online
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                <Box sx={{ py: 1 }}>
                    {menuItems.map((item, index) => (
                        <MenuItem
                            key={index}
                            onClick={handleClose}
                            sx={{
                                px: 2,
                                py: 1.5,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                '&:hover': {
                                    backgroundColor: alpha(theme.palette.action.hover, 0.04),
                                },
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <item.icon
                                    size={16}
                                    color={theme.palette.text.secondary}
                                />
                                <Typography variant="body2" color="text.primary">
                                    {item.label}
                                </Typography>
                                {item.badge && (
                                    <Chip
                                        label={item.badge}
                                        size="small"
                                        sx={{
                                            backgroundColor: alpha(theme.palette.error.main, 0.1),
                                            color: theme.palette.error.main,
                                            fontSize: '0.75rem',
                                            height: 20,
                                        }}
                                    />
                                )}
                            </Box>
                            {item.shortcut && (
                                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                                    {item.shortcut}
                                </Typography>
                            )}
                        </MenuItem>
                    ))}
                </Box>

                <Divider />

                <Box sx={{ py: 1 }}>
                    <MenuItem
                        onClick={handleSignOut}
                        sx={{
                            px: 2,
                            py: 1.5,
                            '&:hover': {
                                backgroundColor: alpha(theme.palette.error.main, 0.04),
                                '& .MuiTypography-root': {
                                    color: theme.palette.error.main,
                                },
                                '& svg': {
                                    color: theme.palette.error.main,
                                },
                            },
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <LogOut size={16} color={theme.palette.text.secondary} />
                            <Typography variant="body2" color="text.primary">
                                Sign out
                            </Typography>
                        </Box>
                    </MenuItem>
                </Box>
            </Menu>
        </Box>
    );
};
const ProfileSkeleton: React.FC = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1, borderRadius: 2 }}>
        <Skeleton variant="circular" width={32} height={32} />
        <Box sx={{ display: { xs: 'none', sm: 'block' }, gap: 0.5 }}>
            <Skeleton variant="text" width={64} height={14} />
            <Skeleton variant="text" width={48} height={10} />
        </Box>
        <Skeleton variant="rectangular" width={16} height={16} sx={{ borderRadius: 1 }} />
    </Box>
);

export default ProfileDropdown;