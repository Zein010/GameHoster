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
    const data = await GameService.GetServers(req.user.role==Role.ADMIN?null:{ userId: req.user.id });
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
    const config = GetServerStartOptions(server.gameVersion, "restart")
    const SetupCorrectly = TerminalService.SetupServerConfigForRestart(server.path, server.gameVersion.changeFileAfterSetup, config);
    if (!SetupCorrectly)
        return res.status(401).json({ msg: "Something went wrong" });
    GameService.AppendToServerConfig(server.id, config);
    if (server.gameVersion.service) {
        TerminalService.StartService(`${username}.service`);
    } else {

        const PID = TerminalService.StartCreatedServer(server)
    }
    res.json({ "msg": "Server started successfully, please wait for initialization to finish", config });

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
    const rand = parseInt((Math.random() * 10000) % 10000);
    const dirName = `GameServer/${gameVersion.game.dirName}-${rand}`;
    const username = `${gameVersion.game.dirName}-${rand}`;
    TerminalService.CreateNewDirectory({ name: dirName })
    await TerminalService.CreateUser(username);
    await sysUserService.StoreSysUser(username);
    var scriptFile = "";
    if (gameVersion.cacheFile&&JSON.parse(gameVersion.cacheFile)[process.env.SERVER_ID]) {
        
        console.log("Copying file");
        await TerminalService.CopyFile(gameVersion.JSON.parse(gameVersion.cacheFile)[process.env.SERVER_ID], dirName).catch((err)=>console.log(err));
        console.log("Done copying files");
        scriptFile = gameVersion.scriptFile
    } else {
        if (gameVersion.downloadLink) {
            scriptFile = TerminalService.DownloadServerData(gameVersion.downloadLink, dirName);
        }
        if (gameVersion.installScript) {
            await TerminalService.DownloadServerDataByScript(gameVersion.installScript, dirName);
            scriptFile = gameVersion.scriptFile
        }
        await TerminalService.CacheFile(dirName, `${gameVersion.game.name}/${gameVersion.id}`);
        GameService.SetGameVersionCache(gameVersion.id, `DownloadCache/${gameVersion.game.name}/${gameVersion.id}`)
    }
    console.log("adding server");
    const serverDetails = await GameService.AddRunningServer(dirName, username, gameVersion.id, scriptFile)
    console.log("added server");
    const config = GetServerStartOptions(gameVersion, "start")
    console.log("Appending to server config");
    GameService.AppendToServerConfig(serverDetails.id, config);
    console.log("Setting up required files");
    TerminalService.SetupRequiredFiles(dirName, gameVersion.getFilesSetup)
    await TerminalService.OwnFile(dirName, username)

    await TerminalService.SetupServerAfterStart(dirName, gameVersion.changeFileAfterSetup, config);
    console.log("Owning new Files");
    await TerminalService.OwnFile(dirName, username)
    if (gameVersion.service) {
        TerminalService.StartService(`${username}.service`);
    } else {

    console.log("Starting created server");
        TerminalService.StartCreatedServer(serverDetails)
    }

    res.json({ msg: "Game server created successfully", config });
}
const CheckServerRunning = async (req, res) => {
    const { serverId } = req.params

    const server = await GameService.GetServer(Number(serverId));
    if (!server) {
        return res.status(404).json({ "msg": "Server not found" })
    }
    const status = await TerminalService.CheckUserHasProcess(server.sysUser.username, server.gameVersion.searchScript);
    res.json({ status, gameVersion: server.gameVersion, config: server.config.startData.length > 0 ? server.config.startData[server.config.startData.length - 1] : {} });
}
const StopServer = async (req, res) => {
    const { serverId } = req.params

    const server = await GameService.GetServer(Number(serverId));
    if (!server) {
        return res.status(404).json({ "msg": "Server not found" })
    }

    const status = await TerminalService.CheckUserHasProcess(server.sysUser.username, server.gameVersion.searchScript);
    if (status) {
        TerminalService.StopUserProcesses(server.sysUser.username, server.gameVersion.searchScript);
    }
    res.json({ status });
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
const MoveToHost=async (req,res)=>{
    const {serverId,hostId}=req.params;
    
    const host=await HostService.GetHost(hostId);
    const gameServer=await GameService.GetServer(serverId);
    if(!gameServer.serverid==process.env.SERVER_ID){
        return res.status(403).json({msg:"Server is already moved to a different host"});
    }
    // stop the server before copying
    const status = await TerminalService.CheckUserHasProcess(gameServer.sysUser.username, gameServer.gameVersion.searchScript);
    if (status) {
        TerminalService.StopUserProcesses(gameServer.sysUser.username, gameServer.gameVersion.searchScript);
    }
    // set server status to transfering
    GameService.SetServerTransferingStatus(serverId,true);
    const copyToken=  crypto.randomBytes(30).toString("base64").replace(/[^a-zA-Z0-9]/g, "").slice(0, 30);
    await GameService.SetCopyToken(serverId,copyToken);
    const outputFile= await TerminalService.ZipForTransfer(gameServer)
    try {
       
         await axios.post(`http://${host.url}/Game/ReceiveServer/${serverId}/${copyToken}`, outputFile.stream, {
        headers: { "Content-Type": "application/octet-stream","X-filename":outputFile.name,"API-Key":host.apiKey,"UserID":req.user.id },
        maxBodyLength: Infinity, // important for large files
        });
        res.status(200).json({msg:"Server moved successfully"});
    } catch (err) {
        res.status(500).json({msg:"Something went wrong, server not moved"+err});
    }
}
const ReceiveGameServer = async (req, res) => {
    const filename = req.headers["x-filename"];
    const { serverId,copyToken } = req.params
    const gameServer=await GameService.GetServer(serverId);
    if(gameServer.copyToken!=copyToken){
        console.log("Invalid copy token");
        return res.status(403).json({error:"Invalid copy token"});
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
    writeStream.on("finish",async ()=>{

        const dirName = `GameServer/${gameServer.sysUser.username}`;
        const username = `${gameServer.sysUser.username}`;
        TerminalService.CreateNewDirectory({ name: dirName })
        await TerminalService.CreateUser(username);
        await sysUserService.StoreSysUser(username);
        // // the file is zip and needs to be unziped
        await FileService.Move(filePath,dirName);
        await FileService.Unzip(path.resolve(path.join(dirName,filename)));
        await TerminalService.OwnFile(path.resolve(dirName),username);
        await GameService.ChangeHostId(gameServer.id,process.env.SERVER_ID);
        await GameService.SetServerTransferingStatus(gameServer.id,false);
        res.status(200).json({msg:"Server transfered successfully"})
    })
}
const GameController = {ReceiveGameServer,MoveToHost, GetLog, BanPlayer, UnBanPlayer, KickPlayer, OPPlayer, DEOPPlayer, GetBannedPlayers, GetPlayers, OneCommand, DisplayLog, StopServer, GetAll, Get, GetVersion, GetServer, GetServers, GetVersions, StartServer, CreateServer, CheckServerRunning };
export default GameController