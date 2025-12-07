
import net from 'net';
import fs from 'fs';
import axios from 'axios';
import TerminalService from './src/services/TerminalService.js';
import HostService from './src/services/hostService.js';
import dotenv from 'dotenv';
import { prisma } from './prisma.js';

dotenv.config();

const PROXIES = {}; // serverId -> { server: net.Server, port: number, target: string }
const SERVER_ID = parseInt(process.env.SERVER_ID);
const MIN_PORT = 60000;
const MAX_PORT = 65535;

async function GetOrAssignPort(runningServerId) {
    // Check if assignment exists for this proxy host + running server
    let connection = await prisma.proxyConnection.findFirst({
        where: {
            runningServerId: runningServerId,
            proxyHostId: SERVER_ID
        }
    });

    if (connection) {
        return connection.port;
    }

    // Assign new port
    // Get all used ports for this proxy host
    const usedPorts = await prisma.proxyConnection.findMany({
        where: { proxyHostId: SERVER_ID },
        select: { port: true }
    });
    const usedPortSet = new Set(usedPorts.map(p => p.port));

    let port = MIN_PORT;
    while (port <= MAX_PORT) {
        if (!usedPortSet.has(port)) {
            // Found free port
            // Reserve it
            try {
                connection = await prisma.proxyConnection.create({
                    data: {
                        runningServerId: runningServerId,
                        proxyHostId: SERVER_ID,
                        port: port
                    }
                });
                return port;
            } catch (e) {
                // Race condition or duplicate? Retry
                console.error("Port assignment collision", e);
            }
        }
        port++;
    }
    return null; // No free ports
}

async function CheckAndProxy() {
    try {
        console.log("Checking active servers...");
        const servers = await prisma.runningServers.findMany({
            where: { deleted: false },
            include: { 
                sysUser: true, 
                server: true,
                gameVersion: true 
            }
        });


        const activeServerIds = new Set();
        
        // Host Health Tracking
        const HOST_STATUS = {}; // hostId -> { failures: number, lastCheck: number }
        const MAX_FAILURES = 3;

        for (const server of servers) {
            let isRunning = false;
            let targetHost = '127.0.0.1';
            
            // Check Config for Port
            if (!server.config || !server.config.startData || server.config.startData.length === 0) {
                continue;
            }
            const gamePort = server.config.startData[server.config.startData.length - 1].port;
            if (!gamePort) continue;

            const isLocal = server.serverid === SERVER_ID;
            const remoteHostId = server.serverid;
            
            try {
                if (isLocal) {
                    // Local Check
                    isRunning = await TerminalService.CheckUserHasProcess(
                        server.sysUser.username, 
                        server.gameVersion.searchScript 
                    );
                    targetHost = '127.0.0.1';
                } else {
                    // Remote Check & Host Monitoring
                    if (server.server && server.server.url) {
                        try {
                           const protocol = server.server.url.startsWith("http") ? "" : "http://";
                           const checkUrl = `${protocol}${server.server.url}/Game/CheckServer/${server.id}`;
                           
                           const response = await axios.get(checkUrl, { timeout: 3000 });
                           if (response.data && response.data.status) {
                               isRunning = true;
                               HOST_STATUS[remoteHostId] = { failures: 0, lastCheck: Date.now() }; // Host is alive
                           } else {
                               // Server seems down, but is host down?
                               // If API returned 200 OK but status false, host is UP, server is STOPPED.
                               HOST_STATUS[remoteHostId] = { failures: 0, lastCheck: Date.now() }; 
                           }

                           targetHost = server.server.url.split(':')[0]; 
                           if (targetHost.includes('/')) targetHost = targetHost.split('/')[2]; 

                        } catch (err) {
                            // API Call Failed. Host might be down.
                            // console.log(`Remote check failed for ${server.id}: ${err.message}`);
                            
                            HOST_STATUS[remoteHostId] = HOST_STATUS[remoteHostId] || { failures: 0 };
                            HOST_STATUS[remoteHostId].failures += 1;
                            HOST_STATUS[remoteHostId].lastCheck = Date.now();

                            console.log(`Host ${remoteHostId} failure count: ${HOST_STATUS[remoteHostId].failures}`);

                            if (HOST_STATUS[remoteHostId].failures >= MAX_FAILURES) {
                                console.error(`Host ${remoteHostId} DOWN. Initiating Failover for Server ${server.id}...`);
                                
                                // AUTO FAILOVER LOGIC
                                // 1. Determine Backup Host (Neighbor)
                                // Only this proxy (running on a specific host) should perform failover if it is the intended backup?
                                // OR this monitoring is centralized?
                                // "The proxy generally calls the check server... I want it to check if the server is down... create a new queue..."
                                // User implies THIS proxy script monitors others. 
                                
                                // If I am the neighbor/backup, I should pick it up.
                                // Logic: Am I the backup for this host?
                                // Hosts: A, B, C. 
                                // B fails. Backup is C (Next) or A (Prev).
                                // Let's check if *I* am the backup host for the failed host.
                                // If I am (my ID is next/prev for remoteHostId), then I take over.
                                
                                const hosts = await prisma.server.findMany({ where: { deleted: false }, orderBy: { id: 'asc' } });
                                const failedHostIndex = hosts.findIndex(h => h.id === remoteHostId);
                                const myIndex = hosts.findIndex(h => h.id === SERVER_ID);
                                
                                if (failedHostIndex !== -1 && myIndex !== -1) {
                                    const nextIndex = (failedHostIndex + 1) % hosts.length;
                                    const prevIndex = (failedHostIndex - 1 + hosts.length) % hosts.length;
                                    
                                    // Let's assume Next host is the primary backup for simplicity, or we can check load.
                                    // Or "two machines... one before it and one after it".
                                    // Both can populate it? 
                                    // Let's have the "Next" host take responsibility to avoid race conditions.
                                    if (hosts[nextIndex].id === SERVER_ID) {
                                        console.log(`I am the Backup Host for ${remoteHostId}. Taking over server ${server.id}.`);
                                        
                                        // 2. Update DB: serverid = MY_ID
                                        await prisma.runningServers.update({
                                            where: { id: server.id },
                                            data: { serverid: SERVER_ID }
                                        });
                                        
                                        // 3. Enqueue START
                                        await prisma.serverQueue.create({
                                            data: {
                                                serverId: server.id,
                                                type: "START",
                                                status: "PENDING"
                                            }
                                        });
                                        
                                        // Reset failure count so we don't spam
                                        HOST_STATUS[remoteHostId].failures = 0;
                                        
                                        continue; // Server will be started by my worker soon.
                                    }
                                }
                            }
                        }
                    }
                }
            } catch (err) {
                console.error(`Check error for server ${server.id}:`, err);
            }

            if (isRunning) {
                activeServerIds.add(server.id);
                
                // Ensure Proxy
                if (!PROXIES[server.id]) {
                    const localPort = await GetOrAssignPort(server.id);
                    if (localPort) {
                        StartProxy(server.id, localPort, targetHost, gamePort);
                    } else {
                        console.error(`No free ports for proxying server ${server.id}`);
                    }
                }
            }
        }

        // Cleanup Inactive Proxies
        for (const id in PROXIES) {
            if (!activeServerIds.has(parseInt(id))) {
                console.log(`Server ${id} no longer active, stopping proxy.`);
                StopProxy(id);
            }
        }

    } catch (e) {
        console.error("Error in proxy loop:", e);
    }
}

function StartProxy(id, localPort, targetHost, targetPort) {
    if (PROXIES[id]) return;

    const server = net.createServer((clientSocket) => {
        const remoteAddress = clientSocket.remoteAddress;
        // Normalize IPv6 mapped IPv4
        const ip = remoteAddress.includes('::ffff:') ? remoteAddress.split('::ffff:')[1] : remoteAddress;
        const time = new Date().toISOString();
        const logMsg = `[Connection] IP: ${ip} | Time: ${time} | Server: ${id}\n`;

        console.log(logMsg.trim());
        try {
            fs.appendFileSync('proxydata.log', logMsg);
        } catch (err) {
            console.error("Failed to write to log file:", err);
        }

        const serverSocket = new net.Socket();
        
        serverSocket.connect(targetPort, targetHost, () => {
            clientSocket.pipe(serverSocket);
            serverSocket.pipe(clientSocket);
        });

        serverSocket.on('error', (err) => {
            clientSocket.end();
        });
        clientSocket.on('error', (err) => {
            serverSocket.end();
        });
        clientSocket.on('close', () => {
            const endTime = new Date().toISOString();
            const logMsg = `[Disconnection] IP: ${ip} | Time: ${endTime} | Server: ${id}\n`;
            console.log(logMsg.trim());
            try {
                fs.appendFileSync('proxydata.log', logMsg);
            } catch (err) {
                console.error("Failed to write to log file:", err);
            }
            serverSocket.end();
        });
        serverSocket.on('close', () => {
            clientSocket.end();
        });
    });

    server.on('error', (err) => {
        console.error(`Proxy server error on port ${localPort}:`, err);
        // If EADDRINUSE, maybe we should release the port or retry?
    });

    server.listen(localPort, () => {
        console.log(`[Proxy] Started for Server ${id}: :${localPort} -> ${targetHost}:${targetPort}`);
    });

    PROXIES[id] = { server, port: localPort, target: `${targetHost}:${targetPort}` };
}

function StopProxy(id) {
    if (PROXIES[id]) {
        PROXIES[id].server.close();
        delete PROXIES[id];
    }
}

// Start Loop
console.log("Starting Proxy Manager...");
setInterval(CheckAndProxy, 10000);
CheckAndProxy();

