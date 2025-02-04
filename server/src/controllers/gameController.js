import GameService from "../services/gameService.js";
import TerminalService from "../services/TerminalService.js";
import sysUserService from "../services/sysUserService.js";
import { GetServerStartOptions } from "../utils.js";
import RCONService from "../services/RCONService.js";


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
    const data = await GameService.GetServers({ userId: req.user.id });
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
    if (gameVersion.cacheFile) {
        console.log("Copying file");
        await TerminalService.CopyFile(gameVersion.cacheFile, dirName);
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
    if (gameVersion.runOnce) {
        console.log("Running once");
        for (var i = 0; i < gameVersion.runOnce.length; i++) {

            await TerminalService.RunScript(dirName, gameVersion.runOnce[i].script, gameVersion.runOnce[i].timeout || 0);
        }
        console.log("ran once");
    }
    if (gameVersion.service) {
        console.log("creating service");
        TerminalService.CreateService(username, dirName, gameVersion.service);
        console.log("created service");
    }
    console.log("adding server");
    const serverDetails = await GameService.AddRunningServer(dirName, username, gameVersion.id, scriptFile)
    console.log("added server");
    const config = GetServerStartOptions(gameVersion, "start")
    GameService.AppendToServerConfig(serverDetails.id, config);
    TerminalService.SetupRequiredFiles(dirName, gameVersion.getFilesSetup)
    await TerminalService.OwnFile(dirName, username)

    await TerminalService.SetupServerAfterStart(dirName, gameVersion.changeFileAfterSetup, config);
    await TerminalService.OwnFile(dirName, username)
    if (gameVersion.service) {
        TerminalService.StartService(`${username}.service`);
    } else {

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
const GameController = { GetLog, BanPlayer, UnBanPlayer, KickPlayer, OPPlayer, DEOPPlayer, GetBannedPlayers, GetPlayers, OneCommand, DisplayLog, StopServer, GetAll, Get, GetVersion, GetServer, GetServers, GetVersions, StartServer, CreateServer, CheckServerRunning };
export default GameController