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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      )
    }, interval)

    return () => clearInterval(timer)
  }, [images.length, interval])

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
              style={{ backgroundImage: `url(${image})` }}
            />
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
