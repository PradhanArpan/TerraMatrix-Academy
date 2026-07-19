import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const CANONICAL_PORTAL_URL =
  'https://script.google.com/macros/s/AKfycbyEQRHMViD0pTdeQqVziBhkYMgLOkd_LHGW9bvnV8BGjWJAn3qZTI1V41FUy2jGD9qW/exec'

const isDirectVercelVisit =
  window.location.hostname.endsWith('.vercel.app') &&
  !window.google?.script?.run

if (isDirectVercelVisit) {
  // Vercel is the hidden static-asset host. The Apps Script web app is the
  // canonical portal because it supplies google.script.run and the shared backend.
  window.location.replace(`${CANONICAL_PORTAL_URL}${window.location.hash || '#/'}`)
} else {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
