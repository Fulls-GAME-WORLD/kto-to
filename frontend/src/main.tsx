import { BrowserRouter } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import Router from './Router.tsx'

import './assets/css/main.css'


if (typeof window !== 'undefined') {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
          <Router />
        </BrowserRouter>
    </StrictMode>,
  )
}