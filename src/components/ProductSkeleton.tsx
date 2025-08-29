import React from 'react';
import './ProductSkeleton.css';

interface ProductSkeletonProps {
  count?: number;
  className?: string;
}

const ProductSkeleton: React.FC<ProductSkeletonProps> = ({ 
  count = 6, 
  className = '' 
}) => {
  const skeletons = Array.from({ length: count }, (_, index) => (
    <div key={index} className={`skeleton-product ${className}`}>
      <div className="skeleton-image"></div>
      <div className="skeleton-content">
        <div className="skeleton-title"></div>
        <div className="skeleton-price"></div>
        <div className="skeleton-button"></div>
      </div>
    </div>
  ));

  return (
    <>
      {skeletons}
    </>
  );
};

export default ProductSkeleton;
