import { Box, Button, Modal, ModalClose, Select, Sheet, Table, Typography, Option } from '@mui/joy'
import { useEffect, useState } from 'react'
import "../index.css"
import { ElevatorSharp, PlayArrow, Settings, SignalWifiStatusbar4Bar, Stop } from '@mui/icons-material'
import { notification } from '../Utils'
import AddIcon from '@mui/icons-material/Add';
import { Link, useParams } from 'react-router-dom'
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import useApiRequests from './API.tsx'

function Servers() {
    const { id } =useParams();
    
    const [servers, setServers] = useState<{
        id: number
        createdAt: string
        sysUser: { username: string }
        gameVersion: { version: string, game: { name: string } },
        config: null | { startData: { port: number }[] }
    }[]>([])
    const [actionsDisabled, setActionsDisabled] = useState<{ [key: string]: { [key: number]: boolean } }>({ start: {}, stop: {} });
    const [globalDisabled, setGlobalDisabled] = useState<boolean>(false)
    const [games, setGames] = useState<{ id: number, name: string, gameVersion: { id: number, version: string }[] }[]>([])
    const [newOpen, setNewOpen] = useState(false)
    const [newDetails, setNewDetails] = useState<{ gameID: number, versionID: number }>({ gameID: 0, versionID: 0 });
    const [refresh, setRefresh] = useState(false)
    const requests = useApiRequests()
    useEffect(() => {
        const fetchData = async () => {

            const serversResponse = await requests.getGameServers()
            if (serversResponse.status == 200) {
                setServers(serversResponse.data.data)
            }
            const gameResponse = await requests.getGames();
             if (gameResponse.status == 200) {
                setGames(gameResponse.data.data)
            }
        }
        fetchData()

    }, [refresh])

    const setActionDisabledState = (id: number, value: { [key: string]: boolean }) => {

        setActionsDisabled((obj) => {
            Object.keys(value).forEach(k => {

                obj[k][id] = value[k]
            })
            return obj
        })
    }
    const startSever = async (serverId: number) => {
        setGlobalDisabled(true)
        const serverOn = await checkStatus(serverId, false, false);
        if (serverOn) {
            notification('Server already running', "success")

            setGlobalDisabled(false)
            return;
        }
        const response= await requests.startGameServer(serverId);
        if (response.status==200) {
            notification('Server is running', "success")
            await checkStatus(serverId, false, false);

        } else {
            notification(response.data.msg, "error")
        }
        setGlobalDisabled(false)

    }
    const stopServer = async (serverId: number) => {
        setGlobalDisabled(true)
        const serverOn = await checkStatus(serverId, false, false);
        if (!serverOn) {
            notification('Server already off', "success")

            setGlobalDisabled(false)
            return;
        }
        const response=await requests.stopGameServer(serverId);

        if (response.status==200) {
            notification('Server is stopped', "success")
            await checkStatus(serverId, false, false);

        } else {
            notification( response.data.msg, "error")
        }
        setGlobalDisabled(false)
    }
    
    const moveToHost = async (serverId: number,hostId:number) => {
       await requests.moveToHost(serverId, hostId);
       
    }
    const checkStatus = async (serverId: number, HideButtons: boolean = true, showAlert: boolean = true) => {
        if (HideButtons)
            setGlobalDisabled(true)
        var serverOn = false;
        const response = await requests.checkGameServerStatus(serverId);
        if (response.status==200) {
            if ( response.data.status) {
                if (showAlert)
                    notification('Server is running', "success")
                setActionDisabledState(serverId, { start: true, stop: false });
                serverOn = true;
            } else {
                if (showAlert)
                    notification('Server is not running', "error")

                setActionDisabledState(serverId, { start: false, stop: true });
                serverOn = false;
            }
            if (HideButtons)
                setGlobalDisabled(false)

        }
        return serverOn
    }
    const createServer = async () => {

        setNewOpen(false)
        const response=await requests.createServer(newDetails.versionID)
        if (response.status==200) {
            setRefresh(!refresh)
        }
    }

    return (
    
       <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                <Typography level="h3">Servers</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button startDecorator={<AddIcon />} onClick={() => { setNewDetails({ gameID: 0, versionID: 0 }); setNewOpen(true) }} sx={{ px: 1 }} size="sm">Server</Button>
                </Box>
            </Box>
            <Table stripe="odd">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Created At</th>
                        <th>Username</th>
                        <th>Game</th>
                        <th>Version</th>
                        <th>Config</th>
                        <th>Manage</th>
                    </tr>
                </thead>

                <tbody>
                    {servers.map(server =>
                    (<tr>
                        <td>{server.id}</td>
                        <td>{server.createdAt}</td>
                        <td>{server.sysUser.username}</td>
                        <td>{server.gameVersion.game.name}</td>
                        <td>{server.gameVersion.version}</td>
                        <td>{server.config?.startData && server.config?.startData.length > 0 && server.config.startData[server.config.startData.length - 1].port}</td>
                        <td>
                            <Button sx={{ mr: 1, mb: 1, size: "sm", py: 0, px: 1 }} disabled={globalDisabled} onClick={() => { checkStatus(server.id) }} color="success"><SignalWifiStatusbar4Bar /></Button>
                            <Button sx={{ mr: 1, mb: 1, size: "sm", py: 0, px: 1 }} disabled={globalDisabled || actionsDisabled.start[server.id]} onClick={() => { startSever(server.id) }} color="success"><PlayArrow /></Button>
                            <Button sx={{ mr: 1, mb: 1, size: "sm", py: 0, px: 1 }} disabled={globalDisabled || actionsDisabled.stop[server.id]} onClick={() => { stopServer(server.id) }} color="danger"><Stop /></Button>
                            <Button sx={{ mr: 1, mb: 1, size: "sm", py: 0, px: 1 }} disabled={globalDisabled || actionsDisabled.stop[server.id]} onClick={() => { moveToHost(server.id,2) }} color="danger"><Stop /></Button>
                            <Link to={`/server/${server.id}`}>
                                <Button sx={{ mr: 1, mb: 1, size: "sm", py: 0, px: 1 }} color="primary"><Settings />
                                </Button>
                            </Link>
                        </td>
                    </tr>)
                    )}
                </tbody>
            </Table>
            <Modal
                aria-labelledby="modal-title"
                aria-describedby="modal-desc"
                open={newOpen}
                onClose={() => setNewOpen(false)}
                sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
                <Sheet
                    variant="outlined"
                    sx={{ minWidth: 400, borderRadius: 'md', p: 3, boxShadow: 'lg' }}
                >
                    <ModalClose variant="plain" sx={{ m: 1 }} />

                    <Typography id="modal-desc " sx={{ mb: 2 }} textColor="text.tertiary">
                        Create New Server
                    </Typography>
                    <Select placeholder="Select server" onChange={(_, newValue) => setNewDetails({ gameID: Number(newValue), versionID: 0 })}>
                        {games.map(game => (<Option key={game.id} value={game.id}>{game.name}</Option>))}

                    </Select>
                    {newDetails.gameID != 0 ? <Select onChange={(_, newValue) => setNewDetails((oldDetails) => ({ ...oldDetails, versionID: Number(newValue) }))} placeholder="Select version..." sx={{ mt: 2 }}>
                        {games.filter(game => game.id == newDetails.gameID)[0].gameVersion.map(version => (<Option value={version.id}>{version.version}</Option>))}

                    </Select> : ""}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mt: 2 }}>
                        <Button color="success" size='sm' onClick={() => { createServer() }} sx={{ mr: 2 }} > Create</Button>
                        <Button size='sm' onClick={() => setNewOpen(false)} color='neutral'>Cancel</Button>

                    </Box>
                </Sheet>
            </Modal >
       </>

    )
}

export default Servers
