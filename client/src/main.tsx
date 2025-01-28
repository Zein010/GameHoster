import { createRoot } from "react-dom/client";
import "./index.css";
import { ToastContainer } from "react-toastify";
import { BrowserRouter as Router } from "react-router-dom";
import AuthProvider from "react-auth-kit/AuthProvider";
import createStore from "react-auth-kit/createStore";
import Routers from "./routes";

const store = createStore({
    authName: "_auth",
    authType: "cookie",
    cookieDomain: window.location.hostname,
    cookieSecure: window.location.protocol === "https:",
});
createRoot(document.getElementById("root")!).render(
    <AuthProvider store={store}>
        <Router>
            <ToastContainer />
            <Routers />
        </Router>
    </AuthProvider>
);
