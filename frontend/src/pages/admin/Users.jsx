import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'
import { UserPlus, Trash2, ToggleLeft, ToggleRight, ClipboardList, X } from 'lucide-react'

export default function Users() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [audit, setAudit] = useState([])
  const [tab, setTab] = useState('users')
  const [form, setForm] = useState({ name: '', username: '', password: '', role: 'admin' })
  const [loading, setLoading] = useState(false)

  useEffect(() => { loadUsers() }, [])

  async function loadUsers() {
    try { setUsers(await api.getUsers()) } catch (e) { toast.error(e.message) }
  }

  async function loadAudit() {
    try { setAudit(await api.getAuditLog()) } catch (e) { toast.error(e.message) }
  }

  async function handleCreate(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await api.createUser(form)
      toast.success('Usuario creado')
      setForm({ name: '', username: '', password: '', role: 'admin' })
      loadUsers()
    } catch (e) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  async function handleToggle(id) {
    try { await api.toggleUser(id); loadUsers() } catch (e) { toast.error(e.message) }
  }

  async function handleDelete(id, username) {
    if (!confirm(`¿Eliminar usuario "${username}"?`)) return
    try { await api.deleteUser(id); toast.success('Eliminado'); loadUsers() } catch (e) { toast.error(e.message) }
  }

  if (user?.role !== 'superadmin') return (
    <div className="flex items-center justify-center h-64 text-gray-400">Solo superadmin puede acceder aquí</div>
  )

  return (
    <div className="space-y-6">
      <div className="flex gap-3 border-b border-brand-100 pb-2">
        <button onClick={() => setTab('users')}
          className={`px-4 py-2 rounded-t-lg text-sm font-bold transition-colors ${tab === 'users' ? 'bg-brand-500 text-white' : 'text-gray-400 hover:text-brand-500'}`}>
          Usuarios
        </button>
        <button onClick={() => { setTab('audit'); loadAudit() }}
          className={`px-4 py-2 rounded-t-lg text-sm font-bold transition-colors flex items-center gap-1 ${tab === 'audit' ? 'bg-brand-500 text-white' : 'text-gray-400 hover:text-brand-500'}`}>
          <ClipboardList className="w-4 h-4" /> Auditoría
        </button>
      </div>

      {tab === 'users' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Formulario crear */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-brand-100">
            <h3 className="font-bold text-dark mb-4">Nuevo usuario</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <input required placeholder="Nombre completo" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-400" />
              <input required placeholder="Usuario (sin @)" value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value.toLowerCase().replace(/\s/g,'') }))}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-400" />
              <input required type="password" placeholder="Contraseña" value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-400" />
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-400">
                <option value="admin">Admin</option>
                <option value="superadmin">Superadmin</option>
              </select>
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60">
                <UserPlus className="w-4 h-4" /> Crear usuario
              </button>
            </form>
          </div>

          {/* Lista usuarios */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-brand-100">
            <h3 className="font-bold text-dark mb-4">Usuarios ({users.length})</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {users.map(u => (
                <div key={u.id} className={`flex items-center justify-between p-3 rounded-xl border ${u.active ? 'border-brand-100 bg-brand-50/30' : 'border-gray-100 bg-gray-50 opacity-60'}`}>
                  <div>
                    <p className="font-bold text-sm text-dark">{u.username}</p>
                    <p className="text-xs text-gray-400">{u.name} · <span className={`font-semibold ${u.role === 'superadmin' ? 'text-brand-500' : 'text-gray-500'}`}>{u.role}</span></p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleToggle(u.id)} title={u.active ? 'Desactivar' : 'Activar'}
                      className="p-1.5 rounded-lg hover:bg-brand-100 text-gray-400 hover:text-brand-500 transition-colors">
                      {u.active ? <ToggleRight className="w-5 h-5 text-brand-500" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>
                    {u.id !== user.id && (
                      <button onClick={() => handleDelete(u.id, u.username)} title="Eliminar"
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'audit' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-brand-100">
          <h3 className="font-bold text-dark mb-4">Registro de actividad</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                  <th className="pb-2 pr-4">Fecha</th>
                  <th className="pb-2 pr-4">Usuario</th>
                  <th className="pb-2 pr-4">Acción</th>
                  <th className="pb-2">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {audit.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="py-2 pr-4 text-gray-400 whitespace-nowrap">
                      {new Date(a.created_at).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="py-2 pr-4 font-semibold text-brand-600">{a.username}</td>
                    <td className="py-2 pr-4">
                      <span className="px-2 py-0.5 bg-brand-50 text-brand-700 rounded-full text-xs">{a.action}</span>
                    </td>
                    <td className="py-2 text-gray-500">{a.detail || '-'}</td>
                  </tr>
                ))}
                {audit.length === 0 && (
                  <tr><td colSpan={4} className="py-8 text-center text-gray-300">Sin registros</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
