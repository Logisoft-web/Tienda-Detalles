import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { LayoutDashboard, CalendarDays, FileText, DollarSign, LogOut, Heart, Menu, X, Users, Settings } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import clsx from 'clsx'

const NAV = [
  { to: '/admin',            label: 'Dashboard',    icon: LayoutDashboard, end: true },
  { to: '/admin/calendar',   label: 'Calendario',   icon: CalendarDays },
  { to: '/admin/quoter',     label: 'Cotizador',    icon: FileText },
  { to: '/admin/accounting', label: 'Contabilidad', icon: DollarSign },
]

const NAV_SUPER = [
  { to: '/admin/site',  label: 'Editor Web', icon: Settings },
  { to: '/admin/users', label: 'Usuarios',   icon: Users },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sideOpen, setSideOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  const NavItems = ({ onClick }) => (
    <>
      {NAV.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to} to={to} end={end} onClick={onClick}
          className={({ isActive }) => clsx(
            'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
            isActive ? 'bg-rose-500 text-white shadow-md' : 'text-gray-600 hover:bg-rose-50 hover:text-rose-600'
          )}
        >
          <Icon size={18} />
          <span>{label}</span>
        </NavLink>
      ))}
      {user?.role === 'superadmin' && (
        <>
          <div className="px-4 pt-3 pb-1 text-xs text-gray-300 uppercase tracking-widest">Superadmin</div>
          {NAV_SUPER.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to} to={to} onClick={onClick}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                isActive ? 'bg-rose-500 text-white shadow-md' : 'text-gray-600 hover:bg-rose-50 hover:text-rose-600'
              )}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </>
      )}
    </>
  )

  return (
    <div className="min-h-screen flex bg-rose-50/30">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-rose-100 shadow-sm p-4 gap-2">
        <div className="flex items-center gap-2 px-2 py-4 mb-2">
          <Heart className="text-rose-500 fill-rose-400" size={20} />
          <span className="font-script text-xl text-rose-600">Hecho con Amor</span>
        </div>
        <NavItems />
        <div className="mt-auto pt-4 border-t border-rose-100">
          <p className="text-xs text-gray-400 px-4 mb-2">{user?.name} <span className="text-gray-300">({user?.role})</span></p>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all">
            <LogOut size={18} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sideOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="bg-black/40 flex-1" onClick={() => setSideOpen(false)} />
          <aside className="w-64 bg-white h-full p-4 flex flex-col gap-2 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="font-script text-xl text-rose-600">Hecho con Amor</span>
              <button onClick={() => setSideOpen(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <NavItems onClick={() => setSideOpen(false)} />
            <div className="mt-auto pt-4 border-t border-rose-100">
              <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm text-gray-500 hover:bg-red-50 hover:text-red-500">
                <LogOut size={18} /> Cerrar sesión
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar mobile */}
        <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-rose-100 px-4 h-14 flex items-center justify-between shadow-sm">
          <button onClick={() => setSideOpen(true)} className="text-rose-500"><Menu size={22} /></button>
          <span className="font-script text-lg text-rose-600">Hecho con Amor</span>
          <button onClick={handleLogout} className="text-gray-400"><LogOut size={18} /></button>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Bottom nav mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-rose-100 flex justify-around py-2 shadow-lg">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) => clsx('flex flex-col items-center gap-0.5 px-3 py-1 text-xs', isActive ? 'text-rose-500' : 'text-gray-400')}
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
