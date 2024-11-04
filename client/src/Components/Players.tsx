import { useEffect, useState } from 'react'
import { styled } from '@mui/joy/styles';
import { Sheet, Grid, Card, CardContent, Typography, Button, Box } from '@mui/joy';
import { Refresh } from '@mui/icons-material';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import { useParams } from 'react-router-dom';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import RemoveModeratorIcon from '@mui/icons-material/RemoveModerator';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
export default function Players() {

    const [players, setPlayers] = useState([]);
    const [refresh, setRefresh] = useState(false);

    const { id } = useParams();
    useEffect(() => {

        const fetchData = async () => {

            const response = await fetch(import.meta.env.VITE_API + `/Game/Command/${id}`, {
                method: 'Post',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ command: "/list uuids" })
            })
            if (response.ok) {
                const log = await response.json();
                const regex = /(\w+)\s\(([\da-fA-F-]+)\)/g;
                let match;
                const newPlayers = []
                while ((match = regex.exec(log.output)) !== null) {
                    newPlayers.push({ name: match[1], uuid: match[2] });
                }
                setPlayers(newPlayers)
            }
        }
        fetchData();

    }, [refresh, id])
    const kickPlayer = async (playername: string) => {
        const response = await fetch(import.meta.env.VITE_API + `/Game/Command/${id}`, {
            method: 'Post',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ command: `/kick ${playername}` })
        })
        if (response.ok) {
            setRefresh(!refresh)
        }

    }
    const banPlayer = async (playername: string) => {
        const response = await fetch(import.meta.env.VITE_API + `/Game/Command/${id}`, {
            method: 'Post',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ command: `/ban ${playername}` })
        })
        if (response.ok) {
            setRefresh(!refresh)
        }

    }
    const opPlayer = async (playername: string) => {
        const response = await fetch(import.meta.env.VITE_API + `/Game/Command/${id}`, {
            method: 'Post',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ command: `/op ${playername}` })
        })
        if (response.ok) {
            setRefresh(!refresh)
        }

    }
    const deopPlayer = async (playername: string) => {
        const response = await fetch(import.meta.env.VITE_API + `/Game/Command/${id}`, {
            method: 'Post',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ command: `/deop ${playername}` })
        })
        if (response.ok) {
            setRefresh(!refresh)
        }

    }
    return (
        <Sheet className="mx-10 px-3 mt-6 p-2">
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <Typography level="h3" sx={{ mr: 5 }}>Players</Typography>
                <Button onClick={() => { setRefresh(!refresh) }} ><Refresh /></Button>
            </Box>
            <Grid container spacing={2} sx={{ flexGrow: 1 }}>
                {players.map(player => {
                    return (
                        <Grid size={8} >
                            <Card variant="soft" sx={{ boxShadow: "lg" }} >
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: "space-between" }}>

                                        <Typography level="title-md">{player.name}</Typography>
                                        <Box sx={{ display: "flex" }}>
                                            <Button sx={{ mr: 1, px: 1 }} variant='soft' title='Kick' color="danger" onClick={() => { kickPlayer(player.name) }} size='sm'><RemoveCircleOutlineIcon /></Button>
                                            <Button sx={{ mr: 1, px: 1 }} variant='soft' title='Ban' color="danger" size='sm' onClick={() => { banPlayer(player.name) }}><NotInterestedIcon /></Button>
                                            <Button sx={{ mr: 1, px: 1 }} variant='soft' title='OP' color="success" size='sm' onClick={() => { opPlayer(player.name) }}><VerifiedUserIcon /></Button>
                                            <Button sx={{ px: 1 }} variant='soft' title='DeOp' color="danger" size='sm' onClick={() => { deopPlayer(player.name) }}><RemoveModeratorIcon /></Button>
                                        </Box>
                                    </Box>
                                    <Typography>UUID: {player.uuid}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>)
                }
                )}


            </Grid>

        </Sheet >
    );



}