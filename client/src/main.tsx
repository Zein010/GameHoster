import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { ToastContainer } from 'react-toastify';
import Servers from './Components/Servers.tsx'
import Terminal from './Components/Terminal.tsx'
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter, Route, Routes } from "react-router-dom";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename="">
      <Routes>
        <Route path="" element={<Servers />} />
        <Route path="/terminal/:id" element={<Terminal />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
