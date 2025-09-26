import React from 'react';
import { ProductoML, Variante } from '../types';
import '../css/admin.css';

interface AdminProductListProps {
  productos: ProductoML[];
}

// Agrupa variantes por color para evitar duplicados
function getUniqueColorVariants(variantes: Variante[]): Variante[] {
  const unique: Variante[] = [];
  variantes.forEach((variante) => {
    if (!unique.some((v) => v.color === variante.color)) {
      unique.push(variante);
    }
  });
  return unique;
}

const AdminProductList: React.FC<AdminProductListProps> = ({ productos }) => {
  return (
    <table className="admin-table">
      <thead>
        <tr>
          <th className="admin-th">Imagen</th>
          <th className="admin-th">Nombre</th>
          <th className="admin-th">Precio</th>
          <th className="admin-th">Stock</th>
          <th className="admin-th">Variante</th>
          <th className="admin-th">Status</th>
          <th className="admin-th">ML ID</th>
          <th className="admin-th">Variante ID</th>
        </tr>
      </thead>
      <tbody>
        {productos.map((producto) => {
          if (producto.variantes && producto.variantes.length > 0) {
            // Mostrar solo una variante por color
            const variantesUnicas = getUniqueColorVariants(producto.variantes);
            return variantesUnicas.map((variante: Variante) => (
              <tr key={`${producto._id}_${variante._id}`} className="admin-tr flex-column-center">
                <td className="admin-td">
                  <img src={variante.images?.[0]?.url || producto.images?.[0]?.url || producto.main_image} alt={producto.title} className="admin-img" />
                </td>
                <td className="admin-td-nombre">{producto.title}</td>
                <td className="admin-td"> ${variante.price || producto.price}</td>
                <td className="admin-td">{variante.stock}</td>
                <td className="admin-td">{variante.color || '-'}</td>
                <td className="admin-td">{producto.status}</td>
                <td className="admin-td-ml-id">{variante.ml_id || producto.ml_id || '-'}</td>
                <td className="admin-td-variante-id">{variante._id}</td>
              </tr>
            ));
          } else {
            // Producto sin variantes
            return (
              <tr key={producto._id} className="admin-tr">
                <td className="admin-td">
                  <img src={producto.images?.[0]?.url || producto.main_image} alt={producto.title} className="admin-img" />
                </td>
                <td className="admin-td-nombre">{producto.title}</td>
                <td className="admin-td">{producto.price}</td>
                <td className="admin-td">{producto.available_quantity}</td>
                <td className="admin-td">-</td>
                <td className="admin-td">{producto.status}</td>
                <td className="admin-td">{producto.ml_id || '-'}</td>
                <td className="admin-td-variante-id">-</td>
              </tr>
            );
          }
        })}
      </tbody>
    </table>
  );
};

export default AdminProductList;
