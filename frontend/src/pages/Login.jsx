import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Heart, Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('¡Bienvenida! 🌸')
      navigate('/admin')
    } catch (err) {
      toast.error(err.message || 'Credenciales incorrectas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-blush flex items-center justify-center p-4 relative overflow-hidden">
      {/* Blobs decorativos */}
      <div className="absolute top-0 -left-20 w-80 h-80 bg-brand-200/30 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-petal/60 rounded-full blur-3xl animate-pulse pointer-events-none" />

      <div className="w-full max-w-3xl z-10">
        <div className="bg-white rounded-[2rem] shadow-brand-lg overflow-hidden border border-brand-100">
          <div className="flex flex-col md:flex-row min-h-[520px]">

            {/* ── Panel de marca ── */}
            <div className="md:w-5/12 bg-gradient-to-br from-brand-500 to-brand-700 p-8 text-white flex flex-col justify-between relative overflow-hidden">
              {/* Círculo decorativo */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16 blur-2xl pointer-events-none" />

              <div className="relative z-10">
                {/* Logo */}
                <div className="bg-white rounded-2xl p-3 w-fit mb-6 shadow-sm">
                  <img src="/galeria/Logo.png" alt="Hecho con Amor" className="h-16 w-16 object-cover rounded-xl" />
                </div>
                <h1 className="font-display text-3xl font-bold mb-2 leading-tight">
                  Hecho con Amor
                </h1>
                <p className="text-brand-100 text-sm leading-relaxed">
                  Panel administrativo para gestionar productos, cotizaciones y eventos de tu tienda.
                </p>
              </div>

              {/* Decoración inferior */}
              <div className="relative z-10 mt-10 hidden md:block">
                <div className="flex gap-2 mb-4">
                  {['🌸', '🧸', '✨', '🎁'].map((e, i) => (
                    <div key={i} className="w-9 h-9 rounded-full bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center text-base">
                      {e}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-brand-200">Flores eternas · Peluches · Accesorios</p>
                <p className="text-xs text-brand-300 mt-1">Calle 5 # 8-25, San Gil</p>
              </div>
            </div>

            {/* ── Formulario ── */}
            <div className="md:w-7/12 p-8 sm:p-12 flex flex-col justify-center bg-white">
              <div className="mb-8">
                <h2 className="font-display text-2xl text-dark font-bold mb-1">¡Bienvenida!</h2>
                <p className="text-gray-400 text-sm font-body">Ingresa tus credenciales para continuar</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-body font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Correo
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-300 group-focus-within:text-brand-500 transition-colors">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email" required
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="admin@hechoconamor.com"
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-400 outline-none transition-all text-dark text-sm font-body placeholder:text-gray-300"
                    />
                  </div>
                </div>

                {/* Contraseña */}
                <div className="space-y-1.5">
                  <label className="text-xs font-body font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Contraseña
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-300 group-focus-within:text-brand-500 transition-colors">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPwd ? 'text' : 'password'} required
                      value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-400 outline-none transition-all text-dark text-sm font-body placeholder:text-gray-300"
                    />
                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-300 hover:text-brand-500 transition-colors">
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Botón */}
                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-body font-bold py-3.5 rounded-xl transition-all shadow-brand hover:shadow-brand-lg text-sm tracking-wide group">
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /><span>Verificando...</span></>
                  ) : (
                    <><span>Acceder al Panel</span><ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col items-center gap-2">
                <Link to="/" className="text-brand-400 hover:text-brand-600 transition-colors">
                  <Heart size={16} className="fill-brand-300" />
                </Link>
                <p className="text-center text-[10px] text-gray-400 font-body tracking-widest uppercase">
                  <Link to="/" className="hover:text-brand-500 transition-colors">← Volver a la tienda</Link>
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
