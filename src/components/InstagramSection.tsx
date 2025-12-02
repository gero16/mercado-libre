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
            <blockquote
              className="instagram-media"
              data-instgrm-permalink="https://www.instagram.com/p/DRiSBqFjFkd/?utm_source=ig_embed&amp;utm_campaign=loading"
              data-instgrm-version="14"
              style={{
                background: '#FFF',
                border: 0,
                borderRadius: '3px',
                boxShadow: '0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)',
                margin: '1px',
                maxWidth: '540px',
                minWidth: '326px',
                padding: 0,
                width: '99.375%',
                // width: '-webkit-calc(100% - 2px)', // React no soporta prefijos
                // width: 'calc(100% - 2px)', // ya se maneja con 99.375%
              }}
            >
              {/* El contenido interno lo carga Instagram */}
            </blockquote>
          </div>

          {/* Embed 2 */}
          <div className="instagram-embed-wrapper">
            <blockquote 
            className="instagram-media" data-instgrm-permalink="https://www.instagram.com/reel/DRNry7XDAGA/?utm_source=ig_embed&amp;utm_campaign=loading" data-instgrm-version="14" style={{
              background: '#FFF',
              border: 0,
              borderRadius: '3px',
              boxShadow: '0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)',
              margin: '1px',
              maxWidth: '540px',
              minWidth: '326px',
              padding: 0,
              width: '99.375%',
            }}>
              <div style={{ padding: 16 }}>
                <a
                  href="https://www.instagram.com/reel/DRNry7XDAGA/?utm_source=ig_embed&utm_campaign=loading"
                  style={{
                    background: '#FFFFFF',
                    lineHeight: 0,
                    padding: '0 0',
                    textAlign: 'center',
                    textDecoration: 'none',
                    width: '100%',
                  }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <div style={{ backgroundColor: '#F4F4F4', borderRadius: '50%', flexGrow: 0, height: 40, marginRight: 14, width: 40 }}></div>
                    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'center' }}>
                      <div style={{ backgroundColor: '#F4F4F4', borderRadius: 4, flexGrow: 0, height: 14, marginBottom: 6, width: 100 }}></div>
                      <div style={{ backgroundColor: '#F4F4F4', borderRadius: 4, flexGrow: 0, height: 14, width: 60 }}></div>
                    </div>
                  </div>
                  <div style={{ padding: '19% 0' }}></div>
                  <div style={{ display: 'block', height: 50, margin: '0 auto 12px', width: 50 }}>
                    <svg width="50px" height="50px" viewBox="0 0 60 60" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
                      <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                        <g transform="translate(-511.000000, -20.000000)" fill="#000000">
                          <g>
                            <path d="M556.869,30.41 C554.814,30.41 553.148,32.076 553.148,34.131 C553.148,36.186 554.814,37.852 556.869,37.852 C558.924,37.852 560.59,36.186 560.59,34.131 C560.59,32.076 558.924,30.41 556.869,30.41 M541,60.657 C535.114,60.657 530.342,55.887 530.342,50 C530.342,44.114 535.114,39.342 541,39.342 C546.887,39.342 551.658,44.114 551.658,50 C551.658,55.887 546.887,60.657 541,60.657 M541,33.886 C532.1,33.886 524.886,41.1 524.886,50 C524.886,58.899 532.1,66.113 541,66.113 C549.9,66.113 557.115,58.899 557.115,50 C557.115,41.1 549.9,33.886 541,33.886 M565.378,62.101 C565.244,65.022 564.756,66.606 564.346,67.663 C563.803,69.06 563.154,70.057 562.106,71.106 C561.058,72.155 560.06,72.803 558.662,73.347 C557.607,73.757 556.021,74.244 553.102,74.378 C549.944,74.521 548.997,74.552 541,74.552 C533.003,74.552 532.056,74.521 528.898,74.378 C525.979,74.244 524.393,73.757 523.338,73.347 C521.94,72.803 520.942,72.155 519.894,71.106 C518.846,70.057 518.197,69.06 517.654,67.663 C517.244,66.606 516.755,65.022 516.623,62.101 C516.479,58.943 516.448,57.996 516.448,50 C516.448,42.003 516.479,41.056 516.623,37.899 C516.755,34.978 517.244,33.391 517.654,32.338 C518.197,30.938 518.846,29.942 519.894,28.894 C520.942,27.846 521.94,27.196 523.338,26.654 C524.393,26.244 525.979,25.756 528.898,25.623 C532.057,25.479 533.004,25.448 541,25.448 C548.997,25.448 549.943,25.479 553.102,25.623 C556.021,25.756 557.607,26.244 558.662,26.654 C560.06,27.196 561.058,27.846 562.106,28.894 C563.154,29.942 563.803,30.938 564.346,32.338 C564.756,33.391 565.244,34.978 565.378,37.899 C565.522,41.056 565.552,42.003 565.552,50 C565.552,57.996 565.522,58.943 565.378,62.101 M570.82,37.631 C570.674,34.438 570.167,32.258 569.425,30.349 C568.659,28.377 567.633,26.702 565.965,25.035 C564.297,23.368 562.623,22.342 560.652,21.575 C558.743,20.834 556.562,20.326 553.369,20.18 C550.169,20.033 549.148,20 541,20 C532.853,20 531.831,20.033 528.631,20.18 C525.438,20.326 523.257,20.834 521.349,21.575 C519.376,22.342 517.703,23.368 516.035,25.035 C514.368,26.702 513.342,28.377 512.574,30.349 C511.834,32.258 511.326,34.438 511.181,37.631 C511.035,40.831 511,41.851 511,50 C511,58.147 511.035,59.17 511.181,62.369 C511.326,65.562 511.834,67.743 512.574,69.651 C513.342,71.625 514.368,73.296 516.035,74.965 C517.703,76.634 519.376,77.658 521.349,78.425 C523.257,79.167 525.438,79.673 528.631,79.82 C531.831,79.965 532.853,80.001 541,80.001 C549.148,80.001 550.169,79.965 553.369,79.82 C556.562,79.673 558.743,79.167 560.652,78.425 C562.623,77.658 564.297,76.634 565.965,74.965 C567.633,73.296 568.659,71.625 569.425,69.651 C570.167,67.743 570.674,65.562 570.82,62.369 C570.966,59.17 571,58.147 571,50 C571,41.851 570.966,40.831 570.82,37.631" />
                          </g>
                        </g>
                      </g>
                    </svg>
                  </div>
                  <div style={{ paddingTop: 8 }}>
                    <div style={{ color: '#3897f0', fontFamily: 'Arial,sans-serif', fontSize: 14, fontStyle: 'normal', fontWeight: 550, lineHeight: '18px' }}>
                      Ver esta publicación en Instagram
                    </div>
                  </div>
                  <div style={{ padding: '12.5% 0' }}></div>
                  <div style={{ display: 'flex', flexDirection: 'row', marginBottom: 14, alignItems: 'center' }}>
                    <div>
                      <div style={{ backgroundColor: '#F4F4F4', borderRadius: '50%', height: 12.5, width: 12.5, transform: 'translateX(0px) translateY(7px)' }}></div>
                      <div style={{ backgroundColor: '#F4F4F4', height: 12.5, transform: 'rotate(-45deg) translateX(3px) translateY(1px)', width: 12.5, flexGrow: 0, marginRight: 14, marginLeft: 2 }}></div>
                      <div style={{ backgroundColor: '#F4F4F4', borderRadius: '50%', height: 12.5, width: 12.5, transform: 'translateX(9px) translateY(-18px)' }}></div>
                    </div>
                    <div style={{ marginLeft: 8 }}>
                      <div style={{ backgroundColor: '#F4F4F4', borderRadius: '50%', flexGrow: 0, height: 20, width: 20 }}></div>
                      <div style={{ width: 0, height: 0, borderTop: '2px solid transparent', borderLeft: '6px solid #f4f4f4', borderBottom: '2px solid transparent', transform: 'translateX(16px) translateY(-4px) rotate(30deg)' }}></div>
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                      <div style={{ width: 0, borderTop: '8px solid #F4F4F4', borderRight: '8px solid transparent', transform: 'translateY(16px)' }}></div>
                      <div style={{ backgroundColor: '#F4F4F4', flexGrow: 0, height: 12, width: 16, transform: 'translateY(-4px)' }}></div>
                      <div style={{ width: 0, height: 0, borderTop: '8px solid #F4F4F4', borderLeft: '8px solid transparent', transform: 'translateY(-4px) translateX(8px)' }}></div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'center', marginBottom: 24 }}>
                    <div style={{ backgroundColor: '#F4F4F4', borderRadius: 4, flexGrow: 0, height: 14, marginBottom: 6, width: 224 }}></div>
                    <div style={{ backgroundColor: '#F4F4F4', borderRadius: 4, flexGrow: 0, height: 14, width: 144 }}></div>
                  </div>
                </a>
                <p style={{ color: '#c9c8cd', fontFamily: 'Arial,sans-serif', fontSize: 14, lineHeight: '17px', marginBottom: 0, marginTop: 8, overflow: 'hidden', padding: '8px 0 7px', textAlign: 'center', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <a
                    href="https://www.instagram.com/reel/DRNry7XDAGA/?utm_source=ig_embed&utm_campaign=loading"
                    style={{ color: '#c9c8cd', fontFamily: 'Arial,sans-serif', fontSize: 14, fontStyle: 'normal', fontWeight: 'normal', lineHeight: '17px', textDecoration: 'none' }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Una publicación compartida por Poppy Shop (@poppyshop.uy)
                  </a>
                </p>
              </div>
            </blockquote>
            <script async src="//www.instagram.com/embed.js"></script>
          </div>

          {/* Embed 3 */}
          <div className="instagram-embed-wrapper">
            <blockquote
            className="instagram-media" data-instgrm-permalink="https://www.instagram.com/reel/DQ-SeUCiV3h/?utm_source=ig_embed&amp;utm_campaign=loading" data-instgrm-version="14" style={{
              background: '#FFF',
              border: 0,
              borderRadius: '3px',
              boxShadow: '0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)',
              margin: '1px',
              maxWidth: '540px',
              minWidth: '326px',
              padding: 0,
              width: '99.375%',
            }}>
              <div style={{ padding: 16 }}>
                <a
                  href="https://www.instagram.com/reel/DQ-SeUCiV3h/?utm_source=ig_embed&utm_campaign=loading"
                  style={{
                    background: '#FFFFFF',
                    lineHeight: 0,
                    padding: '0 0',
                    textAlign: 'center',
                    textDecoration: 'none',
                    width: '100%',
                  }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <div style={{ backgroundColor: '#F4F4F4', borderRadius: '50%', flexGrow: 0, height: 40, marginRight: 14, width: 40 }}></div>
                    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'center' }}>
                      <div style={{ backgroundColor: '#F4F4F4', borderRadius: 4, flexGrow: 0, height: 14, marginBottom: 6, width: 100 }}></div>
                      <div style={{ backgroundColor: '#F4F4F4', borderRadius: 4, flexGrow: 0, height: 14, width: 60 }}></div>
                    </div>
                  </div>
                  <div style={{ padding: '19% 0' }}></div>
                  <div style={{ display: 'block', height: 50, margin: '0 auto 12px', width: 50 }}>
                    <svg width="50px" height="50px" viewBox="0 0 60 60" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
                      <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                        <g transform="translate(-511.000000, -20.000000)" fill="#000000">
                          <g>
                            <path d="M556.869,30.41 C554.814,30.41 553.148,32.076 553.148,34.131 C553.148,36.186 554.814,37.852 556.869,37.852 C558.924,37.852 560.59,36.186 560.59,34.131 C560.59,32.076 558.924,30.41 556.869,30.41 M541,60.657 C535.114,60.657 530.342,55.887 530.342,50 C530.342,44.114 535.114,39.342 541,39.342 C546.887,39.342 551.658,44.114 551.658,50 C551.658,55.887 546.887,60.657 541,60.657 M541,33.886 C532.1,33.886 524.886,41.1 524.886,50 C524.886,58.899 532.1,66.113 541,66.113 C549.9,66.113 557.115,58.899 557.115,50 C557.115,41.1 549.9,33.886 541,33.886 M565.378,62.101 C565.244,65.022 564.756,66.606 564.346,67.663 C563.803,69.06 563.154,70.057 562.106,71.106 C561.058,72.155 560.06,72.803 558.662,73.347 C557.607,73.757 556.021,74.244 553.102,74.378 C549.944,74.521 548.997,74.552 541,74.552 C533.003,74.552 532.056,74.521 528.898,74.378 C525.979,74.244 524.393,73.757 523.338,73.347 C521.94,72.803 520.942,72.155 519.894,71.106 C518.846,70.057 518.197,69.06 517.654,67.663 C517.244,66.606 516.755,65.022 516.623,62.101 C516.479,58.943 516.448,57.996 516.448,50 C516.448,42.003 516.479,41.056 516.623,37.899 C516.755,34.978 517.244,33.391 517.654,32.338 C518.197,30.938 518.846,29.942 519.894,28.894 C520.942,27.846 521.94,27.196 523.338,26.654 C524.393,26.244 525.979,25.756 528.898,25.623 C532.057,25.479 533.004,25.448 541,25.448 C548.997,25.448 549.943,25.479 553.102,25.623 C556.021,25.756 557.607,26.244 558.662,26.654 C560.06,27.196 561.058,27.846 562.106,28.894 C563.154,29.942 563.803,30.938 564.346,32.338 C564.756,33.391 565.244,34.978 565.378,37.899 C565.522,41.056 565.552,42.003 565.552,50 C565.552,57.996 565.522,58.943 565.378,62.101 M570.82,37.631 C570.674,34.438 570.167,32.258 569.425,30.349 C568.659,28.377 567.633,26.702 565.965,25.035 C564.297,23.368 562.623,22.342 560.652,21.575 C558.743,20.834 556.562,20.326 553.369,20.18 C550.169,20.033 549.148,20 541,20 C532.853,20 531.831,20.033 528.631,20.18 C525.438,20.326 523.257,20.834 521.349,21.575 C519.376,22.342 517.703,23.368 516.035,25.035 C514.368,26.702 513.342,28.377 512.574,30.349 C511.834,32.258 511.326,34.438 511.181,37.631 C511.035,40.831 511,41.851 511,50 C511,58.147 511.035,59.17 511.181,62.369 C511.326,65.562 511.834,67.743 512.574,69.651 C513.342,71.625 514.368,73.296 516.035,74.965 C517.703,76.634 519.376,77.658 521.349,78.425 C523.257,79.167 525.438,79.673 528.631,79.82 C531.831,79.965 532.853,80.001 541,80.001 C549.148,80.001 550.169,79.965 553.369,79.82 C556.562,79.673 558.743,79.167 560.652,78.425 C562.623,77.658 564.297,76.634 565.965,74.965 C567.633,73.296 568.659,71.625 569.425,69.651 C570.167,67.743 570.674,65.562 570.82,62.369 C570.966,59.17 571,58.147 571,50 C571,41.851 570.966,40.831 570.82,37.631" />
                          </g>
                        </g>
                      </g>
                    </svg>
                  </div>
                  <div style={{ paddingTop: 8 }}>
                    <div style={{ color: '#3897f0', fontFamily: 'Arial,sans-serif', fontSize: 14, fontStyle: 'normal', fontWeight: 550, lineHeight: '18px' }}>
                      Ver esta publicación en Instagram
                    </div>
                  </div>
                  <div style={{ padding: '12.5% 0' }}></div>
                  <div style={{ display: 'flex', flexDirection: 'row', marginBottom: 14, alignItems: 'center' }}>
                    <div>
                      <div style={{ backgroundColor: '#F4F4F4', borderRadius: '50%', height: 12.5, width: 12.5, transform: 'translateX(0px) translateY(7px)' }}></div>
                      <div style={{ backgroundColor: '#F4F4F4', height: 12.5, transform: 'rotate(-45deg) translateX(3px) translateY(1px)', width: 12.5, flexGrow: 0, marginRight: 14, marginLeft: 2 }}></div>
                      <div style={{ backgroundColor: '#F4F4F4', borderRadius: '50%', height: 12.5, width: 12.5, transform: 'translateX(9px) translateY(-18px)' }}></div>
                    </div>
                    <div style={{ marginLeft: 8 }}>
                      <div style={{ backgroundColor: '#F4F4F4', borderRadius: '50%', flexGrow: 0, height: 20, width: 20 }}></div>
                      <div style={{ width: 0, height: 0, borderTop: '2px solid transparent', borderLeft: '6px solid #f4f4f4', borderBottom: '2px solid transparent', transform: 'translateX(16px) translateY(-4px) rotate(30deg)' }}></div>
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                      <div style={{ width: 0, borderTop: '8px solid #F4F4F4', borderRight: '8px solid transparent', transform: 'translateY(16px)' }}></div>
                      <div style={{ backgroundColor: '#F4F4F4', flexGrow: 0, height: 12, width: 16, transform: 'translateY(-4px)' }}></div>
                      <div style={{ width: 0, height: 0, borderTop: '8px solid #F4F4F4', borderLeft: '8px solid transparent', transform: 'translateY(-4px) translateX(8px)' }}></div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'center', marginBottom: 24 }}>
                    <div style={{ backgroundColor: '#F4F4F4', borderRadius: 4, flexGrow: 0, height: 14, marginBottom: 6, width: 224 }}></div>
                    <div style={{ backgroundColor: '#F4F4F4', borderRadius: 4, flexGrow: 0, height: 14, width: 144 }}></div>
                  </div>
                </a>
                <p style={{ color: '#c9c8cd', fontFamily: 'Arial,sans-serif', fontSize: 14, lineHeight: '17px', marginBottom: 0, marginTop: 8, overflow: 'hidden', padding: '8px 0 7px', textAlign: 'center', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <a
                    href="https://www.instagram.com/reel/DQ-SeUCiV3h/?utm_source=ig_embed&utm_campaign=loading"
                    style={{ color: '#c9c8cd', fontFamily: 'Arial,sans-serif', fontSize: 14, fontStyle: 'normal', fontWeight: 'normal', lineHeight: '17px', textDecoration: 'none' }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Una publicación compartida por Poppy Shop (@poppyshop.uy)
                  </a>
                </p>
              </div>
            </blockquote>
            <script async src="//www.instagram.com/embed.js"></script>
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

