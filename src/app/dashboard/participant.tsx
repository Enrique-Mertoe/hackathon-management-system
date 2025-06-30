'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { AuthUser } from '@/lib/auth'

interface ParticipantDashboardProps {
  user: AuthUser
}

export default function ParticipantDashboard({ user }: ParticipantDashboardProps) {
  return (
    <div className="space-y-12">
      {/* Hero Stats with Floating Elements */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 rounded-3xl"></div>
        <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-6 p-8">
          {/* Profile Status */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur group-hover:blur-md transition-all duration-300"></div>
            <div className="relative bg-background/80 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-3 h-3 rounded-full ${user.email_verified ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`}></div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {user.email_verified ? 'Verified' : 'Pending'}
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur group-hover:blur-md transition-all duration-300"></div>
            <div className="relative bg-background/80 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Skills</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {Array.isArray(user.skills) ? user.skills.length : 0}
              </div>
            </div>
          </div>

          {/* Hackathons */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur group-hover:blur-md transition-all duration-300"></div>
            <div className="relative bg-background/80 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Events</span>
              </div>
              <div className="text-2xl font-bold text-foreground">0</div>
            </div>
          </div>

          {/* Teams */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl blur group-hover:blur-md transition-all duration-300"></div>
            <div className="relative bg-background/80 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Teams</span>
              </div>
              <div className="text-2xl font-bold text-foreground">0</div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Action Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Primary Action - Discover */}
        <div className="lg:col-span-2 group relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-3xl"></div>
          <Card className="relative border-0 bg-gradient-to-br from-background/90 to-background/70 backdrop-blur-sm hover:scale-[1.02] transition-all duration-500">
            <CardContent className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center">
                      <span className="text-2xl">🚀</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">Discover Hackathons</h3>
                      <p className="text-sm text-muted-foreground">Your next adventure awaits</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    Explore cutting-edge hackathons tailored to your skills and interests. Join a community of innovators building the future.
                  </p>
                </div>
                <div className="text-6xl opacity-10 group-hover:opacity-20 transition-opacity duration-300">⚡</div>
              </div>
              <Button size="lg" className="w-full md:w-auto">
                Start Exploring
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Actions */}
        <div className="space-y-6">
          {/* My Journey */}
          <Card className="border-0 bg-gradient-to-br from-background/90 to-primary/5 backdrop-blur-sm hover:scale-105 transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <span className="text-xl">📊</span>
                </div>
                <div>
                  <h4 className="font-bold text-foreground">My Journey</h4>
                  <p className="text-xs text-muted-foreground">Track progress</p>
                </div>
              </div>
              <Button variant="secondary" size="sm" className="w-full">View Progress</Button>
            </CardContent>
          </Card>

          {/* Find Teams */}
          <Card className="border-0 bg-gradient-to-br from-background/90 to-green-500/5 backdrop-blur-sm hover:scale-105 transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <span className="text-xl">👥</span>
                </div>
                <div>
                  <h4 className="font-bold text-foreground">Find Teams</h4>
                  <p className="text-xs text-muted-foreground">Connect & collaborate</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">Browse Teams</Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="relative">
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-3xl font-bold text-foreground">Your Timeline</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-primary/50 to-transparent"></div>
        </div>
        
        <Card className="border-0 bg-gradient-to-br from-background/50 to-muted/20 backdrop-blur-sm">
          <CardContent className="p-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">✨</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Ready to start your journey?</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Your hackathon adventures will appear here. Join your first event to unlock your potential!
              </p>
              <Button size="lg" className="shadow-lg">
                Join Your First Hackathon
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skills Showcase */}
      {Array.isArray(user.skills) && user.skills.length > 0 && (
        <div className="relative">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-3xl font-bold text-foreground">Your Expertise</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-blue-500/50 to-transparent"></div>
          </div>
          
          <Card className="border-0 bg-gradient-to-br from-background/50 to-blue-500/5 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex flex-wrap gap-3">
                {user.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 cursor-default"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}