import { useState, useEffect } from 'react'
import { Heart, Phone, MapPin, ChevronDown, Star } from 'lucide-react'
import ServiceCard from '../components/public/ServiceCard'
import { api } from '../lib/api'

const CATEGORIES = ['todos', 'flores', 'peluches', 'accesorios', 'regalos']
const CAT_LABELS  = {
  todos:     'Todos',
  flores:    '🌸 Flores Eternas',
  peluches:  '🧸 Peluches',
  accesorios:'✨ Accesorios',
  regalos:   '🎁 Regalos',
}

const DEFAULT_CONFIG = {
  hero_title:    'Detalles que enamoran',
  hero_subtitle: 'Flores eternas, peluches y accesorios únicos para cada ocasión especial. Porque los mejores momentos merecen el mejor detalle.',
  hero_images:   ['/galeria/flores-eternas-01.jpg','/galeria/peluche-01.jpg','/galeria/arreglo-floral-03.jpg','/galeria/regalo-01.jpg'],
  gallery_images:['/galeria/flores-eternas-01.jpg','/galeria/peluche-01.jpg','/galeria/regalo-01.jpg','/galeria/accesorio-01.jpg','/galeria/detalle-01.jpg','/galeria/flores-eternas-02.jpg','/galeria/arreglo-floral-03.jpg','/galeria/peluche-02.jpg','/galeria/regalo-02.jpg','/galeria/accesorio-02.jpg','/galeria/detalle-02.jpg','/galeria/arreglo-floral-04.jpg'],
  testimonials:  [
    { name: 'Laura M.',     text: 'Las flores eternas son hermosas, llevan meses y siguen perfectas. Un regalo increíble.', stars: 5 },
    { name: 'Carlos R.',    text: 'Compré un peluche para el cumpleaños de mi novia y quedó encantada. Muy buena calidad.', stars: 5 },
    { name: 'Valentina P.', text: 'Los accesorios son únicos, no los encuentras en otro lado. Siempre vuelvo a comprar.', stars: 5 },
  ],
}

export default function Home() {
  const [cat, setCat] = useState('todos')
  const [services, setServices] = useState([])
  const [lightbox, setLightbox] = useState(null)
  const [cfg, setCfg] = useState(DEFAULT_CONFIG)

  useEffect(() => {
    api.getServices().then(setServices).catch(console.error)
    api.getSiteConfig().then(c => setCfg({ ...DEFAULT_CONFIG, ...c })).catch(() => {})
  }, [])

  const filtered = cat === 'todos' ? services : services.filter(s => s.category === cat)
  const heroImgs = cfg.hero_images?.length >= 4 ? cfg.hero_images : DEFAULT_CONFIG.hero_images
  const gallery  = cfg.gallery_images?.length   ? cfg.gallery_images : DEFAULT_CONFIG.gallery_images
  const testimonials = cfg.testimonials?.length  ? cfg.testimonials  : DEFAULT_CONFIG.testimonials

  const filtered = cat === 'todos' ? services : services.filter(s => s.category === cat)

  return (
    <>
      {/* ── HERO ── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-hero-gradient">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-200/30 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-petal/60 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Texto */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-1.5 rounded-full text-brand-500 text-xs font-body tracking-widest uppercase mb-6 shadow-sm">
              <Heart size={12} className="fill-brand-400" />
              San Gil, Santander
            </div>
            <h1 className="font-display text-5xl md:text-7xl text-dark leading-tight mb-4">
              {cfg.hero_title.split(' que ')[0]} que<br />
              <em className="text-brand-500 not-italic">{cfg.hero_title.split(' que ')[1] || 'enamoran'}</em>
            </h1>
            <p className="font-body text-gray-500 text-lg mb-8 leading-relaxed max-w-md">
              {cfg.hero_subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href="#servicios"
                className="inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-body font-700 px-8 py-4 rounded-full transition-all shadow-brand hover:shadow-brand-lg text-sm tracking-wide">
                Ver Productos
              </a>
              <a href="https://wa.me/573212126285" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-brand-50 text-brand-500 font-body font-700 px-8 py-4 rounded-full border border-brand-200 transition-all text-sm tracking-wide">
                <Phone size={16} />
                Contáctanos
              </a>
            </div>
          </div>

          {/* Collage de fotos */}
          <div className="hidden lg:grid grid-cols-2 gap-3 h-[480px]">
            <div className="flex flex-col gap-3">
              <div className="rounded-2xl overflow-hidden flex-1 shadow-brand">
                <img src={heroImgs[0]} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="rounded-2xl overflow-hidden h-40 shadow-sm">
                <img src={heroImgs[1]} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            </div>
            <div className="flex flex-col gap-3 mt-8">
              <div className="rounded-2xl overflow-hidden h-40 shadow-sm">
                <img src={heroImgs[2]} alt="" className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="rounded-2xl overflow-hidden flex-1 shadow-brand">
                <img src={heroImgs[3]} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-brand-400 animate-bounce">
          <ChevronDown size={20} />
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-brand-500 py-10 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4 text-center">
          {[
            ['💐', 'Flores Eternas', 'Preservadas para siempre'],
            ['🧸', 'Peluches Premium', 'Suaves y adorables'],
            ['✨', 'Accesorios Únicos', 'Para cada ocasión'],
          ].map(([icon, title, sub]) => (
            <div key={title} className="text-white">
              <p className="text-3xl mb-1">{icon}</p>
              <p className="font-display font-600 text-sm md:text-base">{title}</p>
              <p className="text-brand-200 text-xs mt-0.5 hidden md:block">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRODUCTOS ── */}
      <section id="servicios" className="py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-brand-500 font-body text-xs tracking-widest uppercase mb-2">Lo que ofrecemos</p>
          <h2 className="font-display text-4xl md:text-5xl text-dark">Nuestros Productos</h2>
          <div className="w-16 h-0.5 bg-brand-400 mx-auto mt-4" />
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-10 justify-start md:justify-center">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={`whitespace-nowrap px-5 py-2 rounded-full text-xs font-body tracking-widest uppercase transition-all flex-shrink-0 ${
                cat === c
                  ? 'bg-brand-500 text-white shadow-brand'
                  : 'bg-white text-gray-500 border border-brand-200 hover:border-brand-400'
              }`}>
              {CAT_LABELS[c]}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400 font-body">
            <p className="text-4xl mb-3">🌸</p>
            <p>Próximamente más productos en esta categoría</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(s => <ServiceCard key={s.id} service={s} />)}
          </div>
        )}
      </section>

      {/* ── GALERÍA ── */}
      <section id="galeria" className="py-20 px-4 bg-petal/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-brand-500 font-body text-xs tracking-widest uppercase mb-2">Nuestro trabajo</p>
            <h2 className="font-display text-4xl md:text-5xl text-dark">Galería</h2>
            <div className="w-16 h-0.5 bg-brand-400 mx-auto mt-4" />
          </div>

          <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
            {gallery.map((url, i) => (
              <button key={i} onClick={() => setLightbox({ src: url, label: '' })}
                className="break-inside-avoid w-full rounded-xl overflow-hidden shadow-sm hover:shadow-brand transition-all duration-300 hover:-translate-y-1 block">
                <img src={url} alt=""
                  className="w-full object-cover hover:scale-105 transition-transform duration-500" />
              </button>
            ))}
          </div>

          <div className="text-center mt-10">
            <a href="https://www.instagram.com/hechoconamor_am16" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-brand-500 font-body text-sm hover:text-brand-700 transition-colors border-b border-brand-300 pb-0.5">
              Ver más en Instagram @hechoconamor_am16
            </a>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIOS ── */}
      <section className="py-20 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-brand-500 font-body text-xs tracking-widest uppercase mb-2">Opiniones</p>
          <h2 className="font-display text-4xl md:text-5xl text-dark">Lo que dicen</h2>
          <div className="w-16 h-0.5 bg-brand-400 mx-auto mt-4" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map(({ name, text, stars }, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-brand-100">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: stars }).map((_, i) => (
                  <Star key={i} size={14} className="fill-gold text-gold" />
                ))}
              </div>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed font-body italic">"{text}"</p>
              <p className="text-brand-500 font-display font-600 text-sm">{name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CONTACTO ── */}
      <section id="contacto" className="py-20 px-4 bg-dark text-white">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-brand-300 font-body text-xs tracking-widest uppercase mb-3">Visítanos</p>
            <h2 className="font-display text-4xl md:text-5xl mb-6">¿Lista para<br /><em className="text-brand-400 not-italic">sorprender?</em></h2>
            <div className="flex items-start gap-3 mb-4">
              <MapPin size={18} className="text-brand-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-body text-white text-sm">Calle 5 # 8-25</p>
                <p className="font-body text-gray-400 text-sm">San Gil, Santander</p>
              </div>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <Phone size={18} className="text-brand-400 flex-shrink-0" />
              <p className="font-body text-white text-sm">321 212 6285</p>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={18} className="text-brand-400 flex-shrink-0" />
              <p className="font-body text-white text-sm">316 914 3500</p>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <a href="https://wa.me/573212126285?text=Hola!%20Me%20interesa%20conocer%20sus%20productos%20%F0%9F%8C%B8"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white font-body font-700 px-8 py-4 rounded-full transition-all text-sm tracking-wide shadow-lg">
              <Phone size={18} />
              WhatsApp: 321 212 6285
            </a>
            <a href="https://wa.me/573169143500?text=Hola!%20Me%20interesa%20conocer%20sus%20productos%20%F0%9F%8C%B8"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 text-white font-body font-700 px-8 py-4 rounded-full transition-all text-sm tracking-wide border border-white/20">
              <Phone size={18} />
              WhatsApp: 316 914 3500
            </a>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}>
          <img src={lightbox.src} alt={lightbox.label}
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl" />
        </div>
      )}
    </>
  )
}
