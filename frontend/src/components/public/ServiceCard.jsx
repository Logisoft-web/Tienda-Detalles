import clsx from 'clsx'

const CATEGORY_COLORS = {
  globos:     'bg-rose-100 text-rose-600',
  decoracion: 'bg-pink-100 text-pink-700',
  desayunos:  'bg-amber-100 text-amber-700',
  propuestas: 'bg-purple-100 text-purple-700',
}

const CATEGORY_LABELS = {
  globos:     '🎈 Globos',
  decoracion: '✨ Decoración',
  desayunos:  '🍓 Desayunos',
  propuestas: '💍 Propuestas',
}

const WA_NUMBER = '573001234567'

export default function ServiceCard({ service }) {
  const { name, category, price, description, image_url } = service
  const waMsg = encodeURIComponent(`Hola! Me interesa el servicio: ${name} 🎀`)

  return (
    /**
     * Mobile: 1 columna, imagen grande arriba
     * md: 2 columnas
     * lg: 3 columnas
     * Hover en desktop muestra overlay con descripción
     */
    <article className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* Imagen */}
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={image_url}
          alt={name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Overlay desktop */}
        <div className="absolute inset-0 bg-rose-900/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
          <p className="text-white text-sm text-center leading-relaxed">{description}</p>
        </div>
        {/* Badge categoría */}
        <span className={clsx('absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full', CATEGORY_COLORS[category])}>
          {CATEGORY_LABELS[category]}
        </span>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-script text-xl text-rose-700 mb-1">{name}</h3>
        {/* Descripción visible en móvil (oculta en desktop donde está el overlay) */}
        <p className="text-gray-500 text-xs mb-3 line-clamp-2 lg:hidden">{description}</p>
        <div className="flex items-center justify-between">
          <span className="text-gold-600 font-bold text-lg">
            ${price.toLocaleString('es-CO')}
          </span>
          <a
            href={`https://wa.me/${WA_NUMBER}?text=${waMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold px-3 py-2 rounded-full transition-colors"
          >
            Pedir 💬
          </a>
        </div>
      </div>
    </article>
  )
}
