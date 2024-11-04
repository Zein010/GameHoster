import { useEffect, useState } from 'react'
import { styled } from '@mui/joy/styles';
import { Sheet, Grid, Card, CardContent, Typography, Button, Box } from '@mui/joy';
import { Refresh } from '@mui/icons-material';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import { useParams } from 'react-router-dom';
export default function Players() {

    const [players, setPlayers] = useState([]);
    const [refresh, setRefresh] = useState(false);

    const { id } = useParams();
    useEffect(() => {

        const fetchData = async () => {

            const response = await fetch(import.meta.env.VITE_API + `/Game/Command/${id}`, {
                method: 'Post',
                headers: {
                    'content-type': 'application/json;charset=UTF-8',
                }, body: { command: "/list uuids" }
            })
            if (response.ok) {
                const log = await response.json();
                const regex = /(\w+)\s\(([\da-fA-F-]+)\)/g;
                let match;
                const newPlayers = []
                while ((match = regex.exec(log)) !== null) {
                    newPlayers.push({ name: match[1], uuid: match[2] });
                }
                setPlayers(newPlayers)
            }
        }
        fetchData();

    }, [refresh, id])

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
                                            <Button sx={{ mr: 2, px: 1 }} variant='soft' title='Kick' color="danger" size='sm'><RemoveCircleOutlineIcon /></Button>
                                            <Button sx={{ px: 1 }} variant='soft' title='Ban' color="danger" size='sm'><NotInterestedIcon /></Button>
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