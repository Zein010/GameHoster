import { execSync, spawn, fork, exec } from "child_process"
import fs from "fs"
import PrismaService from "../../PrismaService.js";
import net from "net"
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
        res = execSync(`sudo groupadd  ${username}`)
        res = execSync(`sudo useradd -g ${username} ${username}`)
    } catch (Error) {
        return false;
    }
}
const DeleteUser = (username) => {
    try {
        const res = execSync(`sudo userdel ${username}`)
    } catch (error) {
        console.log({ error })
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
const CopyFile = (fromFile, to) => {

    fs.copyFileSync(fromFile, to);
}
const SetupRequiredFiles = async (path, files) => {
    files.forEach(file => {
        fs.appendFileSync(path + "/" + file.fileName, file.content);
    })

}
const CheckPortOpen = async (port) => {
    return new Promise((resolve, reject) => {
        const server = net.createServer();

        // If the server starts listening, the port is not in use
        server.once('listening', () => {
            server.close();
            resolve(true); // Port is not in use
        });

        // If there's an error, the port is likely in use
        server.once('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                resolve(false); // Port is in use
            } else {
                reject(false); // Other error
            }
        });

        // Try to listen on the specified port
        server.listen(port, '127.0.0.1');
    });
}
const SetupServerConfigForRestart = (path, data, config) => {

    for (var i = 0; i < data[j].actions.afterRestartMatchReplaceOrAppend.length; i++) {
        content = fs.readFileSync(path + "/" + data[j].actions.afterRestartMatchReplaceOrAppend[i].fileName, { encoding: "utf-8" });
        data[j].actions.afterRestartMatchReplaceOrAppend[i].data.forEach(replaceOrAppend => {
            Object.keys(config).forEach(key => {
                replaceOrAppend.replace = replaceOrAppend.replace.replaceAll(`[${key}]`, config[key]);
            })

            replaceOrAppend.match = new RegExp(replaceOrAppend.match)
            console.log(replaceOrAppend.match)
            if (replaceOrAppend.match.test(content)) {
                // If match found, replace the matched line
                content = content.replace(replaceOrAppend.match,);
            } else {
                // If no match, append the replace string as a new line
                content += `\n${replaceOrAppend.replace}`;
            }
            content = content.replaceAll(replaceOrAppend.search, replaceOrAppend.replaceWith)
        })
        fs.truncateSync(path + "/" + data[j].actions.afterRestartMatchReplaceOrAppend[i].fileName, 0);
        fs.writeFileSync(path + "/" + data[j].actions.afterRestartMatchReplaceOrAppend[i].fileName, content, { encoding: 'utf-8', flag: 'w' });
    }
}
const SetupServerAfterStart = async (path, data, config) => {
    var content = "";
    for (var j = 0; j < data.length; j++) {
        for (var i = 0; i < data[j].actions.toReplace.length; i++) {
            content = fs.readFileSync(path + "/" + data[j].actions.toReplace[i].fileName, { encoding: "utf-8" });
            data[j].actions.toReplace[i].data.forEach(toReplace => {
                content = content.replaceAll(toReplace.search, toReplace.replaceWith)
            })
            fs.writeFileSync(path + "/" + data[j].actions.toReplace[i].fileName, content, { encoding: 'utf-8', flag: 'w' });
        }
        for (var i = 0; i < data[j].actions.matchReplaceOrAppend.length; i++) {
            content = fs.readFileSync(path + "/" + data[j].actions.matchReplaceOrAppend[i].fileName, { encoding: "utf-8" });
            data[j].actions.matchReplaceOrAppend[i].data.forEach(replaceOrAppend => {
                Object.keys(config).forEach(key => {
                    replaceOrAppend.replace = replaceOrAppend.replace.replaceAll(`[${key}]`, config[key]);
                })
                replaceOrAppend.match = new RegExp(replaceOrAppend.match)
                if (replaceOrAppend.match.test(content)) {
                    console.log(replaceOrAppend.match)
                    console.log("Matched")
                    // If match found, replace the matched line
                    content = content.replace(replaceOrAppend.match, replaceOrAppend.replace);
                } else {
                    console.log(replaceOrAppend.match)
                    console.log("Not Matched")

                    // If no match, append the replace string as a new line
                    content += `\n${replaceOrAppend.replace}`;
                }
                content = content.replaceAll(replaceOrAppend.search, replaceOrAppend.replaceWith)
            })
            fs.truncateSync(path + "/" + data[j].actions.matchReplaceOrAppend[i].fileName, 0);
            fs.writeFileSync(path + "/" + data[j].actions.matchReplaceOrAppend[i].fileName, content, { encoding: 'utf-8', flag: 'w' });
        }


    }

}
const RunGameServer = (serverDetails) => {
    const script = serverDetails.gameVersion.runScript.replaceAll("[{fileName}]", serverDetails.scriptFile);
    try {
        execSync(`sudo -u ${serverDetails.sysUser.username} bash -c " cd ${serverDetails.path} && ${script}"`)
        fs.mkdirSync(serverDetails.path + "/UILogs");
        return true;
    } catch (error) {
        console.log({ error })
        return false;
    }
}
const StartCreatedServer = (serverDetails, pidSetter) => {
    const path = serverDetails.path
    const scriptFile = serverDetails.scriptFile
    const username = serverDetails.sysUser.username
    const gameVersion = serverDetails.gameVersion
    const script = gameVersion.runScript.replaceAll("[{fileName}]", scriptFile);
    try {
        var pidSet = false;
        const ls = spawn(`cd`, [`${path}`, '&& su', username, '-c', `"${script}"`], {
            detached: true,  // Run the process as a separate process
            stdio: ['ignore', 'pipe', 'pipe'],
            shell: true
        });
        ls.stdout.on('data', (data) => {
            fs.appendFileSync(path + "/UILogs/out", data, "utf-8");
            if (!pidSet) {

                const grepData = execSync(`sudo ps -u ${serverDetails.sysUser.username} | grep -E 'java'`, { encoding: "utf-8" });
                console.log({ grepData })
                if (grepData) {
                    const matches = grepData.match(/\s*(\d+)/);
                    if (matches) {

                        const PID = matches[0];
                        if (grepData) {
                            pidSet = true;
                            pidSetter(parseInt(PID))
                        }
                    }
                }
            }
        });
        ls.stderr.on('data', (data) => {
            fs.appendFileSync(path + "/UILogs/err", data, "utf-8");
        });

        ls.on('exit', (code) => {
            fs.appendFileSync(path + "/UILogs/exit", `Process exited with code ${code}\n`, "utf-8");
        });

        ls.on('error', (error) => {
            fs.appendFileSync(path + "/UILogs/err", `Error with process: ${error.message}`, "utf-8");
        });

        ls.unref();
        console.log("Unrefed")
        return 0
    }
    catch (error) {
        console.log({ error })
        return 0;
    }
}
const CacheFile = (file, sub, scriptFileName) => {
    CreateNewDirectory({ name: `DownloadCache/${sub}` });
    fs.copyFileSync(file, `DownloadCache/${sub}/${scriptFileName}`);

}
const OwnFile = async (name, username) => {
    execSync(`chown -R ${username}:${username} ${name} `, { encoding: "utf-8" })
    execSync(`chmod -R 755  ${name} `, { encoding: "utf-8" })
    await PrismaService.SetUserAccess(username, name)
}
const DeleteDir = (path) => {
    try {
        execSync(`sudo rm ${path} -r`)
    } catch (error) {
        console.log({ error })
    }
}
const CheckUserHasProcess = async (username, script, updateProcess = async (pid) => { }) => {
    try {

        const grepData = execSync(`sudo ps -u ${username} | grep -E '${script}'`, { encoding: "utf-8" });
        console.log({ grepData })
        if (grepData) {
            const matches = grepData.match(/\s*(\d+)/);
            if (matches) {
                await updateProcess(matches[0])
                return true;

            }
        }
        return false;
    } catch (error) {
        console.log({ error })
        return false;
    }
}
const TerminalService = { CheckUserHasProcess, CreateNewDirectory, SetupServerConfigForRestart, CheckPortOpen, CacheFile, CopyFile, CreateUser, OwnFile, DeleteUser, DeleteDir, DownloadServerData, RunGameServer, SetupRequiredFiles, SetupServerAfterStart, StartCreatedServer }
export default TerminalService