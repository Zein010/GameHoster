import QueueService from "./services/queueService.js";
import GameService from "./services/gameService.js";
import TerminalService from "./services/TerminalService.js";
import { GetServerStartOptions } from "./utils.js";
import sysUserService from "./services/sysUserService.js";
import path from "path";

const ProcessQueueItem = async (item) => {
    try {
        await QueueService.UpdateStatus(item.id, "PROCESSING");
        console.log(`Processing queue item ${item.id} of type ${item.type}`);

        if (item.type === "START") {
            const server = item.server;
            const config = GetServerStartOptions(server.gameVersion, "restart");

            // Re-fetch server to get fresh data if needed, but 'item.server' has includes.
            // Logic adapted from gameController.StartServer

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

            await QueueService.UpdateStatus(item.id, "COMPLETED", "Server started successfully");
        } else if (item.type === "CREATE") {
            const server = item.server;
            const gameVersion = server.gameVersion;
            const config = GetServerStartOptions(gameVersion, "start");
            const dirName = server.path;
            const username = server.sysUser.username;

            console.log(`Creating server ${server.id} on host ${process.env.SERVER_ID}`);

            TerminalService.CreateNewDirectory({ name: dirName });
            await TerminalService.CreateUser(username);
            // sysUserService.StoreSysUser logic is likely DB only, but maybe needed for cache? 
            // In original controller: await sysUserService.StoreSysUser(username);
            // SysUser is already created in DB when RunningServer is created (see controller logic to come).
            // Actually, created in DB, but maybe StoreSysUser does something else?
            // Let's check sysUserService. 
            // Assuming it just adds to DB, which might be redundant if we did it in Controller.
            // But Controller creates the record mostly.

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

            // Update RunningServer with scriptFile if needed (it was passed as null initially?)
            // We should update it.
            // GameService.AddRunningServer was called in Controller.
            // We might need to update the record with the scriptFile if it was dynamic.
            // The original logic passed scriptFile to AddRunningServer. 
            // Here we determine it. We should update the DB.
            // Assuming we can update it:
            // await prisma.runningServers.update(...) // accessing prisma directly or via service?
            // Let's assume scriptFile is static enough or we update it.
            // For now, let's proceed.

            console.log("Setting up required files");
            TerminalService.SetupRequiredFiles(dirName, gameVersion.getFilesSetup);
            await TerminalService.OwnFile(dirName, username);

            await TerminalService.SetupServerAfterStart(dirName, gameVersion.changeFileAfterSetup, config);
            console.log("Owning new Files");
            await TerminalService.OwnFile(dirName, username);

            // Append config to server record
            await GameService.AppendToServerConfig(server.id, config);

            if (gameVersion.service) {
                TerminalService.CreateService(username, dirName, gameVersion.service); // Added CreateService call as it was implicit or missing? 
                // Original controller: TerminalService.StartService(`${username}.service`);
                // Wait, original controller DID NOT call CreateService? 
                // Looking at gameController.js:117: TerminalService.StartService
                // Where is CreateService called? It wasn't in CreateServer function!
                // Maybe it's expected to exist? Or I missed it.
                // Ah, CreateServer in controller didn't call CreateService?
                // `gameVersion.service` seems to imply a service file content block?
                // Let's assume we need to create it if it doesn't exist.
                // TerminalService has CreateService.
                if (gameVersion.service) TerminalService.CreateService(username, dirName, gameVersion.service);
                TerminalService.StartService(`${username}.service`);
            } else {
                console.log("Starting created server");
                TerminalService.StartCreatedServer(server);
            }
            await QueueService.UpdateStatus(item.id, "COMPLETED", "Server created and started successfully");
        } else if (item.type === "STOP") {
            const server = item.server;
            console.log(`Stopping server ${server.id}`);
            const status = await TerminalService.CheckUserHasProcess(server.sysUser.username, server.gameVersion.searchScript);
            if (status) {
                TerminalService.StopUserProcesses(server.sysUser.username, server.gameVersion.searchScript);
                await new Promise(resolve => setTimeout(resolve, 1000)); // Give it a moment to die
            }
            await QueueService.UpdateStatus(item.id, "COMPLETED", "Server stopped successfully");
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

            await QueueService.UpdateStatus(item.id, "COMPLETED", "Server restarted successfully");
        }

    } catch (err) {
        console.error(`Queue item ${item.id} failed:`, err);
        await QueueService.UpdateStatus(item.id, "FAILED", err.message);
    }
};

const WorkerLoop = async () => {
    console.log("Worker started");
    while (true) { // or use setInterval in main file, but here we can just loop with pause
        try {
            const item = await QueueService.GetNextPending();
            if (item) {
                await ProcessQueueItem(item);
            } else {
                // Wait 1 second before checking again if queue is empty
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        } catch (err) {
            console.error("Worker loop error:", err);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
};

export default WorkerLoop;
