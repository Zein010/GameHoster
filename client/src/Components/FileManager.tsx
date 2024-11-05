import { Box, Button, Card, CardContent, Input, Sheet, Typography, Stack } from '@mui/joy';
import "../index.css"
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import FolderIcon from '@mui/icons-material/Folder';
// Connect to the server with a purpose query parameter
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

import { styled } from '@mui/joy/styles';
const Item = styled(Sheet)(({ theme }) => ({
    backgroundColor: '#fff',
    ...theme.typography['body-sm'],
    padding: theme.spacing(1),
    textAlign: 'center',
    borderRadius: 4,
    color: theme.vars.palette.text.secondary,
    ...theme.applyStyles('dark', {
        backgroundColor: theme.palette.background.level1,
    }),
}));
export default function FileManager() {
    const [files, setFiles] = useState([])
    const { id } = useParams();
    useEffect(() => {
        const fetchFiles = async () => {
            const response = await fetch(import.meta.env.VITE_API + `/Files/${id}`)
            const data = await response.json()
            console.log(data.files)
            setFiles(data.files);
        }
        fetchFiles();
    }, [])
    const SizeFormatter = (sizeInBytes: number): string => {
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        let index = 0;

        let size = sizeInBytes;
        while (size >= 1024 && index < units.length - 1) {
            size /= 1024;
            index++;
        }

        return `${size.toFixed(2)} ${units[index]}`;
    };
    return (
        <Box >
            <Typography level="h3" sx={{ mb: 2, }}>File Manager</Typography>
            <Card variant="outlined" sx={{ bgcolor: '#2d2d2d', color: '#d1d5db', p: 2 }}>
                <CardContent>
                    <Stack spacing={1} sx={{ textAlign: 'left' }} >

                        <Stack direction="row" key={"Header"} sx={{ flexGrow: 1 }}>
                            <Item sx={{ flexGrow: 1, borderEndEndRadius: 0, borderStartEndRadius: 0 }}>
                                <Typography level="body-sm" sx={{ textAlign: 'left' }}  >Name</Typography>
                            </Item>
                            <Item sx={{ flexBasis: '150px', borderRadius: 0 }}>
                                <Typography level="body-sm" sx={{ textAlign: 'right' }}  >

                                    Size
                                </Typography>
                            </Item> <Item sx={{ flexBasis: '200px', borderRadius: 0 }}>
                                <Typography level="body-sm" sx={{ textAlign: 'left' }}  >   Modified At</Typography>

                            </Item>
                            <Item sx={{ flexBasis: '200px', borderEndStartRadius: 0, borderStartStartRadius: 0 }}>
                                <Typography level="body-sm" sx={{ textAlign: 'left' }}  >   Created At</Typography>

                            </Item>
                        </Stack>
                        {files.map((file) => (

                            <Stack direction="row" key={file.name} sx={{ flexGrow: 1 }}>
                                <Item sx={{ flexGrow: 1, borderEndEndRadius: 0, borderStartEndRadius: 0 }}>
                                    <Typography level="body-sm" sx={{ textAlign: 'left', fontWeight: "bold" }}  >{file.isDirectory ? <FolderIcon sx={{ mr: 1 }} /> : <InsertDriveFileIcon sx={{ mr: 1 }} />}{file.name}</Typography>
                                </Item>
                                <Item sx={{ flexBasis: '150px', borderRadius: 0 }}>
                                    <Typography level="body-sm" sx={{ textAlign: 'right' }}  >

                                        {file.isDirectory ? "N/A" : SizeFormatter(file.size)}
                                    </Typography>
                                </Item>
                                <Item sx={{ flexBasis: '200px', borderRadius: 0 }}>
                                    <Typography level="body-sm" sx={{ textAlign: 'left', color: "gray" }}  >{file.modifiedAt.split(".")[0].replace("T", " ")}</Typography>

                                </Item>
                                <Item sx={{ flexBasis: '200px', borderEndStartRadius: 0, borderStartStartRadius: 0 }}>
                                    <Typography level="body-sm" sx={{ textAlign: 'left', color: "gray" }}  >{file.createdAt.split(".")[0].replace("T", " ")}</Typography>

                                </Item>
                            </Stack>

                        ))}
                    </Stack>
                </CardContent>
            </Card>
        </Box >
    );

}

