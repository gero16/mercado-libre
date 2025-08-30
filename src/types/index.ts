export interface Producto {
  id: string;
  name: string;
  image: string;
  category: string;
  price: number;
  stock: number;
  cantidad: number;
  color?: string;
  size?: string | null; // Aceptar null
}

export interface CartItem extends Producto {
  // CartItem hereda de Producto con size que acepta null
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

export interface Image {
  id: string;
  url: string;
  high_quality?: string;
  _id?: string;
  max_size?: string;
}

export interface Variante {
  _id: string;
  id: string;
  __v: number;
  attribute_combinations: any[];
  color: string;
  images: Image[];
  price: number;
  product_id: string;
  size: string | null;
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
  category_id?: string;
  images: Image[];
}

export interface OrderML {
  items: ProductoML[];
}