import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Producto, CartItem } from '../types'

interface CartContextType {
  cartItems: CartItem[]
  cartOpen: boolean
  setCartOpen: (open: boolean) => void
  addToCart: (product: Producto) => void
  removeFromCart: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  cartTotal: number
  cartItemCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

interface CartProviderProps {
  children: ReactNode
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)

  // Cargar carrito desde localStorage al inicializar
  useEffect(() => {
    const savedIds = localStorage.getItem('productoIds')
    if (savedIds) {
      const ids = JSON.parse(savedIds)
      const items: CartItem[] = []
      
      ids.forEach((id: string) => {
        const savedProduct = localStorage.getItem(`producto-${id}`)
        if (savedProduct) {
          items.push(JSON.parse(savedProduct))
        }
      })
      
      setCartItems(items)
    }
  }, [])

  const addToCart = (product: Producto) => {
    const existingItem = cartItems.find(item => item.id === product.id)
    
    if (existingItem) {
      // Si ya existe, incrementar cantidad
      updateQuantity(product.id, existingItem.cantidad + 1)
    } else {
      // Si es nuevo, agregarlo
      const newItem: CartItem = { ...product, cantidad: 1 }
      const newItems = [...cartItems, newItem]
      setCartItems(newItems)
      
      // Guardar en localStorage
      const ids = newItems.map(item => item.id.toString())
      localStorage.setItem('productoIds', JSON.stringify(ids))
      localStorage.setItem(`producto-${product.id}`, JSON.stringify(newItem))
    }
  }

  const removeFromCart = (productId: number) => {
    const newItems = cartItems.filter(item => item.id !== productId)
    setCartItems(newItems)
    
    // Actualizar localStorage
    const ids = newItems.map(item => item.id.toString())
    localStorage.setItem('productoIds', JSON.stringify(ids))
    localStorage.removeItem(`producto-${productId}`)
  }

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    
    const newItems = cartItems.map(item =>
      item.id === productId ? { ...item, cantidad: quantity } : item
    )
    setCartItems(newItems)
    
    // Actualizar localStorage
    const updatedItem = newItems.find(item => item.id === productId)
    if (updatedItem) {
      localStorage.setItem(`producto-${productId}`, JSON.stringify(updatedItem))
    }
  }

  const clearCart = () => {
    setCartItems([])
    localStorage.removeItem('productoIds')
    cartItems.forEach(item => {
      localStorage.removeItem(`producto-${item.id}`)
    })
  }

  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.cantidad), 0)
  const cartItemCount = cartItems.reduce((total, item) => total + item.cantidad, 0)

  const value: CartContextType = {
    cartItems,
    cartOpen,
    setCartOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    cartItemCount
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
} 