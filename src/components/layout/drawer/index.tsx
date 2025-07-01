'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { auth } from '@/lib/auth'
import type { AuthUser } from '@/lib/auth'
import { LayoutDashboard, Compass, Users, Settings } from 'lucide-react'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function Drawer({ isOpen, onClose }: DrawerProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [organizationOpen, setOrganizationOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const getUser = async () => {
      try {
        const currentUser = await auth.getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error('Error fetching user:', error)
      }
    }

    getUser()
  }, [])

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      requireAuth: true
    },
    {
      name: 'Discover',
      href: '/dashboard/discover',
      icon: <Compass className="w-5 h-5" />
    },
    {
      name: 'Teams',
      href: '/dashboard/teams',
      icon: <Users className="w-5 h-5" />
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: <Settings className="w-5 h-5" />,
      requireAuth: true
    }
  ]

  const organizationItems = [
    {
      name: 'Organize',
      href: '/dashboard/organize',
      requireRole: ['ORGANIZER', 'ADMIN']
    },
    {
      name: 'Analytics',
      href: '/dashboard/analytics',
      requireRole: ['ORGANIZER', 'ADMIN']
    },
    {
      name: 'Judging',
      href: '/judging',
      requireRole: ['JUDGE', 'ADMIN']
    }
  ]

  const authItems = user ? [
    {
      name: 'Profile',
      href: '/dashboard/profile',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      name: 'Sign Out',
      href: '/auth/signout',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      )
    }
  ] : [
    {
      name: 'Sign In',
      href: '/auth/signin',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 18 16">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1 8h11m0 0L8 4m4 4-4 4m4-11h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3"/>
        </svg>
      )
    },
    {
      name: 'Sign Up',
      href: '/auth/signup',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z"/>
        </svg>
      )
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

  const isActive = (href: string) => {
    return pathname === href
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar/Drawer */}
      <div 
        className={`order-last sm:fixed  sm:order-first border-t py-1 border-gray-300 bg-white sm:bg-transparent inset-x-0 w-full sm:inset-y-0 bottom-0  z-50 px-1 sm:h-screen sm:overflow-y-auto transition-transform sm:w-[5.5rem] lg:translate-x-0 sm:pt-20 lg:z-auto ${
          isOpen ? 'translate-x-0' : 'lg:translate-x-0'
        }`}
      >
        {/* Header */}
        {/*<div className="flex hidden items-center justify-between mb-6">*/}
        {/*  <button */}
        {/*    type="button" */}
        {/*    onClick={onClose}*/}
        {/*    className="text-muted-foreground hover:text-foreground rounded-lg text-sm w-8 h-8 inline-flex items-center justify-center lg:hidden"*/}
        {/*  >*/}
        {/*    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 14 14">*/}
        {/*      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>*/}
        {/*    </svg>*/}
        {/*    <span className="sr-only">Close menu</span>*/}
        {/*  </button>*/}
        {/*</div>*/}
        {/* Navigation */}
        <nav className="space-y-2">
          {/* Main Navigation */}
          <div className="flex justify-between flex-row sm:flex-col gap-1">
            {navItems.filter(shouldShowItem).map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`flex items-center justify-center gap-2 flex-col py-2 text-xs rounded-md transition-all duration-200 ${
                  isActive(item.href)
                    ? 'bg-[#e1e3e5] text-primary'
                    : 'text-gray-500 hover:text-foreground'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </div>

          {/* Organization Section */}
          {/*{shouldShowOrganization() && (*/}
          {/*  <div className="pt-4 mt-4 border-t border-border">*/}
          {/*    <button*/}
          {/*      type="button"*/}
          {/*      onClick={() => setOrganizationOpen(!organizationOpen)}*/}
          {/*      className="flex items-center w-full p-2 text-sm text-muted-foreground rounded-lg hover:text-foreground hover:bg-muted transition-colors"*/}
          {/*    >*/}
          {/*      <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">*/}
          {/*        <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z"/>*/}
          {/*        <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd"/>*/}
          {/*      </svg>*/}
          {/*      <span className="flex-1 text-left">Organization</span>*/}
          {/*      <svg */}
          {/*        className={`w-3 h-3 transition-transform ${*/}
          {/*          organizationOpen ? 'rotate-180' : ''*/}
          {/*        }`} */}
          {/*        fill="none" */}
          {/*        stroke="currentColor" */}
          {/*        viewBox="0 0 10 6"*/}
          {/*      >*/}
          {/*        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m1 1 4 4 4-4"/>*/}
          {/*      </svg>*/}
          {/*    </button>*/}
          {/*    */}
          {/*    {organizationOpen && (*/}
          {/*      <div className="mt-1 space-y-1">*/}
          {/*        {organizationItems.filter(shouldShowItem).map((item) => (*/}
          {/*          <Link*/}
          {/*            key={item.name}*/}
          {/*            href={item.href}*/}
          {/*            onClick={onClose}*/}
          {/*            className={`block p-4 text-sm rounded-lg transition-colors ${*/}
          {/*              isActive(item.href)*/}
          {/*                ? 'bg-[#e1e3e5] text-primary-foreground'*/}
          {/*                : 'text-muted-foreground hover:text-foreground hover:bg-muted'*/}
          {/*            }`}*/}
          {/*          >*/}
          {/*            {item.name}*/}
          {/*          </Link>*/}
          {/*        ))}*/}
          {/*      </div>*/}
          {/*    )}*/}
          {/*  </div>*/}
          {/*)}*/}
        </nav>
      </div>
    </>
  )
}

export default Drawer