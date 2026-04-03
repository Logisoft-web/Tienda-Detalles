import { Outlet, Link } from 'react-router-dom'
import { Heart, Menu, X } from 'lucide-react'
import { useState } from 'react'
import WhatsAppBtn from '../public/WhatsAppBtn'

export default function PublicLayout() {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-cream">
      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-rose-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Heart className="text-rose-500 fill-rose-400" size={22} />
            <span className="font-script text-2xl text-rose-600">Hecho con Amor</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <a href="#servicios" className="hover:text-rose-500 transition-colors">Servicios</a>
            <a href="#galeria" className="hover:text-rose-500 transition-colors">Galería</a>
            <a href="#contacto" className="hover:text-rose-500 transition-colors">Contacto</a>
            <Link to="/login" className="bg-rose-500 text-white px-4 py-1.5 rounded-full hover:bg-rose-600 transition-colors">
              Admin
            </Link>
          </nav>

          {/* Mobile hamburger */}
          <button className="md:hidden text-rose-500" onClick={() => setOpen(!open)} aria-label="Menú">
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden bg-white border-t border-rose-100 px-4 py-4 flex flex-col gap-4 text-sm font-medium text-gray-700">
            <a href="#servicios" onClick={() => setOpen(false)}>Servicios</a>
            <a href="#galeria" onClick={() => setOpen(false)}>Galería</a>
            <a href="#contacto" onClick={() => setOpen(false)}>Contacto</a>
            <Link to="/login" className="text-rose-500 font-semibold" onClick={() => setOpen(false)}>Panel Admin</Link>
          </div>
        )}
      </header>

      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-rose-600 text-white text-center py-6 mt-16">
        <p className="font-script text-xl mb-1">Hecho con Amor 🎀</p>
        <p className="text-rose-200 text-xs">Decoraciones Inolvidables · Cumpleaños · Aniversarios · Propuestas</p>
      </footer>

      {/* WhatsApp flotante */}
      <WhatsAppBtn />
    </div>
  )
}
