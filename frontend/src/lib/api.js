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
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  // Services
  getServices:    ()      => request('/services'),
  createService:  (body)  => request('/services',          { method: 'POST',   body: JSON.stringify(body) }),
  updateService:  (id, b) => request(`/services/${id}`,    { method: 'PUT',    body: JSON.stringify(b) }),
  deleteService:  (id)    => request(`/services/${id}`,    { method: 'DELETE' }),

  // Quotes
  getQuotes:        ()      => request('/quotes'),
  createQuote:      (body)  => request('/quotes',          { method: 'POST',   body: JSON.stringify(body) }),
  updateQuoteStatus:(id, s) => request(`/quotes/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: s }) }),

  // Events
  getEvents:    ()      => request('/events'),
  createEvent:  (body)  => request('/events',              { method: 'POST',   body: JSON.stringify(body) }),
  deleteEvent:  (id)    => request(`/events/${id}`,        { method: 'DELETE' }),

  // Transactions
  getTransactions:    ()      => request('/transactions'),
  getSummary:         ()      => request('/transactions/summary'),
  createTransaction:  (body)  => request('/transactions',  { method: 'POST',   body: JSON.stringify(body) }),

  // Users (solo superadmin)
  getUsers:     ()      => request('/users'),
  createUser:   (body)  => request('/users',               { method: 'POST',   body: JSON.stringify(body) }),
  toggleUser:   (id)    => request(`/users/${id}/toggle`,  { method: 'PATCH' }),
  deleteUser:   (id)    => request(`/users/${id}`,         { method: 'DELETE' }),
  getAuditLog:  ()      => request('/users/audit'),

  // Site config
  getSiteConfig:  ()         => request('/site/config'),
  updateSiteConfig:(key,val) => request('/site/config', { method: 'PUT', body: JSON.stringify({ key, value: val }) }),
  getMedia:       ()         => request('/site/media'),
  deleteMedia:    (id)       => request(`/site/media/${id}`, { method: 'DELETE' }),
  uploadMedia: (file) => {
    const form = new FormData()
    form.append('image', file)
    return fetch(`${BASE}/site/media`, {
      method: 'POST',
      headers: { ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) },
      body: form,
    }).then(r => r.json().then(d => { if (!r.ok) throw new Error(d.error); return d }))
  },
}
