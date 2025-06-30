import React, { useState, useRef, useEffect } from 'react';
import { ArrowRightSquare, Plus, ChevronDown, ChevronUp } from 'lucide-react';

interface GridItem {
    id: string;
    name: string;
    avatar: string;
    status?: 'online' | 'offline' | 'away';
}

const OrgStaff: React.FC = () => {
    // Sample data - you can replace this with your actual data
    const [items] = useState<GridItem[]>([
        { id: '1', name: 'Sarah Chen', avatar: 'SC', status: 'online' },
        { id: '2', name: 'Mike Johnson', avatar: 'MJ', status: 'offline' },
        { id: '3', name: 'Emma Wilson', avatar: 'EW', status: 'online' },
        { id: '4', name: 'David Brown', avatar: 'DB', status: 'away' },
        { id: '5', name: 'Lisa Garcia', avatar: 'LG', status: 'online' },
        { id: '6', name: 'Tom Anderson', avatar: 'TA', status: 'offline' },
        { id: '7', name: 'Amy Taylor', avatar: 'AT', status: 'online' },
        { id: '8', name: 'John Davis', avatar: 'JD', status: 'away' },
    ]);

    const [showDropdown, setShowDropdown] = useState(false);
    const [visibleItems, setVisibleItems] = useState(6); // Show 6 initially in dropdown
    const [dropdownPosition, setDropdownPosition] = useState({
        top: true,
        left: true,
        transformOrigin: 'top left'
    });
    const [animateItems, setAnimateItems] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

    const shouldShowMoreButton = items.length > 4;
    const displayedItems = shouldShowMoreButton ? items.slice(0, 3) : items.slice(0, 4);
    const remainingItems = shouldShowMoreButton ? items.slice(3) : [];
    const remainingCount = remainingItems.length;

    // Calculate dropdown positioning based on screen constraints
    useEffect(() => {
        if (!showDropdown || !triggerRef.current) {
            setAnimateItems(false);
            return;
        }

        const calculatePosition = () => {
            const trigger = triggerRef.current!;
            const rect = trigger.getBoundingClientRect();
            const viewport = {
                width: window.innerWidth,
                height: window.innerHeight
            };

            // Estimated dropdown dimensions
            const dropdownWidth = 320; // Approximate width
            const dropdownHeight = Math.min(400, (visibleItems * 60) + 120); // Approximate height

            // Calculate available space
            const spaceBelow = viewport.height - rect.bottom - 10;
            const spaceAbove = rect.top - 10;
            const spaceRight = viewport.width - rect.left - 10;
            const spaceLeft = rect.right - 10;

            // Determine vertical positioning
            const shouldPositionAbove = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

            // Determine horizontal positioning
            const shouldPositionLeft = spaceRight < dropdownWidth && spaceLeft > spaceRight;

            // Set transform origin for smooth animations
            let transformOrigin = '';
            if (shouldPositionAbove && shouldPositionLeft) {
                transformOrigin = 'bottom right';
            } else if (shouldPositionAbove && !shouldPositionLeft) {
                transformOrigin = 'bottom left';
            } else if (!shouldPositionAbove && shouldPositionLeft) {
                transformOrigin = 'top right';
            } else {
                transformOrigin = 'top left';
            }

            setDropdownPosition({
                top: !shouldPositionAbove,
                left: !shouldPositionLeft,
                transformOrigin
            });
        };

        calculatePosition();

        // Recalculate on resize
        window.addEventListener('resize', calculatePosition);
        window.addEventListener('scroll', calculatePosition);

        return () => {
            window.removeEventListener('resize', calculatePosition);
            window.removeEventListener('scroll', calculatePosition);
        };
    }, [showDropdown, visibleItems]);

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'online': return 'bg-green-500';
            case 'offline': return 'bg-gray-400';
            case 'away': return 'bg-yellow-500';
            default: return 'bg-gray-400';
        }
    };

    const handleItemClick = (item: GridItem) => {
        console.log('Item clicked:', item);
    };

    const handleMoreClick = () => {
        if (!showDropdown) {
            setShowDropdown(true);
            // Trigger item animations after dropdown appears
            setTimeout(() => setAnimateItems(true), 150);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
            setAnimateItems(false);
            setTimeout(() => setShowDropdown(false), 100);
        }
    };

    const handleLoadMore = () => {
        setVisibleItems(prev => Math.min(prev + 6, remainingItems.length));
    };
    function formatName(fullName: string): string {
        const parts = fullName.trim().split(/\s+/);
        if (parts.length < 2) return fullName; // fallback if only one name

        const firstName = parts[0];
        const lastInitial = parts[1][0].toUpperCase();
        return `${firstName}. ${lastInitial}`;
    }


    const CircleItem: React.FC<{ item: GridItem; isMoreButton?: boolean; onClick?: () => void }> = ({
                                                                                                        item,
                                                                                                        isMoreButton = false,
                                                                                                        onClick
                                                                                                    }) => (
        <div
            onClick={onClick}
            className="flex flex-col items-center cursor-pointer group"
        >
            {/* Circle Avatar */}
            <div className="relative mb-2">
                {isMoreButton ? (
                    <div className="w-10 text-orange-600 h-10 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center transform transition-all duration-300 ease-out hover:scale-110 hover:shadow-lg group-active:scale-95">
                        <Plus className="w-4 h-4 text-orange-600" />
                        {remainingCount}
                    </div>
                ) : (
                    <>
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-300 rounded-full flex items-center justify-center text-xs sm:text-sm md:text-base font-semibold text-gray-700 transform transition-all duration-300 ease-out hover:scale-110 hover:-translate-y-1 hover:shadow-xl group-active:scale-95">
                            {item.avatar}
                        </div>
                        {item.status && (
                            <div className="absolute -bottom-1 -right-1">
                                <div className={`w-3 h-3 ${getStatusColor(item.status)} rounded-full border-2 border-white transition-all duration-300 hover:scale-125 shadow-sm`}>
                                    <div className={`w-full h-full ${getStatusColor(item.status)} rounded-full animate-ping opacity-75`} />
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Name Text */}
            <div className="text-center flex items-center gap-1">
                <p className="text-xs font-medium text-gray-900 truncate transition-colors duration-300 group-hover:text-blue-600">
                    {isMoreButton ? `` : formatName(item.name)}
                </p>
            </div>
        </div>
    );

    return (
        <div className="w-full  mx-auto">
            {/* Horizontal Circle Layout */}
            <div className="flex items-start justify-center gap-3">
                {displayedItems.map((item) => (
                    <CircleItem
                        key={item.id}
                        item={item}
                        onClick={() => handleItemClick(item)}
                    />
                ))}

                {shouldShowMoreButton && (
                    <div ref={triggerRef} className="relative">
                        <CircleItem
                            item={{ id: 'more', name: '', avatar: '' }}
                            isMoreButton
                            onClick={handleMoreClick}
                        />

                        {/* Dropdown */}
                        {showDropdown && (
                            <>
                                {/* Backdrop */}
                                <div
                                    className="fixed inset-0 z-10 bg-black/5 backdrop-blur-[1px] transition-all duration-300"
                                    onClick={() => {
                                        setAnimateItems(false);
                                        setTimeout(() => setShowDropdown(false), 100);
                                    }}
                                />

                                {/* Dropdown Content */}
                                <div
                                    ref={dropdownRef}
                                    className={`
                    fixed z-20 w-80 max-w-[90vw]
                    bg-white rounded-lg shadow-xl border border-gray-200
                    transform transition-all duration-500 ease-out
                    ${showDropdown
                                        ? 'opacity-100 scale-100 rotate-0'
                                        : 'opacity-0 scale-75 -rotate-12'
                                    }
                    ${dropdownPosition.top ? 'top-full mt-2' : 'bottom-full mb-2'}
                    ${dropdownPosition.left ? 'left-0' : 'right-0'}
                    backdrop-blur-sm
                  `}
                                    style={{
                                        transformOrigin: dropdownPosition.transformOrigin,
                                        transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                        ...(triggerRef.current && {
                                            [dropdownPosition.top ? 'top' : 'bottom']: dropdownPosition.top
                                                ? triggerRef.current.getBoundingClientRect().bottom + 8
                                                : window.innerHeight - triggerRef.current.getBoundingClientRect().top + 8,
                                            [dropdownPosition.left ? 'left' : 'right']: dropdownPosition.left
                                                ? triggerRef.current.getBoundingClientRect().left
                                                : window.innerWidth - triggerRef.current.getBoundingClientRect().right
                                        })
                                    }}
                                >
                                    <div className="p-4">
                                        <div className={`flex items-center justify-between mb-3 transform transition-all duration-700 ease-out ${
                                            animateItems ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                                        }`}>
                                            <h3 className="text-sm font-semibold text-gray-900">
                                                All Items ({remainingCount})
                                            </h3>
                                            <button
                                                onClick={() => {
                                                    setAnimateItems(false);
                                                    setTimeout(() => setShowDropdown(false), 100);
                                                }}
                                                className="p-1 hover:bg-gray-100 rounded transition-all duration-200 hover:scale-110 hover:rotate-90"
                                            >
                                                <ChevronUp className="w-4 h-4 text-gray-500" />
                                            </button>
                                        </div>

                                        <div className="space-y-2 max-h-64 sm:max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                            {remainingItems.slice(0, visibleItems).map((item, index) => (
                                                <div
                                                    key={item.id}
                                                    onClick={() => handleItemClick(item)}
                                                    className={`
                            flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer group
                            transform transition-all duration-700 ease-out hover:scale-[1.02] hover:shadow-sm
                            ${animateItems
                                                        ? 'translate-x-0 opacity-100 rotate-0'
                                                        : 'translate-x-8 opacity-0 rotate-3'
                                                    }
                          `}
                                                    style={{
                                                        transitionDelay: `${index * 100}ms`,
                                                        transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
                                                    }}
                                                >
                                                    <div className="relative flex-shrink-0 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                                                        <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-xs font-semibold text-gray-700 shadow-sm">
                                                            {item.avatar}
                                                        </div>
                                                        {item.status && (
                                                            <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 ${getStatusColor(item.status)} rounded-full border border-white`}>
                                                                <div className={`w-full h-full ${getStatusColor(item.status)} rounded-full animate-ping opacity-75`} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate transition-colors group-hover:text-blue-600">{item.name}</p>
                                                        {item.status && (
                                                            <p className="text-xs text-gray-500 capitalize transition-colors group-hover:text-blue-500">{item.status}</p>
                                                        )}
                                                    </div>
                                                    <ArrowRightSquare className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-all duration-300 flex-shrink-0 transform group-hover:translate-x-1 group-hover:scale-110" />
                                                </div>
                                            ))}
                                        </div>

                                        {visibleItems < remainingItems.length && (
                                            <div className={`mt-3 pt-3 border-t border-gray-100 transform transition-all duration-800 ease-out ${
                                                animateItems ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                                            }`}
                                                 style={{ transitionDelay: `${Math.min(visibleItems, 6) * 100 + 200}ms` }}>
                                                <button
                                                    onClick={handleLoadMore}
                                                    className="w-full py-2 px-3 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-all duration-300 flex items-center justify-center space-x-1 hover:scale-105 active:scale-95 transform"
                                                >
                                                    <span>Load More</span>
                                                    <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:translate-y-0.5" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrgStaff;