import { Profiler, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { ToastContainer } from 'react-toastify';
import Servers from './Components/Servers.tsx'
import Terminal from './Components/Terminal.tsx'
import Players from './Components/Players.tsx'
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { AccountBalance, SupervisedUserCircleRounded } from '@mui/icons-material';
import Server from './Server.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename="">
      <Routes>
        <Route path="/" element={<Servers />} />
        <Route path="/server/:id" element={<Server ><Outlet /></Server>}>
          <Route path="" element={<Terminal />} />
          <Route path="terminal" element={<Terminal />} />
          <Route path="players" element={<Players />} />
        </Route></Routes>
    </BrowserRouter>
    <ToastContainer />
  </StrictMode>
)
