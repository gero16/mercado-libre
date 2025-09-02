import React, { useState } from 'react'

interface ContactForm {
  name: string
  email: string
  message: string
}

const ContactoPage: React.FC = () => {
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    message: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.message) {
      alert('Por favor completa todos los campos')
      return
    }

    // Aquí se enviaría el mensaje al backend
    console.log('Mensaje enviado:', formData)
    alert('Mensaje enviado correctamente. Te contactaremos pronto!')
    
    // Limpiar formulario
    setFormData({
      name: '',
      email: '',
      message: ''
    })
  }

  return (
    <div className="container-2">
      <div className="formulario">
        <h1 className="titulo-contacto">Contacto</h1>
        <form onSubmit={handleSubmit}>
          <ul className="lista-contacto">
            <li>
              <label htmlFor="name">Nombre:</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </li>
            <li>
              <label htmlFor="email">Correo electronico:</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </li>
            <li>
              <label htmlFor="message">Mensaje:</label>
              <textarea 
                name="message" 
                id="message" 
                className="msg"
                value={formData.message}
                onChange={handleInputChange}
                required
              />
            </li>
            <li>
              <button type="submit" className="btn-enviar">
                Enviar Mensaje
              </button>
            </li>
          </ul>
        </form>
      </div>
    </div>
  )
}

export default ContactoPage 