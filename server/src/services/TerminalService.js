import { exec, execSync, spawn, fork } from "child_process"
import fs from "fs"
import PrismaService from "../../PrismaService.js";
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
    } catch (Error) {
        return false;
    }
}
const DeleteUser = (username) => {
    try {
        const res = execSync(`userdel ${username}`)
    } catch (error) {
    }
}
const DownloadServerData = (url, pathName) => {
    try {

        execSync(`wget -q -P ${pathName} ${url}`)
        const file = fs.readdirSync(pathName)[0];
        return file
    } catch (error) {
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
const RunGameServer = async (serverDetails) => {
    const script = serverDetails.gameVersion.runScript.replaceAll("[{fileName}]", serverDetails.scriptFile);
    try {
        execSync(`sudo -u ${serverDetails.sysUser.username} bash -c " cd ${serverDetails.path} && ${script}"`)
        fs.mkdirSync(serverDetails.path + "/UILogs");

        return true;
    } catch (error) {
        console.log({ error })
    }
}
const StartCreatedServer = (serverDetails) => {
    const path = serverDetails.path
    const scriptFile = serverDetails.scriptFile
    const username = serverDetails.sysUser.username
    const gameVersion = serverDetails.gameVersion
    const script = gameVersion.runScript.replaceAll("[{fileName}]", scriptFile);
    try {
        const ls = spawn(`cd`, [`${path}`, '&& su', username, '-c', `"${script}"`], {
            detached: true,  // Run the process as a separate process
            stdio: ['ignore', 'pipe', 'pipe'],
            shell: true
        });

        ls.stdout.on('data', (data) => {
            console.log(`stdout ${data}\n`);
            fs.appendFileSync(path + "/UILogs/out", data, "utf-8");
        });

        ls.stderr.on('data', (data) => {
            console.log(`strerr ${data}\n`);
            fs.appendFileSync(path + "/UILogs/err", data, "utf-8");
            // PrismaService.SetRunningServerPID(serverId, 0);
        });

        ls.on('exit', (code) => {
            console.log(`Exit ${code}\n`);
            fs.appendFileSync(path + "/UILogs/exit", `Process exited with code ${code}\n`, "utf-8");
            // PrismaService.SetRunningServerPID(serverId, 0);
        });

        ls.on('error', (error) => {
            console.log(`Error ${error.message}\n`);
            fs.appendFileSync(path + "/UILogs/err", `Error with process: ${error.message}`, "utf-8");
            // PrismaService.SetRunningServerPID(serverId, 0);
        });
        ls.unref()
        return ls.pid;
    }
    catch (error) {
        console.log({ error })
        return 0;
    }
}
const OwnFile = async (name, username) => {
    execSync(`chown -R ${username}:${username} ${name} `)
    execSync(`chmod -R 755  ${name} `)
    await PrismaService.SetUserAccess(username, name)
}

const TerminalService = { CreateNewDirectory, CreateUser, OwnFile, DeleteUser, DownloadServerData, RunGameServer, SetupRequiredFiles, SetupServerAfterStart, StartCreatedServer }
export default TerminalService