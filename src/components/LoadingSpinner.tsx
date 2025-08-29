import React from 'react'

interface LoadingSpinnerProps {
  message?: string
  show: boolean
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = "Procesando...", 
  show 
}) => {
  if (!show) return null

  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <div className="spinner"></div>
        <p>{message}</p>
      </div>
    </div>
  )
}

export default LoadingSpinner