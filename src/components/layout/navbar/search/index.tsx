import React, {useState, useRef, useEffect} from 'react';
import {Search, X} from 'lucide-react';
import {motion} from "framer-motion"


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
            'Tutorial': 'bg-blue-100 text-blue-800',
            'Guide': 'bg-green-100 text-green-800',
            'Component': 'bg-purple-100 text-purple-800',
            'Article': 'bg-orange-100 text-orange-800',
        };
        return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div
            ref={searchRef}
            className={`z-50 transition-all relative duration-300 ease-out ${
                isExpanded
                    ? 'w-96'
                    : 'w-12 h-12'
            }`}
        >
            {!isExpanded ? (
                // Search Icon Button
                <button
                    onClick={handleExpand}
                    className="w-12 h-12 bg-orange-100 cursor-pointer rounded-full transition-all duration-200 flex items-center justify-center group hover:scale-105"
                >
                    <Search className="w-5 h-5 text-gray-600 group-hover:text-orange-600 transition-colors"/>
                </button>
            ) : (
                // Expanded Search Card
                <div
                    className="rounded-lg overflow-hidden animate-in slide-in-from-right-2 zoom-in-95 duration-300">
                    {/* Header */}
                    <div className="flex items-center p-4">
                        <Search className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0"/>
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Search anything..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 outline-none text-gray-900 placeholder-gray-500"
                        />
                        <button
                            onClick={handleClose}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors ml-2"
                        >
                            <X className="w-4 h-4 text-gray-500"/>
                        </button>
                    </div>

                    {/* Results Body */}
                    {
                        isExpanded && (
                            <>
                                <motion.div
                                    initial={{
                                        y: 10,
                                        opacity: 0
                                    }}
                                    animate={{
                                        y: 0,
                                        opacity: 1,
                                    }}
                                    transition={{delay: .1, duration: 0.2, ease: 'easeInOut'}}
                                    className={
                                        "absolute -z-1 top-0 inset-x-0 p-4 pt-20 bg-white border border-gray-200 rounded-xl shadow-lg"
                                    }
                                >
                                    <div className="max-h-80 overflow-y-auto">
                                        {searchQuery.trim() ? (
                                            searchResults.length > 0 ? (
                                                <div className="p-2">
                                                    {searchResults.map((result) => (
                                                        <div
                                                            key={result.id}
                                                            className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group"
                                                        >
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex-1 min-w-0">
                                                                    <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                                                                        {result.title}
                                                                    </h4>
                                                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                                        {result.description}
                                                                    </p>
                                                                </div>
                                                                <span
                                                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 flex-shrink-0 ${getCategoryColor(result.category)}`}>
                            {result.category}
                            </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-8 text-center">
                                                    <div
                                                        className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                        <Search className="w-6 h-6 text-gray-400"/>
                                                    </div>
                                                    <p className="text-gray-500 text-sm">No results found for
                                                        "{searchQuery}"</p>
                                                </div>
                                            )
                                        ) : (
                                            <div className="p-8 text-center">
                                                <div
                                                    className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <Search className="w-6 h-6 text-blue-600"/>
                                                </div>
                                                <p className="text-gray-600 font-medium mb-1">Start searching</p>
                                                <p className="text-gray-500 text-sm">Type to find tutorials, guides, and
                                                    more</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </>
                        )
                    }
                </div>
            )}
        </div>
    );
};

export default FloatingSearch;