'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { AuthUser } from '@/lib/auth'

interface OrganizerDashboardProps {
  user: AuthUser
}

export default function OrganizerDashboard({ user }: OrganizerDashboardProps) {
  return (
    <div className="space-y-12">
      {/* Command Center Stats */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-purple-500/5 to-blue-500/10 rounded-3xl"></div>
        <div className="relative p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center">
              <span className="text-3xl">🎯</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground">Command Center</h2>
              <p className="text-muted-foreground">Orchestrate incredible experiences</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Live Events */}
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

            {/* Total Reach */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="relative bg-background/90 backdrop-blur border border-blue-500/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Reach</span>
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">0</div>
                <div className="text-sm text-muted-foreground">Total Participants</div>
              </div>
            </div>

            {/* Events Created */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="relative bg-background/90 backdrop-blur border border-purple-500/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Created</span>
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">0</div>
                <div className="text-sm text-muted-foreground">Hackathons</div>
              </div>
            </div>

            {/* Success Rate */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/30 to-red-500/30 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="relative bg-background/90 backdrop-blur border border-orange-500/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Impact</span>
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">--</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Creator Studio */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Creator Action */}
        <div className="xl:col-span-2 group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent rounded-3xl"></div>
          <div className="absolute top-4 right-4 text-8xl opacity-5 group-hover:opacity-10 transition-all duration-500">🚀</div>
          
          <Card className="relative border-0 bg-gradient-to-br from-background/95 to-primary/5 backdrop-blur-sm hover:scale-[1.02] transition-all duration-500">
            <CardContent className="p-10">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-3xl flex items-center justify-center">
                  <span className="text-3xl">⚡</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-foreground mb-2">Create Hackathon</h3>
                  <p className="text-muted-foreground mb-6 text-lg">
                    Spark innovation and bring brilliant minds together. Launch your next world-changing event.
                  </p>
                  <div className="flex flex-wrap gap-3 mb-8">
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">Easy Setup</span>
                    <span className="px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-sm">Global Reach</span>
                    <span className="px-3 py-1 bg-blue-500/10 text-blue-600 rounded-full text-sm">Real-time Analytics</span>
                  </div>
                  <Button size="lg" className="shadow-lg hover:shadow-xl transition-all duration-300">
                    Launch New Event
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Panel */}
        <div className="space-y-6">
          {/* My Events */}
          <Card className="border-0 bg-gradient-to-br from-background/90 to-blue-500/5 backdrop-blur-sm hover:scale-105 transition-all duration-300 group overflow-hidden">
            <div className="absolute top-2 right-2 text-4xl opacity-10 group-hover:opacity-20 transition-all duration-300">📊</div>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <span className="text-xl">📋</span>
                </div>
                <div>
                  <h4 className="font-bold text-foreground">My Events</h4>
                  <p className="text-xs text-muted-foreground">Manage & monitor</p>
                </div>
              </div>
              <Button variant="secondary" size="sm" className="w-full">View Dashboard</Button>
            </CardContent>
          </Card>

          {/* Analytics */}
          <Card className="border-0 bg-gradient-to-br from-background/90 to-purple-500/5 backdrop-blur-sm hover:scale-105 transition-all duration-300 group overflow-hidden">
            <div className="absolute top-2 right-2 text-4xl opacity-10 group-hover:opacity-20 transition-all duration-300">📈</div>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <span className="text-xl">📊</span>
                </div>
                <div>
                  <h4 className="font-bold text-foreground">Analytics</h4>
                  <p className="text-xs text-muted-foreground">Performance insights</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">View Metrics</Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Event Pipeline */}
      <div className="relative">
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-3xl font-bold text-foreground">Event Pipeline</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-primary/50 to-transparent"></div>
          <Button variant="outline" size="sm">View All</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Planning */}
          <Card className="border-0 bg-gradient-to-br from-background/50 to-yellow-500/5 backdrop-blur-sm group hover:scale-105 transition-all duration-300">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📝</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Planning</h3>
                <div className="text-3xl font-bold text-yellow-600 mb-2">0</div>
                <p className="text-sm text-muted-foreground">Events in planning</p>
              </div>
            </CardContent>
          </Card>

          {/* Active */}
          <Card className="border-0 bg-gradient-to-br from-background/50 to-green-500/5 backdrop-blur-sm group hover:scale-105 transition-all duration-300">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏃</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Active</h3>
                <div className="text-3xl font-bold text-green-600 mb-2">0</div>
                <p className="text-sm text-muted-foreground">Running events</p>
              </div>
            </CardContent>
          </Card>

          {/* Completed */}
          <Card className="border-0 bg-gradient-to-br from-background/50 to-blue-500/5 backdrop-blur-sm group hover:scale-105 transition-all duration-300">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏆</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Completed</h3>
                <div className="text-3xl font-bold text-blue-600 mb-2">0</div>
                <p className="text-sm text-muted-foreground">Successful events</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Getting Started */}
      <Card className="border-0 bg-gradient-to-br from-background/30 to-primary/5 backdrop-blur-sm">
        <CardContent className="p-12">
          <div className="text-center max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🌟</span>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-4">Ready to inspire innovation?</h3>
            <p className="text-muted-foreground mb-8 text-lg">
              Join thousands of organizers who've launched successful hackathons. Create unforgettable experiences that change careers and build the future.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="shadow-lg">
                Create Your First Hackathon
              </Button>
              <Button variant="outline" size="lg">
                Watch Tutorial
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}