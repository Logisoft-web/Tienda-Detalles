import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, Save, X } from 'lucide-react'
import ImagePicker from '../../components/admin/ImagePicker'

const CATEGORIES = ['flores','peluches','accesorios','regalos','globos','decoracion','desayunos','propuestas']
const CAT_LABELS = { flores:'🌸 Flores',peluches:'🧸 Peluches',accesorios:'✨ Accesorios',regalos:'🎁 Regalos',globos:'🎈 Globos',decoracion:'🎀 Decoración',desayunos:'☕ Desayunos',propuestas:'💍 Propuestas' }

const EMPTY = { name:'', category:'flores', price:'', description:'', image_url:'' }

export default function Products() {
  const [products, setProducts] = useState([])
  const [editing, setEditing] = useState(null) // null | 'new' | product
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [picker, setPicker] = useState(false)
  const [filter, setFilter] = useState('todos')

  useEffect(() => { load() }, [])

  async function load() {
    try { setProducts(await api.getServices()) } catch (e) { toast.error(e.message) }
  }

  function startEdit(p) {
    setEditing(p)
    setForm({ name: p.name, category: p.category, price: p.price, description: p.description || '', image_url: p.image_url || '' })
  }

  function startNew() {
    setEditing('new')
    setForm(EMPTY)
  }

  function cancel() { setEditing(null) }

  async function handleSave() {
    if (!form.name || !form.category || !form.price) return toast.error('Nombre, categoría y precio son requeridos')
    setSaving(true)
    try {
      if (editing === 'new') {
        await api.createService(form)
        toast.success('Producto creado')
      } else {
        await api.updateService(editing.id, { ...form, active: true })
        toast.success('Producto actualizado')
      }
      setEditing(null)
      load()
    } catch (e) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar producto?')) return
    try { await api.deleteService(id); toast.success('Eliminado'); load() } catch (e) { toast.error(e.message) }
  }

  const filtered = filter === 'todos' ? products : products.filter(p => p.category === filter)

  return (
    <div className="space-y-4 pb-20 lg:pb-0">
      <div className="flex items-center justify-between">
        <h1 className="font-script text-3xl text-rose-600">Productos</h1>
        <button onClick={startNew}
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold py-2.5 px-5 rounded-xl text-sm transition-colors">
          <Plus className="w-4 h-4" /> Nuevo
        </button>
      </div>

      {/* Filtro categorías */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button onClick={() => setFilter('todos')}
          className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-colors flex-shrink-0 ${filter === 'todos' ? 'bg-brand-500 text-white' : 'bg-white border border-brand-200 text-gray-500'}`}>
          Todos ({products.length})
        </button>
        {CATEGORIES.map(c => {
          const count = products.filter(p => p.category === c).length
          if (count === 0) return null
          return (
            <button key={c} onClick={() => setFilter(c)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-colors flex-shrink-0 ${filter === c ? 'bg-brand-500 text-white' : 'bg-white border border-brand-200 text-gray-500'}`}>
              {CAT_LABELS[c]} ({count})
            </button>
          )
        })}
      </div>

      {/* Lista */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(p => (
          <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-brand-100 overflow-hidden">
            <div className="h-40 bg-gray-50 relative">
              {p.image_url
                ? <img src={p.image_url} alt={p.name} className="w-full h-full object-contain" />
                : <div className="flex items-center justify-center h-full text-gray-200 text-4xl">🌸</div>
              }
              <span className="absolute top-2 left-2 bg-white/90 text-xs px-2 py-0.5 rounded-full text-brand-600 font-bold">
                {CAT_LABELS[p.category]}
              </span>
            </div>
            <div className="p-4">
              <p className="font-bold text-dark text-sm mb-1">{p.name}</p>
              <p className="text-brand-500 font-bold text-sm mb-3">${Number(p.price).toLocaleString('es-CO')}</p>
              {p.description && <p className="text-gray-400 text-xs mb-3 line-clamp-2">{p.description}</p>}
              <div className="flex gap-2">
                <button onClick={() => startEdit(p)}
                  className="flex-1 flex items-center justify-center gap-1 bg-brand-50 hover:bg-brand-100 text-brand-600 font-bold py-2 rounded-xl text-xs transition-colors">
                  <Pencil className="w-3 h-3" /> Editar
                </button>
                <button onClick={() => handleDelete(p.id)}
                  className="p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal edición */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-dark">{editing === 'new' ? 'Nuevo producto' : 'Editar producto'}</h3>
              <button onClick={cancel} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              {/* Imagen */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden border border-brand-100 bg-gray-50 flex-shrink-0 cursor-pointer hover:border-brand-400 transition-colors"
                  onClick={() => setPicker(true)}>
                  {form.image_url
                    ? <img src={form.image_url} alt="" className="w-full h-full object-cover" />
                    : <div className="flex items-center justify-center h-full text-gray-300 text-xs text-center p-1">Agregar imagen</div>
                  }
                </div>
                <button onClick={() => setPicker(true)} className="text-brand-500 text-sm hover:underline">
                  {form.image_url ? 'Cambiar imagen' : 'Seleccionar imagen'}
                </button>
              </div>

              <input placeholder="Nombre del producto" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-400" />

              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-400">
                {CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
              </select>

              <input placeholder="Precio (ej: 85000)" type="number" value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-400" />

              <textarea placeholder="Descripción (opcional)" value={form.description} rows={2}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-400 resize-none" />
            </div>
            <div className="flex gap-3 p-5 pt-0">
              <button onClick={cancel} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60">
                <Save className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {picker && (
        <ImagePicker
          value={form.image_url}
          onChange={url => setForm(f => ({ ...f, image_url: url }))}
          onClose={() => setPicker(false)}
        />
      )}
    </div>
  )
}
