export interface Producto {
  id: number;
  name: string;
  image: string;
  category: string;
  price: number;
  stock: number;
  cantidad: number;
}

export interface CartItem extends Producto {
  // CartItem hereda de Producto y ya tiene cantidad
}

export interface Order {
  items: Producto[];
}

export interface Category {
  id: string;
  name: string;
  className?: string;
  image?: string;
}

// Interfaces para Mercado Libre
export interface Variante {
  _id: string;
  id: string;
  __v: number;
  color: string;
  image: string;
  product_id: string;
  size: string;
  stock: number;
}

export interface ProductoML {
  _id: string;
  ml_id: string;
  __v: number;
  available_quantity: number;
  main_image: string;
  price: number;
  status: string;
  title: string;
  variantes: Variante[];
  cantidad?: number;
  description?: string;
  categoria?: string;
  images: Array<{
    id: string;
    url: string;
    high_quality: string;
    _id?: string;
  }>;
}

export interface OrderML {
  items: ProductoML[];
} 