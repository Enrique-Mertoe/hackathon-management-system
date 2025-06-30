import React, {useState, useRef, useEffect} from 'react';
import {ChevronDown, User, Settings, HelpCircle, LogOut, Bell, Shield} from 'lucide-react';
import {auth} from '@/lib/auth'

interface ProfileDropdownProps {
    user?: any;
    isLoading?: boolean;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
                                                             user,
                                                             isLoading = false
                                                         }) => {

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Handle clicking outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
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
        <div className="relative" ref={dropdownRef}>
            {isLoading ? (
                <ProfileSkeleton/>
            ) : (
                <button
                    onClick={toggleDropdown}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-all duration-200 group"
                >
                    {/* Avatar */}
                    <div className="relative">
                        {user.avatar ? (
                            <img
                                src={user.avatar}
                                alt={user.username}
                                className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-100"
                            />
                        ) : (
                            <div
                                className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {getInitials(user.username)}
                      </span>
                            </div>
                        )}
                        <div
                            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                    </div>

                    {/* Name */}
                    <div className="hidden sm:block text-left">
                        <p className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                            {user.username.split(' ')[0]}
                        </p>
                        <p className="text-xs text-gray-500">
                            {user.role}
                        </p>
                    </div>

                    {/* Chevron */}
                    <ChevronDown
                        className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                            isOpen ? 'rotate-180' : 'rotate-0'
                        }`}
                    />
                </button>
            )}

            {/* Dropdown */}
            {!isLoading && (
                <div
                    className={`absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-200 origin-top-right z-50 ${
                        isOpen
                            ? 'opacity-100 scale-100 translate-y-0'
                            : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                    }`}>
                    {/* User Info Header */}
                    <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                            {user.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt={user.username}
                                    className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm"
                                />
                            ) : (
                                <div
                                    className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {getInitials(user.username)}
                        </span>
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">{user.username}</p>
                                <p className="text-sm text-gray-600 truncate">{user.email}</p>
                                <div className="flex items-center mt-1">
                                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                    <span className="text-xs text-gray-500">Online</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                        {menuItems.map((item, index) => (
                            <button
                                key={index}
                                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors group"
                            >
                                <div className="flex items-center space-x-3">
                                    <item.icon className="w-4 h-4 text-gray-500 group-hover:text-gray-700"/>
                                    <span className="text-sm text-gray-700 group-hover:text-gray-900">
                          {item.label}
                        </span>
                                    {item.badge && (
                                        <span
                                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {item.badge}
                          </span>
                                    )}
                                </div>
                                {item.shortcut && (
                                    <span className="text-xs text-gray-400 font-mono">
                          {item.shortcut}
                        </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200"></div>

                    {/* Logout */}
                    <div className="py-2">
                        <button
                            onClick={handleSignOut}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-red-50 transition-colors group">
                            <LogOut className="w-4 h-4 text-gray-500 group-hover:text-red-600"/>
                            <span className="text-sm text-gray-700 group-hover:text-red-700">
                      Sign out
                    </span>
                        </button>
                    </div>
                </div>
            )}
        </div>


    );
};
const ProfileSkeleton: React.FC = () => (
    <div className="flex items-center space-x-3 p-2 rounded-lg animate-pulse">
        {/* Avatar Skeleton */}
        <div className="w-8 h-8 bg-gray-300 rounded-full"></div>

        {/* Name Skeleton */}
        <div className="hidden sm:block space-y-1">
            <div className="w-16 h-3 bg-gray-300 rounded"></div>
            <div className="w-12 h-2 bg-gray-200 rounded"></div>
        </div>

        {/* Chevron Skeleton */}
        <div className="w-4 h-4 bg-gray-300 rounded"></div>
    </div>
);

export default ProfileDropdown;