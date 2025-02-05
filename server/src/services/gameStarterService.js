import GameService from "../services/gameService.js";
import sysUserService from "../services/sysUserService.js";
import TerminalService from "../services/TerminalService.js";

import { GetServerStartOptions } from "../utils.js";
const StartRustServer = async (gameVersion) => {

    const rand = parseInt((Math.random() * 10000) % 10000);
    const dirName = `GameServer/${gameVersion.game.dirName}-${rand}`;
    const username = `${gameVersion.game.dirName}-${rand}`;

    TerminalService.CreateNewDirectory({ name: dirName })
    // In Rust we need to create a user for the rust game, and set the home directory to be the game directory, set the home directory
    await TerminalService.CreateUser({ username, dirName });
    await sysUserService.StoreSysUser(username);
    await TerminalService.OwnFile(dirName, username)

    // we need to run the rust server create script
    // 

    const serverDetails = await GameService.AddRunningServer(dirName, username, gameVersion.id, "", user.id)
    const creatingPromise = TerminalService.DownloadRustServer(serverDetails, username, dirName);
    creatingPromise.then(async () => {
        // here the server is created, now we need to create the service, and run it
        const config = GetServerStartOptions(gameVersion);
        TerminalService.CreateRustStartService(username, dirName, config);
        await GameService.AppendToServerConfig(serverDetails.id, config);
        GameService.StartRustServer(username);
    }).catch(() => {

    })
}

const StartMinecraftVanillaServer = async (gameVersion, user) => {

    const rand = parseInt((Math.random() * 10000) % 10000);
    const dirName = `GameServer/${gameVersion.game.dirName}-${rand}`;
    const username = `${gameVersion.game.dirName}-${rand}`;
    TerminalService.CreateNewDirectory({ name: dirName })
    await TerminalService.CreateUser({ username });
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
    const serverDetails = await GameService.AddRunningServer(dirName, username, gameVersion.id, scriptFile, user.id)
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
    return config
}
const GameStarterService = { StartRustServer, StartMinecraftVanillaServer }
export default GameStarterService