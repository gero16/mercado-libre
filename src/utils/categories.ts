// Utilidades y constantes de categorías compartidas entre Tienda y Header

// Mapeo de categorías de MercadoLibre (category_id) a categorías generales (slug)
export const MAPEO_CATEGORIAS: Record<string, string> = {
  // 📚 E-READERS Y KINDLE
  'MLU163646': 'ereaders',
  'MLU163764': 'ereaders',
  'MLU163765': 'ereaders',
  'MLU163771': 'ereaders',

  // 🎵 AUDIO Y PARLANTES
  'MLU168248': 'audio-parlantes',
  'MLU3697': 'audio-parlantes',
  'MLU5072': 'audio-parlantes',
  'MLU4075': 'audio-parlantes',
  'MLU116559': 'audio-parlantes',

  // ⌚ SMARTWATCHES
  'MLU117113': 'smartwatches',
  'MLU1442': 'smartwatches',
  'MLU431680': 'smartwatches',

  // 🏠 ASISTENTES VIRTUALES
  'MLU409415': 'asistentes-virtuales',

  // 🔔 SEGURIDAD HOGAR
  'MLU36566': 'seguridad-hogar',
  'MLU71938': 'seguridad-hogar',
  'MLU10553': 'seguridad-hogar',

  // 💾 MEMORIAS Y ALMACENAMIENTO
  'MLU70969': 'memorias-storage',
  'MLU6336': 'memorias-storage',

  // 📱 ELECTRÓNICA Y TECNOLOGÍA (resto)
  'MLU1055': 'electronica',
  'MLU12953': 'electronica',
  'MLU14407': 'electronica',
  'MLU1676': 'electronica',
  'MLU434342': 'electronica',
  'MLU5549': 'electronica',
  'MLU1915': 'electronica',
  'MLU443772': 'electronica',
  'MLU1155': 'electronica',
  'MLU1658': 'electronica',
  'MLU1717': 'electronica',
  'MLU195437': 'electronica',
  'MLU372999': 'electronica',
  'MLU188198': 'electronica',
  'MLU32605': 'electronica',
  'MLU413515': 'electronica',
  'MLU413564': 'electronica',
  'MLU429735': 'electronica',
  'MLU455057': 'electronica',
  'MLU455839': 'electronica',
  'MLU9914': 'electronica',
  'MLU176997': 'electronica',
  'MLU178391': 'electronica',
  'MLU165337': 'electronica',

  // 🎮 GAMING
  'MLU6344': 'gaming',
  'MLU443628': 'gaming',
  'MLU448172': 'gaming',
  'MLU443741': 'gaming',
  'MLU10858': 'gaming',
  'MLU11898': 'gaming',
  'MLU443583': 'gaming',
  'MLU439534': 'gaming',
  'MLU448173': 'gaming',
  'MLU1152': 'gaming',

  // 🏕️ CAMPING Y OUTDOOR
  'MLU12201': 'camping-outdoor',
  'MLU400173': 'camping-outdoor',

  // 😴 DESCANSO Y ALMOHADAS
  'MLU7969': 'descanso-almohadas',
  'MLU438004': 'descanso-almohadas',
  'MLU436268': 'descanso-almohadas',
  'MLU456110': 'descanso-almohadas',
  'MLU186068': 'descanso-almohadas',

  // 🔇 MÁQUINAS RUIDO BLANCO Y RELAJACIÓN
  'MLU40398': 'hogar',

  // 🏠 HOGAR Y DECORACIÓN (resto)
  'MLU205198': 'hogar',
  'MLU43687': 'hogar',
  'MLU442888': 'hogar',
  'MLU442952': 'hogar',
  'MLU416658': 'hogar',
  'MLU177716': 'hogar',
  'MLU457532': 'hogar',
  'MLU388628': 'hogar',
  'MLU387931': 'hogar',
  'MLU413493': 'hogar',
  'MLU414208': 'hogar',
  'MLU168223': 'hogar',

  // 🍳 COCINA
  'MLU442710': 'cocina',
  'MLU196263': 'cocina',
  'MLU416585': 'cocina',
  'MLU414038': 'cocina',
  'MLU442747': 'cocina',
  'MLU442751': 'cocina',
  'MLU455144': 'cocina',
  'MLU74887': 'cocina',
  'MLU74925': 'cocina',
  'MLU412348': 'cocina',

  // 👶 BEBÉS Y NIÑOS
  'MLU178390': 'bebes-ninos',
  'MLU443005': 'bebes-ninos',
  'MLU412585': 'bebes-ninos',
  'MLU187852': 'bebes-ninos',
  'MLU443022': 'bebes-ninos',
  'MLU443133': 'bebes-ninos',
  'MLU1889': 'bebes-ninos',
  'MLU40629': 'bebes-ninos',
  'MLU457852': 'bebes-ninos',
  'MLU429242': 'bebes-ninos',

  // 🎴 TARJETAS COLECCIONABLES
  'MLU442981': 'tarjetas-coleccionables',

  // 🎒 MOCHILAS Y BOLSOS
  'MLU190994': 'mochilas-bolsos',
  'MLU26538': 'mochilas-bolsos',

  // ✏️ ACCESORIOS (resto)
  'MLU187975': 'accesorios',
  'MLU158838': 'accesorios',
  'MLU434789': 'accesorios',
  'MLU163766': 'accesorios',

  // 🚁 DRONES Y FOTOGRAFÍA
  'MLU178089': 'drones-foto',
  'MLU413447': 'drones-foto',
  'MLU413635': 'drones-foto',
  'MLU430406': 'drones-foto',
  'MLU413444': 'drones-foto',
  'MLU414123': 'drones-foto',
  'MLU1042': 'drones-foto',

  // 🏋️ DEPORTES Y FITNESS
  'MLU165701': 'deportes',
  'MLU165785': 'deportes',
  'MLU413593': 'deportes',
  'MLU206537': 'deportes',

  // 🗡️ FIGURAS DE ACCIÓN
  'MLU176854': 'figuras-accion',
  'MLU110854': 'figuras-accion',

  // 🪄 HARRY POTTER Y COLECCIONABLES
  'MLU455859': 'harry-potter',
  'MLU412670': 'harry-potter',

  // 🐾 MASCOTAS
  'MLU159067': 'mascotas',
  'MLU435781': 'mascotas',
  'MLU443444': 'mascotas',

  // 🏊 PISCINA Y JARDÍN
  'MLU172030': 'piscina-jardin',

  // 💇 CUIDADO PERSONAL
  'MLU70061': 'cuidado-personal',
  'MLU381270': 'cuidado-personal',

  // 🔧 HERRAMIENTAS
  'MLU5824': 'herramientas',
  'MLU457091': 'herramientas',
  'MLU202844': 'herramientas',

  // 🎵 AUDIO Y MÚSICA
  'MLU52047': 'audio-musica',
  'MLU442785': 'audio-musica',

  // 🔭 CIENCIA Y EDUCACIÓN
  'MLU4702': 'ciencia-educacion',

  // 🥋 ARTES MARCIALES
  'MLU443331': 'artes-marciales',
  'MLU443332': 'artes-marciales',

  // 🔧 OTROS
  'MLU379647': 'otros',
}

export const NOMBRES_CATEGORIAS: Record<string, string> = {
  'ereaders': 'E-readers y Kindle',
  'audio-parlantes': 'Audio y Parlantes',
  'smartwatches': 'Smartwatches',
  'asistentes-virtuales': 'Asistentes Virtuales',
  'seguridad-hogar': 'Seguridad Hogar',
  'memorias-storage': 'Memorias y Almacenamiento',
  'electronica': 'Electrónica',
  'gaming': 'Gaming',
  'camping-outdoor': 'Camping y Outdoor',
  'descanso-almohadas': 'Descanso y Almohadas',
  'hogar': 'Hogar',
  'cocina': 'Cocina',
  'bebes-ninos': 'Bebés y Niños',
  'tarjetas-coleccionables': 'Tarjetas Coleccionables',
  'mochilas-bolsos': 'Mochilas y Bolsos',
  'accesorios': 'Accesorios',
  'drones-foto': 'Drones y Fotografía',
  'deportes': 'Deportes y Fitness',
  'figuras-accion': 'Figuras de Acción',
  'harry-potter': 'Harry Potter',
  'mascotas': 'Mascotas',
  'piscina-jardin': 'Piscina y Jardín',
  'cuidado-personal': 'Cuidado Personal',
  'herramientas': 'Herramientas',
  'audio-musica': 'Audio y Música',
  'ciencia-educacion': 'Ciencia y Educación',
  'artes-marciales': 'Artes Marciales',
  'otros': 'Otros',
}

export const ICONOS_CATEGORIAS: Record<string, string> = {
  'ereaders': '📚',
  'audio-parlantes': '🎵',
  'smartwatches': '⌚',
  'asistentes-virtuales': '🏠',
  'seguridad-hogar': '🔔',
  'memorias-storage': '💾',
  'electronica': '📱',
  'gaming': '🎮',
  'camping-outdoor': '🏕️',
  'descanso-almohadas': '😴',
  'hogar': '🏠',
  'cocina': '🍳',
  'bebes-ninos': '👶',
  'tarjetas-coleccionables': '🎴',
  'mochilas-bolsos': '🎒',
  'accesorios': '✏️',
  'drones-foto': '🚁',
  'deportes': '🏋️',
  'figuras-accion': '🗡️',
  'harry-potter': '🪄',
  'mascotas': '🐾',
  'piscina-jardin': '🏊',
  'cuidado-personal': '💇',
  'herramientas': '🔧',
  'audio-musica': '🎵',
  'ciencia-educacion': '🔭',
  'artes-marciales': '🥋',
  'otros': '📦',
}

export const obtenerCategoria = (categoryId?: string): string => {
  if (!categoryId) return 'otros'
  return MAPEO_CATEGORIAS[categoryId] || 'otros'
}

export const obtenerNombreCategoria = (categorySlug: string): string => {
  return NOMBRES_CATEGORIAS[categorySlug] || 'Otros'
}


