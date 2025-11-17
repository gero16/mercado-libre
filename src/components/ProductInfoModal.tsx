import React, { useState, useEffect } from 'react'
import { ProductInfoService, ProductInfoResponse } from '../services/productInfo'
import '../css/product-info-modal.css'

interface ProductInfoModalProps {
  productId: string
  productTitle?: string
  onClose: () => void
}

const ProductInfoModal: React.FC<ProductInfoModalProps> = ({ productId, productTitle, onClose }) => {
  const [info, setInfo] = useState<ProductInfoResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProductInfo()
  }, [productId])

  const loadProductInfo = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await ProductInfoService.getProductInfo(productId)
      setInfo(data)
    } catch (err: any) {
      setError(err.message || 'Error al cargar información del producto')
      console.error('Error cargando info del producto:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: string | Date) => {
    if (!date) return 'N/A'
    try {
      return new Date(date).toLocaleString('es-UY', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return String(date)
    }
  }

  const getStockStatusColor = (sincronizado: boolean | null) => {
    if (sincronizado === null) return '#666'
    return sincronizado ? '#10b981' : '#ef4444'
  }

  const getStockStatusText = (sincronizado: boolean | null) => {
    if (sincronizado === null) return 'No disponible'
    return sincronizado ? 'Sincronizado' : 'Desincronizado'
  }

  return (
    <div className="product-info-modal-overlay" onClick={onClose}>
      <div className="product-info-modal" onClick={(e) => e.stopPropagation()}>
        <div className="product-info-modal-header">
          <h2>Información del Producto</h2>
          <button className="product-info-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="product-info-modal-content">
          {loading ? (
            <div className="product-info-loading">
              <div className="spinner"></div>
              <p>Cargando información...</p>
            </div>
          ) : error ? (
            <div className="product-info-error">
              <p>❌ {error}</p>
              <button onClick={loadProductInfo} className="retry-button">Reintentar</button>
            </div>
          ) : info ? (
            <>
              {/* Comparación de Stock - Destacado */}
              <div className="product-info-section stock-comparison">
                <h3>📊 Comparación de Stock</h3>
                <div className="stock-comparison-grid">
                  <div className="stock-card">
                    <div className="stock-label">Stock en BD</div>
                    <div className="stock-value">{info.comparacion_stock.stock_bd}</div>
                  </div>
                  <div className="stock-card">
                    <div className="stock-label">Stock en ML</div>
                    <div className="stock-value">
                      {info.comparacion_stock.stock_ml !== null 
                        ? info.comparacion_stock.stock_ml 
                        : 'N/A'}
                    </div>
                  </div>
                  <div className="stock-card">
                    <div className="stock-label">Diferencia</div>
                    <div className="stock-value">
                      {info.comparacion_stock.diferencia !== null 
                        ? (info.comparacion_stock.diferencia > 0 ? '+' : '') + info.comparacion_stock.diferencia
                        : 'N/A'}
                    </div>
                  </div>
                  <div className="stock-card status">
                    <div className="stock-label">Estado</div>
                    <div 
                      className="stock-value"
                      style={{ color: getStockStatusColor(info.comparacion_stock.sincronizado) }}
                    >
                      {getStockStatusText(info.comparacion_stock.sincronizado)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Información de Base de Datos */}
              <div className="product-info-section">
                <h3>💾 Base de Datos</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">ID:</span>
                    <span className="info-value">{info.producto_bd._id}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">ML ID:</span>
                    <span className="info-value">{info.producto_bd.ml_id}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Título:</span>
                    <span className="info-value">{info.producto_bd.title}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Precio:</span>
                    <span className="info-value">US$ {info.producto_bd.price.toFixed(2)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Stock:</span>
                    <span className="info-value">{info.producto_bd.available_quantity}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Estado:</span>
                    <span className="info-value">{info.producto_bd.status}</span>
                  </div>
                  {info.producto_bd.seller_sku && (
                    <div className="info-item">
                      <span className="info-label">SKU:</span>
                      <span className="info-value">{info.producto_bd.seller_sku}</span>
                    </div>
                  )}
                  {info.producto_bd.catalog_product_id && (
                    <div className="info-item">
                      <span className="info-label">Catálogo ID:</span>
                      <span className="info-value">{info.producto_bd.catalog_product_id}</span>
                    </div>
                  )}
                  {info.producto_bd.tipo_venta && (
                    <div className="info-item">
                      <span className="info-label">Tipo de Venta:</span>
                      <span className="info-value">{info.producto_bd.tipo_venta}</span>
                    </div>
                  )}
                  <div className="info-item">
                    <span className="info-label">Última Actualización:</span>
                    <span className="info-value">{formatDate(info.producto_bd.last_updated)}</span>
                  </div>
                </div>
              </div>

              {/* Información de MercadoLibre */}
              {info.producto_ml ? (
                <div className="product-info-section">
                  <h3>🛍️ MercadoLibre</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">ML ID:</span>
                      <span className="info-value">{info.producto_ml.ml_id}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Título:</span>
                      <span className="info-value">{info.producto_ml.title}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Precio:</span>
                      <span className="info-value">US$ {info.producto_ml.price.toFixed(2)}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Stock:</span>
                      <span className="info-value">{info.producto_ml.available_quantity}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Vendidos:</span>
                      <span className="info-value">{info.producto_ml.sold_quantity}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Estado:</span>
                      <span className="info-value">{info.producto_ml.status}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Condición:</span>
                      <span className="info-value">{info.producto_ml.condition}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Health:</span>
                      <span className="info-value">{info.producto_ml.health}</span>
                    </div>
                    {info.producto_ml.shipping && (
                      <>
                        <div className="info-item">
                          <span className="info-label">Envío Gratis:</span>
                          <span className="info-value">
                            {info.producto_ml.shipping.free_shipping ? 'Sí' : 'No'}
                          </span>
                        </div>
                        {info.producto_ml.shipping.logistic_type && (
                          <div className="info-item">
                            <span className="info-label">Tipo Logístico:</span>
                            <span className="info-value">{info.producto_ml.shipping.logistic_type}</span>
                          </div>
                        )}
                      </>
                    )}
                    {info.producto_ml.permalink && (
                      <div className="info-item full-width">
                        <span className="info-label">Link:</span>
                        <a 
                          href={info.producto_ml.permalink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="info-link"
                        >
                          Ver en MercadoLibre
                        </a>
                      </div>
                    )}
                    <div className="info-item">
                      <span className="info-label">Creado:</span>
                      <span className="info-value">{formatDate(info.producto_ml.date_created)}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Actualizado:</span>
                      <span className="info-value">{formatDate(info.producto_ml.last_updated)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="product-info-section error">
                  <h3>⚠️ Error obteniendo información de MercadoLibre</h3>
                  <p>{info.error_ml || 'No se pudo conectar con MercadoLibre'}</p>
                </div>
              )}

              <div className="product-info-actions">
                <button onClick={loadProductInfo} className="refresh-button">
                  🔄 Actualizar Información
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default ProductInfoModal

