import { Box, Card, Typography } from '@mui/joy';
import "../index.css"
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
// Connect to the server with a purpose query parameter
export default function Logs() {
    const { id } = useParams();
    const [content, setContent] = useState<string>("")

    const contentRef = useRef<HTMLDivElement>(null);
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
        if (contentRef.current) {
            contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }

    }, [content])


    return (
        <Box >
            <Typography level="h3" sx={{ mb: 2, }}>Logs</Typography>
            <Card variant="outlined" sx={{ bgcolor: '#2d2d2d', color: '#d1d5db', p: 2 }}>
                <div
                    ref={contentRef}
                    style={{
                        maxHeight: '300px', // Set max height
                        overflowY: 'auto',   // Make scrollable
                        color: '#d1d5db',
                        padding: '16px',
                    }}
                    dangerouslySetInnerHTML={{ __html: content.replaceAll("\n", "<br/>") }}
                />
            </Card>
        </Box>
    );

}