
import { exec } from "child_process";
import { prisma } from "../../prisma.js";
import { promisify } from "util";
import os from "os";
import QueueService from "./queueService.js";
import TerminalService from "./TerminalService.js";

const execAsync = promisify(exec);

class MonitorService {
    constructor() {
        this.io = null;
        this.interval = null;
        this.buffer = [];
        this.BUFFER_FLUSH_INTERVAL = 10 * 60 * 1000; // 10 minutes
        this.POLL_INTERVAL = 2000; // 2 seconds
        this.lastFlush = Date.now();
    }

    startMonitor(io) {
        this.io = io;
        console.log("Starting Resource Monitor Service...");
        
        // Start polling loop
        this.interval = setInterval(() => this.pollResources(), this.POLL_INTERVAL);
        
        // Start flush loop (check every minute if it's time to flush to ensure exact timing isn't critical but regular enough)
        setInterval(() => this.flushBuffer(), 60000); 

        // Update Host Capacity on startup
        this.updateHostCapacity();
    }

    async updateHostCapacity() {
        try {
            console.log("Updating Host Capacity...");
            const totalMemMB = Math.floor(os.totalmem() / 1024 / 1024);
            const cpuCount = os.cpus().length;
            
            // Get storage of current partition (where the server is running)
            const { stdout: storageOut } = await execAsync("df -BG . --output=size | tail -1");
            const totalStorageGB = parseInt(storageOut.trim().replace('G', ''));

            await prisma.server.update({
                where: { id: parseInt(process.env.SERVER_ID) },
                data: {
                    ram: totalMemMB,
                    cpu: cpuCount,
                    storage: totalStorageGB
                }
            });
            console.log(`Host Capacity Updated: RAM=${totalMemMB}MB, CPU=${cpuCount}, Storage=${totalStorageGB}GB`);

        } catch (error) {
            console.error("Failed to update host capacity:", error);
        }
    }

    async pollResources() {
        try {
            const SERVER_ID = parseInt(process.env.SERVER_ID);
            
            // 1. Get all running servers on this host
            const servers = await prisma.runningServers.findMany({
                where: { 
                    serverid: SERVER_ID,
                    deleted: false
                },
                include: {
                    sysUser: true,
                    gameVersion: true
                }
            });

            if (servers.length === 0) return;

            // 2. Map PIDs and Status
            const pidMap = {};
            const pids = [];
            const onlineServers = [];

            servers.forEach(s => {
                if (s.pid > 0) {
                    pids.push(s.pid);
                    pidMap[s.pid] = s.id;
                }
                
                // Track servers that SHOULD be online
                if (!s.transfering && (s.presumedStatus === 'online' || s.presumedStatus === 'starting')) {
                    onlineServers.push(s);
                }
            });

            const stats = {};
            const timestamp = new Date();
            const foundPids = new Set();

            // 3. Check Resources via PS if we have PIDs
            if (pids.length > 0) {
                const cmd = `ps -p ${pids.join(',')} -o pid,%cpu,rss --no-headers`;
                try {
                    const { stdout } = await execAsync(cmd);
                    const lines = stdout.trim().split('\n');
                    
                    for (const line of lines) {
                        const parts = line.trim().split(/\s+/);
                        if (parts.length >= 3) {
                            const pid = parseInt(parts[0]);
                            const cpu = parseFloat(parts[1]);
                            const ramKB = parseInt(parts[2]);
                            const ramBytes = ramKB * 1024;
                            
                            foundPids.add(pid);

                            const serverId = pidMap[pid];
                            if (serverId) {
                                stats[serverId] = {
                                    cpu: cpu,
                                    ram: ramBytes
                                };

                                this.buffer.push({
                                    runningServerId: serverId,
                                    cpu: cpu,
                                    ram: BigInt(ramBytes),
                                    createdAt: timestamp
                                });
                            }
                        }
                    }
                } catch (err) {
                    // Start of ps command might fail if all pids are gone, returns exit code 1
                    if (err.code !== 1) {
                         console.error("MonitorService PS Error:", err);
                    }
                }
            }

            // 4. Check for Crashed Servers
            // A server is crashed if:
            // - presumedStatus is 'online'
            // - Not transferring
            // - PID is NOT in foundPids (or PID was 0)
            
            // To be safe, we also check if there are any pending tasks for this server
            // Fetch active tasks for this host to avoid acting on servers currently being processed
            const activeServerIds = new Set();
            const activeQueueItems = await prisma.serverQueue.findMany({
                where: {
                    server: { serverid: SERVER_ID },
                    status: { in: ["PENDING", "PROCESSING"] }
                },
                select: { serverId: true }
            });
            activeQueueItems.forEach(i => activeServerIds.add(i.serverId));

            for (const server of onlineServers) {
                const isProcessRunning = foundPids.has(server.pid);
                const isPendingTask = activeServerIds.has(server.id);
                if (!isProcessRunning && !isPendingTask) {
                    // Double check with actual process check by regex to be sure PID didn't just change
                    const isReallyRunning = await TerminalService.CheckUserHasProcess(server.sysUser.username, server.gameVersion.searchScript);
                    
                    if (isReallyRunning) {
                        // It's running, but PID was wrong. Update PID.
                         await TerminalService.CheckUserHasProcess(server.sysUser.username, server.gameVersion.searchScript, async (newPid) => {
                             await prisma.runningServers.update({
                                where: { id: server.id },
                                data: { pid: newPid }
                             });
                        });
                    } else {
                        // Truly Dead
                        console.log(`Server ${server.id} presumed online but PID ${server.pid} is missing. Initiating Recovery...`);
                        await this.handleServerCrash(server);
                    }
                } else if (isProcessRunning && server.startRetryCount > 0) {
                     // It is running fine, reset retry count if it was > 0
                     await prisma.runningServers.update({
                         where: { id: server.id },
                         data: { startRetryCount: 0 }
                     });
                }
            }

            // 5. Emit Stats
            if (this.io && Object.keys(stats).length > 0) {
                this.io.emit('resource_update', stats);
            }

        } catch (error) {
            console.error("MonitorService Poll Error:", error);
        }
    }

    async handleServerCrash(server) {
        try {
            const nextRetryCount = server.startRetryCount + 1;
            
            await prisma.runningServers.update({
                where: { id: server.id },
                data: { startRetryCount: nextRetryCount }
            });

            if (nextRetryCount <= 3) {
                console.log(`Crash detected for Server ${server.id}. Attempt ${nextRetryCount}/3. Queueing START.`);
                await QueueService.Enqueue(server.id, "START");
            } else {
                console.log(`Server ${server.id} failed to start 3 times. Waiting for Proxy to handle failover.`);
            }

        } catch (err) {
            console.error(`Failed to handle crash for server ${server.id}:`, err);
        }
    }

    async flushBuffer() {
        if (Date.now() - this.lastFlush < this.BUFFER_FLUSH_INTERVAL) return;
        
        if (this.buffer.length === 0) {
            this.lastFlush = Date.now();
            return;
        }

        console.log(`Flushing ${this.buffer.length} resource usage records to DB...`);
        
        try {
            const dataToInsert = [...this.buffer];
            this.buffer = []; 
            this.lastFlush = Date.now();

            await prisma.resourceUsage.createMany({
                data: dataToInsert
            });
            
            console.log("Resource buffer flushed successfully.");
        } catch (error) {
            console.error("Failed to flush resource buffer:", error);
        }
    }
}

export default new MonitorService();
