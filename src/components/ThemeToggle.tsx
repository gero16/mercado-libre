import React, { useState, useEffect } from 'react'
import '../css/theme-toggle.css'

const ThemeToggle: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(true)

  useEffect(() => {
    // Cargar preferencia guardada
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'light') {
      setIsDarkMode(false)
      document.body.classList.remove('dark-mode')
      document.body.classList.add('light-mode')
    } else {
      setIsDarkMode(true)
      document.body.classList.remove('light-mode')
      document.body.classList.add('dark-mode')
    }
  }, [])

  const toggleTheme = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    
    if (newMode) {
      // Modo oscuro
      document.body.classList.remove('light-mode')
      document.body.classList.add('dark-mode')
      localStorage.setItem('theme', 'dark')
    } else {
      // Modo claro
      document.body.classList.remove('dark-mode')
      document.body.classList.add('light-mode')
      localStorage.setItem('theme', 'light')
    }
  }

  return (
    <button 
      className="theme-toggle-button" 
      onClick={toggleTheme}
      aria-label={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={isDarkMode ? 'Modo claro' : 'Modo oscuro'}
    >
      {isDarkMode ? '☀️' : '🌙'}
    </button>
  )
}

export default ThemeToggle
