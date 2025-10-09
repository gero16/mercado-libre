import React from 'react'
import { useLazyLoad } from '../hooks/useLazyLoad'

interface LazySectionProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  minHeight?: string
}

// 🚀 Componente que carga su contenido solo cuando está cerca del viewport
const LazySection: React.FC<LazySectionProps> = ({ 
  children, 
  fallback = null,
  minHeight = '400px' 
}) => {
  const { elementRef, isVisible } = useLazyLoad()

  return (
    <div ref={elementRef} style={{ minHeight: isVisible ? 'auto' : minHeight }}>
      {isVisible ? children : fallback}
    </div>
  )
}

export default LazySection

