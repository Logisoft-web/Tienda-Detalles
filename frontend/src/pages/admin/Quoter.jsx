import { useState, useEffect } from 'react'
import { Plus, Send, ChevronDown, ChevronUp } from 'lucide-react'
import { api } from '../../lib/api'
import toast from 'react-hot-toast'

const STATUS_COLORS = { pending: 'bg-amber-100 text-amber-700', confirmed: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-600' }
const STATUS_LABELS = { pending: 'Pendiente', confirmed: 'Confirmada', cancelled: 'Cancelada' }

export default function AdminQuoter() {
  const [services, setServices] = useState([])
  const [quotes, setQuotes]     = useState([])
  const [expanded, setExpanded] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ client_name:'', client_phone:'', event_date:'', event_type:'', notes:'', selected:[] })

  const load = () => Promise.all([api.getServices(), api.getQuotes()])
    .then(([svcs, qts]) => { setServices(svcs); setQuotes(qts) })
    .catch(console.error)

  useEffect(() => { load() }, [])

  const total = form.selected.reduce((s, id) => s + Number(services.find(sv => sv.id === id)?.price || 0), 0)

  const toggleService = (id) => setForm(f => ({
    ...f, selected: f.selected.includes(id) ? f.selected.filter(x => x !== id) : [...f.selected, id]
  }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.client_name || !form.event_date || form.selected.length === 0)
      return toast.error('Completa los campos y selecciona al menos un servicio')
    try {
      await api.createQuote({ ...form, services: form.selected, total })
      await load()
      setForm({ client_name:'', client_phone:'', event_date:'', event_type:'', notes:'', selected:[] })
      setShowForm(false)
      toast.success('Cotización creada 🎀')
    } catch (err) { toast.error(err.message) }
  }

  const updateStatus = async (id, status) => {
    try {
      await api.updateQuoteStatus(id, status)
      await load()
      toast.success('Estado actualizado')
    } catch (err) { toast.error(err.message) }
  }

  const sendWhatsApp = (q) => {
    const svcs = (q.services || []).map(id => services.find(s => s.id === id)?.name).filter(Boolean).join(', ')
    const msg = encodeURIComponent(`Hola ${q.client_name}! 🎀\nCotización para el ${q.event_date}:\n${svcs}\nTotal: $${Number(q.total).toLocaleString('es-CO')}\n¿Confirmamos?`)
    window.open(`https://wa.me/57${q.client_phone}?text=${msg}`, '_blank')
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-script text-3xl text-rose-600">Cotizador</h1>
          <p className="text-gray-400 text-sm">Crea y gestiona cotizaciones</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors">
          <Plus size={16} /> Nueva
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-semibold text-gray-700">Nueva cotización</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Nombre cliente *</label>
              <input required value={form.client_name} onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))}
                placeholder="Nombre completo"
                className="w-full border border-rose-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Teléfono</label>
              <input value={form.client_phone} onChange={e => setForm(f => ({ ...f, client_phone: e.target.value }))}
                placeholder="3001234567" type="tel"
                className="w-full border border-rose-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Fecha del evento *</label>
              <input required type="date" value={form.event_date} onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))}
                className="w-full border border-rose-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Tipo de evento</label>
              <select value={form.event_type} onChange={e => setForm(f => ({ ...f, event_type: e.target.value }))}
                className="w-full border border-rose-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white">
                <option value="">Seleccionar...</option>
                {['Cumpleaños','Aniversario','Propuesta','Pedida de mano','Otro'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-2 block">Servicios *</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {services.map(s => (
                <label key={s.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${form.selected.includes(s.id) ? 'border-rose-400 bg-rose-50' : 'border-gray-200 hover:border-rose-200'}`}>
                  <input type="checkbox" checked={form.selected.includes(s.id)} onChange={() => toggleService(s.id)} className="accent-rose-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{s.name}</p>
                    <p className="text-xs text-rose-500">${Number(s.price).toLocaleString('es-CO')}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            placeholder="Notas adicionales..." rows={2}
            className="w-full border border-rose-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none" />

          <div className="flex items-center justify-between bg-rose-50 rounded-xl px-4 py-3">
            <span className="font-semibold text-gray-700">Total estimado</span>
            <span className="font-bold text-rose-600 text-xl">${total.toLocaleString('es-CO')}</span>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => setShowForm(false)}
              className="flex-1 border border-gray-200 text-gray-500 py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
              Crear cotización
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        <h3 className="font-semibold text-gray-700 text-sm">Cotizaciones ({quotes.length})</h3>
        {quotes.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No hay cotizaciones aún</p>
        ) : quotes.map(q => (
          <div key={q.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <button className="w-full flex items-center gap-3 p-4 text-left" onClick={() => setExpanded(expanded === q.id ? null : q.id)}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-800 text-sm">{q.client_name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[q.status]}`}>{STATUS_LABELS[q.status]}</span>
                </div>
                <p className="text-gray-400 text-xs mt-0.5">{q.event_date} · {q.event_type}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-rose-600">${Number(q.total).toLocaleString('es-CO')}</p>
                {expanded === q.id ? <ChevronUp size={14} className="text-gray-400 ml-auto mt-1" /> : <ChevronDown size={14} className="text-gray-400 ml-auto mt-1" />}
              </div>
            </button>

            {expanded === q.id && (
              <div className="px-4 pb-4 border-t border-rose-50 pt-3 space-y-3">
                <p className="text-xs text-gray-500">Tel: {q.client_phone || '—'}</p>
                {q.notes && <p className="text-xs text-gray-500">Notas: {q.notes}</p>}
                <div className="flex gap-2 flex-wrap">
                  {['pending','confirmed','cancelled'].map(s => (
                    <button key={s} onClick={() => updateStatus(q.id, s)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${q.status === s ? STATUS_COLORS[s]+' border-transparent' : 'border-gray-200 text-gray-500 hover:border-rose-200'}`}>
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                  {q.client_phone && (
                    <button onClick={() => sendWhatsApp(q)}
                      className="text-xs px-3 py-1.5 rounded-full bg-green-500 text-white flex items-center gap-1 hover:bg-green-600 transition-colors">
                      <Send size={11} /> WhatsApp
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
