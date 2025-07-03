'use client'

import { useEffect } from 'react'
import { useAppTheme } from '@/contexts/ThemeContext'

export function ThemeBody() {
  const { actualTheme } = useAppTheme()

  useEffect(() => {
    const body = document.body
    
    if (actualTheme === 'dark') {
      body.className = body.className.replace('bg-[#f4f0ef]', 'bg-[#0a0a0a]')
      body.style.backgroundColor = '#0a0a0a'
      body.style.color = '#ededed'
    } else {
      body.className = body.className.replace('bg-[#0a0a0a]', 'bg-[#f4f0ef]')
      body.style.backgroundColor = '#f4f0ef'
      body.style.color = '#171717'
    }
  }, [actualTheme])

  return null
}