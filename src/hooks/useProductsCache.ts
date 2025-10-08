import { useState, useEffect, useCallback } from 'react'

interface CacheInfo {
  hasCache: boolean
  cacheAge: number
  isExpired: boolean
}

const CACHE_KEY = 'ml_productos_cache'
const CACHE_TIME_KEY = 'ml_productos_cache_time'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

export const useProductsCache = <T>() => {
  const [cacheInfo, setCacheInfo] = useState<CacheInfo>({
    hasCache: false,
    cacheAge: 0,
    isExpired: true
  })

  const getCacheInfo = useCallback((): CacheInfo => {
    const cachedData = localStorage.getItem(CACHE_KEY)
    const cacheTime = localStorage.getItem(CACHE_TIME_KEY)
    
    if (!cachedData || !cacheTime) {
      return { hasCache: false, cacheAge: 0, isExpired: true }
    }
    
    const cacheAge = Date.now() - parseInt(cacheTime)
    const isExpired = cacheAge >= CACHE_DURATION
    
    return { hasCache: true, cacheAge, isExpired }
  }, [])

  const getFromCache = useCallback((): T | null => {
    const info = getCacheInfo()
    if (!info.hasCache) return null
    
    const cachedData = localStorage.getItem(CACHE_KEY)
    if (!cachedData) return null
    
    try {
      return JSON.parse(cachedData) as T
    } catch {
      return null
    }
  }, [getCacheInfo])

  const saveToCache = useCallback((data: T) => {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data))
    localStorage.setItem(CACHE_TIME_KEY, Date.now().toString())
    setCacheInfo(getCacheInfo())
    console.log('💾 Productos guardados en caché')
  }, [getCacheInfo])

  const clearCache = useCallback(() => {
    localStorage.removeItem(CACHE_KEY)
    localStorage.removeItem(CACHE_TIME_KEY)
    setCacheInfo({ hasCache: false, cacheAge: 0, isExpired: true })
    console.log('🗑️ Caché de productos eliminado')
  }, [])

  useEffect(() => {
    setCacheInfo(getCacheInfo())
  }, [getCacheInfo])

  return {
    cacheInfo,
    getFromCache,
    saveToCache,
    clearCache
  }
}

