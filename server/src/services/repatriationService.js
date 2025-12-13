
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
            console.log(`Repatriating Server ${server.id} to Host ${targetHost.id}...`);

            // 1. Stop Server
            if (server.presumedStatus !== 'stopped') {
                 // Try stop
                 const status = await TerminalService.CheckUserHasProcess(server.sysUser.username, server.gameVersion.searchScript); 
                 if (status) {
                     TerminalService.StopUserProcesses(server.sysUser.username, server.gameVersion.searchScript);
                     await new Promise(r => setTimeout(r, 2000));
                 }
            }

             // B. Zip
             const zipResult = await TerminalService.ZipForTransfer(server);
             
             // C. Generate Token
             const copyToken = (await import("crypto")).randomBytes(30).toString("base64").replace(/[^a-zA-Z0-9]/g, "").slice(0, 30);
             await GameService.SetCopyToken(server.id, copyToken);

             // D. Send
             const protocol = targetHost.url.startsWith("http") ? "" : "http://";
             const stream = zipResult.stream;
             
             await axios.post(`${protocol}${targetHost.url}/Game/ReceiveServer/${server.id}/${copyToken}`, stream, {
                headers: {
                    "Content-Type": "application/octet-stream",
                    "X-filename": zipResult.name,
                    "API-Key": targetHost.apiKey,
                    "UserID": 1
                },
                maxBodyLength: Infinity
             });

             if (zipResult.path) TerminalService.DeleteFile(zipResult.path);

             // E. Update Database
             // Set `serverid` to targetHost.id
             // Keep `preferredHostId` as is (it's already targetHost.id)
             await prisma.runningServers.update({
                 where: { id: server.id },
                 data: { 
                     serverid: targetHost.id,
                     transfering: false,
                     presumedStatus: 'stopped' // It will be stopped on arrival until started
                 }
             });

             // F. Cleanup Local
             const dirName = `GameServer/${server.sysUser.username}`; // Reconstruct path or use server.path
             TerminalService.DeleteDir(server.path); 
             // TerminalService.DeleteUser(server.sysUser.username); // Optional: keep user or delete? Usually delete to clean up.
             
             // G. Start on Target?
             // Enqueue START on the new (now current) host.
             // Since we updated `serverid` in DB, a START queue item will be picked up by the target host.
             await QueueService.Enqueue(server.id, "START");

             console.log(`Server ${server.id} successfully repatriated to Host ${targetHost.id}.`);

        } catch (error) {
            console.error(`Failed to repatriate server ${server.id}:`, error);
        }
    }
}

export default new RepatriationService();
