import { Box, Button, Card, CardContent, Input, Sheet, Typography, Stack, ModalClose, Modal } from '@mui/joy';
import "../index.css"
import { createRef, useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import FolderIcon from '@mui/icons-material/Folder';
// Connect to the server with a purpose query parameter
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { styled } from '@mui/joy/styles';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import Checkbox from '@mui/joy/Checkbox';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { ArrowUpward, Download, UploadFile } from '@mui/icons-material';
import { notification } from '../Utils';
import useApiRequests from './API';
import { API_BASE_URL } from '../Config/app.config';
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
    const requests = useApiRequests();
    const [files, setFiles] = useState<{ name: string; isDirectory: boolean, extension: string, textEditable: boolean, size: number, createdAt: string, modifiedAt: string }[]>([])
    const [uploadOpen, setUploadOpen] = useState(false)
    const [uploadFiles, setUploadFiles] = useState<File[]>([])
    const { id, "*": remainingPath } = useParams();
    const [fileRowsRef, setFileRowsRef] = useState([]);
    const [selectedFiles, setSelectFiles] = useState<string[]>([])
    const [refresh, setRefresh] = useState(false)
    const [createOpen, setCreateOpen] = useState(false);
    const [createType, setCreateType] = useState<"folder" | "file">("folder")
    const [createName, setCreateName] = useState("")
    const [clickedRowIndex, setClickedRowIndex] = useState(-1)
    const [downloadDisabled, setDownloadDisabled] = useState(false)
    const [confirmOpen, setConfirmOpen] = useState(false)

    const navigate = useNavigate();
    const [confirmContent, setConfirmContent] = useState<{ button: string, text: string, action: () => void, buttonColor: "primary" | "danger" }>({ button: "", text: "", action: () => { }, buttonColor: "primary" })
    const currentPath = remainingPath || ""
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
            const response = await requests.fileManager.getFiles(id!, currentPath)

            if (response.status = 200) {

                const data = response.data

                const sortedFiles = data.files.sort((a: { name: string; isDirectory: boolean; }, b: { name: string; isDirectory: boolean; }) => {
                    // First, sort by isDirectory so directories come first
                    if (a.isDirectory && !b.isDirectory) return -1;
                    if (!a.isDirectory && b.isDirectory) return 1;
                    // If both are the same type, sort alphabetically by name
                    return a.name.localeCompare(b.name);
                });
                setFiles(sortedFiles);
            } else {
                ChangePath("")
            }
        }
        setSelectFiles([])
        setClickedRowIndex(-1)

        fetchFiles();
    }, [refresh, currentPath])
    const ChangePath = (path: string) => {

        navigate(`/server/${id}/Files/${path}`);
    }
    const EditFile = (path: string) => {
        navigate(`/server/${id}/Files/Edit/${path}`);

    }
    const handleUploadFile = (event: any) => {
        event.preventDefault()
        const formData = new FormData();
        uploadFiles.forEach(file => {
            formData.append('files[]', file);

        })
        formData.append('path', currentPath);
        axios.post(API_BASE_URL + `/Files/${id}/Upload`, formData, {
            headers: {
                'content-type': 'multipart/form-data',
            },
        }).then(() => {
            setRefresh(!refresh);
            setUploadOpen(false);
            setUploadFiles([]);
        });

    }
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

        const response = await requests.fileManager.createFile(id!, currentPath, createType, createName)
        if (response.status == 200 && response.data.success) {
            setRefresh(!refresh)
            setCreateOpen(false)
            setCreateName("")
            notification(response.data.msg, response.data.success ? "success" : "error")
        } else {
            notification(response.data.msg, "error")
        }


    }

    const ConfirmDeleteFiles = async () => {
        setConfirmContent({ text: "Confirm to delete", button: "Delete", buttonColor: "danger", action: DeleteFiles });
        setConfirmOpen(true)
    }
    const DeleteFiles = async () => {
    const response=await requests.fileManager.deleteFiles(Number(id),selectedFiles,currentPath);
        
        if (response.status==200) {
            setRefresh(!refresh)
            setSelectFiles([])

            notification(response.data.msg, response.data.success ? "success" : "error")
        }

    }
    const openCreate = (type: "folder" | "file") => {
        setCreateType(type);
        setCreateOpen(true)
        setCreateName("");
    }
    const fileRowClicked = (rowID: number) => {

        setClickedRowIndex(clickedRowIndex == rowID ? -1 : rowID)
    }
    const DownloadFiles = async () => {
        notification("Download feature is not ready yet","error");
        setSelectFiles([]);
    };
    return (
        <Box >
            <Typography level="h3" sx={{ mb: 2, }}>File Manager</Typography>
            <Card variant="outlined" sx={{ bgcolor: '#2d2d2d', color: '#d1d5db', p: 2 }}>
                <CardContent>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>

                        <Box sx={{ display: "flex", justifyContent: "start", gap: 1 }}>
                            <Button size="sm" startDecorator={<CreateNewFolderIcon />} onClick={() => { openCreate("folder") }}> New Folder</Button>
                            <Button size="sm" startDecorator={<NoteAddIcon />} onClick={() => { openCreate("file") }}> New File</Button>
                            {currentPath != "" ? <Button size="sm" startDecorator={<ArrowUpward />} onClick={() => { ChangePath(currentPath.substring(0, currentPath.lastIndexOf("/"))) }}> Back</Button> : <></>}
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "end", gap: 1 }}>
                            {selectedFiles.length > 0 ? <Button disabled={downloadDisabled} size="sm" startDecorator={<Download />} onClick={() => { DownloadFiles() }}>{selectedFiles.length} Files</Button> : ""}
                            {selectedFiles.length > 0 ? <Button disabled={downloadDisabled} size="sm" startDecorator={<DeleteIcon />} color={"danger"} onClick={() => { ConfirmDeleteFiles() }}>{selectedFiles.length} Files</Button> : ""}
                            <Button size="sm" startDecorator={<UploadFile />} onClick={() => { setUploadOpen(true) }}> Upload</Button>
                        </Box>
                    </Box>
                    <Stack spacing={1} sx={{ textAlign: 'left' }} >

                        <Stack direction="row" key={"Header"} sx={{ flexGrow: 1, backgroundColor: "background.level2", userSelect: "none", }}>
                            <Item sx={{ flexBasis: '40px', borderEndEndRadius: 0, borderStartEndRadius: 0 }}></Item>
                            <Item sx={{ flexGrow: 1, borderRadius: 0 }}>
                                <Typography level="body-sm" sx={{ textAlign: 'left' }}  >Name</Typography>
                            </Item>
                            <Item sx={{ flexBasis: '80px', borderRadius: 0 }}>
                                <Typography level="body-sm" sx={{ textAlign: 'right' }}  >

                                    Size
                                </Typography>
                            </Item>
                            <Item sx={{ flexBasis: '200px', borderRadius: 0 }}>
                                <Typography level="body-sm" sx={{ textAlign: 'left' }}  >   Modified At</Typography>

                            </Item>
                            <Item sx={{ flexBasis: '200px', borderEndStartRadius: 0, borderStartStartRadius: 0 }}>
                                <Typography level="body-sm" sx={{ textAlign: 'left' }}  >   Created At</Typography>

                            </Item>
                        </Stack>
                        {files.map((file, i) => (

                            <Stack onDoubleClick={(e) => { (file.isDirectory ? ChangePath((currentPath != "" ? currentPath + "/" : "") + file.name) : (file.textEditable ? EditFile((currentPath != "" ? currentPath + "/" : "") + file.name) : "")); e.preventDefault() }} onClick={() => { fileRowClicked(i) }} direction="row" ref={fileRowsRef[i]} key={"file-" + i} sx={{ flexGrow: 1, userSelect: "none", backgroundColor: clickedRowIndex == i ? "background.surface" : (selectedFiles.includes(file.name) ? "background.surface" : "background.level2"), "&:hover": { backgroundColor: "background.level3" } }} >
                                <Item sx={{ flexBasis: '40px', borderEndEndRadius: 0, borderStartEndRadius: 0 }}>
                                    <Checkbox checked={selectedFiles.includes(file.name)} onClick={(e) => { e.stopPropagation(); }} onChange={(e) => { fileCheckBoxClicked(file.name, e.target.checked); }} />
                                </Item>
                                <Item sx={{ flexGrow: 1, borderRadius: 0 }}>
                                    <Typography level="body-sm" sx={{ textAlign: 'left', fontWeight: "bold", userSelect: "none" }}  >{file.isDirectory ? <FolderIcon sx={{ mr: 1 }} color='primary' /> : <InsertDriveFileIcon color='warning' sx={{ mr: 1 }} />}{file.name}</Typography>
                                </Item>
                                <Item sx={{ flexBasis: '80px', borderRadius: 0 }}>
                                    <Typography level="body-sm" sx={{ textAlign: 'right', userSelect: "none" }}  >
                                        {file.isDirectory ? "-" : SizeFormatter(file.size)}
                                    </Typography>
                                </Item>
                                <Item sx={{ flexBasis: '200px', borderRadius: 0 }}>
                                    <Typography level="body-sm" sx={{ textAlign: 'left', color: "gray", userSelect: "none" }}  >{file.modifiedAt.split(".")[0].replace("T", " ")}</Typography>

                                </Item>
                                <Item sx={{ flexBasis: '200px', borderEndStartRadius: 0, borderStartStartRadius: 0 }} >
                                    <Typography level="body-sm" sx={{ textAlign: 'left', color: "gray", userSelect: "none" }}  >{file.createdAt.split(".")[0].replace("T", " ")}</Typography>

                                </Item>
                            </Stack>

                        ))}
                    </Stack>
                </CardContent>
            </Card>
            <Modal
                aria-labelledby="modal-title"
                aria-describedby="modal-desc"
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
                <Sheet
                    variant="outlined"
                    sx={{ maxWidth: 500, borderRadius: 'md', p: 3, boxShadow: 'lg' }}
                >
                    <ModalClose variant="plain" sx={{ m: 1 }} />

                    <Typography id="modal-desc " sx={{ mb: 2 }} textColor="text.tertiary">
                        {confirmContent.text}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mt: 2 }}>
                        <Button onClick={() => { setConfirmOpen(false); confirmContent.action() }} size='sm' sx={{ mr: 2 }} color={`${confirmContent.buttonColor}`} >{confirmContent.button}</Button>
                        <Button size='sm' onClick={() => setConfirmOpen(false)} color='neutral'>Cancel</Button>

                    </Box>
                </Sheet>
            </Modal>
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
                        <Button color="success" onClick={() => sendCreate()} size='sm' sx={{ mr: 2 }} startDecorator={createType == "file" ? <NoteAddIcon /> : <CreateNewFolderIcon />}> Create</Button>
                        <Button size='sm' onClick={() => setCreateOpen(false)} color='neutral'>Cancel</Button>

                    </Box>
                </Sheet>
            </Modal>
            <Modal
                aria-labelledby="modal-title"
                aria-describedby="modal-desc"
                open={uploadOpen}
                onClose={() => setUploadOpen(false)}
                sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
                <Sheet
                    variant="outlined"
                    sx={{ maxWidth: 500, borderRadius: 'md', p: 3, boxShadow: 'lg' }}
                >
                    <ModalClose variant="plain" sx={{ m: 1 }} />

                    <Typography id="modal-desc " sx={{ mb: 2 }} textColor="text.tertiary">
                        Upload File
                    </Typography>
                    <input type='file' multiple onChange={(e) => { e.target.files ? setUploadFiles(Array.from(e.target.files)) : null }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mt: 2 }}>
                        <Button color="success" onClick={(e) => handleUploadFile(e)} size='sm' sx={{ mr: 2 }} startDecorator={<UploadFile />}> Upload</Button>
                        <Button size='sm' onClick={() => setUploadOpen(false)} color='neutral'>Cancel</Button>

                    </Box>
                </Sheet>
            </Modal>
        </Box >
    );

}

