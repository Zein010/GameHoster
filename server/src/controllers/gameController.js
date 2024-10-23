import GameService from "../services/gameService.js";
import TerminalService from "../services/TerminalService.js";
import sysUserService from "../services/sysUserService.js";
import { GetServerStartOptions } from "../utils.js";


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
    const PID = TerminalService.StartCreatedServer(server, (pid) => { GameService.SetRunningServerPID(server.id, pid) })
    await GameService.SetRunningServerPID(server.id, PID)
    res.json({ "msg": "Server started successfully" });

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
    const config = GetServerStartOptions(gameVersion)
    await TerminalService.SetupRequiredFiles(dirName, gameVersion.getFilesSetup)
    await TerminalService.OwnFile(dirName, username)

    TerminalService.RunGameServer(serverDetails)
    await TerminalService.SetupServerAfterStart(dirName, gameVersion.changeFileAfterSetup, config);
    TerminalService.StartCreatedServer(serverDetails, (pid) => { GameService.SetRunningServerPID(serverDetails.id, pid) })
    await
        res.json({ msg: "Game server created successfully" });
}
const GameController = { GetAll, Get, GetVersion, GetServer, GetServers, GetVersions, StartServer, CreateServer };
export default GameController