'use client'

import React, { createContext, useContext, useCallback, useRef, useEffect } from 'react'

// Cache entry structure
interface CacheEntry<T = any> {
  data: T
  timestamp: number
  ttl: number
  isStale: boolean
  loading: boolean
}

// Cache configuration
interface CacheConfig {
  defaultTTL: number // Default TTL in milliseconds
  staleTime: number // Time after which data is considered stale but still usable
  gcInterval: number // Garbage collection interval
  maxSize: number // Maximum number of cache entries
  maxMemoryUsage: number // Maximum memory usage estimate in bytes
}

// Default configuration
const DEFAULT_CONFIG: CacheConfig = {
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  staleTime: 30 * 1000, // 30 seconds
  gcInterval: 10 * 60 * 1000, // 10 minutes
  maxSize: 100, // Maximum 100 cache entries
  maxMemoryUsage: 50 * 1024 * 1024 // 50MB estimated memory limit
}

// Cache manager class
class CacheManager {
  private cache = new Map<string, CacheEntry>()
  private config: CacheConfig
  private gcTimer: NodeJS.Timeout | null = null
  private subscribers = new Map<string, Set<(data: any) => void>>()

  constructor(config: CacheConfig = DEFAULT_CONFIG) {
    this.config = config
    this.startGarbageCollection()
  }

  // Generate cache key from route and params
  generateKey(route: string, params?: Record<string, any>): string {
    if (!params) return route
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value))
      }
    })
    const paramString = searchParams.toString()
    return paramString ? `${route}?${paramString}` : route
  }

  // Get data from cache
  get<T>(key: string): CacheEntry<T> | null {
    const entry = this.cache.get(key) as CacheEntry<T>
    if (!entry) return null

    const now = Date.now()
    const age = now - entry.timestamp

    // Check if data is expired
    if (age > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    // Mark as stale if needed
    if (age > this.config.staleTime) {
      entry.isStale = true
    }

    return entry
  }

  // Set data in cache
  set<T>(key: string, data: T, ttl?: number): void {
    // Check cache size limits before adding
    this.enforceMemoryLimits()

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
      isStale: false,
      loading: false
    }

    this.cache.set(key, entry)
    this.notifySubscribers(key, data)
  }

  // Set loading state
  setLoading(key: string, loading: boolean): void {
    const entry = this.cache.get(key)
    if (entry) {
      entry.loading = loading
      this.notifySubscribers(key, entry.data)
    }
  }

  // Check if data exists and is not expired
  has(key: string): boolean {
    return this.get(key) !== null
  }

  // Check if data is stale
  isStale(key: string): boolean {
    const entry = this.get(key)
    return entry ? entry.isStale : false
  }

  // Check if data is loading
  isLoading(key: string): boolean {
    const entry = this.cache.get(key)
    return entry ? entry.loading : false
  }

  // Invalidate specific cache entry
  invalidate(key: string): void {
    this.cache.delete(key)
    this.notifySubscribers(key, null)
  }

  // Invalidate all cache entries matching pattern
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern)
    for (const [key] of this.cache) {
      if (regex.test(key)) {
        this.cache.delete(key)
        this.notifySubscribers(key, null)
      }
    }
  }

  // Clear all cache
  clear(): void {
    this.cache.clear()
    for (const [key] of this.subscribers) {
      this.notifySubscribers(key, null)
    }
  }

  // Subscribe to cache changes
  subscribe(key: string, callback: (data: any) => void): () => void {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set())
    }
    this.subscribers.get(key)!.add(callback)

    // Return unsubscribe function
    return () => {
      const keySubscribers = this.subscribers.get(key)
      if (keySubscribers) {
        keySubscribers.delete(callback)
        if (keySubscribers.size === 0) {
          this.subscribers.delete(key)
        }
      }
    }
  }

  // Notify subscribers of changes
  private notifySubscribers(key: string, data: any): void {
    const keySubscribers = this.subscribers.get(key)
    if (keySubscribers) {
      keySubscribers.forEach(callback => callback(data))
    }
  }

  // Start garbage collection
  private startGarbageCollection(): void {
    if (this.gcTimer) {
      clearInterval(this.gcTimer)
    }
    
    this.gcTimer = setInterval(() => {
      this.collectGarbage()
    }, this.config.gcInterval)
  }

  // Collect garbage (remove expired entries)
  private collectGarbage(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
    // Also enforce memory limits during garbage collection
    this.enforceMemoryLimits()
  }

  // Enforce memory limits by removing oldest entries
  private enforceMemoryLimits(): void {
    // Remove entries if we exceed max size
    if (this.cache.size >= this.config.maxSize) {
      const sortedEntries = Array.from(this.cache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp) // Sort by oldest first
      
      const entriesToRemove = sortedEntries.slice(0, Math.floor(this.config.maxSize * 0.2)) // Remove oldest 20%
      
      for (const [key] of entriesToRemove) {
        this.cache.delete(key)
      }
    }

    // Estimate memory usage and remove entries if needed
    const estimatedMemory = this.estimateMemoryUsage()
    if (estimatedMemory > this.config.maxMemoryUsage) {
      const sortedEntries = Array.from(this.cache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp)
      
      // Remove oldest entries until we're under the limit
      for (const [key] of sortedEntries) {
        this.cache.delete(key)
        if (this.estimateMemoryUsage() <= this.config.maxMemoryUsage * 0.8) {
          break
        }
      }
    }
  }

  // Estimate memory usage (rough calculation)
  private estimateMemoryUsage(): number {
    let totalSize = 0
    for (const [key, entry] of this.cache) {
      // Rough estimation: key size + JSON stringified data size
      totalSize += key.length * 2 // UTF-16, so 2 bytes per character
      try {
        totalSize += JSON.stringify(entry.data).length * 2
      } catch {
        // If data can't be stringified, estimate as 1KB
        totalSize += 1024
      }
    }
    return totalSize
  }

  // Cleanup
  destroy(): void {
    if (this.gcTimer) {
      clearInterval(this.gcTimer)
      this.gcTimer = null
    }
    this.cache.clear()
    this.subscribers.clear()
  }

  // Get cache stats
  getStats() {
    const estimatedMemory = this.estimateMemoryUsage()
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      estimatedMemoryUsage: estimatedMemory,
      maxMemoryUsage: this.config.maxMemoryUsage,
      memoryUsagePercentage: (estimatedMemory / this.config.maxMemoryUsage) * 100,
      entries: Array.from(this.cache.keys()),
      subscribers: this.subscribers.size
    }
  }
}

// Create cache manager instance
const cacheManager = new CacheManager()

// React context
const CacheContext = createContext<CacheManager | null>(null)

// Cache provider component
export function CacheProvider({ children }: { children: React.ReactNode }) {
  const managerRef = useRef<CacheManager>(cacheManager)

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      managerRef.current.destroy()
    }
  }, [])

  return (
    <CacheContext.Provider value={managerRef.current}>
      {children}
    </CacheContext.Provider>
  )
}

// Hook to use cache manager
export function useCacheManager() {
  const context = useContext(CacheContext)
  if (!context) {
    throw new Error('useCacheManager must be used within a CacheProvider')
  }
  return context
}

// Hook for caching data with stale-while-revalidate pattern
export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: {
    ttl?: number
    staleTime?: number
    enabled?: boolean
  }
) {
  const cache = useCacheManager()
  const [data, setData] = React.useState<T | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)
  const [isStale, setIsStale] = React.useState(false)

  const fetchData = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) {
        setLoading(true)
        cache.setLoading(key, true)
      }
      setError(null)

      const result = await fetcher()
      cache.set(key, result, options?.ttl)
      setData(result)
      setIsStale(false)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      console.error('Cache fetch error:', error)
    } finally {
      if (!isBackground) {
        setLoading(false)
        cache.setLoading(key, false)
      }
    }
  }, [key, fetcher, cache, options?.ttl])

  // Effect to handle initial load and cache subscription
  React.useEffect(() => {
    if (options?.enabled === false) return

    // Check if we have cached data
    const cachedEntry = cache.get<T>(key)
    
    if (cachedEntry) {
      setData(cachedEntry.data)
      setIsStale(cachedEntry.isStale)
      
      // If data is stale, fetch in background
      if (cachedEntry.isStale) {
        fetchData(true)
      }
    } else {
      // No cached data, fetch immediately
      fetchData(false)
    }

    // Subscribe to cache changes
    const unsubscribe = cache.subscribe(key, (newData) => {
      if (newData !== null) {
        setData(newData)
        setIsStale(cache.isStale(key))
      }
    })

    return unsubscribe
  }, [key, cache, fetchData, options?.enabled])

  const mutate = useCallback(async () => {
    await fetchData(false)
  }, [fetchData])

  const invalidate = useCallback(() => {
    cache.invalidate(key)
    setData(null)
    setIsStale(false)
  }, [cache, key])

  return {
    data,
    loading,
    error,
    isStale,
    mutate,
    invalidate
  }
}

// Hook for page-level caching
export function usePageCache<T>(
  route: string,
  params: Record<string, any> | undefined,
  fetcher: () => Promise<T>,
  options?: {
    ttl?: number
    staleTime?: number
    enabled?: boolean
  }
) {
  const cache = useCacheManager()
  const key = cache.generateKey(route, params)
  
  return useCache(key, fetcher, options)
}

// Export cache manager for direct access if needed
export { cacheManager }