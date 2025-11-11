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
  last_valid_price?: number;
  price_invalid?: boolean;
  price_invalid_reason?: string | null;
  price_invalid_at?: string | null;
  price_override?: {
    active: boolean;
    value?: number;
    reason?: string | null;
    updated_at?: string | Date | null;
    updated_by?: string | null;
    ml_price_last?: number | null;
    ml_price_last_at?: string | Date | null;
  };
  status: string;
  title: string;
  permalink?: string; // URL de la publicación en MercadoLibre
  catalog_product_id?: string | null; // para deduplicación por catálogo
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
  // Atributos estructurados de ML
  attributes?: Array<{
    id: string;
    name: string;
    value_id: string;
    value_name: string;
  }>;
  warranty?: string;
  condition?: string;
  // Información de envío
  shipping?: {
    logistic_type?: string; // 'fulfillment' (Flex), 'self_service', 'cross_docking', etc.
    mode?: string;
    free_shipping?: boolean;
    tags?: string[];
  };
  // Nuevas propiedades para dropshipping
  tipo_venta?: 'stock_fisico' | 'dropshipping' | 'mixto';
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
  // 🆕 DESCUENTO NATIVO DE MERCADOLIBRE
  descuento_ml?: {
    original_price: number; // Precio original en ML antes del descuento
    deal_ids?: string[]; // IDs de ofertas/promociones de ML
  };
  // 🆕 Producto destacado (selección manual)
  destacado?: boolean;
}

export interface OrderML {
  items: ProductoML[];
}

// 🆕 Interfaces para Cupones
export interface Cupon {
  _id: string;
  codigo: string;
  descripcion: string;
  tipo_descuento: 'porcentaje' | 'monto_fijo';
  valor_descuento: number;
  activo: boolean;
  fecha_inicio: string;
  fecha_fin?: string;
  usos_maximos?: number;
  usos_actuales: number;
  monto_minimo_compra?: number;
  limite_por_usuario: number;
  date_created: string;
}

export interface ValidacionCupon {
  valido: boolean;
  error?: string;
  cupon?: {
    _id: string;
    codigo: string;
    descripcion: string;
    tipo_descuento: 'porcentaje' | 'monto_fijo';
    valor_descuento: number;
  };
  descuento?: number;
  monto_final?: number;
}