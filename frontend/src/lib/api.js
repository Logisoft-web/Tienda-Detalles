const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

function getToken() {
  try { return JSON.parse(localStorage.getItem('hca_user'))?.token || '' } catch { return '' }
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      ...options.headers,
    },
    ...options,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Error ${res.status}`)
  return data
}

export const api = {
  // Auth
  login:   (body) => request('/auth/login',    { method: 'POST', body: JSON.stringify(body) }),
  register:(body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  // Services (público GET, resto requiere auth)
  getServices:    ()     => request('/services'),
  createService:  (body) => request('/services',     { method: 'POST',   body: JSON.stringify(body) }),
  updateService:  (id, b)=> request(`/services/${id}`,{ method: 'PUT',   body: JSON.stringify(b) }),
  deleteService:  (id)   => request(`/services/${id}`,{ method: 'DELETE' }),

  // Quotes
  getQuotes:      ()     => request('/quotes'),
  createQuote:    (body) => request('/quotes',       { method: 'POST',   body: JSON.stringify(body) }),
  updateQuoteStatus:(id,s)=>request(`/quotes/${id}/status`,{ method:'PATCH', body: JSON.stringify({ status: s }) }),

  // Events
  getEvents:      ()     => request('/events'),
  createEvent:    (body) => request('/events',       { method: 'POST',   body: JSON.stringify(body) }),
  deleteEvent:    (id)   => request(`/events/${id}`, { method: 'DELETE' }),

  // Transactions
  getTransactions:()     => request('/transactions'),
  getSummary:     ()     => request('/transactions/summary'),
  createTransaction:(body)=>request('/transactions', { method: 'POST',   body: JSON.stringify(body) }),
}
