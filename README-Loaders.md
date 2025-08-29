# Componentes de Loader para Mercado Libre

Este proyecto incluye componentes modernos y atractivos para mostrar estados de carga mientras se obtienen datos desde el backend.

## Componentes Disponibles

### 1. Loader

Un componente versátil que muestra diferentes tipos de animaciones de carga.

#### Props

- `type`: Tipo de loader ('spinner', 'dots', 'bars', 'pulse')
- `size`: Tamaño del loader ('small', 'medium', 'large')
- `text`: Texto a mostrar debajo del loader
- `className`: Clases CSS adicionales
- `color`: Color del loader ('primary', 'success', 'warning', 'danger', 'custom')
- `customColor`: Color personalizado (solo cuando color='custom')

#### Ejemplos de Uso

```tsx
// Loader básico
<Loader text="Cargando productos..." />

// Loader con tipo específico
<Loader type="dots" size="large" text="Cargando..." />

// Loader con color personalizado
<Loader type="pulse" color="success" text="Éxito!" />

// Loader para pantalla completa
<Loader 
  type="spinner" 
  size="large" 
  text="Cargando..." 
  className="loader-fullscreen" 
/>
```

### 2. ProductSkeleton

Un componente que muestra esqueletos de productos mientras se cargan los datos reales.

#### Props

- `count`: Número de esqueletos a mostrar
- `className`: Clases CSS adicionales

#### Ejemplos de Uso

```tsx
// Skeleton básico
<ProductSkeleton count={8} />

// Skeleton compacto
<ProductSkeleton count={6} className="skeleton-compact" />

// Skeleton grande
<ProductSkeleton count={4} className="skeleton-large" />
```

## Implementación en las Páginas

### TiendaPage.tsx
- Usa `ProductSkeleton` para mostrar esqueletos mientras se cargan los productos
- Mantiene los filtros visibles durante la carga
- Muestra 8 esqueletos de productos

### TiendaAntigua.tsx
- Usa `ProductSkeleton` para mostrar esqueletos mientras se cargan los productos
- Muestra 8 esqueletos de productos

### DetalleProductoPage.tsx
- Usa `Loader` con pantalla completa mientras se carga el producto individual

## Tipos de Loaders

### 1. Spinner (por defecto)
- Anillos giratorios con diferentes colores
- Animación suave y continua
- Ideal para cargas generales

### 2. Dots
- Puntos que aparecen y desaparecen
- Animación secuencial
- Perfecto para cargas rápidas

### 3. Bars
- Barras de diferentes alturas
- Animación ondulante
- Excelente para cargas de datos

### 4. Pulse
- Círculo que pulsa
- Animación suave de escala
- Ideal para cargas de elementos individuales

## Colores Disponibles

- **Primary**: Azul (#007bff) - Uso general
- **Success**: Verde (#28a745) - Operaciones exitosas
- **Warning**: Amarillo (#ffc107) - Advertencias
- **Danger**: Rojo (#dc3545) - Errores
- **Custom**: Color personalizado

## Clases CSS Útiles

- `loader-fullscreen`: Loader que cubre toda la pantalla
- `loader-dark`: Loader con fondo oscuro
- `skeleton-compact`: Skeleton más pequeño
- `skeleton-large`: Skeleton más grande

## Responsive

Todos los componentes son completamente responsivos y se adaptan a diferentes tamaños de pantalla:

- **Desktop**: Tamaños completos
- **Tablet**: Tamaños medianos
- **Mobile**: Tamaños compactos

## Personalización

Los componentes están diseñados para ser fácilmente personalizables:

```tsx
// Loader personalizado
<Loader 
  type="dots"
  size="large"
  color="custom"
  customColor="#ff6b6b"
  text="Cargando datos personalizados..."
  className="mi-loader-personalizado"
/>
```

## Mejores Prácticas

1. **Usa ProductSkeleton** para listas de productos
2. **Usa Loader** para cargas de elementos individuales
3. **Mantén los filtros visibles** durante la carga de productos
4. **Proporciona texto descriptivo** en los loaders
5. **Usa colores apropiados** para el contexto (success para éxito, warning para advertencias, etc.)

## Demo

Para ver todos los tipos de loaders en acción, puedes importar y usar el componente `LoaderDemo`:

```tsx
import LoaderDemo from './components/LoaderDemo';

// En tu componente
<LoaderDemo />
```

Este componente muestra todos los tipos, tamaños y colores disponibles, junto con ejemplos de código.
