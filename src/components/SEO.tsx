import React, { useEffect } from 'react'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
  type?: 'website' | 'product' | 'article'
  price?: number
  currency?: string
  availability?: 'in stock' | 'out of stock' | 'preorder'
  productSchema?: ProductSchema
}

interface ProductSchema {
  name: string
  image: string | string[] // Soporta imagen única o múltiples imágenes
  description: string
  price: number
  currency: string
  availability: string
  brand?: string
  category?: string
  sku?: string
  rating?: {
    average?: number
    count?: number
  }
  breadcrumbs?: Array<{
    name: string
    url: string
  }>
}

const SEO: React.FC<SEOProps> = ({
  title = 'Tienda Virtual - Productos de Calidad',
  description = 'Descubre nuestra tienda virtual con la mejor selección de productos de calidad.',
  keywords = 'tienda virtual, ropa deportiva, productos deportivos',
  image = '/img/icono.png',
  url = 'https://mercado-libre-roan.vercel.app',
  type = 'website',
  price,
  currency = 'USD',
  availability = 'in stock',
  productSchema
}) => {
  useEffect(() => {
    // Actualizar título
    document.title = title

    // Helper para actualizar o crear meta tags
    const updateMetaTag = (selector: string, attribute: string, content: string) => {
      let element = document.querySelector(selector)
      if (element) {
        element.setAttribute('content', content)
      } else {
        element = document.createElement('meta')
        if (selector.includes('property')) {
          element.setAttribute('property', attribute)
        } else {
          element.setAttribute('name', attribute)
        }
        element.setAttribute('content', content)
        document.head.appendChild(element)
      }
    }

    // Actualizar meta tags básicos
    updateMetaTag('meta[name="description"]', 'description', description)
    updateMetaTag('meta[name="keywords"]', 'keywords', keywords)

    // Actualizar Open Graph
    updateMetaTag('meta[property="og:title"]', 'og:title', title)
    updateMetaTag('meta[property="og:description"]', 'og:description', description)
    updateMetaTag('meta[property="og:url"]', 'og:url', url)
    updateMetaTag('meta[property="og:type"]', 'og:type', type)
    updateMetaTag('meta[property="og:image"]', 'og:image', image)

    // Actualizar Twitter Card
    updateMetaTag('meta[name="twitter:title"]', 'twitter:title', title)
    updateMetaTag('meta[name="twitter:description"]', 'twitter:description', description)
    updateMetaTag('meta[name="twitter:image"]', 'twitter:image', image)

    // Si es un producto, agregar meta tags de producto
    if (type === 'product' && price) {
      updateMetaTag('meta[property="og:price:amount"]', 'og:price:amount', price.toString())
      updateMetaTag('meta[property="og:price:currency"]', 'og:price:currency', currency)
      updateMetaTag('meta[property="product:availability"]', 'product:availability', availability)
    }

    // Actualizar canonical URL
    let canonical = document.querySelector('link[rel="canonical"]')
    if (canonical) {
      canonical.setAttribute('href', url)
    } else {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      canonical.setAttribute('href', url)
      document.head.appendChild(canonical)
    }

    // Agregar datos estructurados JSON-LD si es un producto
    if (productSchema) {
      // Remover schemas existentes
      const existingProductScript = document.getElementById('product-schema')
      if (existingProductScript) {
        existingProductScript.remove()
      }
      const existingBreadcrumbScript = document.getElementById('breadcrumb-schema')
      if (existingBreadcrumbScript) {
        existingBreadcrumbScript.remove()
      }

      // Preparar imágenes (soporta string o array)
      const images = Array.isArray(productSchema.image) 
        ? productSchema.image 
        : [productSchema.image]

      const schema: any = {
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name: productSchema.name,
        image: images.length > 1 ? images : images[0], // Array si hay múltiples, string si es una sola
        description: productSchema.description,
        offers: {
          '@type': 'Offer',
          url: url,
          priceCurrency: productSchema.currency,
          price: productSchema.price.toString(),
          availability: productSchema.availability === 'in stock' 
            ? 'https://schema.org/InStock' 
            : 'https://schema.org/OutOfStock',
          itemCondition: 'https://schema.org/NewCondition',
          priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 1 año desde ahora
        }
      }

      // Agregar campos opcionales
      if (productSchema.brand) {
        schema.brand = {
          '@type': 'Brand',
          name: productSchema.brand
        }
      }

      if (productSchema.category) {
        schema.category = productSchema.category
      }

      if (productSchema.sku) {
        schema.sku = productSchema.sku
      }

      // Agregar ratings/reviews si están disponibles
      if (productSchema.rating && productSchema.rating.average && productSchema.rating.count) {
        schema.aggregateRating = {
          '@type': 'AggregateRating',
          ratingValue: productSchema.rating.average.toString(),
          reviewCount: productSchema.rating.count.toString(),
          bestRating: '5',
          worstRating: '1'
        }
      }

      // Crear y agregar script de producto
      const productScript = document.createElement('script')
      productScript.id = 'product-schema'
      productScript.type = 'application/ld+json'
      productScript.text = JSON.stringify(schema)
      document.head.appendChild(productScript)

      // Agregar breadcrumbs estructurados si están disponibles
      if (productSchema.breadcrumbs && productSchema.breadcrumbs.length > 0) {
        const breadcrumbSchema = {
          '@context': 'https://schema.org/',
          '@type': 'BreadcrumbList',
          itemListElement: productSchema.breadcrumbs.map((crumb, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: crumb.name,
            item: crumb.url
          }))
        }

        const breadcrumbScript = document.createElement('script')
        breadcrumbScript.id = 'breadcrumb-schema'
        breadcrumbScript.type = 'application/ld+json'
        breadcrumbScript.text = JSON.stringify(breadcrumbSchema)
        document.head.appendChild(breadcrumbScript)
      }
    }
  }, [title, description, keywords, image, url, type, price, currency, availability, productSchema])

  return null
}

export default SEO

