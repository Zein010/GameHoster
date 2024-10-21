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
    try {

        const res = execSync(`userdel ${username}`)
        console.log({ res });
    } catch (error) {

        console.log({ error })
    }
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
    var content = "";
    for (var j = 0; j < data.length; j++) {

        for (var i = 0; i < data[j].actions.toReplace.length; i++) {

            content = fs.readFileSync(path + "/" + data[j].actions.toReplace[i].fileName, { encoding: "utf-8" });
            data[j].actions.toReplace[i].data.forEach(toReplace => {
                content = content.replaceAll(toReplace.search, toReplace.replaceWith)
            })
            fs.writeFileSync(path + "/" + data[j].actions.toReplace[i].fileName, content, 'utf-8');
        }
    }

}
const RunGameServer = async (path, scriptFile, username, gameVersion, addToRunningServers) => {
    const script = gameVersion.runScript.replaceAll("[{fileName}]", scriptFile);
    try {
        execSync(`sudo -u ${username} bash -c " cd ${path} && ${script}"`)
        if (addToRunningServers) {
            await PrismaService.AddRunningServer(path, username, gameVersion.id);
        }
    } catch (error) {
        console.log({ error })
    }
}
const RunGameServerAsync = (path, scriptFile, username, gameVersion) => {
    const script = gameVersion.runScript.replaceAll("[{fileName}]", scriptFile);
    const ls = spawn(`sudo -u ${username} bash -c " cd ${path} && ls"`)

    ls.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    ls.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    ls.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });

}
const OwnFile = async (name, username) => {
    execSync(`chown -R ${username}:${username} ${name} `)
    execSync(`chmod -R 755  ${name} `)
    await PrismaService.SetUserAccess(username, name)
}

const TerminalService = { CreateNewDirectory, CreateUser, OwnFile, DeleteUser, DownloadServerData, RunGameServer, SetupRequiredFiles, SetupServerAfterStart, RunGameServerAsync }
export default TerminalService