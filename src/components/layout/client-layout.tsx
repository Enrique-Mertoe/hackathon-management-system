'use client'

import React, {useState} from 'react'
import {Navbar} from '@/components/layout/navbar'
import {Footer} from '@/components/layout/footer'
import Drawer from '@/components/layout/drawer'
import {usePathname} from "next/navigation";
import NavLanding from "@/components/layout/navbar/NavLanding";

interface ClientLayoutProps {
    children: React.ReactNode
}

export function ClientLayout({children}: ClientLayoutProps) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const pathname = usePathname();
    const isAuthPage = pathname.startsWith('/auth');

    const toggleDrawer = () => {
        setIsDrawerOpen(!isDrawerOpen)
    }

    const closeDrawer = () => {
        setIsDrawerOpen(false)
    }

    return (
        <>
            {
                pathname.startsWith("/dashboard") ? (
                    <Navbar onMenuClick={toggleDrawer}/>
                ):(
                    <NavLanding/>
                )
            }
            <div className="flex bg-[#f4f0ef]">
                {
                    pathname.startsWith("/dashboard") ? (
                            <>
                                <Drawer isOpen={isDrawerOpen} onClose={closeDrawer}/>
                                <main className="flex-1 ps-2 lg:ml-34 ">
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
            {!isAuthPage && <Footer />}
        </>
    )
}