import { useEffect, useState } from 'react'
import {  Grid, Card, CardContent, Typography, Button, Box, Divider } from '@mui/joy';
import { Refresh } from '@mui/icons-material';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import { useParams } from 'react-router-dom';
import RemoveModeratorIcon from '@mui/icons-material/RemoveModerator';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import useApiRequests from './API';
export default function Players() {

    const [players, setPlayers] = useState<{ name: string, uuid: string }[]>([]);
    const [bannedPlayers, setBannedPlayers] = useState<{ playerName: string, reason: string }[]>([]);
    const [refresh, setRefresh] = useState(false);
    const requests=useApiRequests();
    const { id } = useParams();
    useEffect(() => {

        const fetchData = async () => {

            const resPlayers =await requests.commandManager.getGamePlayers(parseInt(id!))
            if (resPlayers.status==200) {
                const log =  resPlayers.data;
                const regex = /(\w+)\s\(([\da-fA-F-]+)\)/g;
                let match;
                const newPlayers = []
                while ((match = regex.exec(log.output)) !== null) {
                    newPlayers.push({ name: match[1], uuid: match[2] });
                }
                setPlayers(newPlayers)
            }
            const resBanned = await requests.commandManager.getGameBannedPlayers(parseInt(id!))
            if (resBanned.status==200) {
                const newBannedPlayers =  resBanned.data.output;

                setBannedPlayers(newBannedPlayers)
            }
        }
        fetchData();

    }, [refresh, id])
    const kickPlayer = async (playerName: string) => {
        const response =await requests.commandManager.sendCommand(parseInt(id!),"kick",{playerName}); 
        if (response.status=200) {
            setRefresh(!refresh)
        }

    }
    const banPlayer = async (playerName: string) => {
        const response =await requests.commandManager.sendCommand(parseInt(id!),"Ban",{playerName}); 
        if (response.status=200) {
            setRefresh(!refresh)
        }

    }
    const opPlayer = async (playerName: string) => {
        const response =await requests.commandManager.sendCommand(parseInt(id!),"OP",{playerName}); 
        if (response.status=200) {
            setRefresh(!refresh)
        }
       

    }
    const deopPlayer = async (playerName: string) => {
        const response =await requests.commandManager.sendCommand(parseInt(id!),"DEOP",{playerName}); 
        if (response.status=200) {
            setRefresh(!refresh)
        }

    }
    const unban = async (playerName: string) => {
        const response =await requests.commandManager.sendCommand(parseInt(id!),"Unban",{playerName}); 
       
        if (response.status=200) {
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
                            <Box key={player.uuid}>
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
                            </Box>)
                    }
                    ) :
                        <Box >
                            <Card variant="soft" sx={{ boxShadow: "lg" }} >
                                <CardContent>
                                    <Typography level="title-md">No Players</Typography>
                                </CardContent>
                            </Card>
                        </Box>
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
                    {bannedPlayers.length > 0 ? bannedPlayers.map((player,i) => {
                        return (
                            <Box key={i} >
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
                            </Box>)
                    }
                    ) :
                        <Box >
                            <Card variant="soft" sx={{ boxShadow: "lg" }} >
                                <CardContent>
                                    <Typography level="title-md">No Banned Players</Typography>
                                </CardContent>
                            </Card>
                        </Box>
                    }


                </Grid>

            </Card>

        </Box >
    );



}