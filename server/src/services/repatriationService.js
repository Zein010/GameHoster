
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
                    console.log(`Preferred host ${targetHost.id} for server ${server.id} is ONLINE. Initiating repatriation...`);
                    await this.repatriateServer(server, targetHost);
                } else {
                    console.log(`Preferred host ${targetHost.id} for server ${server.id} is still OFFLINE.`);
                }
            }

        } catch (error) {
            console.error("Repatriation Check Error:", error);
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
