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
    const { versionId } = req.params
    const data = await GameService.GetServers(parseInt(versionId));
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
    const PID = TerminalService.StartCreatedServer(server, (pid) => { GameService.SetRunningServerPID(server.id, pid) })
    await GameService.SetRunningServerPID(server.id, PID)
    res.json({ "msg": "Server started successfully, please wait for initialization to finish", config });

}
const DisplayLog = async (req, res) => {
    const { serverId } = req.params;
    const server = await GameService.GetServer(Number(serverId));
    RCONService.ConnectToServer(server.config.startData[server.config.startData.length - 1].rconPort, server.config.startData[server.config.startData - 1].rconPassword)
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
        TerminalService.CopyFile(gameVersion.cacheFile, dirName + '/' + gameVersion.scriptFile);
        scriptFile = gameVersion.scriptFile
    } else {
        scriptFile = TerminalService.DownloadServerData(gameVersion.downloadLink, dirName);
        TerminalService.CacheFile(dirName + "/" + scriptFile, `${gameVersion.game.name}/${gameVersion.id}`, scriptFile);
        GameService.SetGameVersionCache(gameVersion.id, `DownloadCache/${gameVersion.game.name}/${gameVersion.id}/${scriptFile}`, scriptFile)
    }
    const serverDetails = await GameService.AddRunningServer(dirName, username, gameVersion.id, scriptFile)
    const config = GetServerStartOptions(gameVersion, "start")
    GameService.AppendToServerConfig(serverDetails.id, config);
    await TerminalService.SetupRequiredFiles(dirName, gameVersion.getFilesSetup)
    await TerminalService.OwnFile(dirName, username)

    TerminalService.RunGameServer(serverDetails)
    await TerminalService.SetupServerAfterStart(dirName, gameVersion.changeFileAfterSetup, config);
    TerminalService.StartCreatedServer(serverDetails, (pid) => { GameService.SetRunningServerPID(serverDetails.id, pid) })
    await
        res.json({ msg: "Game server created successfully", config });
}
const CheckServerRunning = async (req, res) => {
    const { serverId } = req.params

    const server = await GameService.GetServer(Number(serverId));
    if (!server) {
        return res.status(404).json({ "msg": "Server not found" })
    }
    const status = await TerminalService.CheckUserHasProcess(server.sysUser.username, server.gameVersion.searchScript, async (pid) => { await GameService.SetRunningServerPID(server.id, pid) });
    res.json({ status });
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
const GameController = { DisplayLog, StopServer, GetAll, Get, GetVersion, GetServer, GetServers, GetVersions, StartServer, CreateServer, CheckServerRunning };
export default GameController