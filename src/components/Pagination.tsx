import React from 'react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (items: number) => void
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange
}) => {
  const startItem = ((currentPage - 1) * itemsPerPage) + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  const goToFirstPage = () => onPageChange(1)
  const goToPreviousPage = () => onPageChange(Math.max(1, currentPage - 1))
  const goToNextPage = () => onPageChange(Math.min(totalPages, currentPage + 1))
  const goToLastPage = () => onPageChange(totalPages)

  // Generar números de página a mostrar
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    
    if (totalPages <= maxVisiblePages) {
      // Si hay 5 páginas o menos, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Lógica para mostrar páginas con elipsis
      if (currentPage <= 3) {
        // Mostrar primeras páginas
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        // Mostrar últimas páginas
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // Mostrar páginas alrededor de la actual
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  if (totalPages <= 1) return null

  return (
    <div className="pagination-container" style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      margin: '40px auto',
      padding: '25px',
      backgroundColor: '#f8f9fa',
      borderRadius: '12px',
      border: '1px solid #e9ecef',
      flexWrap: 'wrap',
      gap: '20px',
      maxWidth: '900px',
      width: '100%',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
    }}>
      {/* Layout centrado en una sola fila */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '30px',
        flexWrap: 'wrap',
        width: '100%'
      }}>
        {/* Información de paginación */}
        <div className="pagination-info" style={{ 
          fontSize: '14px', 
          color: '#6c757d',
          fontWeight: '500',
          textAlign: 'center',
          whiteSpace: 'nowrap'
        }}>
          Mostrando <strong>{startItem}</strong> - <strong>{endItem}</strong> de <strong>{totalItems}</strong> productos
        </div>

        {/* Controles de navegación */}
        <div className="pagination-buttons" style={{ 
          display: 'flex', 
          gap: '4px',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
        {/* Botón primera página */}
        <button 
          onClick={goToFirstPage}
          disabled={currentPage === 1}
          style={{ 
            padding: '8px 12px', 
            border: '1px solid #dee2e6', 
            borderRadius: '6px', 
            backgroundColor: currentPage === 1 ? '#f8f9fa' : 'white',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            color: currentPage === 1 ? '#adb5bd' : '#495057',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (currentPage !== 1) {
              e.currentTarget.style.backgroundColor = '#e9ecef'
            }
          }}
          onMouseLeave={(e) => {
            if (currentPage !== 1) {
              e.currentTarget.style.backgroundColor = 'white'
            }
          }}
        >
          ««
        </button>
        
        {/* Botón página anterior */}
        <button 
          onClick={goToPreviousPage}
          disabled={currentPage === 1}
          style={{ 
            padding: '8px 12px', 
            border: '1px solid #dee2e6', 
            borderRadius: '6px', 
            backgroundColor: currentPage === 1 ? '#f8f9fa' : 'white',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            color: currentPage === 1 ? '#adb5bd' : '#495057',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (currentPage !== 1) {
              e.currentTarget.style.backgroundColor = '#e9ecef'
            }
          }}
          onMouseLeave={(e) => {
            if (currentPage !== 1) {
              e.currentTarget.style.backgroundColor = 'white'
            }
          }}
        >
          «
        </button>

        {/* Números de página */}
        <div className="page-numbers" style={{ display: 'flex', gap: '2px' }}>
          {getPageNumbers().map((pageNum, index) => {
            if (pageNum === '...') {
              return (
                <span 
                  key={`ellipsis-${index}`}
                  style={{
                    padding: '8px 4px',
                    fontSize: '14px',
                    color: '#6c757d',
                    fontWeight: '500'
                  }}
                >
                  ...
                </span>
              )
            }
            
            const isCurrentPage = currentPage === pageNum
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum as number)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #dee2e6',
                  borderRadius: '6px',
                  backgroundColor: isCurrentPage ? '#007bff' : 'white',
                  color: isCurrentPage ? 'white' : '#495057',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  minWidth: '40px'
                }}
                onMouseEnter={(e) => {
                  if (!isCurrentPage) {
                    e.currentTarget.style.backgroundColor = '#e9ecef'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isCurrentPage) {
                    e.currentTarget.style.backgroundColor = 'white'
                  }
                }}
              >
                {pageNum}
              </button>
            )
          })}
        </div>

        {/* Botón página siguiente */}
        <button 
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
          style={{ 
            padding: '8px 12px', 
            border: '1px solid #dee2e6', 
            borderRadius: '6px', 
            backgroundColor: currentPage === totalPages ? '#f8f9fa' : 'white',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            color: currentPage === totalPages ? '#adb5bd' : '#495057',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (currentPage !== totalPages) {
              e.currentTarget.style.backgroundColor = '#e9ecef'
            }
          }}
          onMouseLeave={(e) => {
            if (currentPage !== totalPages) {
              e.currentTarget.style.backgroundColor = 'white'
            }
          }}
        >
          »
        </button>
        
        {/* Botón última página */}
        <button 
          onClick={goToLastPage}
          disabled={currentPage === totalPages}
          style={{ 
            padding: '8px 12px', 
            border: '1px solid #dee2e6', 
            borderRadius: '6px', 
            backgroundColor: currentPage === totalPages ? '#f8f9fa' : 'white',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            color: currentPage === totalPages ? '#adb5bd' : '#495057',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (currentPage !== totalPages) {
              e.currentTarget.style.backgroundColor = '#e9ecef'
            }
          }}
          onMouseLeave={(e) => {
            if (currentPage !== totalPages) {
              e.currentTarget.style.backgroundColor = 'white'
            }
          }}
        >
          »»
        </button>
        </div>

        {/* Selector de productos por página */}
        <div className="items-per-page" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px'
        }}>
          <label htmlFor="items-per-page" style={{ 
            fontSize: '14px',
            fontWeight: '500',
            color: '#495057'
          }}>
            Por página:
          </label>
          <select 
            id="items-per-page"
            value={itemsPerPage} 
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            style={{ 
              padding: '6px 12px', 
              borderRadius: '6px', 
              border: '1px solid #ced4da',
              backgroundColor: 'white',
              fontSize: '14px',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
            <option value={500}>500</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default Pagination
