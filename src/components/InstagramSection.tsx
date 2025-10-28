import React, { useEffect, useRef, useState } from 'react'
import '../css/instagram-section.css'

const InstagramSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  // Lazy load del script solo cuando la sección esté cercana al viewport
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new IntersectionObserver((entries) => {
      if (entries.some(e => e.isIntersecting)) {
        setIsVisible(true)
        obs.disconnect()
      }
    }, { root: null, rootMargin: '300px', threshold: 0 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return
    const script = document.createElement('script')
    script.src = 'https://www.instagram.com/embed.js'
    script.async = true
    document.body.appendChild(script)
    if (window.instgrm) {
      try { window.instgrm.Embeds.process() } catch {}
    }
    return () => { try { document.body.removeChild(script) } catch {} }
  }, [isVisible])

  return (
    <section className="instagram-section">
      <div className="instagram-container" ref={containerRef}>
        <div className="instagram-header">
          <h2 className="instagram-title">
            <svg 
              className="instagram-icon" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" 
                fill="url(#instagram-gradient)"
              />
              <defs>
                <linearGradient id="instagram-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#833AB4" />
                  <stop offset="50%" stopColor="#FD1D1D" />
                  <stop offset="100%" stopColor="#FCAF45" />
                </linearGradient>
              </defs>
            </svg>
            Síguenos en Instagram
          </h2>
          <p className="instagram-subtitle">Descubre nuestras últimas publicaciones y promociones</p>
        </div>
        
        <div className="instagram-grid-embeds instagram-compact">
          {/* Embed 1 */}
          <div className="instagram-embed-wrapper">
            <blockquote className="instagram-media" data-instgrm-permalink="https://www.instagram.com/p/DPSFmqXiVf8/?utm_source=ig_embed&amp;utm_campaign=loading" data-instgrm-version="14" style={{ background:'#FFF', border:0, borderRadius:'3px', boxShadow:'0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)', margin: '1px', maxWidth:'540px', minWidth:'326px', padding:0, width:'99.375%' }}></blockquote>
          </div>

          {/* Embed 2 */}
          <div className="instagram-embed-wrapper">
            <blockquote className="instagram-media" data-instgrm-permalink="https://www.instagram.com/reel/DPFNlv8jEFM/?utm_source=ig_embed&amp;utm_campaign=loading" data-instgrm-version="14" style={{ background:'#FFF', border:0, borderRadius:'3px', boxShadow:'0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)', margin: '1px', maxWidth:'540px', minWidth:'326px', padding:0, width:'99.375%' }}></blockquote>
          </div>

          {/* Embed 3 */}
          <div className="instagram-embed-wrapper">
            <blockquote className="instagram-media" data-instgrm-permalink="https://www.instagram.com/p/DO6iUgllboZ/?utm_source=ig_embed&amp;utm_campaign=loading" data-instgrm-version="14" style={{ background:'#FFF', border:0, borderRadius:'3px', boxShadow:'0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)', margin: '1px', maxWidth:'540px', minWidth:'326px', padding:0, width:'99.375%' }}></blockquote>
          </div>
        </div>
      </div>
    </section>
  )
}

// Declaración para TypeScript
declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void
      }
    }
  }
}

export default InstagramSection

