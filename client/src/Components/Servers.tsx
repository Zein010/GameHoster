import { Button, Sheet, Table } from '@mui/joy'
import { startTransition, useEffect, useState } from 'react'
import "../index.css"
import { CheckCircleSharp, PlayArrow, Settings, SignalWifiStatusbar4Bar, Stop } from '@mui/icons-material'
import { notification } from '../Utils'
function Servers() {
    const [servers, setServers] = useState<{
        id: number
        createdAt: string
        sysUser: { username: string }
        gameVersion: { version: string, game: { name: string } },
        config: null | { startData: { port: number }[] }
    }[]>([])
    const [actionsDisabled, setActionsDisabled] = useState<{ start: { [key: number]: boolean }, stop: { [key: number]: boolean } }>({ start: {}, stop: {} });
    const [globalDisabled, setGlobalDisabled] = useState<boolean>(false)
    useEffect(() => {
        const fetchData = async () => {

            const response = await fetch(import.meta.env.VITE_API + '/Game/Servers/1', {
                method: 'GET',
                headers: {
                    'content-type': 'application/json;charset=UTF-8',
                }
            })
            if (response.ok) {
                setServers((await response.json()).data)
            }
        }
        fetchData()

    }, [])
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
        const response = await fetch(import.meta.env.VITE_API + `/Game/StartServer/${serverId}`)
        if (response.ok) {
            notification('Server is running', "success")
            await checkStatus(serverId, false, false);

        } else {
            notification((await response.json()).msg, "error")
        }
        setGlobalDisabled(false)

    }
    const checkStatus = async (serverId: number, HideButtons: boolean = true, showAlert: boolean = true) => {
        if (HideButtons)
            setGlobalDisabled(true)
        var serverOn = false;
        const response = await fetch(import.meta.env.VITE_API + `/Game/CheckServer/${serverId}`)
        if (response.ok) {
            if ((await response.json()).status) {
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
    console.log(actionsDisabled)

    return (
        <Sheet className="mx-10 px-3">
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
                            <Button sx={{ mr: 1, mb: 1, size: "sm", py: 0, px: 1 }} disabled={globalDisabled || actionsDisabled.stop[server.id]} color="danger"><Stop /></Button>
                        </td>
                    </tr>)
                    )}
                </tbody>
            </Table>
        </Sheet >
    )
}

export default Servers
