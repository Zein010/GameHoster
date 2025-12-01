import { Box, Button, Modal, ModalClose, Select, Sheet, Table, Typography, Option } from '@mui/joy'
import { useEffect, useState } from 'react'
import "../index.css"
import { ElevatorSharp, PlayArrow, Settings, SignalWifiStatusbar4Bar, Stop } from '@mui/icons-material'
import { notification } from '../Utils.ts'
import AddIcon from '@mui/icons-material/Add';
import { Link } from 'react-router-dom'
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import useApiRequests from './API.tsx'
import { env } from 'process'

function Hosts() {
    const [hosts, setHosts] = useState<{
        id: number
        frontendUrl: string
        deleted:boolean
        current:boolean
    }[]>([])
    const [newOpen, setNewOpen] = useState(false)
    const [refresh, setRefresh] = useState(false)
    const requests = useApiRequests()
    useEffect(() => {
        const fetchData = async () => {

            const response = await requests.getHosts()
            if (response.status == 200) {
                setHosts(response.data.data)
            }
        }
        fetchData()

    }, [refresh])


    return (
      <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>

                <Typography level="h3">Hosts</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button startDecorator={<AddIcon />} onClick={() => { setNewOpen(true) }} sx={{ px: 1 }} size="sm">Hosts</Button>
                </Box>
            </Box>
            <Table stripe="odd">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>FrontEnd Url</th>
                        <th>Deleted</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {hosts.map(host =>
                    (<tr>
                        <td>{host.id}</td>
                        <td>{host.frontendUrl}</td>
                        <td>{host.deleted}</td>
                        <td>
                            <Link to={`http://${host.frontendUrl}:${import.meta.env.VITE_PORT}/Hosts/${host.id}/Servers`}>
                                <Button sx={{ mr: 1, mb: 1, size: "sm", py: 0, px: 1 }} color="primary"><Settings />
                                </Button>
                            </Link>
                        </td>
                    </tr>)
                    )}
                </tbody>
            </Table>
            </>
    )
}

export default Hosts
