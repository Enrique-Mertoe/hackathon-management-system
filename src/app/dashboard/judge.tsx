'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { AuthUser } from '@/lib/auth'

interface JudgeDashboardProps {
  user: AuthUser
}

export default function JudgeDashboard({ user }: JudgeDashboardProps) {
  return (
    <div className="space-y-12">
      {/* Evaluation Command Center */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-orange-500/10 rounded-3xl"></div>
        <div className="relative p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-2xl flex items-center justify-center">
              <span className="text-3xl">⚖️</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground">Evaluation Center</h2>
              <p className="text-muted-foreground">Shape the future through fair assessment</p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Profile Status */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/30 to-emerald-500/30 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="relative bg-background/90 backdrop-blur border border-green-500/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-2 h-2 rounded-full ${user.email_verified ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
                  <span className="text-xs font-bold text-green-600 uppercase tracking-wider">Status</span>
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">
                  {user.email_verified ? 'Verified' : 'Pending'}
                </div>
                <div className="text-sm text-muted-foreground">Judge Profile</div>
              </div>
            </div>

            {/* Active Judging */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="relative bg-background/90 backdrop-blur border border-blue-500/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Active</span>
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">0</div>
                <div className="text-sm text-muted-foreground">Assignments</div>
              </div>
            </div>

            {/* Reviews Completed */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="relative bg-background/90 backdrop-blur border border-purple-500/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Reviews</span>
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">0</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
            </div>

            {/* Expertise */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/30 to-red-500/30 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="relative bg-background/90 backdrop-blur border border-orange-500/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Skills</span>
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">
                  {Array.isArray(user.skills) ? user.skills.length : 0}
                </div>
                <div className="text-sm text-muted-foreground">Expertise Areas</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Judging Opportunities */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        {/* Find Judging Opportunities */}
        <div className="xl:col-span-3 group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-transparent rounded-3xl"></div>
          <div className="absolute top-6 right-6 text-8xl opacity-5 group-hover:opacity-10 transition-all duration-500">🎯</div>
          
          <Card className="relative border-0 bg-gradient-to-br from-background/95 to-amber-500/5 backdrop-blur-sm hover:scale-[1.02] transition-all duration-500">
            <CardContent className="p-10">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-3xl flex items-center justify-center">
                  <span className="text-3xl">🔍</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-foreground mb-2">Find Judging Opportunities</h3>
                  <p className="text-muted-foreground mb-6 text-lg">
                    Discover hackathons seeking expert evaluation. Apply your knowledge to identify breakthrough innovations and guide talented teams.
                  </p>
                  <div className="flex flex-wrap gap-3 mb-8">
                    <span className="px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full text-sm">Expert Matching</span>
                    <span className="px-3 py-1 bg-blue-500/10 text-blue-600 rounded-full text-sm">Fair Evaluation</span>
                    <span className="px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-sm">Industry Impact</span>
                  </div>
                  <Button size="lg" className="shadow-lg hover:shadow-xl transition-all duration-300">
                    Browse Opportunities
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Judge Actions */}
        <div className="xl:col-span-2 space-y-6">
          {/* My Assignments */}
          <Card className="border-0 bg-gradient-to-br from-background/90 to-blue-500/5 backdrop-blur-sm hover:scale-105 transition-all duration-300 group overflow-hidden">
            <div className="absolute top-2 right-2 text-4xl opacity-10 group-hover:opacity-20 transition-all duration-300">📋</div>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <span className="text-xl">📝</span>
                </div>
                <div>
                  <h4 className="font-bold text-foreground">My Assignments</h4>
                  <p className="text-xs text-muted-foreground">Current judging</p>
                </div>
              </div>
              <Button variant="secondary" size="sm" className="w-full">View All</Button>
            </CardContent>
          </Card>

          {/* Guidelines */}
          <Card className="border-0 bg-gradient-to-br from-background/90 to-purple-500/5 backdrop-blur-sm hover:scale-105 transition-all duration-300 group overflow-hidden">
            <div className="absolute top-2 right-2 text-4xl opacity-10 group-hover:opacity-20 transition-all duration-300">📖</div>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <span className="text-xl">⚖️</span>
                </div>
                <div>
                  <h4 className="font-bold text-foreground">Guidelines</h4>
                  <p className="text-xs text-muted-foreground">Criteria & standards</p>
                </div>
              </div>
              <Button
                  //@ts-ignore
                  variant="outline" size="sm" className="w-full">View Guide</Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Performance & Impact */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Judging History */}
        <Card className="border-0 bg-gradient-to-br from-background/50 to-amber-500/5 backdrop-blur-sm group hover:scale-105 transition-all duration-300">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Judged</h3>
              <div className="text-3xl font-bold text-amber-600 mb-2">0</div>
              <p className="text-sm text-muted-foreground">Hackathons evaluated</p>
            </div>
          </CardContent>
        </Card>

        {/* Response Time */}
        <Card className="border-0 bg-gradient-to-br from-background/50 to-blue-500/5 backdrop-blur-sm group hover:scale-105 transition-all duration-300">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Response</h3>
              <div className="text-3xl font-bold text-blue-600 mb-2">--</div>
              <p className="text-sm text-muted-foreground">Avg time</p>
            </div>
          </CardContent>
        </Card>

        {/* Feedback Rating */}
        <Card className="border-0 bg-gradient-to-br from-background/50 to-purple-500/5 backdrop-blur-sm group hover:scale-105 transition-all duration-300">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⭐</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Rating</h3>
              <div className="text-3xl font-bold text-purple-600 mb-2">--</div>
              <p className="text-sm text-muted-foreground">Feedback score</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expertise Showcase */}
      <div className="relative">
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-3xl font-bold text-foreground">Judging Expertise</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-amber-500/50 to-transparent"></div>
        </div>
        
        <Card className="border-0 bg-gradient-to-br from-background/50 to-amber-500/5 backdrop-blur-sm">
          <CardContent className="p-8">
            {Array.isArray(user.skills) && user.skills.length > 0 ? (
              <div className="space-y-6">
                <p className="text-muted-foreground text-lg">
                  Your expertise areas help organizers match you with relevant hackathons:
                </p>
                <div className="flex flex-wrap gap-4">
                  {user.skills.map((skill, index) => (
                    <div
                      key={index}
                      className="group relative"
                    >
                      <div className="absolute inset-0 bg-amber-500/30 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                      <span className="relative px-6 py-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 rounded-2xl text-sm font-medium transition-all duration-300 hover:scale-105 cursor-default block">
                        {
                          //@ts-ignore
                          skill?.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">🎯</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Define your expertise</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Add your expertise areas to help organizers find the perfect judge for their hackathons. Your knowledge shapes the future!
                </p>
                <Button size="lg">Add Expertise Areas</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Getting Started */}
      <Card className="border-0 bg-gradient-to-br from-background/30 to-amber-500/5 backdrop-blur-sm">
        <CardContent className="p-12">
          <div className="text-center max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🌟</span>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-4">Ready to evaluate excellence?</h3>
            <p className="text-muted-foreground mb-8 text-lg">
              Join our panel of expert judges who shape the innovation landscape. Your evaluation helps identify breakthrough solutions and guides talented teams.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="shadow-lg">
                Start Judging Today
              </Button>
              <Button
                  //@ts-ignore
                  variant="outline" size="lg">
                Learn About Judging
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}