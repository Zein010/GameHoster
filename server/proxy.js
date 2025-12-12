
import net from 'net';
import fs from 'fs';
import axios from 'axios';
import TerminalService from './src/services/TerminalService.js';
import HostService from './src/services/hostService.js';
import QueueService from './src/services/queueService.js';
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
            runningServerId: parseInt(runningServerId),
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
                        runningServerId: parseInt(runningServerId),
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

const HOST_STATUS = {}; // hostId -> { failures: number, lastCheck: number }
const SERVER_FAILURES = {}; // serverId -> failures
const MAX_FAILURES = 3;

async function HandleFailover(server, remoteHostId) {
    // Smart Failover with Backup Tracking
    // 1. Find all backups for this server
    const backups = await prisma.serverBackup.findMany({
        where: { runningServerId: parseInt(server.id) },
        orderBy: { createdAt: 'desc' },
        include: { host: true }
    });

    // 2. Filter backups:
    // - Must not be on the failed host (remoteHostId)
    // - Host must not be deleted
    // - Host must be reachable? (Optional, but good practice. For now just DB availability)
    
    // We can also get all active hosts to cross-reference
    const activeHosts = await prisma.server.findMany({ where: { deleted: false } });
    const activeHostIds = new Set(activeHosts.map(h => h.id));

    let bestBackup = null;
    for (const backup of backups) {
        if (backup.hostId !== remoteHostId && activeHostIds.has(backup.hostId)) {
            bestBackup = backup;
            break; // Since we ordered by desc, the first valid one is the best
        }
    }

    let targetHostId = null;

    if (bestBackup) {
        console.log(`Found recent backup on Host ${bestBackup.hostId} (created ${bestBackup.createdAt}). Failover Target: Host ${bestBackup.hostId}`);
        targetHostId = bestBackup.hostId;
    } else {
        // Fallback to "Next Host" strategy if no backup found
        console.warn(`No valid backup found for Server ${server.id}. Falling back to neighbor strategy.`);
        
        const hosts = activeHosts.sort((a, b) => a.id - b.id);
        const failedHostIndex = hosts.findIndex(h => h.id === remoteHostId);
        
        if (failedHostIndex !== -1) {
            const nextHost = hosts[(failedHostIndex + 1) % hosts.length];
             if (nextHost.id !== remoteHostId) {
                 targetHostId = nextHost.id;
             }
        }
    }

    // 3. Execute Failover if I AM the target host
    if (targetHostId && targetHostId === SERVER_ID) {
        console.log(`I am the Failover Target (Host ${SERVER_ID}) for Server ${server.id}. Initiating takeover.`);

        // Update DB: serverid = MY_ID
        // Also update 'transfering' to false if it was stuck?
        await prisma.runningServers.update({
            where: { id: parseInt(server.id) },
            data: {  
                serverid: SERVER_ID,
                presumedStatus: "online" // We presume it will be online soon
            }
        });
        
        // Enqueue START
        // Note: The START handler in worker.js now has logic to "Restore from Backup" if directory missing.
        // It checks `Backups/{username}.zip`. 
        // We assume the backup stream arrived successfully via the backup mechanism previously.
        await prisma.serverQueue.create({
            data: {
                serverId: parseInt(server.id),
                type: "START",
                status: "PENDING"
            }
        });
        
        // Reset local failures tracking
        if(HOST_STATUS[remoteHostId]) HOST_STATUS[remoteHostId].failures = 0;
        SERVER_FAILURES[server.id] = 0;
        return true;
    }

    return false;
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
                           
                           const response = await axios.get(checkUrl, { 
                               timeout: 3000,
                               headers: { 
                                   "API-Key": server.server.apiKey,
                                   "UserID": 1
                               } 
                               // always use root account
                           });
                           if (response.data && response.data.status) {
                               isRunning = true;
                               // Host is alive
                               HOST_STATUS[remoteHostId] = { failures: 0, lastCheck: Date.now() }; 
                           } else {
                               // API OK, but Status False -> Server Stopped
                               HOST_STATUS[remoteHostId] = { failures: 0, lastCheck: Date.now() }; 
                           }

                           targetHost = server.server.url.split(':')[0]; 
                           if (targetHost.includes('/')) targetHost = targetHost.split('/')[2]; 

                        } catch (err) {
                            // API Call Failed. Host might be down.
                            HOST_STATUS[remoteHostId] = HOST_STATUS[remoteHostId] || { failures: 0 };
                            HOST_STATUS[remoteHostId].failures += 1;
                            console.log(`Host ${remoteHostId} failure count: ${HOST_STATUS[remoteHostId].failures}`);

                            if (HOST_STATUS[remoteHostId].failures >= MAX_FAILURES) {
                                console.error(`Host ${remoteHostId} DOWN. Initiating Failover for Server ${server.id}...`);
                                if (await HandleFailover(server, remoteHostId)) continue; 
                            }
                        }
                    }
                }
            } catch (err) {
                console.error(`Check error for server ${server.id}:`, err);
            }

            // Periodic Backup Scheduler (Every 3 minutes) - For ALL running servers (Local & Remote)
            if (isRunning) {
                const lastBackup = await prisma.serverBackup.findFirst({
                    where: { runningServerId: parseInt(server.id) },
                    orderBy: { createdAt: 'desc' }
                });

                const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000);
                
                // Check if backup is needed (no backup or older than 3 mins)
                if (!lastBackup || lastBackup.createdAt < threeMinutesAgo) {
                    
                    // Check for existing pending BACKUP tasks
                    const pendingBackup = await prisma.serverQueue.findFirst({
                        where: {
                            serverId: parseInt(server.id),
                            type: "BACKUP",
                            status: { in: ["PENDING", "PROCESSING"] }
                        }
                    });

                    if (!pendingBackup) {
                        // Check if ANY host is available for backup
                        const onlineHosts = await prisma.server.findMany({
                            where: { deleted: false, status: "online", id: { not: SERVER_ID } }
                        });

                        if (onlineHosts.length > 0) {
                            console.log(`[Scheduler] Enqueuing periodic backup for Server ${server.id}`);
                            await QueueService.Enqueue(parseInt(server.id), "BACKUP");
                        } else {
                            console.log(`[Scheduler] No online hosts available. Skipping backup enqueue for Server ${server.id}`);
                        }
                    }
                }
            }

            // Check for Presumed Status Mismatch
            // If presumed online, but not running -> Failure
            if (server.presumedStatus === 'online' && !isRunning) {
                
                const isHostOffline = HOST_STATUS[remoteHostId] && HOST_STATUS[remoteHostId].failures >= MAX_FAILURES;
                
                if (!isHostOffline) {
                     // Host is Online. Check if Host gave up.
                     if (server.startRetryCount > 3) {
                         console.error(`Server ${server.id} FAILED (Retry Count ${server.startRetryCount}). Initiating Failover...`);
                         if (await HandleFailover(server, remoteHostId)) continue;
                     } else {
                         console.log(`Server ${server.id} presumed online but not running. Retry Count: ${server.startRetryCount}/3. Waiting for Host recovery.`);
                     }
                }
            } else {
                // Reset failure count (just in case we use it elsewhere, though we rely on DB now)
                SERVER_FAILURES[server.id] = 0;
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

// Status Check Loop
async function CheckStatusLoop() {
    console.log("Starting Status Check Loop...");
    while (true) {
        try {
            const servers = await prisma.server.findMany({
                where: { deleted: false, id: { not: SERVER_ID } }
            });

            for (const server of servers) {
                const protocol = server.url.startsWith("http") ? "" : "http://";
                try {
                    await axios.get(`${protocol}${server.url}/Game/Status`, {
                        timeout: 5000,
                        headers: { "API-Key": server.apiKey, "UserID": 1 }
                    });
                    await prisma.server.update({
                        where: { id: server.id },
                        data: { status: "online" }
                    });
                } catch (err) {
                    console.error(`Status check failed for Host ${server.id}: ${err.message}`);
                    await prisma.server.update({
                        where: { id: server.id },
                        data: { status: "offline" }
                    });
                }
            }
        } catch (e) {
            console.error("Error in status loop:", e);
        }
        await new Promise(resolve => setTimeout(resolve, 60000)); // Every 1 minute
    }
}

// Start Loops
console.log("Starting Proxy Manager...");
setInterval(CheckAndProxy, 10000);
CheckAndProxy();
CheckStatusLoop();
