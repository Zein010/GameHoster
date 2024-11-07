import { Box, Button, Card, CardContent, Input, Sheet, Typography, Stack, ModalClose, Modal, TextField } from '@mui/joy';
import "../index.css"
import { createRef, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import FolderIcon from '@mui/icons-material/Folder';
// Connect to the server with a purpose query parameter
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import { styled } from '@mui/joy/styles';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import Checkbox from '@mui/joy/Checkbox';
import { main } from '@mui/material/colors';
import DeleteIcon from '@mui/icons-material/Delete';
import { ArrowBack, ArrowUpward, Download } from '@mui/icons-material';
const Item = styled(Sheet)(({ theme }) => ({
    // Use prop if provided, fallback to #fff
    ...theme.typography['body-sm'],
    backgroundColor: "transparent",
    padding: theme.spacing(1),
    textAlign: 'center',
    borderRadius: 4,
    color: theme.vars.palette.text.secondary,

}));

export default function FileManager() {
    const [files, setFiles] = useState([])
    const { id } = useParams();
    const fileRows = useRef([])
    const [fileRowsRef, setFileRowsRef] = useState([]);
    const [selectedFiles, setSelectFiles] = useState<string[]>([])
    const [refresh, setRefresh] = useState(false)
    const [createOpen, setCreateOpen] = useState(false);
    const [createType, setCreateType] = useState<"folder" | "file">("folder")
    const [createName, setCreateName] = useState("")
    const [currentPath, setCurrentPath] = useState("");
    const [clickedRowIndex, setClickedRowIndex] = useState(-1)
    const [downloadDisabled, setDownloadDisabled] = useState(false)
    const fileCheckBoxClicked = (file: string, add: boolean) => {

        if (add) {

            setSelectFiles((prev) => prev.includes(file) ? prev : [...prev, file])
        } else {
            setSelectFiles((prev) => prev.filter((f) => f !== file))
        }
    }

    useEffect(() => {
        // add or remove refs
        setFileRowsRef((fileRows) =>
            files.map((_, i) => fileRows[i] || createRef()),
        );
    }, [files]);
    useEffect(() => {
    }, [fileRowsRef])
    useEffect(() => {
        const fetchFiles = async () => {
            const response = await fetch(import.meta.env.VITE_API + `/Files/${id}`, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json;charset=UTF-8',
                }
                , body: JSON.stringify({ path: currentPath })
            })
            if (response.ok) {

                const data = await response.json()

                const sortedFiles = data.files.sort((a, b) => {
                    // First, sort by isDirectory so directories come first
                    if (a.isDirectory && !b.isDirectory) return -1;
                    if (!a.isDirectory && b.isDirectory) return 1;
                    // If both are the same type, sort alphabetically by name
                    return a.name.localeCompare(b.name);
                });
                setFiles(sortedFiles);
            } else {
                setCurrentPath("")
            }
        }
        fetchFiles();
    }, [refresh, currentPath])

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
    const sendCreate = async () => {

        const response = await fetch(import.meta.env.VITE_API + `/Files/${id}/${createType}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: createName, path: currentPath })
        })
        if (response.ok) {
            setRefresh(!refresh)
            setCreateOpen(false)
            setCreateName("")
        }

    }
    const DeleteFiles = async () => {

        const response = await fetch(import.meta.env.VITE_API + `/Files/${id}/Delete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ path: currentPath, files: selectedFiles })
        })
        if (response.ok) {
            setRefresh(!refresh)
            setSelectFiles([])
        }

    }
    const openCreate = (type: "folder" | "file") => {
        setCreateType(type);

        setCreateName("");
        setCreateOpen(true);
    }
    const fileRowClicked = (rowID: number) => {

        setClickedRowIndex(clickedRowIndex == rowID ? -1 : rowID)
    }
    const DonwloadFiles = async () => {
        setDownloadDisabled(true);
        const response = await fetch(import.meta.env.VITE_API + `/Files/${id}/Download`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ files: selectedFiles, path: currentPath })
        });

        if (response.ok) {
            const blob = await response.blob();
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            response.headers.forEach(header => { console.log(header) })
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = 'downloaded_file'; // Default filename

            // Extract filename from Content-Disposition header if available
            if (contentDisposition && contentDisposition.includes('filename=')) {
                console.log(contentDisposition)
                filename = contentDisposition
                    .split('filename=')[1]
                    .replace(/['"]/g, '');
            }

            // Set the download attribute with the extracted filename
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            URL.revokeObjectURL(a.href);
            a.remove();
        } else {
            console.error("Failed to download the file.");
        }

        setDownloadDisabled(false);
        setSelectFiles([]);

    }
    return (
        <Box >
            <Typography level="h3" sx={{ mb: 2, }}>File Manager</Typography>
            <Card variant="outlined" sx={{ bgcolor: '#2d2d2d', color: '#d1d5db', p: 2 }}>
                <CardContent>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>

                        <Box sx={{ display: "flex", justifyContent: "start", gap: 1 }}>
                            <Button size="sm" startDecorator={<CreateNewFolderIcon />} onClick={() => { openCreate("folder") }}> New Folder</Button>
                            <Button size="sm" startDecorator={<NoteAddIcon />} onClick={() => { openCreate("file") }}> New File</Button>
                            {currentPath != "" ? <Button size="sm" startDecorator={<ArrowUpward />} onClick={() => { setCurrentPath(currentPath.substring(0, currentPath.lastIndexOf("/"))) }}> Back</Button> : <></>}
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "end", gap: 1 }}>
                            {selectedFiles.length > 0 ? <Button disabled={downloadDisabled} size="sm" startDecorator={<Download />} onClick={() => { DonwloadFiles() }}>{selectedFiles.length} Files</Button> : ""}
                            {selectedFiles.length > 0 ? <Button disabled={downloadDisabled} size="sm" startDecorator={<DeleteIcon />} color={"danger"} onClick={() => { DeleteFiles() }}>{selectedFiles.length} Files</Button> : ""}
                            <Button size="sm" startDecorator={<DriveFolderUploadIcon />}> Upload</Button>
                        </Box>
                    </Box>
                    <Stack spacing={1} sx={{ textAlign: 'left' }} >

                        <Stack direction="row" key={"Header"} sx={{ flexGrow: 1, backgroundColor: "background.level2", }}>
                            <Item sx={{ flexBasis: '30px', borderEndEndRadius: 0, borderStartEndRadius: 0 }}></Item>
                            <Item sx={{ flexGrow: 1, borderRadius: 0 }}>
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
                        {files.map((file, i) => (

                            <Stack onDoubleClick={() => { file.isDirectory ? setCurrentPath(currentPath + "/" + file.name) : null }} onClick={() => { fileRowClicked(i) }} direction="row" ref={fileRowsRef[i]} key={"file-" + i} sx={{ flexGrow: 1, backgroundColor: clickedRowIndex == i ? "background.surface" : (selectedFiles.includes(file.name) ? "background.surface" : "background.level2"), "&:hover": { backgroundColor: "background.level3" } }} >
                                <Item sx={{ flexBasis: '30px', borderEndEndRadius: 0, borderStartEndRadius: 0 }}>
                                    <Checkbox checked={selectedFiles.includes(file.name)} onClick={(e) => { e.stopPropagation(); }} onChange={(e) => { fileCheckBoxClicked(file.name, e.target.checked); }} />
                                </Item>
                                <Item sx={{ flexGrow: 1, borderRadius: 0 }}>
                                    <Typography level="body-sm" sx={{ textAlign: 'left', fontWeight: "bold" }}  >{file.isDirectory ? <FolderIcon sx={{ mr: 1 }} color='primary' /> : <InsertDriveFileIcon color='warning' sx={{ mr: 1 }} />}{file.name}</Typography>
                                </Item>
                                <Item sx={{ flexBasis: '150px', borderRadius: 0 }}>
                                    <Typography level="body-sm" sx={{ textAlign: 'right' }}  >
                                        {file.isDirectory ? "-" : SizeFormatter(file.size)}
                                    </Typography>
                                </Item>
                                <Item sx={{ flexBasis: '200px', borderRadius: 0 }}>
                                    <Typography level="body-sm" sx={{ textAlign: 'left', color: "gray" }}  >{file.modifiedAt.split(".")[0].replace("T", " ")}</Typography>

                                </Item>
                                <Item sx={{ flexBasis: '200px', borderEndStartRadius: 0, borderStartStartRadius: 0 }} >
                                    <Typography level="body-sm" sx={{ textAlign: 'left', color: "gray" }}  >{file.createdAt.split(".")[0].replace("T", " ")}</Typography>

                                </Item>
                            </Stack>

                        ))}
                    </Stack>
                </CardContent>
            </Card>
            <Modal
                aria-labelledby="modal-title"
                aria-describedby="modal-desc"
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
                <Sheet
                    variant="outlined"
                    sx={{ maxWidth: 500, borderRadius: 'md', p: 3, boxShadow: 'lg' }}
                >
                    <ModalClose variant="plain" sx={{ m: 1 }} />

                    <Typography id="modal-desc " sx={{ mb: 2 }} textColor="text.tertiary">
                        New {createType == "file" ? "File" : "Folder"}
                    </Typography>
                    <Input autoFocus type='text' onKeyDown={(e) => e.key === 'Enter' ? sendCreate() : null} value={createName} onChange={(e) => setCreateName(e.target.value)} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mt: 2 }}>
                        <Button color="success" onClick={() => sendCreate()} size='sm' startDecorator={createType == "file" ? <NoteAddIcon /> : <CreateNewFolderIcon />}>Create</Button>
                        <Button size='sm' onClick={() => setCreateOpen(false)} color='danger'>Cancel</Button>

                    </Box>
                </Sheet>
            </Modal>
        </Box >
    );

}

