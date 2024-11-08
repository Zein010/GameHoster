
import { createRoot } from 'react-dom/client'
import './index.css'
import { ToastContainer } from 'react-toastify';
import Servers from './Components/Servers.tsx'
import Terminal from './Components/Terminal.tsx'
import Players from './Components/Players.tsx'
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import Server from './Server.tsx';
import Logs from './Components/Log.tsx';
import FileManager from './Components/FileManager.tsx';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter basename="">
    <Routes>
      <Route path="/" key={"Main"} element={<Servers />} />
      <Route path="/server/:id" key={"Server"} element={<Server ><Outlet /></Server>}>
        <Route path="" key={"Terminal"} element={<Terminal />} />
        <Route path="logs" key={"Logs"} element={<Logs />} />
        <Route path="players" key={"Players"} element={<Players />} />
        <Route path="Files" key={"Players"} element={<FileManager />} />
      </Route></Routes>
    <ToastContainer />
  </BrowserRouter>
)
