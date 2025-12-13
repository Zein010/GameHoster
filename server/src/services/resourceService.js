
import { prisma } from "../../prisma.js";
import GameService from "./gameService.js";
import axios from 'axios';


const ResourceService = {
    GetBestHost: async (gameVersionId) => {
        const gameVersion = await GameService.GetVersion(gameVersionId);
        if (!gameVersion) throw new Error("Game version not found");

        const hosts = await prisma.server.findMany({ where: { deleted: false } });

        // Calculate available resources for each host
        const candidates = [];

        for (const host of hosts) {
            // check online status (basic ping)
            // Assuming host.url is reachable from here. If it's internal IP, good.
            try {
                // A simple health check point would be ideal, using existing CheckServer route or a new one?
                // For now, let's assume if we can list processes or servers, it's alive. 
                // Using a light-weight endpoint if possible. 
                // Since we don't have a dedicated health endpoint, well assume it's alive if we can fetch something small, 
                // or just skip ping for now and rely on logic? 
                // USER REQUEST: "it will ping each server, confirm if it is online"
                // Let's try a simple GET to root or a known endpoint
                // Actually, host.url might not have http protocol, schema says "domain:port"
                const protocol = host.url.startsWith("http") ? "" : "http://";
                await axios.get(`${protocol}${host.url}/Ping`, { timeout: 2000 }); // Assuming a Ping endpoint or handling 404 as "online"
            } catch (err) {
                if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
                    console.log(`Host ${host.id} is offline.`);
                    continue;
                }
                // Other errors might mean it's online but endpoint missing, which is fine for "online"
            }

            // Calculate used resources
            // We need to sum up requirements of all active servers on this host
            const runningServers = await prisma.runningServers.findMany({
                where: {
                    serverid: host.id,
                    deleted: false,
                    presumedStatus: "online"
                },
                include: {
                    gameVersion: true
                }
            });

            let usedRam = 0;
            let usedCpu = 0;
            let usedStorage = 0;

            for (const server of runningServers) {
                usedRam += server.gameVersion.requiredRam;
                usedCpu += server.gameVersion.requiredCpu;
                usedStorage += server.gameVersion.requiredStorage;
            }

            const availableRam = host.ram - usedRam;
            const availableCpu = host.cpu - usedCpu;
            const availableStorage = host.storage - usedStorage;

            if (availableRam >= gameVersion.requiredRam &&
                availableCpu >= gameVersion.requiredCpu &&
                availableStorage >= gameVersion.requiredStorage) {

                candidates.push({
                    host,
                    availableRam,
                    availableCpu,
                    availableStorage,
                    totalAvailableFactor: availableRam + availableCpu + availableStorage // Simplified factor
                });
            }
        }

        if (candidates.length === 0) return null;

        // Sort: Priority (Desc) -> Available Resources (Desc)
        candidates.sort((a, b) => {
            if (b.host.priority !== a.host.priority) {
                return b.host.priority - a.host.priority;
            }
            // "one with the most available resources will be chosen"
            // We can resolve this logic to be Sum of available or specific resource. 
            // Let's use the sum factor for now.
            return b.totalAvailableFactor - a.totalAvailableFactor;
        });

        return candidates[0].host;
    }
}

export default ResourceService;
