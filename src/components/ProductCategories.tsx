import React from 'react'

const ProductCategories: React.FC = () => {
  const categories = [
    { id: 1, name: 'Indumentaria', className: 'categoria-1' },
    { id: 2, name: 'Championes', className: 'categoria-2' },
    { id: 3, name: 'Gorros', className: 'categoria-3' },
    { id: 4, name: 'Remeras', className: 'categoria-4' }
  ]

  const handleCategoryClick = (category: any) => {
    // Por ahora solo mostraremos un console.log, pero aquí podrías
    // navegar a la página de la categoría o mostrar productos
    console.log(`Categoría seleccionada: ${category.name}`)
  }

  return (
    <div className="contenido-principal">
      <div className="container">
        <div className="productos-index">
          {categories.map(category => (
            <div key={category.id} className="caja-categoria">
              <div 
                className={`categoria ${category.className}`}
                onClick={() => handleCategoryClick(category)}
                style={{ cursor: 'pointer' }}
              >
                <div className="nombre-categoria">
                  <h2>{category.name}</h2>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProductCategories 