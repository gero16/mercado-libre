import React from 'react'

interface Category {
  id: string
  name: string
  count?: number
}

interface CategoryFilterProps {
  categories: Category[]
  selectedCategory: string
  onCategoryChange: (categoryId: string) => void
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategoryChange
}) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Filtrar por Categoría</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            <div className="flex items-center justify-between">
              <span className="truncate">{category.name}</span>
              {category.count && (
                <span className="ml-2 px-2 py-1 bg-gray-200 text-gray-600 rounded-full text-xs">
                  {category.count}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default CategoryFilter
