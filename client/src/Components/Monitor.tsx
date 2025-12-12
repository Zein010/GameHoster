
import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, LinearProgress } from '@mui/joy';
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../Config/app.config';

interface ResourceStats {
    cpu: number;
    ram: number; // in bytes
}

interface ServerStats {
    [serverId: number]: ResourceStats;
}

// Helper to format bytes
const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export default function Monitor() {
    const [stats, setStats] = useState<ServerStats>({});
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        // Connect to the socket of the configured API base URL
        const newSocket = io(API_BASE_URL || `http://${window.location.hostname}:3004`); 
        
        newSocket.on('connect', () => {
            console.log("Monitor connected to socket");
        });

        newSocket.on('resource_update', (data: ServerStats) => {
            setStats(data);
        });

        newSocket.on('disconnect', () => {
            console.log("Monitor disconnected");
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);


    return (
        <Box sx={{ width: '100%', height: '100%', overflow: 'auto', p: 2 }}>
             <Typography level="h2" sx={{ mb: 2 }}>Host Resource Monitor</Typography>
             
             {Object.keys(stats).length === 0 ? (
                 <Typography level="body-md">No active servers or waiting for data...</Typography>
             ) : (
                 <Grid container spacing={2}>
                     {Object.entries(stats).map(([serverId, stat]) => (
                         <Grid xs={12} sm={6} md={4} lg={3} key={serverId}>
                             <Card variant="outlined">
                                 <CardContent>
                                     <Typography level="title-lg" sx={{ mb: 1 }}>Server #{serverId}</Typography>
                                     
                                     <Box sx={{ mb: 2 }}>
                                         <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                             <Typography level="body-sm">CPU Usage</Typography>
                                             <Typography level="body-sm" fontWeight="bold">{stat.cpu.toFixed(1)}%</Typography>
                                         </Box>
                                         <LinearProgress 
                                            determinate 
                                            value={Math.min(stat.cpu, 100)} 
                                            color={stat.cpu > 80 ? 'danger' : stat.cpu > 50 ? 'warning' : 'success'}
                                         />
                                     </Box>

                                     <Box>
                                         <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                             <Typography level="body-sm">RAM Usage</Typography>
                                             <Typography level="body-sm" fontWeight="bold">{formatBytes(stat.ram)}</Typography>
                                         </Box>
                                          <LinearProgress 
                                            determinate 
                                            value={Math.min((stat.ram / (1024*1024*1024*4)) * 100, 100)} 
                                            color="primary"
                                         />
                                     </Box>
                                 </CardContent>
                             </Card>
                         </Grid>
                     ))}
                 </Grid>
             )}
        </Box>
    );
}
