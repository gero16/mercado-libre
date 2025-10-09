import { useState, useEffect, useRef } from 'react'

// 🚀 Hook para cargar componentes solo cuando están cerca del viewport
export const useLazyLoad = (options?: IntersectionObserverInit) => {
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Cargar cuando el elemento está a 300px de ser visible
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect() // Ya no necesitamos observar más
        }
      },
      {
        rootMargin: '300px', // Cargar 300px antes de que sea visible
        threshold: 0,
        ...options
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [options])

  return { elementRef, isVisible }
}

