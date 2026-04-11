import { useState, useEffect, useCallback } from 'react'
import { Calendar, momentLocalizer, Views } from 'react-big-calendar'
import moment from 'moment'
import 'moment/locale/es'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { Plus, X, Calendar as CalIcon, CheckCircle, DollarSign } from 'lucide-react'
import { api } from '../../lib/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

moment.locale('es')
const localizer = momentLocalizer(moment)
const COLORS = ['#e91e8c', '#e8b923', '#ff80aa', '#c4006e', '#9a0055', '#ff4d88']
const MESSAGES = {
  today: 'Hoy', previous: '‹', next: '›',
  month: 'Mes', week: 'Semana', day: 'Día', agenda: 'Agenda',
  date: 'Fecha', time: 'Hora', event: 'Evento',
  noEventsInRange: 'Sin eventos en este rango',
  showMore: n => `+${n} más`,
  allDay: 'Todo el día',
}

export default function AdminCalendar() {
  const [events, setEvents] = useState([])
  const [modal, setModal]   = useState(null)
  const [form, setForm]     = useState({ title: '', client_name: '', color: COLORS[0], notes: '' })
  const [view, setView]     = useState(Views.MONTH)
  const [loading, setLoading] = useState(true)
  const [payForm, setPayForm] = useState({ amount: '', category: 'Venta detalle', description: '' })
  const [paying, setPaying] = useState(false)

  const load = () => api.getEvents()
    .then(data => setEvents(data.map(e => ({ ...e, start: new Date(e.event_date), end: new Date(e.event_date) }))))
    .catch(console.error)
    .finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const handleSelectSlot = useCallback(({ start }) => {
    setForm({ title: '', client_name: '', color: COLORS[0], notes: '', event_date: start.toISOString() })
    setModal({ mode: 'add', date: start })
  }, [])

  const handleSelectEvent = useCallback((event) => setModal({ mode: 'view', event }), [])

  const handleSave = async () => {
    if (!form.title.trim()) return toast.error('El título es requerido')
    try {
      await api.createEvent({ ...form, event_date: modal.date.toISOString() })
      await load()
      setModal(null)
      toast.success('Evento agregado 🎀')
    } catch (err) { toast.error(err.message) }
  }

  const handleDelete = async (id) => {
    try {
      await api.deleteEvent(id)
      await load()
      setModal(null)
      toast.success('Evento eliminado')
    } catch (err) { toast.error(err.message) }
  }

  const handleRegisterPayment = async () => {
    if (!payForm.amount || parseFloat(payForm.amount) <= 0) return toast.error('Ingresa un monto válido')
    setPaying(true)
    try {
      const ev = modal.event
      await api.createTransaction({
        type: 'income',
        category: payForm.category,
        amount: parseFloat(payForm.amount),
        description: payForm.description || `Pago: ${ev.title}${ev.client_name ? ` — ${ev.client_name}` : ''}`,
        date: ev.event_date?.slice(0, 10) || new Date().toISOString().slice(0, 10),
      })
      toast.success('✅ Pago registrado en contabilidad')
      setPayForm({ amount: '', category: 'Venta detalle', description: '' })
      setModal(null)
    } catch (err) { toast.error(err.message) }
    finally { setPaying(false) }
  }

  const upcoming = [...events].sort((a, b) => a.start - b.start).filter(e => e.start >= new Date())

  if (loading) return <div className="flex items-center justify-center h-64 text-rose-400">Cargando...</div>

  return (
    <div className="space-y-4 pb-20 lg:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-script text-3xl text-rose-600">Calendario</h1>
          <p className="text-gray-400 text-sm">Gestiona tus eventos y citas</p>
        </div>
        <button onClick={() => { setForm({ title:'', client_name:'', color: COLORS[0], notes:'', event_date: new Date().toISOString() }); setModal({ mode:'add', date: new Date() }) }}
          className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors">
          <Plus size={16} /> Nuevo
        </button>
      </div>

      {/* Calendario desktop */}
      <div className="hidden md:block bg-white rounded-2xl p-4 shadow-sm" style={{ height: 560 }}>
        <Calendar localizer={localizer} events={events} startAccessor="start" endAccessor="end"
          view={view} onView={setView} onSelectSlot={handleSelectSlot} onSelectEvent={handleSelectEvent}
          selectable messages={MESSAGES} culture="es"
          eventPropGetter={e => ({ style: { backgroundColor: e.color, border: 'none', borderRadius: 6 } })}
          style={{ height: '100%' }} />
      </div>

      {/* Timeline móvil */}
      <div className="md:hidden space-y-3">
        <h2 className="font-semibold text-gray-700 text-sm flex items-center gap-2">
          <CalIcon size={16} className="text-rose-400" /> Próximos eventos
        </h2>
        {upcoming.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No hay eventos próximos</p>
        ) : upcoming.map(ev => (
          <button key={ev.id} onClick={() => setModal({ mode:'view', event: ev })}
            className="w-full flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm text-left">
            <div className="w-1.5 h-12 rounded-full flex-shrink-0" style={{ backgroundColor: ev.color }} />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 text-sm truncate">{ev.title}</p>
              <p className="text-gray-400 text-xs">{ev.client_name}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-rose-500 font-bold text-sm">{format(ev.start, 'dd', { locale: es })}</p>
              <p className="text-gray-400 text-xs">{format(ev.start, 'MMM', { locale: es })}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-script text-2xl text-rose-600">
                {modal.mode === 'add' ? 'Nuevo Evento' : modal.event?.title}
              </h3>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            {modal.mode === 'add' ? (
              <div className="space-y-4">
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Título del evento *"
                  className="w-full border border-rose-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
                <input value={form.client_name} onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))}
                  placeholder="Nombre del cliente"
                  className="w-full border border-rose-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Notas..." rows={2}
                  className="w-full border border-rose-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none" />
                <div>
                  <p className="text-xs text-gray-500 mb-2">Color</p>
                  <div className="flex gap-2">
                    {COLORS.map(c => (
                      <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                        className={`w-7 h-7 rounded-full transition-transform ${form.color === c ? 'scale-125 ring-2 ring-offset-1 ring-gray-400' : ''}`}
                        style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
                <button onClick={handleSave}
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl transition-colors">
                  Guardar evento
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600"><span className="font-medium">Cliente:</span> {modal.event?.client_name || '—'}</p>
                <p className="text-sm text-gray-600"><span className="font-medium">Fecha:</span> {format(new Date(modal.event?.event_date), 'dd MMMM yyyy', { locale: es })}</p>
                {modal.event?.notes && <p className="text-sm text-gray-600"><span className="font-medium">Notas:</span> {modal.event.notes}</p>}

                {/* Registrar pago */}
                <div className="border-t border-brand-100 pt-4 mt-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                    <DollarSign size={12} className="text-brand-500" /> Registrar pago en contabilidad
                  </p>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="number" min="0" placeholder="Monto del pago"
                        value={payForm.amount}
                        onChange={e => setPayForm(f => ({ ...f, amount: e.target.value }))}
                        className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-400"
                      />
                      <select value={payForm.category}
                        onChange={e => setPayForm(f => ({ ...f, category: e.target.value }))}
                        className="border border-gray-200 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-brand-400 bg-white">
                        <option value="Venta detalle">🎁 Venta detalle</option>
                        <option value="Domicilio">🛵 Domicilio</option>
                        <option value="Personalización">✨ Personalización</option>
                        <option value="Otro ingreso">💰 Otro ingreso</option>
                      </select>
                    </div>
                    <input placeholder="Descripción (opcional)"
                      value={payForm.description}
                      onChange={e => setPayForm(f => ({ ...f, description: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-400"
                    />
                    <button onClick={handleRegisterPayment} disabled={paying || !payForm.amount}
                      className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                      <CheckCircle size={16} />
                      {paying ? 'Registrando...' : 'Registrar pago'}
                    </button>
                  </div>
                </div>

                <button onClick={() => handleDelete(modal.event.id)}
                  className="w-full border border-red-200 text-red-500 hover:bg-red-50 font-semibold py-2.5 rounded-xl transition-colors text-sm">
                  Eliminar evento
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
