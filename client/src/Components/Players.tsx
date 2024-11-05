import { useEffect, useState } from 'react'
import { Sheet, Grid, Card, CardContent, Typography, Button, Box, Divider } from '@mui/joy';
import { Refresh } from '@mui/icons-material';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import { useParams } from 'react-router-dom';
import RemoveModeratorIcon from '@mui/icons-material/RemoveModerator';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
export default function Players() {

    const [players, setPlayers] = useState([]);
    const [bannedPlayers, setBannedPlayers] = useState([]);
    const [refresh, setRefresh] = useState(false);

    const { id } = useParams();
    useEffect(() => {

        const fetchData = async () => {

            const resPlayers = await fetch(import.meta.env.VITE_API + `/Game/Command/${id}/GetPlayers`, {
                method: 'Get',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            if (resPlayers.ok) {
                const log = await resPlayers.json();
                const regex = /(\w+)\s\(([\da-fA-F-]+)\)/g;
                let match;
                const newPlayers = []
                while ((match = regex.exec(log.output)) !== null) {
                    newPlayers.push({ name: match[1], uuid: match[2] });
                }
                setPlayers(newPlayers)
            }
            const resBanned = await fetch(import.meta.env.VITE_API + `/Game/Command/${id}/GetBanned`, {
                method: 'Get',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            if (resBanned.ok) {
                const newBannedPlayers = (await resBanned.json()).output;

                setBannedPlayers(newBannedPlayers)
            }
        }
        fetchData();

    }, [refresh, id])
    const kickPlayer = async (playerName: string) => {
        const response = await fetch(import.meta.env.VITE_API + `/Game/Command/${id}/Kick`, {
            method: 'Post',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ playerName })
        })
        if (response.ok) {
            setRefresh(!refresh)
        }

    }
    const banPlayer = async (playerName: string) => {
        const response = await fetch(import.meta.env.VITE_API + `/Game/Command/${id}/Ban`, {
            method: 'Post',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ playerName })
        })
        if (response.ok) {
            setRefresh(!refresh)
        }

    }
    const opPlayer = async (playerName: string) => {
        const response = await fetch(import.meta.env.VITE_API + `/Game/Command/${id}/OP`, {
            method: 'Post',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ playerName })
        })
        if (response.ok) {
            setRefresh(!refresh)
        }

    }
    const deopPlayer = async (playerName: string) => {
        const response = await fetch(import.meta.env.VITE_API + `/Game/Command/${id}/DEOP`, {
            method: 'Post',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ playerName })
        })
        if (response.ok) {
            setRefresh(!refresh)
        }

    }
    const unban = async (playerName: string) => {
        const response = await fetch(import.meta.env.VITE_API + `/Game/Command/${id}/Unban`, {
            method: 'Post',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ playerName })
        })
        if (response.ok) {
            setRefresh(!refresh)
        }

    }
    return (
        <Box >
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <Typography level="h3" sx={{ mr: 2 }}>Players</Typography>
                <Button onClick={() => { setRefresh(!refresh) }} size='sm'><Refresh /></Button>
            </Box>
            <Card variant="outlined" sx={{ bgcolor: '#2d2d2d', color: '#d1d5db', p: 2 }}>

                <Grid container spacing={2} sx={{ flexGrow: 1 }}>
                    {players.length > 0 ? players.map(player => {
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
                    ) :
                        <Grid size={8} >
                            <Card variant="soft" sx={{ boxShadow: "lg" }} >
                                <CardContent>
                                    <Typography level="title-md">No Players</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    }


                </Grid>

            </Card>
            <Divider sx={{ color: '#d1d5db', my: 2 }} />
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <Typography level="h3" sx={{ mr: 2, }}>Banned Players</Typography>
                <Button onClick={() => { setRefresh(!refresh) }} size='sm'><Refresh /></Button>
            </Box>
            <Card variant="outlined" sx={{ bgcolor: '#2d2d2d', color: '#d1d5db', p: 2 }}>

                <Grid container spacing={2} sx={{ flexGrow: 1 }}>
                    {bannedPlayers.length > 0 ? bannedPlayers.map(player => {
                        return (
                            <Grid size={8} >
                                <Card variant="soft" sx={{ boxShadow: "lg" }} >
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: "space-between" }}>

                                            <Typography level="title-md">{player.playerName}</Typography>
                                            <Box sx={{ display: "flex" }}>
                                                <Button sx={{ mr: 1, px: 1 }} variant='soft' title='UNBan' color="success" onClick={() => { unban(player.playerName) }} size='sm'><RemoveCircleOutlineIcon /></Button>
                                            </Box>
                                        </Box>
                                        <Typography>Reason: {player.reason}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>)
                    }
                    ) :
                        <Grid size={8} >
                            <Card variant="soft" sx={{ boxShadow: "lg" }} >
                                <CardContent>
                                    <Typography level="title-md">No Banned Players</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    }


                </Grid>

            </Card>

        </Box >
    );



}