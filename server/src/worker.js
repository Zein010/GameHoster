import QueueService from "./services/queueService.js";
import GameService from "./services/gameService.js";
import TerminalService from "./services/TerminalService.js";
import { GetServerStartOptions } from "./utils.js";
import sysUserService from "./services/sysUserService.js";
import FileService from "./services/fileService.js";
import ResourceService from "./services/resourceService.js";
import { prisma } from "../prisma.js";
import axios from "axios";
import path from "path";
import fs from "fs";

const SERVER_ID = parseInt(process.env.SERVER_ID);

const CheckResources = async (gameVersion) => {
    // Simplified resource check for current host
    const host = await prisma.server.findUnique({ where: { id: SERVER_ID } });
    const runningServers = await prisma.runningServers.findMany({
        where: { serverid: SERVER_ID, deleted: false },
        include: { gameVersion: true }
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

    return (availableRam >= gameVersion.requiredRam &&
            availableCpu >= gameVersion.requiredCpu &&
            availableStorage >= gameVersion.requiredStorage);
};

const ProcessQueueItem = async (item) => {
    try {
        await QueueService.UpdateStatus(item.id, "PROCESSING");
        console.log(`Processing queue item ${item.id} of type ${item.type}`);

        if (item.type === "START") {
            const server = item.server;
            
            // 1. Check if we need to Restore from Backup (Failover scenario)
            const dirName = path.resolve(server.path);
            if (!fs.existsSync(dirName)) {
                console.log(`Server directory missing for ${server.id}, checking backups...`);
                // Check backups
                const backupFile = path.resolve(`Backups/${server.sysUser.username}.zip`);
                if (fs.existsSync(backupFile)) {
                    console.log(`Restoring from backup: ${backupFile}`);
                    
                    // Clean directory first
                    console.log(`[RESTORE] Cleaning directory ${dirName} before restore...`);
                    TerminalService.DeleteDir(dirName);

                    TerminalService.CreateNewDirectory({ name: dirName });
                    await TerminalService.CreateUser(server.sysUser.username);
                    await sysUserService.StoreSysUser(server.sysUser.username);
                    
                    // Unzip
                    await FileService.Unzip(backupFile, dirName);
                    await TerminalService.OwnFile(dirName, server.sysUser.username);
                } else {
                    // New Server or Lost Cause?
                    // If it's a new server creation that failed? 
                    // But type is START. Proceed as usual, maybe it will fail later or user intended to just start.
                    // Or maybe we treat it as "needs setup"?
                    // For now, proceed.
                    console.log("No backup found. Proceeding with standard start sequence.");
                }
            }

            // 2. Resource Check & Smart Transfer
            // Only if this is NOT a just-created server (which would have passed resource check at creation)
            // But checking again is safer.
            const hasResources = await CheckResources(server.gameVersion);
            if (!hasResources) {
                console.log(`Insufficient resources on Host ${SERVER_ID}. Finding better host...`);
                const bestHost = await ResourceService.GetBestHost(server.gameVersion.id);
                
                if (bestHost && bestHost.id !== SERVER_ID) {
                    console.log(`Transferring server ${server.id} to Host ${bestHost.id}`);
                    
                    // Trigger MoveToHost Logic
                    // We can reuse the Controller logic or call it?
                    // Controller logic uses req/res. We need service logic.
                    // Reimplementing Move logic here using Service calls.
                    
                    // Stop if running (it shouldn't be if we are starting, but just in case)
                    // ...
                    
                    // Zip
                    const outputFile = await TerminalService.ZipForTransfer(server); // from GameServer/ or we just restored it?
                    
                    // Generate Copy Token
                    const copyToken = (await import("crypto")).randomBytes(30).toString("base64").replace(/[^a-zA-Z0-9]/g, "").slice(0, 30);
                    await GameService.SetCopyToken(server.id, copyToken);
                    
                    // Send
                    const protocol = bestHost.url.startsWith("http") ? "" : "http://";
                    try {
                        await axios.post(`${protocol}${bestHost.url}/Game/ReceiveServer/${server.id}/${copyToken}`, outputFile.stream, { 
                            headers: { 
                                "Content-Type": "application/octet-stream", 
                                "X-filename": outputFile.name, 
                                "API-Key": bestHost.apiKey, 
                                "UserID": 1 
                            }, 
                            maxBodyLength: Infinity 
                        });
                        
                        // Update Server Host ID in DB
                        // The ReceiveServer on target will create the server there.
                        // We need to update existing RunningServers record to point to new serverid (Host ID).
                        // Wait, AddRunningServer creates a NEW record usually? No, Move logic updates it?
                        // Controller MoveToHost: doesn't update serverid explicitly?
                        // Ah, ReceiveServer on target: creates folder, user...
                        // Who updates the DB `serverid` field?
                        // `GameController.MoveToHost` sets `transfering` status.
                        // It seems the original MoveToHost logic was incomplete regarding DB update?
                        // Or maybe `ReceiveServer` does it? No, `ReceiveServer` just unzips.
                        // We must update the DB to point to the new Host.
                        
                        await prisma.runningServers.update({
                            where: { id: parseInt(server.id) },
                            data: { serverid: bestHost.id, transfering: false }
                        });
                        
                        // Cleanup local?
                        TerminalService.DeleteDir(dirName);
                        // Also delete User? TerminalService.DeleteUser(server.sysUser.username);
                        
                        // Enqueue START on the new host?
                        // The user asked: "it should issue a transfer command... and started again"
                        // We can hit the Start endpoint on the new host or Enqueue a START task via DB.
                        // DB Queue is global? `serverQueue` table has `serverId`.
                        // But QueueWorker filters by `process.env.SERVER_ID`.
                        // So if we Enqueue START for this server, and we changed `serverid` (Host ID) in `RunningServers` table...
                        // Does `serverQueue` link to `RunningServers`? Yes.
                        // Does `GetNextPending` filter by `RunningServers.serverid`?
                        // Yes: `where: { server: { serverid: parseInt(process.env.SERVER_ID) } }`
                        // So if we update `RunningServers.serverid`, the NEW host will pick up the task!
                        
                        await QueueService.Enqueue(parseInt(server.id), "START"); // This will be picked up by the new host
                        await QueueService.UpdateStatus(parseInt(item.id), "COMPLETED", `Transferred to Host ${bestHost.id}`);
                        return; // Done with this task on this host.

                    } catch (transferErr) {
                        console.error("Transfer failed:", transferErr);
                        throw new Error("Transfer to best host failed: " + transferErr.message);
                    }
                } else {
                    console.warn("No better host found or current is best. Attempting to start anyway (might fail).");
                }
            }

            const config = GetServerStartOptions(server.gameVersion, "restart");
            const SetupCorrectly = TerminalService.SetupServerConfigForRestart(path.resolve(server.path), server.gameVersion.changeFileAfterSetup, config);
            if (!SetupCorrectly) {
                throw new Error("Failed to setup server config");
            }

            await GameService.AppendToServerConfig(server.id, config);

            if (server.gameVersion.service) {
                await TerminalService.StartService(`${server.sysUser.username}.service`);
            } else {
                await TerminalService.StartCreatedServer(server);
            }

            await new Promise(resolve => setTimeout(resolve, 3000));
            let pid = 0;
            await TerminalService.CheckUserHasProcess(server.sysUser.username, server.gameVersion.searchScript, async (p) => { pid = p; });


            await prisma.runningServers.update({ where: { id: parseInt(server.id) }, data: { presumedStatus: "online", pid: pid } });
            await QueueService.UpdateStatus(parseInt(item.id), "COMPLETED", "Server started successfully");
            
        } else if (item.type === "BACKUP") {
            const server = item.server;
            console.log(`Backing up server ${server.id}`);
            
            // 1. Identify Neighbors
            const hosts = await prisma.server.findMany({ 
                where: { deleted: false, status: "online" },
                orderBy: { id: 'asc' }
            });
            
            if (hosts.length < 2) {
                console.log("Not enough hosts for redundancy. Skipping backup.");
                await QueueService.UpdateStatus(item.id, "COMPLETED", "Skipped: Not enough hosts");
                return;
            }

            const currentIndex = hosts.findIndex(h => h.id === SERVER_ID);
            const prevHost = hosts[(currentIndex - 1 + hosts.length) % hosts.length];
            const nextHost = hosts[(currentIndex + 1) % hosts.length];
            const neighbors = [prevHost, nextHost].filter(h => h.id !== SERVER_ID);
            const uniqueNeighbors = [...new Map(neighbors.map(item => [item['id'], item])).values()]; // Deduplicate if only 2 hosts total

            // 2. Zip
            const zipResult = await TerminalService.ZipForTransfer(server);
            const zipPath = path.resolve(`TempForTransfer/${zipResult.name}`);
            
            // 3. Generate Copy Token for Authentication
            const copyToken = (await import("crypto")).randomBytes(30).toString("base64").replace(/[^a-zA-Z0-9]/g, "").slice(0, 30);
            await prisma.runningServers.update({
                where: { id: parseInt(server.id) },
                data: { copyToken: copyToken }
            });

            // 4. Send
            for (const host of uniqueNeighbors) {
                console.log(`Sending backup to Host ${host.id} (${host.url})`);
                const protocol = host.url.startsWith("http") ? "" : "http://";
                
                // Pre-flight Check: Ensure host is reachable
                try {
                    await axios.get(`${protocol}${host.url}/Game`, { 
                        timeout: 2000,
                        headers: { 
                           "API-Key": host.apiKey,
                           "UserID": 1
                        }
                    });
                } catch (checkErr) {
                    console.warn(`Host ${host.id} appears to be down (Unreachable). Skipping backup send.`);
                    continue; 
                }

                try {
                    // Create fresh stream for each request
                    const stream = fs.createReadStream(zipPath);
                    await axios.post(`${protocol}${host.url}/Game/ReceiveBackup/${server.id}/${copyToken}`, stream, {
                        headers: { 
                            "Content-Type": "application/octet-stream", 
                            "X-filename": `${server.sysUser.username}.zip`, 
                            "API-Key": host.apiKey,
                            "UserID": 1
                        },
                        maxBodyLength: Infinity
                    });

                    // Record Backup Success
                    await prisma.serverBackup.create({
                        data: {
                            runningServerId: parseInt(server.id),
                            hostId: parseInt(host.id)
                        }
                    });

                } catch (err) {
                    console.error(`Failed to send backup to Host ${host.id}:`, err.message);
                }
            }
            
            // Cleanup Zip
            fs.unlinkSync(zipPath);
            
            await QueueService.UpdateStatus(item.id, "COMPLETED", "Backup completed");

        } else if (item.type === "CREATE") {
            const server = item.server;
            const gameVersion = server.gameVersion;
            const config = GetServerStartOptions(gameVersion, "start");
            const dirName = path.resolve(server.path);
            const username = server.sysUser.username;

            console.log(`Creating server ${server.id} on host ${process.env.SERVER_ID}`);

            TerminalService.CreateNewDirectory({ name: dirName });
            await TerminalService.CreateUser(username);
            await sysUserService.StoreSysUser(username);

            let scriptFile = "";
            if (gameVersion.cacheFile && JSON.parse(gameVersion.cacheFile)[process.env.SERVER_ID]) {
                console.log("Copying file from cache");
                await TerminalService.CopyFile(JSON.parse(gameVersion.cacheFile)[process.env.SERVER_ID], dirName).catch((err) => console.log(err));
                scriptFile = gameVersion.scriptFile;
            } else {
                if (gameVersion.downloadLink) {
                    scriptFile = TerminalService.DownloadServerData(gameVersion.downloadLink, dirName);
                }
                if (gameVersion.installScript) {
                    await TerminalService.DownloadServerDataByScript(gameVersion.installScript, dirName);
                    scriptFile = gameVersion.scriptFile;
                }
                // Cache logic:
                await TerminalService.CacheFile(dirName, `${gameVersion.game.name}/${gameVersion.id}`);
                await GameService.SetGameVersionCache(gameVersion.id, `DownloadCache/${gameVersion.game.name}/${gameVersion.id}`);
            }
            await GameService.SetScriptFile(server.id, scriptFile);
            server.scriptFile = scriptFile;

            console.log("Setting up required files");
            TerminalService.SetupRequiredFiles(dirName, gameVersion.getFilesSetup);
            await TerminalService.OwnFile(dirName, username);

            await TerminalService.SetupServerAfterStart(dirName, gameVersion.changeFileAfterSetup, config);
            console.log("Owning new Files");
            await TerminalService.OwnFile(dirName, username);

            // Append config to server record
            await GameService.AppendToServerConfig(server.id, config);

            if (gameVersion.service) {
                TerminalService.CreateService(username, dirName, gameVersion.service); 
                TerminalService.StartService(`${username}.service`);
            } else {
                console.log("Starting created server");
                TerminalService.StartCreatedServer(server);
            }

            await new Promise(resolve => setTimeout(resolve, 3000));
            let pid = 0;
            await TerminalService.CheckUserHasProcess(username, gameVersion.searchScript, async (p) => { pid = p; });
            await prisma.runningServers.update({ where: { id: server.id }, data: { presumedStatus: "online", pid: pid, preferredHostId: SERVER_ID } });
            await QueueService.UpdateStatus(item.id, "COMPLETED", "Server created and started successfully");
        } else if (item.type === "STOP") {
            const server = item.server;
            console.log(`Stopping server ${server.id}`);
            const status = await TerminalService.CheckUserHasProcess(server.sysUser.username, server.gameVersion.searchScript);
            if (status) {
                TerminalService.StopUserProcesses(server.sysUser.username, server.gameVersion.searchScript);
                await new Promise(resolve => setTimeout(resolve, 1000)); // Give it a moment to die
            }
            await prisma.runningServers.update({ where: { id: parseInt(server.id) }, data: { presumedStatus: "stopped" } });
            await QueueService.UpdateStatus(parseInt(item.id), "COMPLETED", "Server stopped successfully");
        } else if (item.type === "RESTART") {
            const server = item.server;
            console.log(`Restarting server ${server.id}`);

            // STOP logic
            const status = await TerminalService.CheckUserHasProcess(server.sysUser.username, server.gameVersion.searchScript);
            if (status) {
                TerminalService.StopUserProcesses(server.sysUser.username, server.gameVersion.searchScript);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            // START logic 
            // We can reuse the "START" type handling? Or copy-paste?
            // "START" logic above now has Restore & Resource Check logic.
            // RESTART should probably have it too if it was migrated?
            // But RESTART usually implies it's already here.
            // If it was migrated, `serverid` would be different, so WE wouldn't pick it up unless we are the target.
            // If we are the target, it depends on what we enqueue.
            // Usually we enqueue START.
            // But if user clicks "Restart", it enqueues RESTART.
            // If we need to "Smart Restart", we should probably copy logic.
            // For now, let's keep RESTART simple (local restart).
            
            const config = GetServerStartOptions(server.gameVersion, "restart");
            const SetupCorrectly = TerminalService.SetupServerConfigForRestart(server.path, server.gameVersion.changeFileAfterSetup, config);
            if (!SetupCorrectly) {
                throw new Error("Failed to setup server config");
            }
            await GameService.AppendToServerConfig(server.id, config);

            if (server.gameVersion.service) {
                await TerminalService.StartService(`${server.sysUser.username}.service`);
            } else {
                await TerminalService.StartCreatedServer(server);
            }

            await new Promise(resolve => setTimeout(resolve, 3000));
            let pid = 0;
            await TerminalService.CheckUserHasProcess(server.sysUser.username, server.gameVersion.searchScript, async (p) => { pid = p; });

            await prisma.runningServers.update({ where: { id: parseInt(server.id) }, data: { presumedStatus: "online", pid: pid } });
            await QueueService.UpdateStatus(parseInt(item.id), "COMPLETED", "Server restarted successfully");
            await prisma.runningServers.update({ where: { id: parseInt(server.id) }, data: { presumedStatus: "online", pid: pid } });
            await QueueService.UpdateStatus(parseInt(item.id), "COMPLETED", "Server restarted successfully");
        } else if (item.type === "TRANSFER") {
            const server = item.server;
            const targetHostId = item.payload.targetHostId;
            console.log(`Transferring server ${server.id} to Host ${targetHostId}`);
            console.log(`[TRANSFER] Server DB Path: ${server.path}, Username: ${server.sysUser ? server.sysUser.username : 'N/A'}`);

            const targetHost = await prisma.server.findUnique({ where: { id: targetHostId } });
            if (!targetHost) {
                throw new Error(`Target host ${targetHostId} not found`);
            }

            // 1. Stop Server
            console.log(`[TRANSFER] Stopping server ${server.id}...`);
            const status = await TerminalService.CheckUserHasProcess(server.sysUser.username, server.gameVersion.searchScript);
            if (status) {
                TerminalService.StopUserProcesses(server.sysUser.username, server.gameVersion.searchScript);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            // 2. Zip
            console.log(`[TRANSFER] Zipping server ${server.id} data...`);
            const outputFile = await TerminalService.ZipForTransfer(server);
            console.log(`[TRANSFER] Zip created: ${outputFile.name}`);

            // 3. Generate Token
            const copyToken = (await import("crypto")).randomBytes(30).toString("base64").replace(/[^a-zA-Z0-9]/g, "").slice(0, 30);
            await GameService.SetCopyToken(server.id, copyToken);

            // 4. Send
            const protocol = targetHost.url.startsWith("http") ? "" : "http://";
            console.log(`[TRANSFER] Sending zip to ${targetHost.url}...`);
            try {
                await axios.post(`${protocol}${targetHost.url}/Game/ReceiveServer/${server.id}/${copyToken}`, outputFile.stream, {
                    headers: {
                        "Content-Type": "application/octet-stream",
                        "X-filename": outputFile.name,
                        "API-Key": targetHost.apiKey,
                        "UserID": 1
                    },
                    maxBodyLength: Infinity
                });
                console.log(`[TRANSFER] File sent successfully to ${targetHost.id}`);

                // 5. Cleanup Zip
                if (outputFile.path) TerminalService.DeleteFile(outputFile.path);

                // 6. Update Database
                console.log(`[TRANSFER] Updating database records...`);
                await prisma.runningServers.update({
                    where: { id: parseInt(server.id) },
                    data: {
                        serverid: targetHost.id,
                        transfering: false,
                        presumedStatus: 'stopped'
                    }
                });

                // 7. Cleanup Local Directory
                console.log(`[TRANSFER] Cleaning up local files...`);
                const dirName = path.resolve(server.path);
                TerminalService.DeleteDir(dirName);

                // 8. Enqueue START on new host
                console.log(`[TRANSFER] Enqueuing START task on target host...`);
                await QueueService.Enqueue(parseInt(server.id), "START");
                
                await QueueService.UpdateStatus(parseInt(item.id), "COMPLETED", `Transferred to Host ${targetHost.id}`);
                console.log(`[TRANSFER] Transfer complete for server ${server.id}`);

            } catch (err) {
                console.error(`[TRANSFER] Error during transfer execution:`, err.message);
                // Cleanup Zip on failure
                if (outputFile.path) TerminalService.DeleteFile(outputFile.path);

                // Reset transfering status
                await prisma.runningServers.update({
                    where: { id: parseInt(server.id) },
                    data: { transfering: false }
                });

                throw err;
            }
        }

    } catch (err) {
        console.error(`Queue item ${item.id} failed:`, err);
        await QueueService.UpdateStatus(item.id, "FAILED", err.message);
    }
};

const WorkerLoop = async () => {
    console.log("Worker started");
    while (true) { 
        try {
            const item = await QueueService.GetNextPending();
            if (item) {
                await ProcessQueueItem(item);
            } else {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        } catch (err) {
            console.error("Worker loop error:", err);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
};

export default WorkerLoop;
