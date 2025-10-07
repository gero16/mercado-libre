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
  ml_id?: string;
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
  color?: string;
  size?: string;
  stock: number;
  price?: number;
  images?: Image[];
  // Agregar propiedades de dropshipping para variantes
  dropshipping?: {
    dias_preparacion?: number;
    dias_envio_estimado?: number;
    proveedor?: string;
    pais_origen?: string;
    costo_importacion?: number;
    tiempo_configurado_en_ml?: boolean;
  };
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
  // Métricas de Mercado Libre
  sold_quantity?: number;
  health?: number;
  metrics?: {
    visits: number;
    reviews: {
      rating_average: number;
      total: number;
    };
  };
  // Nuevas propiedades para dropshipping
  dias_preparacion?: number;
  dias_envio_estimado?: number;
  proveedor?: string;
  pais_origen?: string;
  requiere_confirmacion?: boolean;
  costo_importacion?: number;
  tiempo_configurado_en_ml?: boolean;
  // Objeto dropshipping anidado
  dropshipping?: {
    dias_preparacion: number;
    dias_envio_estimado: number;
    proveedor: string;
    pais_origen: string;
    requiere_confirmacion: boolean;
    costo_importacion: number;
    tiempo_configurado_en_ml: boolean;
  };
  // 🆕 Información de descuentos
  descuento?: {
    activo: boolean;
    porcentaje: number;
    precio_original?: number;
    fecha_inicio?: string;
    fecha_fin?: string;
  };
}

export interface OrderML {
  items: ProductoML[];
}