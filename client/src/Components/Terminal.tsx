import { Box, Button, Card, CardContent, Input, Sheet, Typography, Stack } from '@mui/joy';
import "../index.css"
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Send } from '@mui/icons-material';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
// Connect to the server with a purpose query parameter
export default function App() {
    const { id } = useParams();
    let terminalSocket = null;
    useEffect(() => {
        terminalSocket = io.connect(import.meta.env.VITE_API, { query: { purpose: "terminal", serverId: id } });
        terminalSocket.on("termianlOutput", (data: any) => {
            setMessages((prevMessages) => [...prevMessages, `> ${data}`]);

        })

    }, [id])
    const [messages, setMessages] = useState<String[]>([]);
    const [inputValue, setInputValue] = useState('');

    const handleSend = () => {
        if (terminalSocket)
            if (inputValue.trim()) {
                terminalSocket.emit("termianlCommand", {
                    command: inputValue.trim(),
                });
                setInputValue('');
            }
    };
    const sendMessage = () => {


    };


    return (

        <Sheet className="mx-10 px-3 mt-4 p-2">
            <Card variant="outlined" sx={{ bgcolor: '#2d2d2d', color: '#d1d5db', p: 2 }}>
                <CardContent>
                    {/* Display messages */}
                    <Stack spacing={1} sx={{ mb: 2, maxHeight: 200, overflowY: 'auto' }}>
                        {messages.map((msg, index) => (
                            <Typography key={index} sx={{ fontFamily: 'monospace', color: '#10b981' }}>
                                {msg}
                            </Typography>
                        ))}
                    </Stack>

                    {/* Input field and send button */}
                    <Box sx={{ display: 'flex' }}>
                        <Input
                            placeholder="Type a command..."
                            variant="outlined"
                            size="sm"
                            sx={{
                                flex: "auto",
                                bgcolor: '#1f2937',
                                color: '#d1d5db',
                                fontFamily: 'monospace',
                                border: '1px solid #374151',
                                ':hover': { bgcolor: '#111827' }
                            }}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <Button
                            onClick={handleSend}
                            variant="solid"
                            size="sm"
                            sx={{ ml: 1, bgcolor: '#3b82f6', ':hover': { bgcolor: '#2563eb' } }}
                        >
                            <ArrowDropUpIcon />
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Sheet>
    );

}