import React from 'react';
import Loader from './Loader';
import ProductSkeleton from './ProductSkeleton';

const LoaderDemo: React.FC = () => {
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Demo de Loaders</h1>
      
      <section style={{ marginBottom: '3rem' }}>
        <h2>Tipos de Loaders</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
          <div>
            <h3>Spinner (por defecto)</h3>
            <Loader type="spinner" size="medium" text="Cargando..." />
          </div>
          
          <div>
            <h3>Dots</h3>
            <Loader type="dots" size="medium" text="Cargando..." />
          </div>
          
          <div>
            <h3>Bars</h3>
            <Loader type="bars" size="medium" text="Cargando..." />
          </div>
          
          <div>
            <h3>Pulse</h3>
            <Loader type="pulse" size="medium" text="Cargando..." />
          </div>
        </div>
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2>Tamaños de Loaders</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '2rem' }}>
          <div>
            <h3>Small</h3>
            <Loader type="spinner" size="small" text="Pequeño" />
          </div>
          
          <div>
            <h3>Medium</h3>
            <Loader type="spinner" size="medium" text="Mediano" />
          </div>
          
          <div>
            <h3>Large</h3>
            <Loader type="spinner" size="large" text="Grande" />
          </div>
        </div>
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2>Colores de Loaders</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '2rem' }}>
          <div>
            <h3>Primary</h3>
            <Loader type="dots" size="medium" color="primary" text="Primary" />
          </div>
          
          <div>
            <h3>Success</h3>
            <Loader type="dots" size="medium" color="success" text="Success" />
          </div>
          
          <div>
            <h3>Warning</h3>
            <Loader type="dots" size="medium" color="warning" text="Warning" />
          </div>
          
          <div>
            <h3>Danger</h3>
            <Loader type="dots" size="medium" color="danger" text="Danger" />
          </div>
        </div>
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2>Product Skeleton</h2>
        <div>
          <h3>Grid de Productos (8 items)</h3>
          <ProductSkeleton count={8} />
        </div>
        
        <div style={{ marginTop: '2rem' }}>
          <h3>Grid Compacto (6 items)</h3>
          <ProductSkeleton count={6} className="skeleton-compact" />
        </div>
        
        <div style={{ marginTop: '2rem' }}>
          <h3>Grid Grande (4 items)</h3>
          <ProductSkeleton count={4} className="skeleton-large" />
        </div>
      </section>

      <section>
        <h2>Uso en Código</h2>
        <div style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '8px', fontFamily: 'monospace' }}>
          <pre>{`// Loader básico
<Loader text="Cargando productos..." />

// Loader con tipo específico
<Loader type="dots" size="large" text="Cargando..." />

// Loader con color personalizado
<Loader type="pulse" color="success" text="Éxito!" />

// Product Skeleton
<ProductSkeleton count={8} />

// Product Skeleton con variante
<ProductSkeleton count={6} className="skeleton-compact" />`}</pre>
        </div>
      </section>
    </div>
  );
};

export default LoaderDemo;
