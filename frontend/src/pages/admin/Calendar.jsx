import { useState, useEffect, useCallback } from 'react'
import { Calendar, momentLocalizer, Views } from 'react-big-calendar'
import moment from 'moment'
import 'moment/locale/es'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { Plus, X, Calendar as CalIcon, CheckCircle, AlertCircle, DollarSign } from 'lucide-react'
import { api } from '../../lib/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

// Forzar locale español ANTES de crear el localizer
moment.locale('es')
const localizer = momentLocalizer(moment)

const COLORS = ['#e91e8c', '#e8b923', '#ff80aa', '#c4006e', '#9a0055', '#ff4d88']

const MESSAGES = {
  today: 'Hoy', previous: '‹', next: '›',
  month: 'Mes', week: 'Semana', day: 'Día', agenda: 'Agenda',
  date: 'Fecha', time: 'Hora', event: 'Evento',
  noEventsInRange: 'Sin eventos en este rango',
  showMore: n => `+${n} más`, allDay: 'Todo el día',
}

const FORMATS = {
  // Estas funciones usan moment con locale 'es' ya activo
  weekdayFormat: (date, culture, loc) => loc.format(date, 'ddd', culture),
  dayFormat: (date, culture, loc) => loc.format(date, 'ddd DD', culture),
  dayHeaderFormat: (date, culture, loc) => loc.format(date, 'dddd DD [de] MMMM', culture),
  monthHeaderFormat: (date, culture, loc) => loc.format(date, 'MMMM YYYY', culture),
  dayRangeHeaderFormat: ({ start, end }, culture, loc) =>
    `${loc.format(start, 'DD MMM', culture)} – ${loc.format(end, 'DD MMM', culture)}`,
}

// El header de mes recibe { label } que ya viene formateado por weekdayFormat
// Solo necesitamos capitalize porque moment en español devuelve minúsculas
const MonthHeader = ({ label }) => (
  <span style={{ textTransform: 'capitalize' }}>{label}</span>
)

const COMPONENTS = {
  month: { header: MonthHeader },
  week: { header: ({ date }) => (
    <span style={{ textTransform: 'capitalize' }}>{moment(date).format('ddd DD')}</span>
  )},
}

const fmt = n => `$${Number(n || 0).toLocaleString('es-CO')}`
const EMPTY_FORM = { title: '', client_name: '', color: COLORS[0], notes: '', total_value: '', amount_paid: '' }

export default function AdminCalendar() {
  const [events, setEvents] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [view, setView] = useState(Views.MONTH)
  const [loading, setLoading] = useState(true)
  const [abonoAmount, setAbonoAmount] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => api.getEvents()
    .then(data => setEvents(data.map(e => ({ ...e, start: new Date(e.event_date), end: new Date(e.event_date) }))))
    .catch(console.error)
    .finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const handleSelectSlot = useCallback(({ start }) => {
    setForm({ ...EMPTY_FORM })
    setModal({ mode: 'add', date: start })
  }, [])

  const handleSelectEvent = useCallback((event) => {
    setAbonoAmount('')
    // Obtener el evento fresco por id desde la DB
    api.getEventById(event.id).then(fresh => {
      setModal({ mode: 'view', event: { ...fresh, start: new Date(fresh.event_date), end: new Date(fresh.event_date) } })
    }).catch(() => setModal({ mode: 'view', event }))
  }, [])

  const handleSave = async () => {
    if (!form.title.trim()) return toast.error('El título es requerido')
    setSaving(true)
    try {
      const payload = {
        ...form,
        event_date: modal.date.toISOString(),
        total_value: form.total_value ? parseFloat(form.total_value) : null,
        amount_paid: form.amount_paid ? parseFloat(form.amount_paid) : 0,
      }
      const newEvent = await api.createEvent(payload)
      if (payload.amount_paid > 0) {
        const saldo = payload.total_value ? payload.total_value - payload.amount_paid : 0
        await api.createTransaction({
          type: 'income', category: 'Venta detalle', amount: payload.amount_paid,
          description: `${saldo > 0 ? 'Abono' : 'Pago'}: ${form.title}${form.client_name ? ` — ${form.client_name}` : ''}${saldo > 0 ? ` (saldo: ${fmt(saldo)})` : ''}`,
          date: modal.date.toISOString().slice(0, 10),
          event_id: newEvent.id,
        })
      }
      await load(); setModal(null); setForm(EMPTY_FORM)
      toast.success('Evento guardado 🎀')
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este evento? También se eliminarán sus registros contables.')) return
    try {
      await api.deleteEvent(id)
      await load(); setModal(null)
      toast.success('Evento eliminado')
    } catch (err) { toast.error(err.message) }
  }

  const handleAbono = async () => {
    const amount = parseFloat(abonoAmount)
    if (!amount || amount <= 0) return toast.error('Ingresa un monto válido')
    const ev = modal.event
    const newPaid = Number(ev.amount_paid || 0) + amount
    const total = Number(ev.total_value || 0)
    if (total > 0 && newPaid > total) return toast.error(`El total pagado (${fmt(newPaid)}) supera el valor del evento (${fmt(total)})`)
    setSaving(true)
    try {
      await api.updateEventPayment(ev.id, newPaid)
      const saldo = total > 0 ? total - newPaid : 0
      await api.createTransaction({
        type: 'income', category: 'Venta detalle', amount,
        description: `${saldo > 0 ? 'Abono' : 'Pago final'}: ${ev.title}${ev.client_name ? ` — ${ev.client_name}` : ''}${saldo > 0 ? ` (saldo: ${fmt(saldo)})` : ' ✅ Saldado'}`,
        date: ev.event_date?.slice(0, 10) || new Date().toISOString().slice(0, 10),
        event_id: ev.id,
      })
      toast.success(saldo > 0 ? `💰 Abono registrado. Saldo: ${fmt(saldo)}` : '✅ Evento saldado completamente')
      setAbonoAmount(''); await load(); setModal(null)
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  const upcoming = [...events].sort((a, b) => a.start - b.start).filter(e => e.start >= new Date())
  if (loading) return <div className="flex items-center justify-center h-64 text-brand-400">Cargando...</div>

  const ev = modal?.mode === 'view' ? modal.event : null
  const evTotal = ev ? Number(ev.total_value || 0) : 0
  const evPaid = ev ? Number(ev.amount_paid || 0) : 0
  const evSaldo = evTotal - evPaid
  const evPct = evTotal > 0 ? Math.min(100, Math.round((evPaid / evTotal) * 100)) : 0

  return (
    <div className="space-y-4 pb-20 lg:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-script text-3xl text-rose-600">Calendario</h1>
          <p className="text-gray-400 text-sm">Gestiona tus eventos y pagos</p>
        </div>
        <button onClick={() => { setForm(EMPTY_FORM); setModal({ mode: 'add', date: new Date() }) }}
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm">
          <Plus size={16} /> Nuevo
        </button>
      </div>

      {/* Calendario desktop */}
      <div className="hidden md:block bg-white rounded-2xl p-4 shadow-sm" style={{ height: 560 }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start" endAccessor="end"
          view={view} onView={setView}
          onSelectSlot={handleSelectSlot} onSelectEvent={handleSelectEvent}
          selectable
          messages={MESSAGES}
          formats={FORMATS}
          components={COMPONENTS}
          eventPropGetter={e => {
            const saldo = Number(e.total_value || 0) - Number(e.amount_paid || 0)
            const hasSaldo = e.total_value && saldo > 0
            return { style: { backgroundColor: e.color, border: hasSaldo ? '2px solid #f59e0b' : 'none', borderRadius: 6 } }
          }}
          style={{ height: '100%' }}
        />
      </div>

      {/* Timeline móvil */}
      <div className="md:hidden space-y-3">
        <h2 className="font-bold text-gray-700 text-sm flex items-center gap-2">
          <CalIcon size={16} className="text-brand-400" /> Próximos eventos
        </h2>
        {upcoming.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No hay eventos próximos</p>
        ) : upcoming.map(ev => {
          const saldo = Number(ev.total_value || 0) - Number(ev.amount_paid || 0)
          return (
            <button key={ev.id} onClick={() => { setAbonoAmount(''); setModal({ mode: 'view', event: ev }) }}
              className="w-full flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm text-left border border-brand-50">
              <div className="w-1.5 h-12 rounded-full flex-shrink-0" style={{ backgroundColor: ev.color }} />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 text-sm truncate">{ev.title}</p>
                <p className="text-gray-400 text-xs">{ev.client_name}</p>
                {ev.total_value && (
                  <p className={`text-xs font-bold mt-0.5 ${saldo > 0 ? 'text-amber-500' : 'text-green-500'}`}>
                    {saldo > 0 ? `Saldo: ${fmt(saldo)}` : '✅ Saldado'}
                  </p>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-brand-500 font-bold text-sm">{format(ev.start, 'dd', { locale: es })}</p>
                <p className="text-gray-400 text-xs">{format(ev.start, 'MMM', { locale: es })}</p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 pb-3">
              <div className="flex items-center gap-3">
                {modal.mode === 'view' && ev && (
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: ev.color }} />
                )}
                <div>
                  <h3 className="font-script text-2xl text-brand-600">
                    {modal.mode === 'add' ? 'Nuevo Evento' : ev?.title}
                  </h3>
                  {modal.mode === 'add' && modal.date && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      📅 {format(modal.date, "EEEE dd 'de' MMMM 'de' yyyy", { locale: es })}
                    </p>
                  )}
                </div>
              </div>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            {modal.mode === 'add' && (
              <div className="px-6 pb-6 space-y-4">
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Título del evento *"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-400" />
                <input value={form.client_name} onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))}
                  placeholder="Nombre del cliente"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-400" />
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Notas..." rows={2}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-400 resize-none" />
                <div className="bg-brand-50 rounded-2xl p-4 space-y-3">
                  <p className="text-xs font-bold text-brand-600 uppercase tracking-wide">💰 Información de pago</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Precio total</label>
                      <input type="number" min="0" value={form.total_value}
                        onChange={e => setForm(f => ({ ...f, total_value: e.target.value }))} placeholder="0"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-400 bg-white" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Abono del cliente</label>
                      <input type="number" min="0" value={form.amount_paid}
                        onChange={e => setForm(f => ({ ...f, amount_paid: e.target.value }))} placeholder="0"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-400 bg-white" />
                    </div>
                  </div>
                  <div className="bg-white rounded-xl px-4 py-2.5 flex justify-between items-center border border-brand-100">
                    <span className="text-xs text-gray-500 font-bold">Queda debiendo:</span>
                    <span className={`text-sm font-bold ${form.total_value && Number(form.total_value) - Number(form.amount_paid || 0) > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                      {form.total_value ? fmt(Math.max(0, Number(form.total_value) - Number(form.amount_paid || 0))) : '—'}
                    </span>
                  </div>
                </div>
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
                <button onClick={handleSave} disabled={saving}
                  className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors">
                  {saving ? 'Guardando...' : 'Guardar evento'}
                </button>
              </div>
            )}

            {modal.mode === 'view' && ev && (
              <div className="px-6 pb-6 space-y-4">
                <div className="bg-gray-50 rounded-2xl p-4 space-y-2 border border-gray-100">
                  {ev.client_name && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <span>👤</span><span className="font-bold">{ev.client_name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>📅</span>
                    <span>{format(new Date(ev.event_date), "dd 'de' MMMM 'de' yyyy", { locale: es })}</span>
                  </div>
                  {ev.notes && (
                    <div className="flex items-start gap-2 text-sm text-gray-500">
                      <span>📝</span><span>{ev.notes}</span>
                    </div>
                  )}
                </div>

                {evTotal > 0 ? (
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">💰 Estado de pago</p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                        <p className="text-xs text-gray-400 mb-1">Precio</p>
                        <p className="font-bold text-gray-700 text-sm">{fmt(evTotal)}</p>
                      </div>
                      <div className="bg-green-50 rounded-xl p-3 shadow-sm">
                        <p className="text-xs text-gray-400 mb-1">Abonado</p>
                        <p className="font-bold text-green-600 text-sm">{fmt(evPaid)}</p>
                      </div>
                      <div className={`rounded-xl p-3 shadow-sm ${evSaldo > 0 ? 'bg-amber-50' : 'bg-green-50'}`}>
                        <p className="text-xs text-gray-400 mb-1">Debe</p>
                        <p className={`font-bold text-sm ${evSaldo > 0 ? 'text-amber-600' : 'text-green-600'}`}>{fmt(evSaldo)}</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${evPct}%` }} />
                    </div>
                    <p className="text-xs text-center text-gray-400">{evPct}% pagado</p>

                    {evSaldo > 0 ? (
                      <div className="bg-amber-50 rounded-2xl p-4 space-y-3 border border-amber-100">
                        <p className="text-xs font-bold text-amber-700 uppercase tracking-wide flex items-center gap-1">
                          <DollarSign size={12} /> Registrar abono
                        </p>
                        <div className="flex gap-2">
                          <input type="number" min="0" value={abonoAmount}
                            onChange={e => setAbonoAmount(e.target.value)} placeholder="Monto a abonar"
                            className="flex-1 border border-amber-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-amber-400 bg-white" />
                          <button onClick={() => setAbonoAmount(String(evSaldo))}
                            className="text-xs bg-white border border-amber-200 text-amber-700 font-bold px-3 rounded-xl hover:bg-amber-100 whitespace-nowrap">
                            Todo
                          </button>
                        </div>
                        {abonoAmount && parseFloat(abonoAmount) > 0 && (
                          <p className="text-xs text-gray-500">
                            Nuevo saldo: <span className="font-bold text-amber-700">{fmt(Math.max(0, evSaldo - parseFloat(abonoAmount)))}</span>
                          </p>
                        )}
                        <button onClick={handleAbono} disabled={saving || !abonoAmount || parseFloat(abonoAmount) <= 0}
                          className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                          <CheckCircle size={14} />
                          {saving ? 'Registrando...' : 'Confirmar abono → Contabilidad'}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 text-green-600 text-sm font-bold py-2">
                        <CheckCircle size={16} /> Evento completamente saldado
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-brand-50 rounded-xl p-3 flex items-center gap-2 text-brand-600 text-xs">
                    <AlertCircle size={14} /> Este evento no tiene valor registrado
                  </div>
                )}

                <button onClick={() => handleDelete(ev.id)}
                  className="w-full border border-red-200 text-red-500 hover:bg-red-50 font-bold py-2.5 rounded-xl text-sm transition-colors">
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
