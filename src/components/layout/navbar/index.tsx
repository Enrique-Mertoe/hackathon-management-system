'use client'

import React, {useState, useEffect} from 'react'
import Link from 'next/link'
import {useRouter} from 'next/navigation'
import {Button} from '@/components/ui/button'
import {auth} from '@/lib/auth'
import type {AuthUser} from '@/lib/auth'
import ProfileDropdown from "@/components/layout/navbar/profile";
import FloatingSearch from "@/components/layout/navbar/search";
import Image from "next/image";

const navLinClass = "rounded-full border border-orange-100 bg-orange-100 transition-all duration-200 px-6 py-1";

interface NavbarProps {
    onMenuClick?: () => void
}

export const Navbar: React.FC<NavbarProps> = ({onMenuClick}) => {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

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
        <nav className="sm:fixed inset-x-0 bg-[#f5f6fa] top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className={"flex  items-center space-x-2"}>
                            <div className="w-8 h-8 flex items-center justify-center">
                                <img src={"/logo-favicon.ico"} alt={"HackHub Logo"} className={""}/>
                            </div>
                            <div className="h-8 w-22 flex items-center justify-center">
                                <img src={"/logo-text.png"} alt={"HackHub Logo"} className={""}/>
                            </div>
                        </Link>

                        <div className="hidden md:ml-10 md:flex md:space-x-2">
                            <Link href="/hackathons"
                                  className={`text-foreground ${navLinClass} hover:text-primary transition-colors`}>
                                Discover
                            </Link>
                            {user && user.role === 'ORGANIZER' && (
                                <Link href="/organize"
                                      className={`text-foreground hover:text-primary transition-colors ${navLinClass}`}>
                                    Organize
                                </Link>
                            )}
                            {user && (
                                <>
                                    <Link href="/dashboard"
                                          className={`text-foreground hover:text-primary transition-colors ${navLinClass}`}>
                                        Dashboard
                                    </Link>
                                    <Link href="/settings"
                                          className={`text-foreground hover:text-primary transition-colors ${navLinClass}`}>
                                        Settings
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        {loading ? (
                            <div
                                className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        ) : user ? (''
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link href="/auth/signin">
                                    <Button variant="ghost" size="sm">
                                        Sign In
                                    </Button>
                                </Link>
                                <Link href="/auth/signup">
                                    <Button size="sm">
                                        Sign Up
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className={"flex items-center space-x-2 "}>
                        <FloatingSearch/>
                        <ProfileDropdown user={user} isLoading={!user || loading}/>
                    </div>
                </div>
            </div>
        </nav>
    )
}