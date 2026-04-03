import { Outlet, Link } from 'react-router-dom'
import { Menu, X, Phone, MapPin, Instagram } from 'lucide-react'
import { useState } from 'react'
import WhatsAppBtn from '../public/WhatsAppBtn'

export default function PublicLayout() {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-blush">
      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-brand-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/galeria/Logo.png" alt="Hecho con Amor" className="h-10 w-auto object-contain" />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-body font-700 text-gray-600 tracking-wide">
            <a href="#servicios" className="hover:text-brand-500 transition-colors uppercase text-xs tracking-widest">Productos</a>
            <a href="#galeria"   className="hover:text-brand-500 transition-colors uppercase text-xs tracking-widest">Galería</a>
            <a href="#contacto"  className="hover:text-brand-500 transition-colors uppercase text-xs tracking-widest">Contacto</a>
            <Link to="/login" className="bg-brand-500 text-white px-5 py-2 rounded-full text-xs tracking-widest uppercase hover:bg-brand-600 transition-colors shadow-brand">
              Admin
            </Link>
          </nav>

          <button className="md:hidden text-brand-500" onClick={() => setOpen(!open)} aria-label="Menú">
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {open && (
          <div className="md:hidden bg-white border-t border-brand-100 px-6 py-5 flex flex-col gap-4 text-sm font-body text-gray-700">
            <a href="#servicios" onClick={() => setOpen(false)} className="uppercase tracking-widest text-xs">Productos</a>
            <a href="#galeria"   onClick={() => setOpen(false)} className="uppercase tracking-widest text-xs">Galería</a>
            <a href="#contacto"  onClick={() => setOpen(false)} className="uppercase tracking-widest text-xs">Contacto</a>
            <Link to="/login" className="text-brand-500 font-bold uppercase tracking-widest text-xs" onClick={() => setOpen(false)}>Panel Admin</Link>
          </div>
        )}
      </header>

      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-dark text-white pt-12 pb-6 mt-20">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          <div>
            <img src="/galeria/Logo.png" alt="Hecho con Amor" className="h-14 w-auto object-contain mb-4" />
            <p className="text-gray-400 text-sm leading-relaxed">
              Tienda de detalles para toda ocasión. Flores eternas, peluches y accesorios únicos.
            </p>
          </div>
          <div>
            <h4 className="font-display text-brand-300 text-lg mb-4">Encuéntranos</h4>
            <div className="flex items-start gap-2 text-gray-400 text-sm mb-3">
              <MapPin size={16} className="text-brand-400 mt-0.5 flex-shrink-0" />
              <span>Calle 5 # 8-25, San Gil, Santander</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <Phone size={16} className="text-brand-400 flex-shrink-0" />
              <span>321 212 6285</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Phone size={16} className="text-brand-400 flex-shrink-0" />
              <span>316 914 3500</span>
            </div>
          </div>
          <div>
            <h4 className="font-display text-brand-300 text-lg mb-4">Síguenos</h4>
            <a href="https://www.instagram.com/hechoconamor_am16" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-brand-300 transition-colors text-sm">
              <Instagram size={18} />
              @hechoconamor_am16
            </a>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 text-center text-gray-500 text-xs tracking-widest uppercase">
          © {new Date().getFullYear()} Hecho con Amor · San Gil, Colombia
        </div>
      </footer>

      <WhatsAppBtn />
    </div>
  )
}
