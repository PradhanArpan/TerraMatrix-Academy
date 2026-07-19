import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const CANONICAL_PORTAL_URL =
  'https://script.google.com/macros/s/AKfycbyEQRHMViD0pTdeQqVziBhkYMgL0kd_LHGW9bvnV8BGjWJAn3qZTl1V41FUy2jGD9qW/exec'

const isDirectVercelVisit =
  window.location.hostname.endsWith('.vercel.app') &&
  !window.google?.script?.run

if (isDirectVercelVisit) {
  window.location.replace(`${CANONICAL_PORTAL_URL}${window.location.hash || '#/'}`)
} else {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
