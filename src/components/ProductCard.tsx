import React from 'react'
import { ProductoML } from '../types'

interface ProductCardProps {
  product: ProductoML
  onClick?: (product: ProductoML) => void
  showAddButton?: boolean
  onAddToCart?: (product: ProductoML) => void
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)

// Usa el mismo markup/clases que la tienda (FeaturedProducts/TiendaPage)
const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, showAddButton, onAddToCart }) => {
  const imagenOriginal = product.images && product.images.length > 0
    ? product.images[0].url
    : product.main_image

  const getOptimizedImageUrl = (url: string) => {
    if (!url) return url
    if (url.match(/-[IOSV]\.(jpg|jpeg|png|webp)$/i)) {
      return url.replace(/-[IOSV]\.(jpg|jpeg|png|webp)$/i, '-V.jpg')
    }
    if (url.match(/\.(jpg|jpeg|png|webp)$/i)) {
      return url.replace(/\.(jpg|jpeg|png|webp)$/i, '-V.jpg')
    }
    return url
  }

  const imagenPrincipal = getOptimizedImageUrl(imagenOriginal || '')
  const tieneDescuento = product.descuento?.activo
  const precioOriginal = product.descuento?.precio_original
  const porcentajeDescuento = product.descuento?.porcentaje
  const tieneDescuentoML = !!product.descuento_ml?.original_price
  const precioOriginalML = product.descuento_ml?.original_price
  const porcentajeDescuentoML = precioOriginalML
    ? Math.round(((precioOriginalML - product.price) / precioOriginalML) * 100)
    : 0

  return (
    <div
      className="product-card"
      onClick={() => onClick?.(product)}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="product-image-container">
        <img
          src={imagenPrincipal}
          alt={product.title}
          className="product-image"
          loading="lazy"
          decoding="async"
        />
        {(tieneDescuento && porcentajeDescuento) || tieneDescuentoML ? (
          <div
            className="product-badge"
            style={{
              background: tieneDescuentoML
                ? 'linear-gradient(135deg, #FFE600 0%, #FFC300 100%)'
                : 'linear-gradient(135deg, #d32f2f 0%, #e53935 100%)',
              color: tieneDescuentoML ? '#000' : 'white',
            }}
          >
            {tieneDescuentoML && (
              <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>ML</span>
            )}
            -{tieneDescuentoML ? porcentajeDescuentoML : porcentajeDescuento}%
          </div>
        ) : (
          <div className="product-badge">Oferta</div>
        )}
      </div>

      <div className="product-info">
        <h3 className="product-name">{product.title}</h3>
        <div className="product-price-container">
          {(tieneDescuento && precioOriginal) || tieneDescuentoML ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span
                style={{ textDecoration: 'line-through', color: '#999', fontSize: '1rem', lineHeight: 1 }}
              >
                {formatPrice(tieneDescuentoML ? (precioOriginalML ?? 0) : (precioOriginal ?? 0))}
              </span>
              <span
                className="product-price"
                style={{ color: '#d32f2f', fontWeight: 700, fontSize: '1rem', lineHeight: 1 }}
              >
                {formatPrice(product.price)}
              </span>
            </div>
          ) : (
            <span className="product-price">{formatPrice(product.price)}</span>
          )}
        </div>
        {showAddButton && (
          <div style={{ marginTop: 8 }}>
            <button
              className="btn btn-primary"
              onClick={(e) => { e.stopPropagation(); onAddToCart?.(product) }}
            >
              Agregar al carrito
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductCard


