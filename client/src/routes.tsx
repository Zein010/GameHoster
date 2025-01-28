import { Outlet, Route, Routes } from "react-router-dom";
import Servers from "./Components/Dashboard/Servers.tsx";
import Profile from "./Components/Dashboard/Profile.tsx";
import Terminal from "./Components/Terminal.tsx";
import Players from "./Components/Players.tsx";
import "react-toastify/dist/ReactToastify.css";
import Server from "./Server.tsx";
import Logs from "./Components/Log.tsx";
import FileManager from "./Components/FileManager.tsx";
import Login from "./Components/Login.tsx";
import TextEditor from "./Components/TextEditor.tsx";
import Dashboard from "./Dashboard.tsx";
import RequireAuth from "@auth-kit/react-router/RequireAuth";

const Routers = () => {
    return (
        <Routes>
            <Route path="/Login" element={<Login />} />

            <Route
                path="/"
                element={
                    <RequireAuth fallbackPath="/Login">
                        <Outlet />
                    </RequireAuth>
                }
            >
                <Route
                    path="/Dashboard"
                    key={"Main"}
                    element={
                        <Dashboard>
                            <Outlet />
                        </Dashboard>
                    }
                >
                    <Route path="Servers" element={<Servers />} />
                    <Route path="Profile" element={<Profile />} />
                    <Route path="Friends" element={<Servers />} />
                </Route>

                <Route
                    path="/server/:id"
                    key={"Server"}
                    element={
                        <Server>
                            <Outlet />
                        </Server>
                    }
                >
                    <Route path="" element={<Terminal />} />
                    <Route path="logs" element={<Logs />} />
                    <Route path="players" element={<Players />} />
                    <Route path="Files/*" element={<FileManager />} />
                    <Route path="Files/Edit/*" element={<TextEditor />} />
                </Route>
            </Route>
        </Routes>
    );
};

export default Routers;
