'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { AuthUser } from '@/lib/auth'

interface AdminDashboardProps {
  user: AuthUser
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  return (
    <div className="space-y-12">
      {/* Mission Control Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-orange-500/5 to-yellow-500/10 rounded-3xl"></div>
        <div className="relative p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center">
              <span className="text-3xl">🎛️</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground">Mission Control</h2>
              <p className="text-muted-foreground">Orchestrate the entire platform</p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Users */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="relative bg-background/90 backdrop-blur border border-blue-500/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Users</span>
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">0</div>
                <div className="text-sm text-muted-foreground">Total Registered</div>
              </div>
            </div>

            {/* Active Events */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/30 to-emerald-500/30 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="relative bg-background/90 backdrop-blur border border-green-500/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-bold text-green-600 uppercase tracking-wider">Live</span>
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">0</div>
                <div className="text-sm text-muted-foreground">Active Events</div>
              </div>
            </div>

            {/* Total Hackathons */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="relative bg-background/90 backdrop-blur border border-purple-500/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Total</span>
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">0</div>
                <div className="text-sm text-muted-foreground">All Events</div>
              </div>
            </div>

            {/* System Health */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/30 to-red-500/30 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="relative bg-background/90 backdrop-blur border border-orange-500/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Health</span>
                </div>
                <div className="text-3xl font-bold text-green-600 mb-1">100%</div>
                <div className="text-sm text-muted-foreground">System Up</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Control Center */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Primary Admin Action */}
        <div className="xl:col-span-2 group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-orange-500/10 to-transparent rounded-3xl"></div>
          <div className="absolute top-4 right-4 text-8xl opacity-5 group-hover:opacity-10 transition-all duration-500">⚡</div>
          
          <Card className="relative border-0 bg-gradient-to-br from-background/95 to-red-500/5 backdrop-blur-sm hover:scale-[1.02] transition-all duration-500">
            <CardContent className="p-10">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-3xl flex items-center justify-center">
                  <span className="text-3xl">📊</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-foreground mb-2">Platform Analytics</h3>
                  <p className="text-muted-foreground mb-6 text-lg">
                    Monitor platform health, user engagement, and system performance with real-time insights.
                  </p>
                  <div className="flex flex-wrap gap-3 mb-8">
                    <span className="px-3 py-1 bg-red-500/10 text-red-600 rounded-full text-sm">Real-time Data</span>
                    <span className="px-3 py-1 bg-blue-500/10 text-blue-600 rounded-full text-sm">User Insights</span>
                    <span className="px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-sm">Performance</span>
                  </div>
                  <Button size="lg" className="shadow-lg hover:shadow-xl transition-all duration-300">
                    View Analytics Dashboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Admin Tools */}
        <div className="space-y-6">
          {/* User Management */}
          <Card className="border-0 bg-gradient-to-br from-background/90 to-blue-500/5 backdrop-blur-sm hover:scale-105 transition-all duration-300 group overflow-hidden">
            <div className="absolute top-2 right-2 text-4xl opacity-10 group-hover:opacity-20 transition-all duration-300">👥</div>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <span className="text-xl">👤</span>
                </div>
                <div>
                  <h4 className="font-bold text-foreground">User Management</h4>
                  <p className="text-xs text-muted-foreground">Verify & moderate</p>
                </div>
              </div>
              <Button variant="secondary" size="sm" className="w-full">Manage Users</Button>
            </CardContent>
          </Card>

          {/* Content Moderation */}
          <Card className="border-0 bg-gradient-to-br from-background/90 to-purple-500/5 backdrop-blur-sm hover:scale-105 transition-all duration-300 group overflow-hidden">
            <div className="absolute top-2 right-2 text-4xl opacity-10 group-hover:opacity-20 transition-all duration-300">🛡️</div>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <span className="text-xl">🔍</span>
                </div>
                <div>
                  <h4 className="font-bold text-foreground">Content Review</h4>
                  <p className="text-xs text-muted-foreground">Safety & compliance</p>
                </div>
              </div>
              <Button
                  //@ts-ignore
                  variant="outline" size="sm" className="w-full">Review Content</Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* System Monitoring */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Metrics */}
        <Card className="border-0 bg-gradient-to-br from-background/50 to-blue-500/5 backdrop-blur-sm group hover:scale-105 transition-all duration-300">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Users</h3>
              <div className="text-3xl font-bold text-blue-600 mb-2">0</div>
              <p className="text-sm text-muted-foreground">New this month</p>
            </div>
          </CardContent>
        </Card>

        {/* Event Metrics */}
        <Card className="border-0 bg-gradient-to-br from-background/50 to-green-500/5 backdrop-blur-sm group hover:scale-105 transition-all duration-300">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Events</h3>
              <div className="text-3xl font-bold text-green-600 mb-2">0</div>
              <p className="text-sm text-muted-foreground">This month</p>
            </div>
          </CardContent>
        </Card>

        {/* Performance */}
        <Card className="border-0 bg-gradient-to-br from-background/50 to-purple-500/5 backdrop-blur-sm group hover:scale-105 transition-all duration-300">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Performance</h3>
              <div className="text-3xl font-bold text-purple-600 mb-2">99.9%</div>
              <p className="text-sm text-muted-foreground">Uptime</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <div className="relative">
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-3xl font-bold text-foreground">System Status</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-red-500/50 to-transparent"></div>
        </div>
        
        <Card className="border-0 bg-gradient-to-br from-background/50 to-green-500/5 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Database */}
              <div className="text-center group">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300">
                  <span className="text-2xl">🗄️</span>
                </div>
                <h3 className="font-bold text-foreground mb-2">Database</h3>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-600">Operational</span>
                </div>
                <p className="text-xs text-muted-foreground">All systems normal</p>
              </div>

              {/* API Services */}
              <div className="text-center group">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300">
                  <span className="text-2xl">🔌</span>
                </div>
                <h3 className="font-bold text-foreground mb-2">API Services</h3>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-600">Operational</span>
                </div>
                <p className="text-xs text-muted-foreground">Response: &lt;100ms</p>
              </div>

              {/* File Storage */}
              <div className="text-center group">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300">
                  <span className="text-2xl">☁️</span>
                </div>
                <h3 className="font-bold text-foreground mb-2">Storage</h3>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-600">Operational</span>
                </div>
                <p className="text-xs text-muted-foreground">Upload/download OK</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Administration Hub */}
      <Card className="border-0 bg-gradient-to-br from-background/30 to-red-500/5 backdrop-blur-sm">
        <CardContent className="p-12">
          <div className="text-center max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🎯</span>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-4">Complete Platform Control</h3>
            <p className="text-muted-foreground mb-8 text-lg">
              Monitor, moderate, and manage the entire HackHub ecosystem. Your oversight ensures a safe and thriving community.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-background/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Pending Approvals</span>
                  <span className="bg-red-500/10 text-red-600 px-2 py-1 rounded text-xs font-medium">0</span>
                </div>
                <p className="text-xs text-muted-foreground">Organizer verifications</p>
              </div>
              <div className="bg-background/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Content Reports</span>
                  <span className="bg-orange-500/10 text-orange-600 px-2 py-1 rounded text-xs font-medium">0</span>
                </div>
                <p className="text-xs text-muted-foreground">Safety reviews</p>
              </div>
              <div className="bg-background/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">System Alerts</span>
                  <span className="bg-green-500/10 text-green-600 px-2 py-1 rounded text-xs font-medium">0</span>
                </div>
                <p className="text-xs text-muted-foreground">All clear</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="shadow-lg">
                View Admin Panel
              </Button>
              <Button
                  //@ts-ignore
                  variant="outline" size="lg">
                System Logs
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}