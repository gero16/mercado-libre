import React from 'react'

const WhatsAppButton: React.FC = () => {
  // Número de WhatsApp (formato internacional sin +, espacios ni guiones)
  // Ejemplo: 5491112345678 para Argentina (+54 9 11 1234-5678)
  const phoneNumber = '5491112345678' // 👈 Cambiar por tu número real
  
  // Mensaje predeterminado (opcional)
  const defaultMessage = '¡Hola! Me gustaría obtener más información sobre sus productos.'
  
  // URL de WhatsApp API
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`
  
  const handleClick = () => {
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }
  
  return (
    <button 
      className="whatsapp-float-button"
      onClick={handleClick}
      aria-label="Contactar por WhatsApp"
      title="¡Chatea con nosotros!"
    >
      <svg 
        viewBox="0 0 32 32" 
        className="whatsapp-icon"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          fill="currentColor" 
          d="M16 0c-8.837 0-16 7.163-16 16 0 2.825 0.737 5.607 2.137 8.048l-2.137 7.952 7.933-2.127c2.42 1.37 5.173 2.127 8.067 2.127 8.837 0 16-7.163 16-16s-7.163-16-16-16zM16 29.467c-2.482 0-4.908-0.646-7.07-1.87l-0.507-0.292-4.713 1.262 1.262-4.669-0.292-0.508c-1.207-2.100-1.847-4.507-1.847-6.957 0-7.384 6.083-13.467 13.467-13.467s13.467 6.083 13.467 13.467c0 7.384-6.083 13.467-13.467 13.467zM21.984 18.656c-0.307-0.153-1.813-0.898-2.095-1.001-0.281-0.103-0.486-0.153-0.691 0.153s-0.794 1.001-0.973 1.206c-0.179 0.205-0.358 0.230-0.666 0.077s-1.298-0.479-2.471-1.524c-0.913-0.815-1.53-1.821-1.709-2.129s-0.019-0.472 0.135-0.626c0.138-0.138 0.307-0.358 0.461-0.537s0.205-0.307 0.307-0.512 0.051-0.384-0.026-0.537c-0.077-0.153-0.691-1.669-0.947-2.284-0.250-0.598-0.503-0.517-0.691-0.526-0.179-0.009-0.384-0.011-0.589-0.011s-0.537 0.077-0.818 0.384c-0.281 0.307-1.074 1.050-1.074 2.563s1.099 2.973 1.252 3.178c0.153 0.205 2.159 3.298 5.233 4.624 0.731 0.315 1.302 0.504 1.747 0.646 0.734 0.234 1.402 0.201 1.930 0.122 0.589-0.088 1.813-0.742 2.068-1.458s0.255-1.331 0.179-1.458c-0.077-0.128-0.281-0.205-0.589-0.358z"
        />
      </svg>
    </button>
  )
}

export default WhatsAppButton

