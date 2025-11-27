import React, { useState, useEffect } from 'react'

interface ImageCarouselProps {
  images: string[]
  interval?: number
  showDots?: boolean
  showArrows?: boolean
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ 
  images, 
  interval = 4000, 
  showDots = true, 
  showArrows = true 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0])) // Pre-cargar primera imagen

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      )
    }, interval)

    return () => clearInterval(timer)
  }, [images.length, interval])

  // Pre-cargar la siguiente imagen cuando cambia el índice
  useEffect(() => {
    const nextIndex = (currentImageIndex + 1) % images.length
    if (!loadedImages.has(nextIndex)) {
      const img = new Image()
      img.src = images[nextIndex]
      img.onload = () => {
        setLoadedImages(prev => new Set([...prev, nextIndex]))
      }
    }
  }, [currentImageIndex, images, loadedImages])

  const goToPrevious = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    )
  }

  const goToNext = () => {
    setCurrentImageIndex((prevIndex => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    ))
  }

  const goToSlide = (index: number) => {
    setCurrentImageIndex(index)
  }

  const handleImageLoad = (index: number) => {
    setLoadedImages(prev => new Set([...prev, index]))
  }

  if (images.length === 0) {
    return null
  }

  return (
    <div className="image-carousel">
      <div className="carousel-container">
        {showArrows && (
          <button 
            className="carousel-arrow carousel-arrow-left" 
            onClick={goToPrevious}
            aria-label="Imagen anterior"
          >
            &#8249;
          </button>
        )}
        
        <div className="carousel-slides">
          {images.map((image, index) => (
            <div
              key={index}
              className={`carousel-slide ${index === currentImageIndex ? 'active' : ''}`}
            >
              {/* Primera imagen: carga inmediata con alta prioridad (LCP) */}
              {index === 0 ? (
                <img
                  src={image}
                  alt={`Carrusel ${index + 1}`}
                  className="carousel-image"
                  fetchPriority="high"
                  loading="eager"
                  decoding="async"
                  onLoad={() => handleImageLoad(index)}
                />
              ) : (
                /* Imágenes secundarias: lazy loading */
                <img
                  src={image}
                  alt={`Carrusel ${index + 1}`}
                  className="carousel-image"
                  loading="lazy"
                  decoding="async"
                  onLoad={() => handleImageLoad(index)}
                />
              )}
            </div>
          ))}
        </div>

        {showArrows && (
          <button 
            className="carousel-arrow carousel-arrow-right" 
            onClick={goToNext}
            aria-label="Imagen siguiente"
          >
            &#8250;
          </button>
        )}
      </div>

      {showDots && (
        <div className="carousel-dots">
          {images.map((_, index) => (
            <button
              key={index}
              className={`carousel-dot ${index === currentImageIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Ir a imagen ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default ImageCarousel
