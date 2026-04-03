import { useEffect, useState } from 'react'
import { DollarSign, CalendarDays, FileText, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { api } from '../../lib/api'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

const COLORS = ['#e91e8c', '#e8b923', '#ff80aa', '#c4006e']

export default function AdminDashboard() {
  const [summary, setSummary]         = useState({ income: 0, expense: 0, profit: 0 })
  const [transactions, setTransactions] = useState([])
  const [events, setEvents]           = useState([])
  const [quotes, setQuotes]           = useState([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    Promise.all([
      api.getSummary(),
      api.getTransactions(),
      api.getEvents(),
      api.getQuotes(),
    ]).then(([sum, txs, evs, qts]) => {
      setSummary(sum)
      setTransactions(txs)
      setEvents(evs)
      setQuotes(qts)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  // Ingresos por categoría
  const byCategory = Object.entries(
    transactions.filter(t => t.type === 'income').reduce((m, t) => {
      m[t.category] = (m[t.category] || 0) + Number(t.amount); return m
    }, {})
  ).map(([name, value]) => ({ name, value }))

  // Ingresos últimos 7 días
  const byDay = Object.entries(
    transactions.filter(t => t.type === 'income' && t.date).reduce((m, t) => {
      const d = t.date.slice(0, 10); m[d] = (m[d] || 0) + Number(t.amount); return m
    }, {})
  ).sort().slice(-7).map(([date, total]) => ({
    day: format(parseISO(date), 'dd MMM', { locale: es }), total
  }))

  const upcoming = [...events]
    .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
    .filter(e => new Date(e.event_date) >= new Date())
    .slice(0, 4)

  const stats = [
    { label: 'Ingresos',        value: `$${Number(summary.income).toLocaleString('es-CO')}`,  icon: DollarSign,  color: 'bg-rose-100 text-rose-600' },
    { label: 'Ganancia neta',   value: `$${Number(summary.profit).toLocaleString('es-CO')}`,  icon: TrendingUp,  color: 'bg-green-100 text-green-600' },
    { label: 'Próximos eventos',value: events.length,                                          icon: CalendarDays,color: 'bg-amber-100 text-amber-600' },
    { label: 'Cotizaciones',    value: quotes.length,                                          icon: FileText,    color: 'bg-purple-100 text-purple-600' },
  ]

  if (loading) return <div className="flex items-center justify-center h-64 text-rose-400">Cargando...</div>

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div>
        <h1 className="font-script text-3xl text-rose-600">Dashboard</h1>
        <p className="text-gray-400 text-sm">Resumen de tu negocio 💕</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className={`inline-flex p-2 rounded-xl mb-3 ${color}`}><Icon size={18} /></div>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
            <p className="text-gray-400 text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-4 text-sm">Ingresos últimos 7 días</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={byDay}>
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={v => [`$${Number(v).toLocaleString('es-CO')}`, 'Ingreso']} />
              <Bar dataKey="total" fill="#e91e8c" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-4 text-sm">Ingresos por categoría</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={byCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}
                label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                {byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={v => `$${Number(v).toLocaleString('es-CO')}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Próximos eventos */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="font-semibold text-gray-700 mb-4 text-sm">Próximos eventos</h3>
        {upcoming.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">No hay eventos próximos</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map(ev => (
              <div key={ev.id} className="flex items-center gap-3 p-3 rounded-xl bg-rose-50">
                <div className="w-2 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: ev.color }} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm truncate">{ev.title}</p>
                  <p className="text-gray-400 text-xs">{ev.client_name}</p>
                </div>
                <span className="text-xs text-rose-500 font-medium flex-shrink-0">
                  {format(new Date(ev.event_date), 'dd MMM', { locale: es })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
