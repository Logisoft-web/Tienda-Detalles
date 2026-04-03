import { useState, useEffect } from 'react'
import { Heart, Star, Phone } from 'lucide-react'
import ServiceCard from '../components/public/ServiceCard'
import { api } from '../lib/api'

const CATEGORIES = ['todos', 'globos', 'decoracion', 'desayunos', 'propuestas']
const CAT_LABELS  = { todos: 'Todos', globos: '🎈 Globos', decoracion: '✨ Decoración', desayunos: '🍓 Desayunos', propuestas: '💍 Propuestas' }

export default function Home() {
  const [cat, setCat] = useState('todos')
  const [services, setServices] = useState([])

  useEffect(() => {
    api.getServices().then(setServices).catch(console.error)
  }, [])
  const filtered = cat === 'todos' ? services : services.filter(s => s.category === cat)

  return (
    <>
      {/* Hero */}
      <section className="bg-hero-gradient py-16 px-4 text-center relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-rose-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -right-10 w-56 h-56 bg-gold-300/30 rounded-full blur-3xl" />

        <div className="relative max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur px-4 py-1.5 rounded-full text-rose-500 text-sm font-medium mb-4 shadow-sm">
            <Heart size={14} className="fill-rose-400" />
            Tienda de Regalos
          </div>
          <h1 className="text-5xl md:text-7xl text-rose-600 mb-3 leading-tight">Hecho con Amor</h1>
          <p className="text-rose-400 font-script text-2xl md:text-3xl mb-4">Decoraciones Inolvidables</p>
          <p className="text-gray-600 text-sm md:text-base mb-8 max-w-md mx-auto">
            Cumpleaños · Aniversarios · Pedidas de mano · ¡y mucho más!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="#servicios" className="bg-rose-500 hover:bg-rose-600 text-white font-semibold px-6 py-3 rounded-full transition-colors shadow-md">
              Ver Servicios 🎀
            </a>
            <a href="https://wa.me/573001234567" target="_blank" rel="noopener noreferrer"
              className="bg-white hover:bg-rose-50 text-rose-500 font-semibold px-6 py-3 rounded-full border border-rose-200 transition-colors">
              ¡Contáctanos! 💬
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white py-8 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4 text-center">
          {[['500+', 'Clientes felices'], ['4.9★', 'Calificación'], ['3 años', 'De experiencia']].map(([val, label]) => (
            <div key={label}>
              <p className="font-script text-3xl text-rose-500">{val}</p>
              <p className="text-gray-500 text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Servicios */}
      <section id="servicios" className="py-12 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-4xl text-rose-600 mb-2">Nuestros Servicios</h2>
          <p className="text-gray-500 text-sm">Cada detalle, hecho con amor 💕</p>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-8 justify-start md:justify-center">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all flex-shrink-0 ${
                cat === c ? 'bg-rose-500 text-white shadow-md' : 'bg-white text-gray-600 border border-rose-200 hover:border-rose-400'
              }`}
            >
              {CAT_LABELS[c]}
            </button>
          ))}
        </div>

        {/* Grid — 1 col mobile, 2 md, 3 lg */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(s => <ServiceCard key={s.id} service={s} />)}
        </div>
      </section>

      {/* Testimonios */}
      <section className="bg-rose-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl text-rose-600 text-center mb-8">Lo que dicen nuestros clientes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'Laura M.', text: 'La decoración de mi cuarto quedó increíble, mi novio quedó sin palabras 😍', stars: 5 },
              { name: 'Carlos R.', text: 'El arco de globos para el cumpleaños de mi hija fue perfecto. ¡Muy recomendados!', stars: 5 },
              { name: 'Valentina P.', text: 'El desayuno sorpresa llegó puntual y hermoso. Definitivamente volvería a pedir.', stars: 5 },
            ].map(({ name, text, stars }) => (
              <div key={name} className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: stars }).map((_, i) => <Star key={i} size={14} className="fill-gold-500 text-gold-500" />)}
                </div>
                <p className="text-gray-600 text-sm mb-3 italic">"{text}"</p>
                <p className="text-rose-500 font-semibold text-sm">{name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section id="contacto" className="py-12 px-4 max-w-2xl mx-auto text-center">
        <h2 className="text-4xl text-rose-600 mb-3">¿Lista para sorprender?</h2>
        <p className="text-gray-500 mb-6 text-sm">Escríbenos y creamos juntos el momento perfecto 💕</p>
        <a
          href="https://wa.me/573001234567"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-4 rounded-full text-lg transition-colors shadow-lg"
        >
          <Phone size={20} />
          ¡Contáctanos por WhatsApp!
        </a>
      </section>
    </>
  )
}
