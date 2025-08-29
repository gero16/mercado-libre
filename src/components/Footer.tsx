import React from 'react'

const Footer: React.FC = () => {
  return (
    <footer>
      <div className="container">
        <div className="pagos">
          <ul className="lista-pagos">
            <li><img className="img-pagos" src="/src/img/pagos/mercadopago.svg" alt="Mercado Pago" /></li>
            <li><img className="img-pagos" src="/src/img/pagos/redpagos.svg" alt="Red Pagos" /></li>
            <li><img className="img-pagos" src="/src/img/pagos/abitab.svg" alt="Abitab" /></li>
            <li><img className="img-pagos" src="/src/img/pagos/oca.svg" alt="OCA" /></li>
            <li><img className="img-pagos" src="/src/img/pagos/visa.svg" alt="Visa" /></li>
            <li><img className="img-pagos" src="/src/img/pagos/master.svg" alt="Mastercard" /></li>
          </ul>
        </div>

        <div className="footer">
          <p>© Copyright 2022 / Tiendita Virtual </p>
       
          <div className="preguntas">
            <p>Terminos y Condiciones</p>
            <p>Preguntas Frecuentes</p>
            <p>Contacto</p>
          </div>

          <div className="redes-sociales">
            <img src="/img/instagram.png" alt="logo-instagram" />
            <img src="/img/facebook.png" alt="logo-facebook" />
            <img src="/img/whatsapp.png" alt="logo-whatsapp" />

          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer 