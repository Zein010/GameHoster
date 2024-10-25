import { Button, Sheet, Table } from '@mui/joy'
import { startTransition, useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import "../index.css"
import { PlayArrow, Settings, SignalWifiStatusbar4Bar, Stop } from '@mui/icons-material'
function Servers() {
    const [servers, setServers] = useState<{
        id: number
        createdAt: string
        sysUser: { username: string }
        gameVersion: { version: string, game: { name: string } }
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
    const checkStatus = async (serverId: number) => {
        setGlobalDisabled(true)
        const response = await fetch(import.meta.env.VITE_API + `/Game/CheckServer/${serverId}`)
        if (response.ok) {
            if ((await response.json()).status) {
                toast.success('Server is running', {
                    position: "top-center",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                });
                setActionDisabledState(serverId, { start: true, stop: false });
            } else {
                toast.error('Server is not running', {
                    position: "top-center",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                });
                setActionDisabledState(serverId, { start: false, stop: true });
            }
            setGlobalDisabled(false)

        }
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
                        <td>
                            <Button sx={{ mr: 1, mb: 1, size: "sm", py: 0, px: 1 }} disabled={globalDisabled} onClick={() => { checkStatus(server.id) }} color="success"><SignalWifiStatusbar4Bar /></Button>
                            <Button sx={{ mr: 1, mb: 1, size: "sm", py: 0, px: 1 }} disabled={globalDisabled || actionsDisabled.start[server.id]} color="success"><PlayArrow /></Button>
                            <Button sx={{ mr: 1, mb: 1, size: "sm", py: 0, px: 1 }} disabled={globalDisabled || actionsDisabled.stop[server.id]} color="danger"><Stop /></Button>
                            <Button sx={{ mr: 1, mb: 1, size: "sm", py: 0, px: 1 }} disabled={globalDisabled} color="warning"><Settings /></Button>
                        </td>
                    </tr>)
                    )}
                </tbody>
            </Table>
        </Sheet >
    )
}

export default Servers
