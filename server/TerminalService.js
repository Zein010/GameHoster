import { exec, execSync, spawn } from "child_process"
import fs from "fs"
import PrismaService from "./PrismaService.js";
import path from "path";
const CreateNewDirectory = (config) => {
    const PathArr = config.name.split("/");
    var currPath = "";
    if (PathArr.length > 0) {
        for (var i = 0; i < PathArr.length; i++) {
            currPath += (currPath == "" ? "" : "/") + PathArr[i];
            if (!fs.existsSync(currPath))
                fs.mkdirSync(currPath)
        }
    }
}
const CreateUser = async (username) => {
    var res = null;
    try {
        res = execSync(`groupadd  ${username}`)
        res = execSync(`useradd -g ${username} ${username}`)
        await PrismaService.StoreUser(username)
    } catch (Error) {
        return false;
    }
}
const DeleteUser = (username) => {

}
const DownloadServerData = (url, pathName) => {
    let file = "";
    try {

        execSync(`wget -P ${pathName} ${url}`)
        const file = fs.readdirSync(pathName)[0];
        return file
    } catch (error) {
        console.log(error)
    }
}
const SetupRequiredFiles = async (path, gameVersionId) => {
    const files = await PrismaService.GetGameVersionFiles(gameVersionId)
    files.forEach(file => {
        fs.appendFileSync(path + "/" + file.fileName, file.content);
    })

}
const RunGameServer = async (path, scriptFile, username, gameVersion, addToRunningServers) => {
    const script = gameVersion.runScript.replaceAll("[{fileName}]", scriptFile);
    try {
        console.log({ script: `sudo -u ${username} bash -c " cd ${path} && ${script}"` })
        const res = execSync(`sudo -u ${username} bash -c " cd ${path} && ${script}"`)
        console.log({ res })
        if (addToRunningServers) {
            await PrismaService.AddRunningServer(path, username, gameVersion.id);
        }
    } catch (error) {
        console.log({ error })
    }
}
const OwnFile = async (name, username) => {
    execSync(`chown -R ${username}:${username} ${name} `)
    execSync(`chmod -R 755  ${name} `)
    await PrismaService.SetUserAccess(username, name)
}

const TerminalService = { CreateNewDirectory, CreateUser, OwnFile, DeleteUser, DownloadServerData, RunGameServer, SetupRequiredFiles }
export default TerminalService