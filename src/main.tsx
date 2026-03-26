import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { TranslatePage } from './pages/TranslatePage'
import { SessionsPage } from './pages/SessionsPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TranslatePage />} />
        <Route path="/sessions" element={<SessionsPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
