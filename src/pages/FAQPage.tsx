import React, { useState } from 'react'
import '../css/faq.css'

interface FAQItem {
  question: string
  answer: string
}

const FAQPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs: FAQItem[] = [
    {
      question: "¿Hacen envíos?",
      answer: "Tenemos envío gratuito a todo el país a través de agencia de transporte."
    },
    {
      question: "¿Tienen local físico para retirar? ¿Dónde están ubicados y en qué horario?",
      answer: "Lamentablemente, a raíz de la pandemia tuvimos que limitar nuestra operativa a la venta exclusivamente online. Estamos trabajando en ello para poder brindar el servicio de mejor calidad. De todos modos, contamos con envío gratuito a todo el país. Agradecemos tu comprensión."
    },
    {
      question: "¿Tienen garantía?",
      answer: "Nuestros productos cuentan con garantía de 12 meses respaldada."
    },
    {
      question: "¿Los productos son originales?",
      answer: "Comercializamos productos 100% originales de fábrica. En algunas excepciones puede tratarse de un producto compatible, pero siempre estará aclarado en la descripción del artículo. En caso de que no figure la aclaración de réplica, se trata de un producto original."
    },
    {
      question: "¿Tengo que utilizar una franquicia o hacer algún trámite aduanero?",
      answer: "Nosotros nos encargamos de toda la gestión de importación del producto, pago de tasas y costos administrativos correspondientes. No es necesario que nos brinde cédula ni utilizar ninguna franquicia."
    }
  ]

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="faq-page">
      <div className="faq-header">
        <div className="faq-header-content">
          <h1 className="faq-title">Preguntas Frecuentes</h1>
          <p className="faq-subtitle">
            Encuentra respuestas a las preguntas más comunes sobre Poppy Shop Uruguay
          </p>
        </div>
      </div>

      <div className="faq-container">
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`faq-item ${openIndex === index ? 'active' : ''}`}
            >
              <button 
                className="faq-question"
                onClick={() => toggleFAQ(index)}
                aria-expanded={openIndex === index}
              >
                <span className="faq-question-text">{faq.question}</span>
                <span className="faq-icon">
                  {openIndex === index ? '−' : '+'}
                </span>
              </button>
              
              <div className={`faq-answer ${openIndex === index ? 'open' : ''}`}>
                <div className="faq-answer-content">
                  <p>{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="faq-contact">
          <div className="faq-contact-box">
            <h3>¿No encontraste lo que buscabas?</h3>
            <p>Contáctanos y con gusto te ayudaremos</p>
            <a href="/contacto" className="faq-contact-button">
              Ir a Contacto
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FAQPage

