import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import moment from 'moment'
import 'moment/locale/es'
import App from './App'
import './index.css'

// Forzar locale español globalmente
moment.locale('es')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
