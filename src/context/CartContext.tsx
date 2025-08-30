import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Producto, CartItem } from '../types'

interface CartContextType {
  cartItems: CartItem[]
  cartOpen: boolean
  setCartOpen: (open: boolean) => void
  addToCart: (product: Producto & { color?: string; size?: string | null }) => void
  removeFromCart: (product: Producto & { color?: string; size?: string | null }) => void
  updateQuantity: (product: Producto & { color?: string; size?: string | null }, quantity: number) => void
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

  // Utilidad para obtener una clave única de producto+variante+talle
  const getCartItemKey = (item: Partial<CartItem> & { color?: string; size?: string | null }) => {
    // Convertir null a string vacío para la clave
    const colorKey = item.color || '';
    const sizeKey = item.size !== null && item.size !== undefined ? item.size : '';
    return [item.id, colorKey, sizeKey].filter(Boolean).join('-');
  };

  const addToCart = (product: Producto & { color?: string; size?: string | null }) => {
    const productKey = getCartItemKey(product);
    const existingItem = cartItems.find(
      item => getCartItemKey(item) === productKey
    );

    if (existingItem) {
      updateQuantity(product, existingItem.cantidad + (product.cantidad || 1));
    } else {
      const newItem: CartItem = { 
        ...product, 
        cantidad: product.cantidad || 1,
        // Asegurar que size sea null en lugar de undefined si no existe
        size: product.size !== undefined ? product.size : null
      };
      const newItems = [...cartItems, newItem];
      setCartItems(newItems);

      // Guardar en localStorage con clave única
      const ids = newItems.map(item => getCartItemKey(item));
      localStorage.setItem('productoIds', JSON.stringify(ids));
      localStorage.setItem(`producto-${productKey}`, JSON.stringify(newItem));
    }
  };

  const removeFromCart = (product: Producto & { color?: string; size?: string | null }) => {
    const productKey = getCartItemKey(product);
    const newItems = cartItems.filter(item => getCartItemKey(item) !== productKey);
    setCartItems(newItems);
    // Actualizar localStorage
    const ids = newItems.map(item => getCartItemKey(item));
    localStorage.setItem('productoIds', JSON.stringify(ids));
    localStorage.removeItem(`producto-${productKey}`);
  };

  const updateQuantity = (product: Producto & { color?: string; size?: string | null }, quantity: number) => {
    const productKey = getCartItemKey(product);
    if (quantity <= 0) {
      removeFromCart(product);
      return;
    }
    const newItems = cartItems.map(item =>
      getCartItemKey(item) === productKey ? { ...item, cantidad: quantity } : item
    );
    setCartItems(newItems);
    // Actualizar localStorage
    const updatedItem = newItems.find(item => getCartItemKey(item) === productKey);
    if (updatedItem) {
      localStorage.setItem(`producto-${productKey}`, JSON.stringify(updatedItem));
    }
  };

  const clearCart = () => {
    // Limpiar todos los items del localStorage
    cartItems.forEach(item => {
      const itemKey = getCartItemKey(item);
      localStorage.removeItem(`producto-${itemKey}`);
    });
    localStorage.removeItem('productoIds');
    setCartItems([]);
  };

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