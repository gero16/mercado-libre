import React from 'react'
import { Link } from 'react-router-dom'

const Footer: React.FC = () => {
  return (
    <footer>
      <div className="container">
        <div className="pagos">
          <ul className="lista-pagos">
            <li><img className="img-pagos" src="/img/pagos/mercadopago.svg" alt="Mercado Pago" /></li>
            <li><img className="img-pagos" src="/img/pagos/redpagos.svg" alt="Red Pagos" /></li>
            <li><img className="img-pagos" src="/img/pagos/abitab.svg" alt="Abitab" /></li>
            <li><img className="img-pagos" src="/img/pagos/oca.svg" alt="OCA" /></li>
            <li><img className="img-pagos" src="/img/pagos/visa.svg" alt="Visa" /></li>
            <li><img className="img-pagos" src="/img/pagos/master.svg" alt="Mastercard" /></li>
          </ul>
        </div>

        <div className="footer">
          <p>© Copyright 2025 / Poppy Shop Uruguay </p>
       
          <div className="preguntas">
            <Link to="/terminos-y-condiciones" style={{ textDecoration: 'none', color: 'inherit' }}>
              <p>Términos y Condiciones</p>
            </Link>
            <Link to="/preguntas-frecuentes" style={{ textDecoration: 'none', color: 'inherit' }}>
              <p>Preguntas Frecuentes</p>
            </Link>
            <Link to="/contacto" style={{ textDecoration: 'none', color: 'inherit' }}>
              <p>Contacto</p>
            </Link>
          </div>

          <div className="redes-sociales">
            <a href="https://instagram.com/poppyshopuy" target="_blank" rel="noopener noreferrer" className="social-link">
              <img src="https://res.cloudinary.com/geronicola/image/upload/v1759325974/dodgeball/adh6vtxq60nmkhunw9n9.png" alt="logo-instagram" />
              <span>@poppyshop.uy</span>
            </a>
            <a href="https://facebook.com/poppyshopuy" target="_blank" rel="noopener noreferrer" className="social-link">
              <img src="https://res.cloudinary.com/geronicola/image/upload/v1759325974/dodgeball/yvzfdz5pyj6fybkv9p96.png" alt="logo-facebook" />
              <span>Poppy Shop </span>
            </a>
            <a href="https://wa.me/59892701630?text=%C2%A1Hola!%Poppy%20Shop!%Tengo%una%consulta...%" target="_blank" rel="noopener noreferrer" className="social-link">
              <img src="/img/whatsapp.png" alt="logo-whatsapp" />
              <span>092 701 630</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer 