
import { createRoot } from 'react-dom/client'
import './index.css'
import { ToastContainer } from 'react-toastify';
import Servers from './Components/Dashboard/Servers.tsx'
import Profile from './Components/Dashboard/Profile.tsx'
import Terminal from './Components/Terminal.tsx'
import Players from './Components/Players.tsx'
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import Server from './Server.tsx';
import Logs from './Components/Log.tsx';
import FileManager from './Components/FileManager.tsx';
import Login from './Components/Login.tsx';
import AuthProvider from 'react-auth-kit';
import createStore from 'react-auth-kit/createStore';
import RequireAuth from '@auth-kit/react-router/RequireAuth'
import TextEditor from './Components/TextEditor.tsx';
import Dashboard from './Dashboard.tsx';

const store = createStore({
  authName: '_auth',
  authType: 'cookie',
  cookieDomain: window.location.hostname,
  cookieSecure: window.location.protocol === 'https:',
});
createRoot(document.getElementById('root')!).render(
  <AuthProvider store={store}>
    <BrowserRouter basename="">
      <Routes>
        <Route path="/" key={"Login"} element={<Login />} />

        <Route path="/Dashboard" key={"Main"} element={<RequireAuth fallbackPath='/'><Dashboard><Outlet /></Dashboard></RequireAuth>} >
          <Route path="Servers" key={"Servers"} element={<Servers />} />
          <Route path="Profile" key={"Servers"} element={<Profile />} />
          <Route path="Friends" key={"Servers"} element={<Servers />} />

        </Route>


        <Route path="/server/:id" key={"Server"} element={<RequireAuth fallbackPath='/'><Server ><Outlet /></Server></RequireAuth>} >
          <Route path="" key={"Terminal"} element={<Terminal />} />
          <Route path="logs" key={"Logs"} element={<Logs />} />
          <Route path="players" key={"Players"} element={<Players />} />
          <Route path="Files/*" key={"Players"} element={<FileManager />} />
          <Route path="Files/Edit/*" key={"Players"} element={<TextEditor />} />
        </Route>
      </Routes>
      <ToastContainer />
    </BrowserRouter>

  </AuthProvider>
)
