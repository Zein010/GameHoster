import { toast } from "react-toastify";

export function notification(msg: string, type: "success" | "error" | "warning") {
    toast[type](msg, {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
    });
}