import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Servers from './Components/Servers.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Servers />
  </StrictMode>,
)
