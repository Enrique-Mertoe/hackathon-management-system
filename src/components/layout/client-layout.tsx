'use client'

import React, {useState} from 'react'
import {Navbar} from '@/components/layout/navbar'
import {Footer} from '@/components/layout/footer'
import Drawer from '@/components/layout/drawer'
import {usePathname} from "next/navigation";
import NavLanding from "@/components/layout/navbar/NavLanding";
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ThemeBody } from '@/components/layout/theme-body';
import { CacheProvider } from '@/lib/cache';

interface ClientLayoutProps {
    children: React.ReactNode
}

export function ClientLayout({children}: ClientLayoutProps) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const pathname = usePathname();
    const nofooter = pathname.startsWith('/auth') || pathname.startsWith('/dashboard');

    const toggleDrawer = () => {
        setIsDrawerOpen(!isDrawerOpen)
    }

    const canHaveHeader =()=>{
        return pathname.startsWith("/dashboard") ||
            pathname.startsWith("/hackathons")
    }

    const closeDrawer = () => {
        setIsDrawerOpen(false)
    }

    return (
        <CacheProvider>
            <ThemeProvider>
                <ThemeBody />
                <div className={"flex w-full h-screen overflow-y-hidden flex-col sm:h-auto"}>
                    {
                        canHaveHeader() ? (
                            <Navbar onMenuClick={toggleDrawer}/>
                        ) : (
                            <NavLanding/>
                        )
                    }
                    <div className="flex flex-grow w-full p-0 overflow-y-auto sm:flex-row flex-col">
                        {
                            pathname.startsWith("/dashboard") ? (
                                    <>
                                        <Drawer isOpen={isDrawerOpen} onClose={closeDrawer}/>
                                        <main className="flex-1 sm:pt-20 w-full px-[1px] overflow-auto sm:pl-[6rem] ">
                                            {children}
                                        </main>
                                    </>
                                ) :
                                (
                                    <main className="flex-1">
                                        {children}
                                    </main>
                                )
                        }
                    </div>
                    {/*{!nofooter && <Footer/>}*/}
                </div>
            </ThemeProvider>
        </CacheProvider>
    )
}