import { Box, Button, Modal, ModalClose, Select, Sheet, Table, Typography, Option } from '@mui/joy'
import { useEffect, useState } from 'react'
import "../index.css"
import { PlayArrow, Settings, SignalWifiStatusbar4Bar, Stop, StorageOutlined } from '@mui/icons-material'
import { notification } from '../Utils'
import AddIcon from '@mui/icons-material/Add';
import { Link } from 'react-router-dom'
import useApiRequests from './API.tsx'

function Servers() {
    const [servers, setServers] = useState<{
        id: number
        createdAt: string
        sysUser: { username: string }
        gameVersion: { version: string, game: { name: string } },
        config: null | { startData: { port: number }[] },
        server: { url: string }
    }[]>([])
    const [actionsDisabled, setActionsDisabled] = useState<{ [key: string]: { [key: number]: boolean } }>({ start: {}, stop: {} });
    const [disabledHosts, setDisabledHosts] = useState<string[]>([]);

    const addDisabledHost = (hostUrl: string) => {
        setDisabledHosts((prev) => [...prev, hostUrl]);
    }
    const removeDisabledHost = (hostUrl: string) => {
        setDisabledHosts((prev) => prev.filter(h => h !== hostUrl));
    }
    const isHostDisabled = (hostUrl: string) => {
        return disabledHosts.includes(hostUrl);
    }
    const [games, setGames] = useState<{ id: number, name: string, gameVersion: { id: number, version: string }[] }[]>([])
    const [newOpen, setNewOpen] = useState(false)
    const [newDetails, setNewDetails] = useState<{ gameID: number, versionID: number }>({ gameID: 0, versionID: 0 });
    const [hosts, setHosts] = useState<{ id: number, frontendUrl: String, current: boolean }[]>();
    const [refreshHosts, setRefreshHosts] = useState<boolean>(false);
    const [refresh, setRefresh] = useState(false)
    const [moveToHostDetails, setMoveToHostDetails] = useState<{ id: number, open: boolean, newHostId: number }>({ id: 0, open: false, newHostId: 0 })
    const requests = useApiRequests()
    const [serverTransferInProgress, setServerTransferInProgress] = useState<number>(0);
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
    useEffect(() => {
        const fetchHosts = async () => {
            const hostsRespose = await requests.getHosts();
            if (hostsRespose.status == 200) {
                setHosts(hostsRespose.data.data);
            }
        }

        fetchHosts()
    }, [refreshHosts])
    const setActionDisabledState = (id: number, value: { [key: string]: boolean }) => {

        setActionsDisabled((obj) => {
            Object.keys(value).forEach(k => {

                obj[k][id] = value[k]
            })
            return obj
        })
    }
    const getHostUrl = (serverId: number) => {
        const server = servers.find(s => s.id === serverId);
        return server?.server?.url || API_BASE_URL; // Fallback or handle error. server.server.url is from the nested Host relation
    }

    const startSever = async (serverId: number) => {
        const hostUrl = getHostUrl(serverId);
        addDisabledHost(hostUrl);
        const serverOn = await checkStatus(serverId, false, false);
        if (serverOn) {
            notification('Server already running', "success")

            removeDisabledHost(hostUrl);
            return;
        }
        const response = await requests.startGameServer(hostUrl, serverId);
        if (response.status == 200) {
            const queueId = response.data.queueId;
            notification('Server start queued...', "success");

            const pollInterval = setInterval(async () => {
                try {
                    const statusRes = await requests.getQueueStatus(hostUrl, queueId);
                    if (statusRes.data.status === "COMPLETED") {
                        clearInterval(pollInterval);
                        notification('Server started successfully', "success");
                        await checkStatus(serverId, false, false);
                        removeDisabledHost(hostUrl);
                    } else if (statusRes.data.status === "FAILED") {
                        clearInterval(pollInterval);
                        notification("Server start failed: " + statusRes.data.logs, "error");
                        removeDisabledHost(hostUrl);
                    }
                    // If PENDING or PROCESSING, continue polling
                } catch (err) {
                    clearInterval(pollInterval);
                    notification("Error polling status", "error");
                    removeDisabledHost(hostUrl);
                }
            }, 2000);

        } else {
            notification(response.data.msg, "error")
            removeDisabledHost(hostUrl);
        }
    }
    const stopServer = async (serverId: number) => {
        const hostUrl = getHostUrl(serverId);
        addDisabledHost(hostUrl);
        const serverOn = await checkStatus(serverId, false, false);
        if (!serverOn) {
            notification('Server already off', "success")

            removeDisabledHost(hostUrl);
            return;
        }
        const response = await requests.stopGameServer(hostUrl, serverId);

        if (response.status == 200) {
            notification('Server is stopped', "success")
            await checkStatus(serverId, false, false);

        } else {
            notification(response.data.msg, "error")
        }
        removeDisabledHost(hostUrl);
    }

    const moveToHost = async () => {
        setServerTransferInProgress(Number(moveToHostDetails.id));
        setMoveToHostDetails((old) => ({ id: old.id, open: false, newHostId: old.newHostId }));
        const hostUrl = getHostUrl(moveToHostDetails.id);
        const response = await requests.moveToHost(hostUrl, moveToHostDetails.id, moveToHostDetails.newHostId);

        if (response.status == 200) {
            notification(response.data.msg, "success")
        }


        setRefresh(true);
        setMoveToHostDetails({ id: 0, open: false, newHostId: 0 });
        setServerTransferInProgress(0);

    }

    const checkStatus = async (serverId: number, HideButtons: boolean = true, showAlert: boolean = true) => {
        const hostUrl = getHostUrl(serverId);
        if (HideButtons)
            addDisabledHost(hostUrl);
        var serverOn = false;
        const response = await requests.checkGameServerStatus(hostUrl, serverId);
        if (response.status == 200) {
            if (response.data.status) {
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
                removeDisabledHost(hostUrl);

        }
        return serverOn
    }
    const createServer = async () => {

        setNewOpen(false)
        const response = await requests.createServer(newDetails.versionID)
        if (response.status == 200) {
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
                        <th>Game</th>
                        <th>Version</th>
                        <th>Config</th>
                        <th>Manage</th>
                    </tr>
                </thead>

                <tbody>
                    {servers.map(server =>
                    (<tr key={server.id}>
                        <td>{server.id}</td>
                        <td>{server.createdAt}</td>
                        <td>{server.gameVersion.game.name}</td>
                        <td>{server.gameVersion.version}</td>
                        <td>{server.config?.startData && server.config?.startData.length > 0 && server.config.startData[server.config.startData.length - 1].port}</td>
                        <td>
                            <Button sx={{ mr: 1, mb: 1, py: 0, px: 1 }} size='sm' disabled={isHostDisabled(getHostUrl(server.id)) || serverTransferInProgress == server.id} onClick={() => { checkStatus(server.id) }} color="success"><SignalWifiStatusbar4Bar /></Button>
                            <Button sx={{ mr: 1, mb: 1, py: 0, px: 1 }} size='sm' disabled={isHostDisabled(getHostUrl(server.id)) || actionsDisabled.start[server.id] || serverTransferInProgress == server.id} onClick={() => { startSever(server.id) }} color="success"><PlayArrow /></Button>
                            <Button sx={{ mr: 1, mb: 1, py: 0, px: 1 }} size='sm' disabled={isHostDisabled(getHostUrl(server.id)) || actionsDisabled.stop[server.id] || serverTransferInProgress == server.id} onClick={() => { stopServer(server.id) }} color="danger"><Stop /></Button>

                            {(hosts != null && hosts.length > 1) ? <Button sx={{ mr: 1, mb: 1, py: 0, px: 1 }} size='sm' disabled={serverTransferInProgress == server.id} onClick={() => { setMoveToHostDetails({ id: server.id, open: true, newHostId: 0 }) }} color="primary"><StorageOutlined /></Button> : null}
                            <Link to={`/server/${server.id}`} >
                                <Button sx={{ mr: 1, mb: 1, py: 0, px: 1 }} size='sm' disabled={serverTransferInProgress == server.id} color="primary"><Settings />
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
                        {games.filter(game => game.id == newDetails.gameID)[0].gameVersion.map(version => (<Option key={version.id} value={version.id}>{version.version}</Option>))}

                    </Select> : ""}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mt: 2 }}>
                        <Button color="success" size='sm' onClick={() => { createServer() }} sx={{ mr: 2 }} > Create</Button>
                        <Button size='sm' onClick={() => setNewOpen(false)} color='neutral'>Cancel</Button>

                    </Box>
                </Sheet>
            </Modal >
            {hosts != null && hosts.length > 1 ?
                <Modal
                    aria-labelledby="modal-title"
                    aria-describedby="modal-desc"
                    open={moveToHostDetails.open}
                    onClose={() => setMoveToHostDetails({ id: 0, open: false, newHostId: 0 })}
                    sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                >
                    <Sheet
                        variant="outlined"
                        sx={{ minWidth: 400, borderRadius: 'md', p: 3, boxShadow: 'lg' }}
                    >
                        <ModalClose variant="plain" sx={{ m: 1 }} />

                        <Typography id="modal-desc " sx={{ mb: 2 }} textColor="text.tertiary">
                            Move to host
                        </Typography>
                        <Select placeholder="Select host" onChange={(_, newValue) => setMoveToHostDetails({ id: moveToHostDetails.id, open: moveToHostDetails.open, newHostId: Number(newValue) })}>
                            {hosts!.map(host => !host.current ? (<Option key={host.id} value={host.id}>{host.frontendUrl}</Option>) : null)}

                        </Select>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mt: 2 }}>
                            <Button color="success" size='sm' onClick={() => { moveToHost() }} sx={{ mr: 2 }} > Create</Button>
                            <Button size='sm' onClick={() => setMoveToHostDetails({ id: 0, open: false, newHostId: 0 })} color='neutral'>Cancel</Button>

                        </Box>
                    </Sheet>
                </Modal > : null}
        </>

    )
}

export default Servers
