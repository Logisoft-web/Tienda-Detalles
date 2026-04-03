import { useState, useEffect, useMemo } from 'react'
import { Plus, TrendingUp, TrendingDown, DollarSign, X } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { api } from '../../lib/api'
import toast from 'react-hot-toast'
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'
import { es } from 'date-fns/locale'

const INCOME_CATS  = ['Decoración','Globos','Desayunos','Propuestas','Otro']
const EXPENSE_CATS = ['Materiales','Transporte','Marketing','Servicios','Otro']

export default function AdminAccounting() {
  const [transactions, setTransactions] = useState([])
  const [summary, setSummary]           = useState({ income: 0, expense: 0, profit: 0 })
  const [modal, setModal]   = useState(false)
  const [filter, setFilter] = useState('all')
  const [form, setForm] = useState({ type:'income', category:'', amount:'', description:'', date: new Date().toISOString().split('T')[0] })

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
      setForm({ type:'income', category:'', amount:'', description:'', date: new Date().toISOString().split('T')[0] })
      toast.success('Transacción registrada 💰')
    } catch (err) { toast.error(err.message) }
  }

  const filtered = filter === 'all' ? transactions : transactions.filter(t => t.type === filter)

  const monthlyData = useMemo(() => {
    const months = []
    for (let i = 3; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i)
      const start = startOfMonth(d), end = endOfMonth(d)
      const label = format(d, 'MMM', { locale: es })
      const inc = transactions.filter(t => t.type==='income'  && t.date && isWithinInterval(parseISO(t.date.slice(0,10)), { start, end })).reduce((s,t) => s+Number(t.amount), 0)
      const exp = transactions.filter(t => t.type==='expense' && t.date && isWithinInterval(parseISO(t.date.slice(0,10)), { start, end })).reduce((s,t) => s+Number(t.amount), 0)
      months.push({ mes: label, Ingresos: inc, Egresos: exp })
    }
    return months
  }, [transactions])

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-script text-3xl text-rose-600">Contabilidad</h1>
          <p className="text-gray-400 text-sm">Ingresos y egresos del negocio</p>
        </div>
        <button onClick={() => setModal(true)}
          className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors">
          <Plus size={16} /> Registrar
        </button>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
          <TrendingUp size={18} className="text-green-500 mx-auto mb-1" />
          <p className="font-bold text-green-600 text-lg">${(Number(summary.income)/1000).toFixed(0)}k</p>
          <p className="text-gray-400 text-xs">Ingresos</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
          <TrendingDown size={18} className="text-red-400 mx-auto mb-1" />
          <p className="font-bold text-red-500 text-lg">${(Number(summary.expense)/1000).toFixed(0)}k</p>
          <p className="text-gray-400 text-xs">Egresos</p>
        </div>
        <div className="bg-rose-500 rounded-2xl p-4 shadow-sm text-center">
          <DollarSign size={18} className="text-white mx-auto mb-1" />
          <p className="font-bold text-white text-lg">${(Number(summary.profit)/1000).toFixed(0)}k</p>
          <p className="text-rose-200 text-xs">Ganancia</p>
        </div>
      </div>

      {/* Gráfico */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="font-semibold text-gray-700 mb-4 text-sm">Comparativo mensual</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthlyData}>
            <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={v => `$${Number(v).toLocaleString('es-CO')}`} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="Ingresos" fill="#e91e8c" radius={[4,4,0,0]} />
            <Bar dataKey="Egresos"  fill="#ffb3cc" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        {[['all','Todos'],['income','↑ Ingresos'],['expense','↓ Egresos']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter===val ? 'bg-rose-500 text-white' : 'bg-white text-gray-600 border border-rose-200'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Tabla desktop */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-rose-50 text-rose-700">
              <tr>{['Fecha','Tipo','Categoría','Descripción','Monto'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-semibold text-xs">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-rose-50">
              {filtered.map(t => (
                <tr key={t.id} className="hover:bg-rose-50/50 transition-colors">
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{t.date?.slice(0,10)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${t.type==='income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {t.type==='income' ? '↑ Ingreso' : '↓ Egreso'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{t.category}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs max-w-xs truncate">{t.description}</td>
                  <td className={`px-4 py-3 font-bold text-sm ${t.type==='income' ? 'text-green-600' : 'text-red-500'}`}>
                    {t.type==='income' ? '+' : '-'}${Number(t.amount).toLocaleString('es-CO')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tarjetas móvil */}
      <div className="md:hidden space-y-2">
        {filtered.map(t => (
          <div key={t.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${t.type==='income' ? 'bg-green-100' : 'bg-red-100'}`}>
              {t.type==='income' ? <TrendingUp size={16} className="text-green-600" /> : <TrendingDown size={16} className="text-red-500" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{t.description || t.category}</p>
              <p className="text-xs text-gray-400">{t.category} · {t.date?.slice(0,10)}</p>
            </div>
            <span className={`font-bold text-sm flex-shrink-0 ${t.type==='income' ? 'text-green-600' : 'text-red-500'}`}>
              {t.type==='income' ? '+' : '-'}${Number(t.amount).toLocaleString('es-CO')}
            </span>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4">
          <form onSubmit={handleAdd} className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-script text-2xl text-rose-600">Nueva transacción</h3>
              <button type="button" onClick={() => setModal(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="flex gap-2">
              {[['income','↑ Ingreso'],['expense','↓ Egreso']].map(([val, label]) => (
                <button key={val} type="button" onClick={() => setForm(f => ({ ...f, type: val, category:'' }))}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${form.type===val ? (val==='income' ? 'bg-green-500 text-white' : 'bg-red-400 text-white') : 'bg-gray-100 text-gray-500'}`}>
                  {label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Categoría *</label>
                <select required value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full border border-rose-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white">
                  <option value="">Seleccionar</option>
                  {(form.type==='income' ? INCOME_CATS : EXPENSE_CATS).map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Monto *</label>
                <input required type="number" min="0" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder="0" className="w-full border border-rose-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Fecha *</label>
              <input required type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full border border-rose-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
            </div>
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Descripción (opcional)"
              className="w-full border border-rose-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
            <button type="submit" className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl transition-colors">
              Guardar
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
