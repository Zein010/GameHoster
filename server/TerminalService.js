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
        return pathName + "/" + file
    } catch (error) {
        console.log(error)
    }
}

const RunGameServer = async (path, username, gameVersion, addToRunningServers) => {
    console.log({ path })
    const script = gameVersion.runScript.replaceAll("[{fileName}]", path);
    try {
        const res = execSync(script)
        exec(`su ${username} & ${script}`, (error, stdout, stderr) => {
            if (error) {
                console.log({ error })
            }
            if (stderr) {
                console.log({ stderr })
            }
            console.log(stdout)
        })

        if (addToRunningServers) {
            await PrismaService.AddRunningServer(path, username, gameVersion.id);
        }
        console.log({ res })
    } catch (error) {
        console.log({ error })
    }
}
const OwnFile = async (name, username) => {
    execSync(`chown -R ${username}:${username} ${name} `)
    execSync(`chmod -R 755  ${name} `)
    await PrismaService.SetUserAccess(username, name)
}

const TerminalService = { CreateNewDirectory, CreateUser, OwnFile, DeleteUser, DownloadServerData, RunGameServer }
export default TerminalService