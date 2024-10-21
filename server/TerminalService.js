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
const SetupRequiredFiles = async (path, files) => {
    files.forEach(file => {
        fs.appendFileSync(path + "/" + file.fileName, file.content);
    })

}
const SetupServerAfterStart = async (path, data) => {
    console.log(data);
    var content = "";
    for (var j = 0; j < data.length; j++) {

        for (var i = 0; i < data[j].actions.toReplace.length; i++) {

            content = await fs.readFile(path + "/" + data[j].actions.toReplace[i].fileName);
            data[j].toReplace[i].data.forEach(toReplace => {
                content = content.replaceAll(toReplace.search, toReplace.replaceWith)
            })
            await fs.writeFile(path + "/" + data[j].actions.toReplace[i].fileName, content, 'utf-8');
        }
    }

}
const RunGameServer = async (path, scriptFile, username, gameVersion, addToRunningServers) => {
    const script = gameVersion.runScript.replaceAll("[{fileName}]", scriptFile);
    try {
        console.log({ script: `sudo -u ${username} bash -c " cd ${path} && ${script}"` })
        execSync(`sudo -u ${username} bash -c " cd ${path} && ${script}"`)
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

const TerminalService = { CreateNewDirectory, CreateUser, OwnFile, DeleteUser, DownloadServerData, RunGameServer, SetupRequiredFiles, SetupServerAfterStart }
export default TerminalService