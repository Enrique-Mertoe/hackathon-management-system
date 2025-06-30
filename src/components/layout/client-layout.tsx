'use client'

import React, { useState } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import Drawer from '@/components/layout/drawer'

interface ClientLayoutProps {
  children: React.ReactNode
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen)
  }

  const closeDrawer = () => {
    setIsDrawerOpen(false)
  }

  return (
    <>
      <Navbar onMenuClick={toggleDrawer} />
      <div className="flex bg-[#f4f0ef]">
        <Drawer isOpen={isDrawerOpen} onClose={closeDrawer} />
        <main className="flex-1 ps-2 lg:ml-34 ">
          {children}
        </main>
      </div>
      {/*<Footer />*/}
    </>
  )
}