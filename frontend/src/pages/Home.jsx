import { useState, useEffect, useRef } from 'react'
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

// ── Carrusel 3D ──────────────────────────────────────────────
function HeroCarousel({ images }) {
  const [active, setActive] = useState(0)
  const total = images.length
  const intervalRef = useRef(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setActive(a => (a + 1) % total)
    }, 3000)
    return () => clearInterval(intervalRef.current)
  }, [total])

  const getStyle = (i) => {
    const offset = (i - active + total) % total
    const angle = (offset / total) * 360
    const rad = (angle * Math.PI) / 180
    // Radio del carrusel
    const rx = 160  // horizontal
    const rz = 50   // profundidad
    const x = Math.sin(rad) * rx
    const z = Math.cos(rad) * rz - rz
    const scale = 0.55 + 0.45 * ((Math.cos(rad) + 1) / 2)
    const opacity = 0.4 + 0.6 * ((Math.cos(rad) + 1) / 2)
    const zIndex = Math.round(scale * 10)
    return {
      transform: `translateX(${x}px) translateZ(${z}px) scale(${scale})`,
      opacity,
      zIndex,
      transition: 'all 0.6s cubic-bezier(0.4,0,0.2,1)',
    }
  }

  return (
    <div className="relative w-full flex items-center justify-center"
      style={{ height: '520px', perspective: '900px' }}>
      <div className="relative w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
        {images.map((src, i) => (
          <div key={i}
            onClick={() => { setActive(i); clearInterval(intervalRef.current) }}
            className="absolute left-1/2 top-1/2 cursor-pointer"
            style={{
              ...getStyle(i),
              marginLeft: '-130px',
              marginTop: '-180px',
              width: '260px',
              height: '360px',
            }}>
            <div className="w-full h-full rounded-3xl overflow-hidden ring-4 ring-white shadow-2xl">
              <img src={src} alt="" className="w-full h-full object-cover" />
            </div>
            {/* Reflejo sutil */}
            {(i - active + total) % total === 0 && (
              <div className="absolute -bottom-2 left-2 right-2 h-8 rounded-b-3xl"
                style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.15), transparent)', filter: 'blur(4px)' }} />
            )}
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, i) => (
          <button key={i} onClick={() => setActive(i)}
            className={`rounded-full transition-all ${i === active ? 'w-6 h-2 bg-brand-500' : 'w-2 h-2 bg-brand-200'}`} />
        ))}
      </div>
    </div>
  )
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

  return (
    <>
      {/* ── HERO ── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-hero-gradient">
        {/* Fondo decorativo */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-brand-300/20 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-petal/50 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4" />
          <div className="absolute top-20 left-10 w-2 h-2 bg-brand-300 rounded-full opacity-60" />
          <div className="absolute top-40 left-24 w-1 h-1 bg-brand-400 rounded-full opacity-40" />
          <div className="absolute bottom-32 right-20 w-3 h-3 bg-brand-200 rounded-full opacity-50" />
        </div>

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-0 min-h-[90vh] flex items-center">
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">            {/* ── Texto ── */}
            <div className="lg:col-span-5 flex flex-col justify-center order-2 lg:order-1 text-center lg:text-left items-center lg:items-start">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full text-brand-500 text-xs font-body tracking-widest uppercase mb-6 shadow-sm w-fit">
                <Heart size={10} className="fill-brand-400" />
                San Gil, Santander
              </div>

              <h1 className="font-display leading-[1.05] mb-5">
                <span className="block text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-dark">
                  {cfg.hero_title.split(' que ')[0]}
                </span>
                <span className="block text-4xl sm:text-5xl lg:text-6xl xl:text-7xl">
                  que <em className="text-brand-500 not-italic">{cfg.hero_title.split(' que ')[1] || 'enamoran'}</em>
                </span>
              </h1>

              <p className="font-body text-gray-500 text-base lg:text-lg mb-8 leading-relaxed max-w-sm">
                {cfg.hero_subtitle}
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <a href="#servicios"
                  className="inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-body font-bold px-7 py-3.5 rounded-full transition-all shadow-brand hover:shadow-brand-lg text-sm tracking-wide">
                  Ver Productos
                </a>
                <a href="https://wa.me/573212126285" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-white hover:bg-brand-50 text-brand-500 font-body font-bold px-7 py-3.5 rounded-full border border-brand-200 transition-all text-sm tracking-wide">
                  <Phone size={15} />
                  Contáctanos
                </a>
              </div>

              <div className="flex gap-8 mt-10 pt-8 border-t border-brand-100 justify-center lg:justify-start">
                {[['💐','Flores'],['🧸','Peluches'],['✨','Accesorios']].map(([icon, label]) => (
                  <div key={label} className="text-center">
                    <p className="text-xl mb-0.5">{icon}</p>
                    <p className="text-xs text-gray-400 font-body">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Carrusel 3D ── */}
            <div className="lg:col-span-7 order-1 lg:order-2 flex items-center justify-center">
              <HeroCarousel images={heroImgs} />
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-brand-400 animate-bounce">
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
          {testimonials.map(({ name, text, stars, image }, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-brand-100">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: stars }).map((_, i) => (
                  <Star key={i} size={14} className="fill-gold text-gold" />
                ))}
              </div>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed font-body italic">"{text}"</p>
              <div className="flex items-center gap-3">
                {image && <img src={image} alt={name} className="w-9 h-9 rounded-full object-cover border border-brand-100" />}
                <p className="text-brand-500 font-display font-600 text-sm">{name}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CONTACTO ── */}
      <section id="contacto" className="py-20 px-4 bg-dark text-white">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left">
            <p className="text-brand-300 font-body text-xs tracking-widest uppercase mb-3">Visítanos</p>
            <h2 className="font-display text-4xl md:text-5xl mb-6">¿Lista para<br /><em className="text-brand-400 not-italic">sorprender?</em></h2>
            <div className="flex items-start gap-3 mb-4 justify-center md:justify-start">
              <MapPin size={18} className="text-brand-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-body text-white text-sm">Calle 5 # 8-25</p>
                <p className="font-body text-gray-400 text-sm">San Gil, Santander</p>
              </div>
            </div>
            <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
              <Phone size={18} className="text-brand-400 flex-shrink-0" />
              <p className="font-body text-white text-sm">321 212 6285</p>
            </div>
            <div className="flex items-center gap-3 justify-center md:justify-start">
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
