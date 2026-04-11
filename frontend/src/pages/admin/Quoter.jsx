import { useState, useEffect } from 'react'
import { Plus, Send, ChevronDown, ChevronUp, CalendarDays, DollarSign, CheckCircle, Clock, X, History } from 'lucide-react'
import { api } from '../../lib/api'
import toast from 'react-hot-toast'

const STATUS_COLORS = { pending: 'bg-amber-100 text-amber-700', confirmed: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-600' }
const STATUS_LABELS = { pending: '⏳ Pendiente', confirmed: '✅ Confirmada', cancelled: '❌ Cancelada' }
const COLORS = ['#e91e8c', '#e8b923', '#ff80aa', '#c4006e', '#9a0055', '#ff4d88']
const fmt = n => `${Number(n).toLocaleString('es-CO')}`
const EMPTY_CONFIRM = { total_value: '', amount_paid: '', color: COLORS[0] }

export default function AdminQuoter() {
  const [services, setServices] = useState([])
  const [quotes, setQuotes] = useState([])
  const [expanded, setExpanded] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [showAll, setShowAll] = useState(false)

  // Modal confirmar → calendario
  const [confirmModal, setConfirmModal] = useState(null)
  const [confirmForm, setConfirmForm] = useState(EMPTY_CONFIRM)
  const [confirming, setConfirming] = useState(false)

  // Modal pago
  const [payModal, setPayModal] = useState(null)
  const [payForm, setPayForm] = useState({ amount: '', type: 'abono', category: 'Venta detalle', description: '' })
  const [paying, setPaying] = useState(false)

  const [form, setForm] = useState({ client_name: '', client_phone: '', event_date: '', event_type: '', notes: '', selected: [] })

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
      setForm({ client_name: '', client_phone: '', event_date: '', event_type: '', notes: '', selected: [] })
      setShowForm(false)
      toast.success('Cotización creada 🎀')
    } catch (err) { toast.error(err.message) }
  }

  // Cancelar: actualiza estado y desaparece de la lista activa
  const handleCancel = async (q) => {
    if (!confirm(`¿Cancelar la cotización de ${q.client_name}?`)) return
    try {
      await api.updateQuoteStatus(q.id, 'cancelled')
      await load()
      setExpanded(null)
      toast.success('Cotización cancelada')
    } catch (err) { toast.error(err.message) }
  }

  // Confirmar: abre modal para pedir datos del calendario
  const handleConfirmClick = (q) => {
    setConfirmModal(q)
    setConfirmForm({ ...EMPTY_CONFIRM, total_value: String(q.total) })
  }

  const handleConfirmSave = async () => {
    const q = confirmModal
    setConfirming(true)
    try {
      await api.updateQuoteStatus(q.id, 'confirmed')
      const total_value = confirmForm.total_value ? parseFloat(confirmForm.total_value) : Number(q.total)
      const amount_paid = confirmForm.amount_paid ? parseFloat(confirmForm.amount_paid) : 0
      const newEvent = await api.createEvent({
        title: `${q.event_type || 'Pedido'} — ${q.client_name}`,
        client_name: q.client_name,
        event_date: new Date(q.event_date).toISOString(),
        color: confirmForm.color,
        notes: q.notes || '',
        quote_id: q.id,
        total_value,
        amount_paid,
      })
      // Si hay abono, registrar en contabilidad vinculado al evento
      if (amount_paid > 0) {
        const saldo = total_value - amount_paid
        await api.createTransaction({
          type: 'income',
          category: 'Venta detalle',
          amount: amount_paid,
          description: `Abono: ${q.event_type || 'Pedido'} — ${q.client_name}${saldo > 0 ? ` (saldo: $${fmt(saldo)})` : ''}`,
          date: q.event_date?.slice(0, 10) || new Date().toISOString().slice(0, 10),
          event_id: newEvent.id,
        })
      }
      toast.success('✅ Confirmada y agregada al calendario')
      setConfirmModal(null)
      setConfirmForm(EMPTY_CONFIRM)
      setExpanded(null)
      await load()
    } catch (err) { toast.error(err.message) }
    finally { setConfirming(false) }
  }

  const handleRegisterPayment = async () => {
    const q = payModal
    const amount = parseFloat(payForm.amount)
    if (!amount || amount <= 0) return toast.error('Ingresa un monto válido')
    if (amount > Number(q.total)) return toast.error('El monto supera el total de la cotización')
    setPaying(true)
    try {
      const isAbono = payForm.type === 'abono'
      const saldo = Number(q.total) - amount
      const desc = payForm.description ||
        `${isAbono ? 'Abono' : 'Pago total'}: ${q.event_type || 'Pedido'} — ${q.client_name}${isAbono ? ` (saldo pendiente: ${fmt(saldo)})` : ''}`
      await api.createTransaction({
        type: 'income', category: payForm.category, amount,
        description: desc,
        date: q.event_date?.slice(0, 10) || new Date().toISOString().slice(0, 10),
      })
      toast.success(isAbono ? `💰 Abono registrado. Saldo: ${fmt(saldo)}` : '✅ Pago total registrado')
      setPayModal(null)
      setPayForm({ amount: '', type: 'abono', category: 'Venta detalle', description: '' })
    } catch (err) { toast.error(err.message) }
    finally { setPaying(false) }
  }

  const sendWhatsApp = (q) => {
    const svcs = (q.services || []).map(id => services.find(s => s.id === id)?.name).filter(Boolean).join(', ')
    const msg = encodeURIComponent(`Hola ${q.client_name}! 🎀\nCotización para el ${q.event_date}:\n${svcs}\nTotal: ${fmt(q.total)}\n¿Confirmamos?`)
    window.open(`https://wa.me/57${q.client_phone}?text=${msg}`, '_blank')
  }

  // Solo mostrar pendientes en la lista principal
  const activeQuotes = quotes.filter(q => q.status === 'pending')
  const archivedQuotes = quotes.filter(q => q.status !== 'pending')

  // Saldo pendiente en confirmForm
  const confirmSaldo = confirmForm.total_value
    ? Math.max(0, parseFloat(confirmForm.total_value || 0) - parseFloat(confirmForm.amount_paid || 0))
    : null

  return (
    <div className="space-y-5 pb-20 lg:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-script text-3xl text-rose-600">Cotizador</h1>
          <p className="text-gray-400 text-sm">Crea y gestiona cotizaciones</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm">
          <Plus size={16} /> Nueva
        </button>
      </div>

      {/* Formulario nueva cotización */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 shadow-sm border border-brand-100 space-y-4">
          <h3 className="font-bold text-gray-700">Nueva cotización</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block font-bold">Nombre cliente *</label>
              <input required value={form.client_name} onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))}
                placeholder="Nombre completo"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-400" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block font-bold">Teléfono</label>
              <input value={form.client_phone} onChange={e => setForm(f => ({ ...f, client_phone: e.target.value }))}
                placeholder="3001234567" type="tel"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-400" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block font-bold">Fecha del evento *</label>
              <input required type="date" value={form.event_date} onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-400" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block font-bold">Tipo de evento</label>
              <select value={form.event_type} onChange={e => setForm(f => ({ ...f, event_type: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-400 bg-white">
                <option value="">Seleccionar...</option>
                {['Cumpleaños', 'Aniversario', 'Propuesta', 'Pedida de mano', 'Graduación', 'Día de la madre', 'San Valentín', 'Otro'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-2 block font-bold">Servicios *</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {services.map(s => (
                <label key={s.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${form.selected.includes(s.id) ? 'border-brand-400 bg-brand-50' : 'border-gray-200 hover:border-brand-200'}`}>
                  <input type="checkbox" checked={form.selected.includes(s.id)} onChange={() => toggleService(s.id)} className="accent-brand-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">{s.name}</p>
                    <p className="text-xs text-brand-500 font-bold">{fmt(s.price)}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            placeholder="Notas adicionales..." rows={2}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-400 resize-none" />

          <div className="flex items-center justify-between bg-brand-50 rounded-xl px-4 py-3">
            <span className="font-bold text-gray-700">Total estimado</span>
            <span className="font-bold text-brand-600 text-xl">{fmt(total)}</span>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => setShowForm(false)}
              className="flex-1 border border-gray-200 text-gray-500 py-2.5 rounded-xl text-sm hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" className="flex-1 bg-brand-500 hover:bg-brand-600 text-white font-bold py-2.5 rounded-xl text-sm">
              Crear cotización
            </button>
          </div>
        </form>
      )}

      {/* Lista cotizaciones PENDIENTES */}
      <div className="space-y-3">
        <h3 className="font-bold text-gray-700 text-sm">Pendientes ({activeQuotes.length})</h3>
        {activeQuotes.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No hay cotizaciones pendientes</p>
        ) : activeQuotes.map(q => (
          <div key={q.id} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-brand-50">
            <button className="w-full flex items-center gap-3 p-4 text-left" onClick={() => setExpanded(expanded === q.id ? null : q.id)}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-gray-800 text-sm">{q.client_name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${STATUS_COLORS[q.status]}`}>{STATUS_LABELS[q.status]}</span>
                </div>
                <p className="text-gray-400 text-xs mt-0.5">{q.event_date?.slice(0,10)} · {q.event_type || '—'}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-brand-600">{fmt(q.total)}</p>
                {expanded === q.id ? <ChevronUp size={14} className="text-gray-400 ml-auto mt-1" /> : <ChevronDown size={14} className="text-gray-400 ml-auto mt-1" />}
              </div>
            </button>

            {expanded === q.id && (
              <div className="px-4 pb-4 border-t border-brand-50 pt-3 space-y-3">
                {q.client_phone && <p className="text-xs text-gray-500">📞 {q.client_phone}</p>}
                {q.notes && <p className="text-xs text-gray-500">📝 {q.notes}</p>}

                <div className="flex gap-2 flex-wrap">
                  {q.client_phone && (
                    <button onClick={() => sendWhatsApp(q)}
                      className="text-xs px-3 py-1.5 rounded-full bg-green-500 text-white flex items-center gap-1 hover:bg-green-600 font-bold">
                      <Send size={11} /> WhatsApp
                    </button>
                  )}
                </div>

                {/* Acciones principales */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button onClick={() => handleConfirmClick(q)}
                    className="flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-2.5 rounded-xl transition-colors">
                    <CheckCircle size={13} /> Confirmar
                  </button>
                  <button onClick={() => handleCancel(q)}
                    className="flex items-center justify-center gap-1.5 border border-red-200 text-red-500 hover:bg-red-50 text-xs font-bold py-2.5 rounded-xl transition-colors">
                    <X size={13} /> Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Historial (confirmadas/canceladas) */}
      {archivedQuotes.length > 0 && (
        <div className="space-y-2">
          <button onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600 font-bold">
            <History size={13} /> {showAll ? 'Ocultar' : 'Ver'} historial ({archivedQuotes.length})
          </button>
          {showAll && archivedQuotes.map(q => (
            <div key={q.id} className="bg-gray-50 rounded-2xl border border-gray-100 px-4 py-3 flex items-center gap-3 opacity-70">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-gray-600 truncate">{q.client_name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${STATUS_COLORS[q.status]}`}>{STATUS_LABELS[q.status]}</span>
                </div>
                <p className="text-gray-400 text-xs">{q.event_date?.slice(0,10)} · {q.event_type || '—'}</p>
              </div>
              <p className="text-sm font-bold text-gray-500 flex-shrink-0">{fmt(q.total)}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal confirmar → calendario ── */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 pb-3">
              <div>
                <h3 className="font-script text-2xl text-brand-600">Confirmar pedido</h3>
                <p className="text-xs text-gray-400 mt-0.5">Completa los datos para el calendario</p>
              </div>
              <button onClick={() => setConfirmModal(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            <div className="px-6 pb-6 space-y-4">
              {/* Resumen cotización */}
              <div className="bg-brand-50 rounded-2xl p-4 space-y-1">
                <p className="font-bold text-gray-800 text-sm">👤 {confirmModal.client_name}</p>
                <p className="text-xs text-gray-500">📅 {confirmModal.event_date?.slice(0,10)} · {confirmModal.event_type || '—'}</p>
                <p className="text-brand-600 font-bold text-sm">Total cotización: ${fmt(confirmModal.total)}</p>
              </div>

              {/* Datos para el calendario */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">💰 Información de pago</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Precio total</label>
                    <input type="number" min="0" value={confirmForm.total_value}
                      onChange={e => setConfirmForm(f => ({ ...f, total_value: e.target.value }))}
                      placeholder="0"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-400" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Abono del cliente</label>
                    <input type="number" min="0" value={confirmForm.amount_paid}
                      onChange={e => setConfirmForm(f => ({ ...f, amount_paid: e.target.value }))}
                      placeholder="0"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-400" />
                  </div>
                </div>

                {/* Saldo automático */}
                <div className="bg-gray-50 rounded-xl px-4 py-2.5 flex justify-between items-center border border-gray-100">
                  <span className="text-xs text-gray-500 font-bold">Queda debiendo:</span>
                  <span className={`text-sm font-bold ${confirmSaldo > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                    {confirmForm.total_value ? `$${fmt(confirmSaldo)}` : '—'}
                  </span>
                </div>
              </div>

              {/* Color del evento */}
              <div>
                <p className="text-xs text-gray-500 mb-2 font-bold">Color en el calendario</p>
                <div className="flex gap-2">
                  {COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setConfirmForm(f => ({ ...f, color: c }))}
                      className={`w-7 h-7 rounded-full transition-transform ${confirmForm.color === c ? 'scale-125 ring-2 ring-offset-1 ring-gray-400' : ''}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setConfirmModal(null)}
                  className="flex-1 border border-gray-200 text-gray-500 py-2.5 rounded-xl text-sm hover:bg-gray-50">
                  Cancelar
                </button>
                <button onClick={handleConfirmSave} disabled={confirming}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                  <CalendarDays size={14} />
                  {confirming ? 'Guardando...' : 'Confirmar y agregar al calendario'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de pago */}
      {payModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-script text-2xl text-brand-600">Registrar pago</h3>
              <button onClick={() => setPayModal(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            <div className="bg-brand-50 rounded-xl p-3">
              <p className="text-sm font-bold text-gray-700">{payModal.client_name}</p>
              <p className="text-xs text-gray-400">{payModal.event_type} · {payModal.event_date?.slice(0,10)}</p>
              <p className="text-brand-600 font-bold mt-1">Total cotización: {fmt(payModal.total)}</p>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Tipo de pago</label>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setPayForm(f => ({ ...f, type: 'abono', amount: '' }))}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold border-2 transition-all ${payForm.type === 'abono' ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-gray-200 text-gray-500'}`}>
                  <Clock size={14} /> Abono parcial
                </button>
                <button type="button" onClick={() => setPayForm(f => ({ ...f, type: 'total', amount: String(payModal.total) }))}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold border-2 transition-all ${payForm.type === 'total' ? 'border-green-400 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500'}`}>
                  <CheckCircle size={14} /> Pago total
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 mb-1 block">
                Monto *
                {payForm.type === 'abono' && payForm.amount && (
                  <span className="text-amber-600 ml-2">Saldo: {fmt(Number(payModal.total) - parseFloat(payForm.amount || 0))}</span>
                )}
              </label>
              <input type="number" min="0" max={payModal.total} value={payForm.amount}
                onChange={e => setPayForm(f => ({ ...f, amount: e.target.value }))}
                placeholder="0"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-400" />
            </div>

            <input placeholder="Descripción (opcional)"
              value={payForm.description}
              onChange={e => setPayForm(f => ({ ...f, description: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-400" />

            <button onClick={handleRegisterPayment} disabled={paying || !payForm.amount}
              className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition-colors">
              <CheckCircle size={16} />
              {paying ? 'Registrando...' : payForm.type === 'abono' ? 'Registrar abono' : 'Registrar pago total'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
