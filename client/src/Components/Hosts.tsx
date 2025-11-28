import { Box, Button, Modal, ModalClose, Select, Sheet, Table, Typography, Option } from '@mui/joy'
import { useEffect, useState } from 'react'
import "../index.css"
import { ElevatorSharp, PlayArrow, Settings, SignalWifiStatusbar4Bar, Stop } from '@mui/icons-material'
import { notification } from '../Utils.ts'
import AddIcon from '@mui/icons-material/Add';
import { Link } from 'react-router-dom'
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import useApiRequests from './API.tsx'

function Hosts() {
    const [hosts, setHosts] = useState<{
        id: number
        url: string
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
        <Sheet className="mx-10 px-3 mt-6">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 2 }}>

                <Typography level="h3">Hosts</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button startDecorator={<AddIcon />} onClick={() => { setNewOpen(true) }} sx={{ px: 1 }} size="sm">Hosts</Button>
                </Box>
            </Box>
            <Table stripe="odd">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>URl</th>
                        <th>Deleted</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {hosts.map(host =>
                    (<tr>
                        <td>{host.id}</td>
                        <td>{host.url}</td>
                        <td>{host.deleted}</td>
                        <td>
                            <Link to={`/Hosts/${host.id}/Servers`}>
                                <Button sx={{ mr: 1, mb: 1, size: "sm", py: 0, px: 1 }} color="primary"><Settings />
                                </Button>
                            </Link>
                        </td>
                    </tr>)
                    )}
                </tbody>
            </Table>
          
        </Sheet >

    )
}

export default Hosts
