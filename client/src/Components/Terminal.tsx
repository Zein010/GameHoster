import { Box, Button, Card, CardContent, Input, Sheet, Typography, Stack } from '@mui/joy';
import "../index.css"
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { useFetcher, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { CollectionsBookmarkOutlined, Send } from '@mui/icons-material';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
// Connect to the server with a purpose query parameter
export default function App() {
    const { id } = useParams();
    const [terminalSocket, setTerminalSocket] = useState(null);
    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [currentCommandIndex, setCurrentCommandIndex] = useState(0);
    useEffect(() => {
        setTerminalSocket(io.connect(import.meta.env.VITE_API, { query: { purpose: "terminal", serverId: id } }));


    }, [id])
    useEffect(() => {

        if (terminalSocket)
            terminalSocket.on("termianlOutput", (data: any) => {
                setMessages((prevMessages) => [...prevMessages, `> ${data}`]);

            })
    }, [terminalSocket])
    const [messages, setMessages] = useState<String[]>([]);
    const [inputValue, setInputValue] = useState('');

    const handleSend = () => {
        if (terminalSocket)
            if (inputValue.trim()) {
                setCommandHistory([...commandHistory, inputValue]);

                terminalSocket.emit("termianlCommand", {

                    command: inputValue.trim(),
                });
                setInputValue('');
            }
    };
    useEffect(() => {
        setCurrentCommandIndex(commandHistory.length)
    }, [commandHistory])
    const handleKeyPress = (e: any) => {
        if (e.key === 'Enter') {
            handleSend()
            setInputValue("");
        }
        if (e.key === "ArrowUp") {

            if (commandHistory.length > 0) {
                if (currentCommandIndex > 0) {
                    setCurrentCommandIndex(currentCommandIndex - 1);
                    setInputValue(commandHistory[currentCommandIndex - 1]);
                }
            }

            e.preventDefault();
        } if (e.key === "ArrowDown") {
            if (commandHistory.length > 0) {
                if (currentCommandIndex < commandHistory.length - 1) {
                    setCurrentCommandIndex(currentCommandIndex + 1);
                    setInputValue(commandHistory[currentCommandIndex + 1]);
                } else {
                    setInputValue("")
                }
            }
            e.preventDefault();
        }
    }

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
                            onKeyDown={handleKeyPress}
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