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
  image: string
  description: string
  price: number
  currency: string
  availability: string
  brand?: string
  category?: string
  sku?: string
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
      const existingScript = document.getElementById('product-schema')
      if (existingScript) {
        existingScript.remove()
      }

      const schema = {
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name: productSchema.name,
        image: productSchema.image,
        description: productSchema.description,
        offers: {
          '@type': 'Offer',
          url: url,
          priceCurrency: productSchema.currency,
          price: productSchema.price,
          availability: productSchema.availability === 'in stock' 
            ? 'https://schema.org/InStock' 
            : 'https://schema.org/OutOfStock',
          itemCondition: 'https://schema.org/NewCondition'
        }
      }

      // Agregar campos opcionales
      if (productSchema.brand) {
        schema['brand'] = {
          '@type': 'Brand',
          name: productSchema.brand
        }
      }

      if (productSchema.category) {
        schema['category'] = productSchema.category
      }

      if (productSchema.sku) {
        schema['sku'] = productSchema.sku
      }

      const script = document.createElement('script')
      script.id = 'product-schema'
      script.type = 'application/ld+json'
      script.text = JSON.stringify(schema)
      document.head.appendChild(script)
    }
  }, [title, description, keywords, image, url, type, price, currency, availability, productSchema])

  return null
}

export default SEO

