import { Box, Card, Typography } from '@mui/joy';
import "../index.css"
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import useApiRequests from './API';
import useHostUrl from '../hooks/useHostUrl';

export default function Logs() {
    const requests = useApiRequests();
    const { id } = useParams();
    const { hostUrl } = useHostUrl(Number(id));
    const [content, setContent] = useState<string>("")

    const contentRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const fetchData = async () => {
            if (!hostUrl) return;
            const res = await requests.getGameLogs(hostUrl, parseInt(id!));
            if (res.status = 200) {
                setContent(res.data.output)
            }
        }
        fetchData();

    }, [id, hostUrl])
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
                    }}
                    dangerouslySetInnerHTML={{ __html: content.replaceAll("\n", "<br/>") }}
                />
            </Card>
        </Box>
    );

}