import { useState, useEffect, useMemo } from 'react'
import { Plus, TrendingUp, TrendingDown, DollarSign, X, Package, Truck, Megaphone, Users, ShoppingBag, Wrench } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { api } from '../../lib/api'
import toast from 'react-hot-toast'
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'
import { es } from 'date-fns/locale'

// Categorías específicas para Hecho con Amor
const INCOME_CATS = [
  { value: 'Venta detalle',     label: '🎁 Venta de detalle',       color: '#e91e8c' },
  { value: 'Domicilio',         label: '🛵 Domicilio',               color: '#ff80aa' },
  { value: 'Personalización',   label: '✨ Personalización',         color: '#c4006e' },
  { value: 'Otro ingreso',      label: '💰 Otro ingreso',            color: '#ffb3cc' },
]
const EXPENSE_CATS = [
  { value: 'Insumos directos',  label: '🌸 Insumos directos',       color: '#ef4444' },
  { value: 'Empaque',           label: '📦 Empaque y presentación',  color: '#f97316' },
  { value: 'Transporte',        label: '🚗 Transporte',              color: '#eab308' },
  { value: 'Marketing',         label: '📱 Marketing y publicidad',  color: '#8b5cf6' },
  { value: 'Servicios web',     label: '💻 Servicios web',           color: '#3b82f6' },
  { value: 'Mano de obra',      label: '👩 Mano de obra',            color: '#06b6d4' },
  { value: 'Otro gasto',        label: '📋 Otro gasto',              color: '#6b7280' },
]

const ALL_CATS = [...INCOME_CATS, ...EXPENSE_CATS]
const PIE_COLORS = ['#e91e8c','#ff80aa','#c4006e','#ffb3cc','#ef4444','#f97316','#eab308','#8b5cf6','#3b82f6','#06b6d4']

const fmt = n => `$${Number(n).toLocaleString('es-CO')}`

export default function AdminAccounting() {
  const [transactions, setTransactions] = useState([])
  const [summary, setSummary] = useState({ income: 0, expense: 0, profit: 0 })
  const [modal, setModal] = useState(false)
  const [filter, setFilter] = useState('all')
  const [filterCat, setFilterCat] = useState('all')
  const [form, setForm] = useState({
    type: 'income', category: '', amount: '', description: '',
    date: new Date().toISOString().split('T')[0]
  })

  const load = () => Promise.all([api.getTransactions(), api.getSummary()])
    .then(([txs, sum]) => { setTransactions(txs); setSummary(sum) })
    .catch(console.error)

  useEffect(() => { load() }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!form.amount || !form.category) return toast.error('Completa todos los campos')
    try {
      await api.createTransaction({ ...form, amount: parseFloat(form.amount) })
      await load()
      setModal(false)
      setForm({ type: 'income', category: '', amount: '', description: '', date: new Date().toISOString().split('T')[0] })
      toast.success('Registrado 💰')
    } catch (err) { toast.error(err.message) }
  }

  const filtered = transactions
    .filter(t => filter === 'all' || t.type === filter)
    .filter(t => filterCat === 'all' || t.category === filterCat)

  // Datos mensuales últimos 4 meses
  const monthlyData = useMemo(() => {
    const months = []
    for (let i = 3; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i)
      const start = startOfMonth(d), end = endOfMonth(d)
      const label = format(d, 'MMM', { locale: es })
      const inc = transactions.filter(t => t.type === 'income' && t.date && isWithinInterval(parseISO(t.date.slice(0, 10)), { start, end })).reduce((s, t) => s + Number(t.amount), 0)
      const exp = transactions.filter(t => t.type === 'expense' && t.date && isWithinInterval(parseISO(t.date.slice(0, 10)), { start, end })).reduce((s, t) => s + Number(t.amount), 0)
      months.push({ mes: label, Ingresos: inc, Egresos: exp, Ganancia: inc - exp })
    }
    return months
  }, [transactions])

  // Distribución de egresos por categoría
  const expenseByCategory = useMemo(() => {
    const map = {}
    transactions.filter(t => t.type === 'expense').forEach(t => {
      map[t.category] = (map[t.category] || 0) + Number(t.amount)
    })
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  }, [transactions])

  // Margen del mes actual
  const thisMonth = useMemo(() => {
    const start = startOfMonth(new Date()), end = endOfMonth(new Date())
    const inc = transactions.filter(t => t.type === 'income' && t.date && isWithinInterval(parseISO(t.date.slice(0, 10)), { start, end })).reduce((s, t) => s + Number(t.amount), 0)
    const exp = transactions.filter(t => t.type === 'expense' && t.date && isWithinInterval(parseISO(t.date.slice(0, 10)), { start, end })).reduce((s, t) => s + Number(t.amount), 0)
    return { inc, exp, profit: inc - exp, margin: inc > 0 ? Math.round(((inc - exp) / inc) * 100) : 0 }
  }, [transactions])

  const cats = form.type === 'income' ? INCOME_CATS : EXPENSE_CATS

  return (
    <div className="space-y-5 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-script text-3xl text-rose-600">Contabilidad</h1>
          <p className="text-gray-400 text-sm">Flujo de caja · Hecho con Amor</p>
        </div>
        <button onClick={() => setModal(true)}
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm">
          <Plus size={16} /> Registrar
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-green-100">
          <p className="text-xs text-gray-400 mb-1">Ingresos totales</p>
          <p className="font-bold text-green-600 text-xl">{fmt(summary.income)}</p>
          <p className="text-xs text-gray-300 mt-0.5">acumulado</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-red-100">
          <p className="text-xs text-gray-400 mb-1">Egresos totales</p>
          <p className="font-bold text-red-500 text-xl">{fmt(summary.expense)}</p>
          <p className="text-xs text-gray-300 mt-0.5">acumulado</p>
        </div>
        <div className="bg-brand-500 rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-brand-200 mb-1">Ganancia neta</p>
          <p className="font-bold text-white text-xl">{fmt(summary.profit)}</p>
          <p className="text-xs text-brand-200 mt-0.5">acumulado</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-brand-100">
          <p className="text-xs text-gray-400 mb-1">Margen este mes</p>
          <p className={`font-bold text-xl ${thisMonth.margin >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {thisMonth.margin}%
          </p>
          <p className="text-xs text-gray-300 mt-0.5">{fmt(thisMonth.profit)}</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-gray-700 mb-4 text-sm">Comparativo mensual</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData}>
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={v => fmt(v)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Ingresos" fill="#e91e8c" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Egresos" fill="#ffb3cc" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Ganancia" fill="#c4006e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-gray-700 mb-4 text-sm">Distribución de egresos</h3>
          {expenseByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={expenseByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {expenseByCategory.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => fmt(v)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-300 text-sm">Sin egresos registrados</div>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-brand-100">
          {[['all', 'Todos'], ['income', '↑ Ingresos'], ['expense', '↓ Egresos']].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === val ? 'bg-brand-500 text-white' : 'text-gray-500 hover:text-brand-500'}`}>
              {label}
            </button>
          ))}
        </div>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="bg-white border border-brand-100 rounded-xl px-3 py-1.5 text-xs text-gray-600 shadow-sm outline-none">
          <option value="all">Todas las categorías</option>
          {ALL_CATS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      {/* Tabla desktop */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm overflow-hidden border border-brand-50">
        <table className="w-full text-sm">
          <thead className="bg-brand-50 text-brand-700">
            <tr>{['Fecha', 'Tipo', 'Categoría', 'Descripción', 'Monto'].map(h => (
              <th key={h} className="text-left px-4 py-3 font-bold text-xs">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-gray-300 text-sm">Sin registros</td></tr>
            ) : filtered.map(t => (
              <tr key={t.id} className="hover:bg-brand-50/30 transition-colors">
                <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{t.date?.slice(0, 10)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-bold ${t.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {t.type === 'income' ? '↑ Ingreso' : '↓ Egreso'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs">{t.category}</td>
                <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">{t.description || '—'}</td>
                <td className={`px-4 py-3 font-bold text-sm ${t.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                  {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tarjetas móvil */}
      <div className="md:hidden space-y-2">
        {filtered.map(t => (
          <div key={t.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 border border-brand-50">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${t.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
              {t.type === 'income' ? <TrendingUp size={18} className="text-green-600" /> : <TrendingDown size={18} className="text-red-500" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800 truncate">{t.description || t.category}</p>
              <p className="text-xs text-gray-400">{t.category} · {t.date?.slice(0, 10)}</p>
            </div>
            <span className={`font-bold text-sm flex-shrink-0 ${t.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
              {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
            </span>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-10 text-gray-300 text-sm">Sin registros</div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4">
          <form onSubmit={handleAdd} className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-script text-2xl text-brand-600">Nueva transacción</h3>
              <button type="button" onClick={() => setModal(false)}><X size={20} className="text-gray-400" /></button>
            </div>

            {/* Tipo */}
            <div className="flex gap-2">
              {[['income', '↑ Ingreso'], ['expense', '↓ Egreso']].map(([val, label]) => (
                <button key={val} type="button" onClick={() => setForm(f => ({ ...f, type: val, category: '' }))}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${form.type === val ? (val === 'income' ? 'bg-green-500 text-white' : 'bg-red-400 text-white') : 'bg-gray-100 text-gray-500'}`}>
                  {label}
                </button>
              ))}
            </div>

            {/* Categoría */}
            <div>
              <label className="text-xs text-gray-500 mb-2 block font-bold uppercase tracking-wide">Categoría *</label>
              <div className="grid grid-cols-2 gap-2">
                {cats.map(c => (
                  <button key={c.value} type="button"
                    onClick={() => setForm(f => ({ ...f, category: c.value }))}
                    className={`text-left px-3 py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${form.category === c.value ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-100 text-gray-500 hover:border-brand-200'}`}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block font-bold">Monto *</label>
                <input required type="number" min="0" value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder="0"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-400" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block font-bold">Fecha *</label>
                <input required type="date" value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-400" />
              </div>
            </div>

            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Descripción (ej: Compra de flores para pedido #12)"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-400" />

            <button type="submit"
              className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-xl transition-colors">
              Guardar transacción
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
