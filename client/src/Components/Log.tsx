import { Box, Card, Typography } from '@mui/joy';
import "../index.css"
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
// Connect to the server with a purpose query parameter
export default function Logs() {
    const { id } = useParams();
    const [terminalSocket, setTerminalSocket] = useState(null);
    const [content, setContent] = useState("")
    useEffect(() => {
        const fetchData = async () => {

            const res = await fetch(import.meta.env.VITE_API + `/Game/GetLog/${id}`, {
                method: 'Get',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            if (res.ok) {
                setContent((await res.json()).output)
            }
        }
        fetchData();

    }, [id])
    useEffect(() => {

    }, [terminalSocket])


    return (
        <Box >
            <Typography level="h3" sx={{ mb: 2, }}>Logs</Typography>
            <Card variant="outlined" sx={{ bgcolor: '#2d2d2d', color: '#d1d5db', p: 2 }}>
                <Typography level="p" sx={{ mb: 2, }}>{content.replaceAll("\n", <br />)}</Typography>

            </Card>
        </Box>
    );

}