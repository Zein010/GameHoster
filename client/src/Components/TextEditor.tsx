import { Box, Card, Typography, Textarea, Button } from '@mui/joy';
import "../index.css"
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { Cancel, Restore, Save } from '@mui/icons-material';
// Connect to the server with a purpose query parameter

export default function TextEditor() {
    const { id, "*": currentPath } = useParams<{ id: string, "*": string }>();
    const contentFieldRef = useRef<HTMLTextAreaElement>(null);
    const [content, setContent] = useState<string>("")
    const navigate = useNavigate();
    useEffect(() => {
        const fetcData = async () => {

            const response = await fetch(import.meta.env.VITE_API + `/Files/${id}/GetContent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ path: currentPath, serverId: id })
            })
            if (response.ok) {
                const data = await response.json()
                setContent(data.content)
            }
        }
        if (currentPath) {
            fetcData()
        }
    }, [currentPath])
    const saveContent = async () => {

        const response = await fetch(import.meta.env.VITE_API + `/Files/${id}/SaveContent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ path: currentPath, content: contentFieldRef.current?.value, serverId: id })
        })
        if (response.ok) {
            navigate(`/server/${id}/Files/${currentPath?.split("/").slice(0, currentPath?.split("/").length - 1).join("/")}`)
        }
    }

    return (
        <Box >
            <Typography level="h3" sx={{ mb: 2, }}>Edit File: {currentPath}</Typography>
            <Card variant="outlined" sx={{ bgcolor: '#2d2d2d', color: '#d1d5db', p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>

                    <Button startDecorator={<Cancel />} color="danger" onClick={() => { navigate(`/server/${id}/Files/${currentPath?.split("/").slice(0, currentPath?.split("/").length - 1).join("/")}`) }}>Cancel</Button>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button startDecorator={<Restore />} color="primary" onClick={() => { if (contentFieldRef.current) { contentFieldRef.current.value = content } }} >Restore</Button>
                        <Button startDecorator={<Save />} color="success" onClick={() => { saveContent() }} >Save</Button>
                    </Box>
                </Box>
                <Textarea defaultValue={content} slotProps={{ textarea: { ref: contentFieldRef } }} sx={{ p: 2 }}  >

                </Textarea>
            </Card>
        </Box >
    );

}

