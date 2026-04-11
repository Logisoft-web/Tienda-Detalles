const CAT_LABELS = {
  flores:    '🌸 Flores Eternas',
  peluches:  '🧸 Peluches',
  accesorios:'✨ Accesorios',
  regalos:   '🎁 Regalos',
  globos:     '🎈 Globos',
  decoracion: '✨ Decoración',
  desayunos:  '🍓 Desayunos',
  propuestas: '💍 Propuestas',
}

const WA = '573212126285'
const WA_MSG = encodeURIComponent('¡Hola! 👋 Vi su página web y me encantaron los detalles que tienen. Me gustaría recibir información sobre el catálogo actual y saber qué opciones tienen disponibles para entrega en San Gil. ¿Me podrían ayudar? ¡Muchas gracias! ✨')

export default function ServiceCard({ service }) {
  const { name, category, price, description, image_url } = service
  const waMsg = encodeURIComponent(`¡Hola! 👋 Vi su página web y me interesa: ${name} 🌸 ¿Me pueden dar más información y el precio actual? ¡Muchas gracias! ✨`)

  return (
    <article className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-brand transition-all duration-300 hover:-translate-y-1 border border-brand-100">
      <div className="relative overflow-hidden aspect-[4/3] bg-brand-50">
        <img src={image_url} alt={name} loading="lazy"
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-dark/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
          <p className="text-white text-sm text-center leading-relaxed font-body">{description}</p>
        </div>
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-brand-600 text-xs font-body tracking-wide px-3 py-1 rounded-full">
          {CAT_LABELS[category] || category}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-display text-lg text-dark mb-1">{name}</h3>
        <p className="text-gray-400 text-xs mb-3 line-clamp-2 font-body lg:hidden">{description}</p>
        <div className="flex items-center justify-between">
          <span className="font-display text-brand-500 font-600 text-lg">
            ${Number(price).toLocaleString('es-CO')}
          </span>
          <a href={`https://wa.me/${WA}?text=${waMsg}`} target="_blank" rel="noopener noreferrer"
            className="bg-brand-500 hover:bg-brand-600 text-white text-xs font-body tracking-wide px-4 py-2 rounded-full transition-colors shadow-brand">
            Pedir 💬
          </a>
        </div>
      </div>
    </article>
  )
}
