
import { prisma } from "../../prisma.js";
import TerminalService from "./TerminalService.js";
import axios from "axios";
import GameService from "./gameService.js";
import QueueService from "./queueService.js";

class RepatriationService {
    constructor() {
        this.CHECK_INTERVAL = 60000; // 1 Minute
        this.startLoop();
    }

    startLoop() {
        setInterval(() => this.checkRepatriation(), this.CHECK_INTERVAL);
    }

    async checkRepatriation() {
        try {
            const serverId = parseInt(process.env.SERVER_ID);
            
            // Find displaced servers:
            // hosted on THIS server (serverid == SERVER_ID)
            // BUT preferred host is DIFFERENT (preferredHostId != SERVER_ID)
            const displacedServers = await prisma.runningServers.findMany({
                where: {
                    serverid: serverId,
                    deleted: false,
                    transfering: false,
                    preferredHostId: {
                        not: null,
                        not: serverId
                    }
                },
                include: {
                    preferredHost: true,
                    sysUser: true,
                    gameVersion: true
                }
            });

            if (displacedServers.length === 0) return;

            console.log(`Found ${displacedServers.length} displaced servers. Checking preferred hosts...`);

            for (const server of displacedServers) {
                const targetHost = server.preferredHost;
                if (!targetHost) continue;

                if (await this.isHostOnline(targetHost)) {
                    // Check Resources
                    if (await this.hasResources(targetHost, server.gameVersion)) {
                        console.log(`Preferred host ${targetHost.id} for server ${server.id} is ONLINE and HAS RESOURCES. Initiating repatriation...`);
                        await this.repatriateServer(server, targetHost);
                    } else {
                        console.log(`Preferred host ${targetHost.id} is ONLINE but LACKS RESOURCES for server ${server.id}.`);
                    }
                } else {
                    console.log(`Preferred host ${targetHost.id} for server ${server.id} is still OFFLINE.`);
                }
            }

        } catch (error) {
            console.error("Repatriation Check Error:", error);
        }
    }

    async hasResources(host, gameVersion) {
        try {
            // Find running servers on the target host to calculate current load
            // We assume 'presumedStatus: online' generally implies resource consumption
            const runningServers = await prisma.runningServers.findMany({
                where: { 
                    serverid: host.id, // target host
                    deleted: false, 
                    presumedStatus: "online" 
                },
                include: { gameVersion: true }
            });

            let usedRam = 0;
            let usedCpu = 0;
            let usedStorage = 0;

            for (const s of runningServers) {
                usedRam += s.gameVersion.requiredRam;
                usedCpu += s.gameVersion.requiredCpu;
                usedStorage += s.gameVersion.requiredStorage;
            }

            const availableRam = host.ram - usedRam;
            const availableCpu = host.cpu - usedCpu;
            const availableStorage = host.storage - usedStorage;
            
            // console.log(`[ResourceCheck] Host ${host.id} - RAM: ${availableRam}/${gameVersion.requiredRam}, CPU: ${availableCpu}/${gameVersion.requiredCpu}`);

            return (availableRam >= gameVersion.requiredRam &&
                    availableCpu >= gameVersion.requiredCpu &&
                    availableStorage >= gameVersion.requiredStorage);

        } catch (err) {
            console.error(`Error checking resources for Host ${host.id}:`, err);
            return false; // Fail safe
        }
    }

    async isHostOnline(host) {
        try {
            const protocol = host.url.startsWith("http") ? "" : "http://";
            await axios.get(`${protocol}${host.url}/Game/Status`, {
                timeout: 2000,
                headers: {
                    "API-Key": host.apiKey,
                    "UserID": 1
                }
            });
            return true;
        } catch (error) {
            console.error(`isHostOnline check failed for ${host.url}:`, error.message);
            if (error.response) console.error("Response status:", error.response.status);
            return false;
        }
    }

    async repatriateServer(server, targetHost) {
        try {
            console.log(`Enqueuing TRANSFER for Server ${server.id} to Host ${targetHost.id}...`);
            await prisma.runningServers.update({
                where: { id: server.id },
                data: { transfering: true }
            });
            await QueueService.Enqueue(server.id, "TRANSFER", { targetHostId: targetHost.id });
        } catch (error) {
            console.error(`Failed to enqueue repatriation for server ${server.id}:`, error);
            // Revert transfer status if enqueue failed
            await prisma.runningServers.update({
                where: { id: server.id },
                data: { transfering: false }
            });
        }
    }
}

export default new RepatriationService();
