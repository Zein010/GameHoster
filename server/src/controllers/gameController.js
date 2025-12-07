import GameService from "../services/gameService.js";
import TerminalService from "../services/TerminalService.js";
import sysUserService from "../services/sysUserService.js";
import { GetServerStartOptions } from "../utils.js";
import RCONService from "../services/RCONService.js";
import { Role } from "@prisma/client";
import HostService from "../services/hostService.js";
import crypto from "crypto";
import { exec, execSync } from "child_process";
import path from "path";
import axios from "axios";
import fs from "fs";
import FileService from "../services/fileService.js";
const GetAll = async (req, res) => {
    const data = await GameService.GetAll();
    res.json({ data });
}
const Get = async (req, res) => {
    const { id } = req.params
    const data = await GameService.Get(parseInt(id));

    res.json({ data });
}
const GetVersion = async (req, res) => {
    const { id } = req.params
    const data = await GameService.GetVersion(parseInt(id));
    res.json({ data });
}
const GetVersions = async (req, res) => {
    const { gameId } = req.params
    const data = await GameService.GetVersions(parseInt(gameId));
    res.json({ data });
}
const GetServers = async (req, res) => {
    const data = await GameService.GetServers(req.user.role == Role.ADMIN ? null : { userId: req.user.id });
    res.json({ data });
}
const GetServer = async (req, res) => {
    const { id } = req.params
    const data = await GameService.GetServer(parseInt(id));
    res.json({ data });
}
const StartServer = async (req, res) => {
    const { id } = req.params
    const server = await GameService.GetServer(parseInt(id))
    if (!server)
        return res.status(400).json({ msg: "Invalid server id" });

    // New Queue Logic
    try {
        const queueItem = await import("../services/queueService.js").then(m => m.default.Enqueue(server.id, "START"));
        res.json({ msg: "Server start request queued", queueId: queueItem.id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Failed to queue start request" });
    }
}

const GetQueueStatus = async (req, res) => {
    const { id } = req.params;
    try {
        const item = await import("../services/queueService.js").then(m => m.default.GetQueueItem(id));
        if (!item) return res.status(404).json({ msg: "Queue item not found" });
        res.json({ status: item.status, logs: item.logs });
    } catch (err) {
        res.status(500).json({ msg: "Error fetching queue status" });
    }
}
const DisplayLog = async (req, res) => {
    const { serverId } = req.params;
    const server = await GameService.GetServer(Number(serverId));
    RCONService.ConnectToServer(server.config.startData[server.config.startData.length - 1].rport, server.config.startData[server.config.startData.length - 1].rpassword)
    TerminalService.DisplayUserLog(server.path);
    res.json({ msg: "try now" });
}
const CreateServer = async (req, res) => {
    const { versionId } = req.params
    const gameVersion = await GameService.GetVersion(parseInt(versionId))

    // Select Best Host
    const host = await import("../services/resourceService.js").then(m => m.default.GetBestHost(gameVersion.id));
    if (!host) {
        return res.status(503).json({ msg: "No available host found for this server type" });
    }

    const rand = parseInt((Math.random() * 10000) % 10000);
    const dirName = `GameServer/${gameVersion.game.dirName}-${rand}`;
    const username = `${gameVersion.game.dirName}-${rand}`;

    // Create DB Records (Deferred execution)
    // Note: We create SysUser entry here in DB? 
    // In original code: await TerminalService.CreateUser(username) -> creates system user.
    // await sysUserService.StoreSysUser(username) -> stores in DB.
    // We can store in DB now, assuming the worker will create the system user later.
    await sysUserService.StoreSysUser(username);

    // Add RunningServer linked to the selected Host
    console.log(`Assigning new server to host ${host.id}`);
    const serverDetails = await GameService.AddRunningServer(dirName, username, gameVersion.id, null, host.id);

    // Enqueue CREATE task
    try {
        const queueItem = await import("../services/queueService.js").then(m => m.default.Enqueue(serverDetails.id, "CREATE"));
        res.json({ msg: "Server creation queued", queueId: queueItem.id, config: {} });
    } catch (err) {
        console.error(err);
        // Rollback? ideally yes, but for now just fail.
        res.status(500).json({ msg: "Failed to queue creation request" });
    }
}
const CheckServerRunning = async (req, res) => {
    const { serverId } = req.params

    const server = await GameService.GetServer(Number(serverId));
    if (!server) {
        return res.status(404).json({ "msg": "Server not found" })
    }
    const status = await TerminalService.CheckUserHasProcess(server.sysUser.username, server.gameVersion.searchScript);
    res.json({ status, gameVersion: server.gameVersion, config: server.config&&server.config.startData.length > 0 ? server.config.startData[server.config.startData.length - 1] : {} });
}
const StopServer = async (req, res) => {
    const { serverId } = req.params
    const server = await GameService.GetServer(Number(serverId));
    if (!server) {
        return res.status(404).json({ "msg": "Server not found" })
    }

    try {
        const queueItem = await import("../services/queueService.js").then(m => m.default.Enqueue(server.id, "STOP"));
        res.json({ msg: "Server stop request queued", queueId: queueItem.id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Failed to queue stop request" });
    }
}

const RestartServer = async (req, res) => {
    const { serverId } = req.params
    const server = await GameService.GetServer(Number(serverId));
    if (!server) {
        return res.status(404).json({ "msg": "Server not found" })
    }

    try {
        const queueItem = await import("../services/queueService.js").then(m => m.default.Enqueue(server.id, "RESTART"));
        res.json({ msg: "Server restart request queued", queueId: queueItem.id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Failed to queue restart request" });
    }
}
const OneCommand = async (req, res) => {
    const { command } = req.body
    const { serverId } = req.params
    const output = await TerminalService.OneCommand(serverId, command)
    res.json({ output });
}
const GetPlayers = async (req, res) => {
    const { serverId } = req.params
    const output = await TerminalService.OneCommand(serverId, "/list uuids")
    res.json({ output });
}
const GetBannedPlayers = async (req, res) => {
    const { serverId } = req.params
    const output = await TerminalService.GetBannedPlayers(serverId)
    res.json({ output });
}
const DEOPPlayer = async (req, res) => {
    const { playerName } = req.body
    const { serverId } = req.params
    const output = await TerminalService.OneCommand(serverId, `/deop ${playerName}`)
    res.json({ output });
}
const OPPlayer = async (req, res) => {
    const { playerName } = req.body
    const { serverId } = req.params
    const output = await TerminalService.OneCommand(serverId, `/op ${playerName}`)
    res.json({ output });
}
const KickPlayer = async (req, res) => {
    const { playerName } = req.body
    const { serverId } = req.params
    const output = await TerminalService.OneCommand(serverId, `/kick ${playerName}`)
    res.json({ output });
}
const UnBanPlayer = async (req, res) => {
    const { playerName } = req.body
    const { serverId } = req.params
    const output = await TerminalService.OneCommand(serverId, `/pardon ${playerName}`)
    res.json({ output });
}
const BanPlayer = async (req, res) => {
    const { playerName } = req.body
    const { serverId } = req.params
    const output = await TerminalService.OneCommand(serverId, `/ban ${playerName}`)
    res.json({ output });
}
const GetLog = async (req, res) => {
    const { serverId } = req.params
    const server = await GameService.GetServer(Number(serverId));
    const output = TerminalService.GetLog(server.path);

    res.json({ output });
}
const MoveToHost = async (req, res) => {
    const { serverId, hostId } = req.params;

    const host = await HostService.GetHost(hostId);
    const gameServer = await GameService.GetServer(serverId);
    if (!gameServer.serverid == process.env.SERVER_ID) {
        return res.status(403).json({ msg: "Server is already moved to a different host" });
    }
    // stop the server before copying
    const status = await TerminalService.CheckUserHasProcess(gameServer.sysUser.username, gameServer.gameVersion.searchScript);
    if (status) {
        TerminalService.StopUserProcesses(gameServer.sysUser.username, gameServer.gameVersion.searchScript);
    }
    // set server status to transfering
    GameService.SetServerTransferingStatus(serverId, true);
    const copyToken = crypto.randomBytes(30).toString("base64").replace(/[^a-zA-Z0-9]/g, "").slice(0, 30);
    await GameService.SetCopyToken(serverId, copyToken);
    const outputFile = await TerminalService.ZipForTransfer(gameServer)
    try {

        await axios.post(`http://${host.url}/Game/ReceiveServer/${serverId}/${copyToken}`, outputFile.stream, { headers: { "Content-Type": "application/octet-stream", "X-filename": outputFile.name, "API-Key": host.apiKey, "UserID": req.user.id }, maxBodyLength: Infinity, });
        res.status(200).json({ msg: "Server moved successfully" });
    } catch (err) {
        res.status(500).json({ msg: "Something went wrong, server not moved" + err });
    }
}
const ReceiveGameServer = async (req, res) => {
    const filename = req.headers["x-filename"];
    const { serverId, copyToken } = req.params
    const gameServer = await GameService.GetServer(serverId);
    if (gameServer.copyToken != copyToken) {
        console.log("Invalid copy token");
        return res.status(403).json({ error: "Invalid copy token" });
    }


    const filePath = path.resolve(`TempForReceive/${filename}`);

    if (!fs.existsSync(path.resolve("TempForReceive"))) {
        fs.mkdirSync(path.resolve("TempForReceive"), { recursive: true });
    }
    const writeStream = fs.createWriteStream(filePath);
    req.pipe(writeStream);
    writeStream.on("error", (err) => {
        console.error(err);
        console.log(err.message);
        res.status(500).send({ success: false, error: err.message });
    });
    writeStream.on("finish", async () => {

        const dirName = `GameServer/${gameServer.sysUser.username}`;
        const username = `${gameServer.sysUser.username}`;
        TerminalService.CreateNewDirectory({ name: dirName })
        await TerminalService.CreateUser(username);
        await sysUserService.StoreSysUser(username);
        // // the file is zip and needs to be unziped
        await FileService.Move(filePath, dirName);
        await FileService.Unzip(path.resolve(path.join(dirName, filename)));
        await TerminalService.OwnFile(path.resolve(dirName), username);
    });
}

    const ReceiveBackup = async (req, res) => {
    const filename = req.headers["x-filename"];
    const { serverId, copyToken } = req.params;

    // Verify token (reusing logic or simplified for backup?)
    // For now assuming same token logic: server.copyToken matches
    const gameServer = await GameService.GetServer(serverId);
    if (!gameServer || gameServer.copyToken != copyToken) {
        console.log("Invalid copy token for backup");
        return res.status(403).json({ error: "Invalid or expired backup token" });
    }

    const backupDir = path.resolve("Backups");
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }

    const filePath = path.join(backupDir, filename);
    const writeStream = fs.createWriteStream(filePath);
    req.pipe(writeStream);

    writeStream.on("error", (err) => {
        console.error("Backup receive error:", err);
        res.status(500).send({ success: false, error: err.message });
    });

    writeStream.on("finish", async () => {
        console.log(`Backup received: ${filename}`);
        res.status(200).json({ success: true, msg: "Backup received successfully" });
    });
}

const GameController = { ReceiveBackup, ReceiveGameServer, MoveToHost, GetLog, BanPlayer, UnBanPlayer, KickPlayer, OPPlayer, DEOPPlayer, GetBannedPlayers, GetPlayers, OneCommand, DisplayLog, StopServer, RestartServer, GetAll, Get, GetVersion, GetServer, GetServers, GetVersions, StartServer, CreateServer, CheckServerRunning, GetQueueStatus };
export default GameController
