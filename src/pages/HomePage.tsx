import React from 'react'
import Banner from '../components/Banner'
import ProductCategories from '../components/ProductCategories'

const HomePage: React.FC = () => {
  return (
    <>
      <div className="metodo-pago centrar-texto">
      </div>

      <Banner />
      
      <ProductCategories />
      
      <div className="metodo-pago centrar-texto">
      </div>
    </>
  )
}

export default HomePage 