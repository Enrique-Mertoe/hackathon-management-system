import React, {useState} from 'react';
import {
    Plus,
    User,
    Package,
    Router,
    Users,
    UserCheck,
    Wifi,
    WifiOff,
    Circle
} from 'lucide-react';

// Custom Badge Component
const CartBadge: React.FC<{ badgeContent: number; children: React.ReactNode }> = ({badgeContent, children}) => (
    <div className="relative">
        {children}
        <div
            className="absolute -top-1 -right-1 min-w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center px-1">
            {badgeContent}
        </div>
    </div>
);

// Custom Icon Button Component
const IconButton: React.FC<{
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    size?: 'large' | 'medium';
}> = ({children, onClick, className = '', size = 'medium'}) => {
    const sizeClasses = size === 'large' ? 'p-3' : 'p-2';
    return (
        <button
            onClick={onClick}
            className={`${sizeClasses} hover:bg-gray-100 transition-all duration-200 ease-in-out hover:scale-105 ${className}`}
        >
            {children}
        </button>
    );
};

// MTK Component placeholder
const Mtk: React.FC<{ width: number }> = ({width}) => (
    <div
        className="flex items-center justify-center bg-gray-200 rounded"
        style={{width: `${width}px`, height: `${width * 0.6}px`}}
    >
        <span className="text-xs font-semibold text-gray-600">MTK</span>
    </div>
);

// ISPOverview Component placeholder
const ISPOverview: React.FC = () => (
    <div className="p-4 bg-[#f5f6fa] rounded">
        <h3 className="text-sm font-semibold text-gray-700">ISP Overview</h3>
    </div>
);

const DashStat: React.FC = () => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleMenuItemClick = (action: string) => {
        console.log('Menu item clicked:', action);
        handleClose();
    };

    return (
        <div
            className="!rounded-lg relative bg-[#f5f6fa] shadow-sm text-white mt-[3rem] mb-5 w-full">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-0 items-center justify-between">
                <div
                    className="shadow-sm relative px-3 rounded-t-lg -mt-[1.6rem] bg-[#f5f6fa] rounded-tr-[1.5rem] before:content-[''] before:h-2 before:inset-x-0 before:absolute before:-bottom-2 before:bg-[#f5f6fa] before:z-[1] after:content-[''] after:w-2 after:inset-y-0 after:absolute after:-right-2 after:bg-[#f5f6fa] after:z-[1]"
                >
                    <ISPOverview/>
                </div>

                <div className="bg-white px-3 relative h-24 z-[2] md:-mt-[4rem] mt-0 rounded-[2em] hidden md:flex">
                    <div className="flex w-full pb-2 justify-center items-end">
                        {/* Device Status Grid */}
                        <div className="flex justify-center gap-6 items-end w-full">
                            {/* Connected Devices */}
                            <div className="flex flex-row">
                                <div
                                    className="flex items-center space-x-1 bg-green-50 rounded-sm px-2 border border-green-200">
                                    <div className="flex items-center gap-1">
                                        <Wifi className="text-green-600 w-3 h-3"/>
                                        <Circle className="text-green-500 w-1 h-1 fill-current"/>
                                    </div>
                                    <span className="text-green-700 text-xs font-semibold">24</span>
                                    <span className="text-green-600 text-[9px] font-medium">Online</span>
                                </div>
                            </div>

                            <div className="flex flex-col">
                                <div className="relative">
                                    <Mtk width={48}/>
                                    <div
                                        className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                                </div>
                                {/* Total Status Bar */}
                                <div className="flex items-center gap-2 -mt-1">
                                    <div className="flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                                        <span className="text-slate-600 text-[10px] font-medium">Total: 27</span>
                                    </div>
                                </div>
                            </div>

                            {/* Disconnected Devices */}
                            <div
                                className="flex items-center space-x-1 bg-red-50 rounded-sm px-2 border border-red-200">
                                <div className="flex items-center gap-1">
                                    <WifiOff className="text-red-600 w-3 h-3"/>
                                    <Circle className="text-red-500 w-1 h-1 fill-current"/>
                                </div>
                                <span className="text-red-700 text-xs font-semibold">3</span>
                                <span className="text-red-600 text-[9px] font-medium">Offline</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className="flex justify-center md:justify-end shadow-sm relative px-3 !rounded-tl-[1.5rem] rounded-t-lg md:-mt-[1.6rem] bg-[#f5f6fa] before:content-[''] before:h-2 before:inset-x-0 before:absolute md:before:block before:hidden before:-bottom-2 before:bg-[#f5f6fa] before:z-[1] after:content-[''] after:w-2 after:inset-y-0 after:absolute after:-left-2 after:bg-[#f5f6fa] after:z-[1]"
                >
                    <div className="flex py-2 gap-2 md:gap-4">
                        <div className="relative">
                            <IconButton
                                className="!rounded-full"
                                size="large"
                                //@ts-ignore
                                onClick={handleClick}
                            >
                                <Plus
                                    className={`rounded-full text-green-500 border border-green-200 p-2 transition-transform duration-200 ease-in-out ${
                                        open ? 'rotate-45' : 'rotate-0'
                                    }`}
                                    size={48}
                                />
                            </IconButton>

                            {/* Custom Menu */}
                            {open && (
                                <>
                                    {/* Backdrop */}
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={handleClose}
                                    />

                                    {/* Menu */}
                                    <div
                                        className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-20 transform opacity-100 scale-100 transition-all duration-200 ease-in-out">
                                        <div className="py-1">
                                            <button
                                                onClick={() => handleMenuItemClick('create-client')}
                                                className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-all duration-200 ease-in-out hover:translate-x-1 flex items-center"
                                            >
                                                <div className="min-w-10">
                                                    <User className="text-green-600 w-4 h-4"/>
                                                </div>
                                                <span className="text-sm">Create Client</span>
                                            </button>

                                            <button
                                                onClick={() => handleMenuItemClick('create-package')}
                                                className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-all duration-200 ease-in-out hover:translate-x-1 flex items-center"
                                            >
                                                <div className="min-w-10">
                                                    <Package className="text-orange-600 w-4 h-4"/>
                                                </div>
                                                <span className="text-sm">Create Package</span>
                                            </button>

                                            <button
                                                onClick={() => handleMenuItemClick('add-device')}
                                                className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-all duration-200 ease-in-out hover:translate-x-1 flex items-center"
                                            >
                                                <div className="min-w-10">
                                                    <Router className="text-blue-600 w-4 h-4"/>
                                                </div>
                                                <span className="text-sm">Add Device</span>
                                            </button>

                                            <button
                                                onClick={() => handleMenuItemClick('add-user')}
                                                className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-all duration-200 ease-in-out hover:translate-x-1 flex items-center"
                                            >
                                                <div className="min-w-10">
                                                    <Users className="text-orange-500 w-4 h-4"/>
                                                </div>
                                                <span className="text-sm">Add User</span>
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="hidden md:flex gap-2 md:gap-4">
                            <IconButton className="!rounded-full" size="large">
                                <CartBadge badgeContent={2}>
                                    <UserCheck className="rounded-full border border-gray-200 p-2" size={48}/>
                                </CartBadge>
                            </IconButton>

                            <IconButton className="!rounded-full" size="large">
                                <CartBadge badgeContent={2}>
                                    <Plus className="rounded-full border border-gray-200 p-2" size={48}/>
                                </CartBadge>
                            </IconButton>
                        </div>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2">
                <div className="">

                </div>
                <div className="p-3">
                    <div className="grid grid-cols-3 gap-2">
                        {/* Live Events */}
                        <div className="group h-full relative">
                            <div
                                className="absolute inset-0 bg-gradient-to-br from-green-500/30 to-emerald-500/30 rounded-md blur opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                            <div
                                className="relative h-full bg-background/90 backdrop-blur border border-green-500/20 rounded-md p-2 px-4 hover:scale-105 transition-all duration-300">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span
                                        className="text-xs font-bold text-green-600 uppercase tracking-wider">Live</span>
                                </div>
                                <div className="text-3xl font-bold text-foreground mb-1">0</div>
                                <div className="text-sm text-muted-foreground">Active Events</div>
                            </div>
                        </div>
                        {/* Total Reach */}
                        <div className="group h-full relative">
                            <div
                                className="absolute  inset-0 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-md blur opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                            <div
                                className="relative h-full bg-background/90 backdrop-blur border border-blue-500/20 rounded-md p-2 px-4 hover:scale-105 transition-all duration-300">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span
                                        className="text-xs font-bold text-blue-600 uppercase tracking-wider">Reach</span>
                                </div>
                                <div className="text-3xl font-bold text-foreground mb-1">0</div>
                                <div className="text-sm text-muted-foreground">Total Participants</div>
                            </div>
                        </div>

                        <div className="flex  flex-col gap-1">


                            {/* Events Created */}
                            <div className="group relative">
                                <div
                                    className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-md blur opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                                <div
                                    className="relative bg-background/90 px-3 p-1 backdrop-blur border border-purple-500/20 rounded-sm hover:scale-105 transition-all duration-300">
                                    <div className="flex items-center gap-1 mb-1">
                                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                        <span
                                            className="text-xs font-bold text-purple-600 uppercase tracking-wider">Created</span>
                                        <div className="font-bold text-foreground ms-auto mb-1">0</div>
                                    </div>

                                </div>
                            </div>

                            {/* Success Rate */}
                            <div className="group relative">
                                <div
                                    className="absolute inset-0 bg-gradient-to-br from-orange-500/30 to-red-500/30 rounded-sm blur opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                                <div
                                    className="relative bg-background/90 backdrop-blur border border-orange-500/20 rounded-sm p-1 px-3 hover:scale-105 transition-all duration-300">
                                    <div className="flex items-center justify-between">
                                        <div className="text-3xl font-bold text-foreground mb-1">--</div>
                                        <span
                                            className="text-xs font-bold text-orange-600 uppercase tracking-wider">Impact</span>
                                    </div>

                                    <div className="text-sm text-muted-foreground">Success Rate</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashStat;