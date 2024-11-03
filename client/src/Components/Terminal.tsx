import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';

// Connect to the server with a purpose query parameter
export default function App() {
    const { id } = useParams();
    let terminalSocket = null;
    useEffect(() => {
        terminalSocket = io.connect(mport.meta.env.VITE_API, { query: { purpose: "terminal", serverId: id } });

        terminalSocket.on("termianlOutput", (data: any) => {
            console.log(data);
        })

    }, [id])

    const sendMessage = () => {
        terminalSocket.emit("termianlCommand", {
            command: "Say Hi"
        });

    };


    return (
        <div>
            <button onClick={sendMessage}>Send Message</button>
        </div>
    );
}