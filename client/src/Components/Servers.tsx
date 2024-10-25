import { Button, Sheet, Table } from '@mui/joy'
import { useEffect, useState } from 'react'
import "../index.css"
import { Home, KeyboardArrowRight, LocalConvenienceStoreOutlined, PlayArrow, Settings, Stop } from '@mui/icons-material'
function Servers() {
    const [servers, setServers] = useState([])
    useEffect(() => {
        const fetchData = async () => {

            const response = await window.fetch('http://localhost:3000/Game/Servers/1', {
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
    console.log(servers)
    return (
        <Sheet className="mx-10 px-3">
            <Table stripe="odd"  >
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
                            <Button sx={{ mr: 1, mb: 1, size: "sm", py: 0, px: 1 }} color="success"><PlayArrow /></Button>
                            <Button sx={{ mr: 1, mb: 1, size: "sm", py: 0, px: 1 }} color="danger"><Stop /></Button>
                            <Button sx={{ mr: 1, mb: 1, size: "sm", py: 0, px: 1 }} color="warning"><Settings /></Button>
                        </td>
                    </tr>)
                    )}
                </tbody>
            </Table>
        </Sheet >
    )
}

export default Servers
