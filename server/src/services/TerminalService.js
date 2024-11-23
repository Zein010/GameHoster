import { execSync, spawn, fork, exec } from "child_process"
import fs from "fs"
import PrismaService from "../../PrismaService.js";
import net from "net"
import pathLib from "path";
import { promiseHooks } from "v8";
const RunningServers = {};
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
const DownloadServerDataByScript = async (script, pathName) => {
    return new Promise((resolve, reject) => {
        let directory = pathLib.resolve();;
        console.log({ directory })
        directory = pathLib.join(directory, pathName);

        try {
            console.log(`${script.replaceAll("[path]", directory)}`)
            const downloadDataProcess = spawn(`${script.replaceAll("[path]", directory)}`, { shell: true });

            downloadDataProcess.on('error', (error) => {
                console.log({ error })
            })
            downloadDataProcess.stdout.on('data', (data) => {
                console.log({ data: data.toString("utf-8") })
            })
            downloadDataProcess.stderr.on('data', (data) => {
                console.log({ data: data.toString("utf-8") })
            })
            downloadDataProcess.on('close', (code) => {
                console.log({ code: code });
                resolve(code)
            })
        } catch (error) {
            console.log({ error })
        }
    })


}
const CopyFile = async (fromDirectory, toDirectory) => {
    return new Promise((resolve, reject) => {
        fs.cp(fromDirectory, toDirectory, { recursive: true }, (err) => {
            if (err)
                reject("Error copying directory:", err)
            resolve("Directory copied successfully!")
        });
    })
}
const SetupRequiredFiles = (path, files) => {
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
    try {

        var content = "";
        for (var j = 0; j < data.length; j++) {
            for (var i = 0; i < data[j].actions.afterRestartMatchReplaceOrAppend.length; i++) {
                content = fs.readFileSync(path + "/" + data[j].actions.afterRestartMatchReplaceOrAppend[i].fileName, { encoding: "utf-8" });
                data[j].actions.afterRestartMatchReplaceOrAppend[i].data.forEach(replaceOrAppend => {
                    Object.keys(config).forEach(key => {
                        replaceOrAppend.replace = replaceOrAppend.replace.replaceAll(`[${key}]`, config[key]);
                    })

                    replaceOrAppend.match = new RegExp(replaceOrAppend.match)
                    if (replaceOrAppend.match.test(content)) {
                        // If match found, replace the matched line
                        content = content.replace(replaceOrAppend.match, replaceOrAppend.replace);
                    } else {
                        // If no match, append the replace string as a new line
                        content += `\n${replaceOrAppend.replace}`;
                    }
                    content = content.replaceAll(replaceOrAppend.search, replaceOrAppend.replace)
                })
                fs.truncateSync(path + "/" + data[j].actions.afterRestartMatchReplaceOrAppend[i].fileName, 0);
                fs.writeFileSync(path + "/" + data[j].actions.afterRestartMatchReplaceOrAppend[i].fileName, content, { encoding: 'utf-8', flag: 'w' });
            }
        }
        return true;
    } catch (SetupServerConfigForRestartError) {
        console.log({ SetupServerConfigForRestartError })
        return false;
    }

}
const SetupServerAfterStart = async (path, data, config) => {
    var content = "";
    for (var j = 0; j < data.length; j++) {
        for (var i = 0; i < data[j].actions.toReplace.length; i++) {
            content = fs.readFileSync(path + "/" + data[j].actions.toReplace[i].fileName, { encoding: "utf-8" });
            data[j].actions.toReplace[i].data.forEach(toReplace => {
                content = content.replaceAll(toReplace.search, toReplace.replace)
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
                    // If match found, replace the matched line
                    content = content.replace(replaceOrAppend.match, replaceOrAppend.replace);
                } else {

                    // If no match, append the replace string as a new line
                    content += `\n${replaceOrAppend.replace}`;
                }
                content = content.replaceAll(replaceOrAppend.search, replaceOrAppend.replace)
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
        return true;
    } catch (error) {
        console.log({ error })
        return false;
    }
}
const StartCreatedServer = (serverDetails, pidSetter) => {
    const path = serverDetails.path;
    const scriptFile = serverDetails.scriptFile;
    const username = serverDetails.sysUser.username;
    const gameVersion = serverDetails.gameVersion;
    const script = gameVersion.runScript.replaceAll("[{fileName}]", scriptFile);

    const outFile = fs.openSync(path + '/outlog', 'a'); // Open in append mode ('a')

    try {
        // Create a detached process with its own process group
        const command = `cd "${path}" && /bin/su ${username} -c 'cd "${path}" && ${script}'`;

        const ls = spawn('sh', ['-c', command], {
            detached: true,
            stdio: ['pipe', 'pipe', 'pipe'], // Changed to pipe for debugging
            shell: true,
            cwd: "/var/www/GameHoster/server", // Set working directory explicitly
        });
        ls.stdout.on("data", (data) => {
            fs.writeSync(outFile, data.toString());
        });

        ls.stderr.on("data", (data) => {
            fs.writeSync(outFile, data.toString());
        });
        RunningServers[serverDetails.id] = ls
        // ls.unref();
        // Don't wait for the child to exit
        ls.on('error', (err) => {
            console.error('Failed to start subprocess:', err);
        });

        return ls.pid;
    } catch (error) {
        console.error('Error starting server:', error);
        return 0;
    }
}
const CacheFile = async (DirectoryFrom, versionID) => {

    CreateNewDirectory({ name: `DownloadCache/${versionID}` });
    await CopyFile(DirectoryFrom, `DownloadCache/${versionID}`);

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
        if (grepData) {
            const matches = grepData.match(/\s*(\d+)/);
            if (matches) {
                await updateProcess(Number(matches[0]))
                return true;

            }
        }
        return false;
    } catch (error) {
        return false;
    }
}
const StopUserProcesses = (username, script) => {
    try {

        const grepData = execSync(`sudo ps -u ${username} | grep -E '${script}'`, { encoding: "utf-8" });
        if (grepData) {
            const matches = grepData.match(/\s*(\d+)/);
            if (matches) {
                execSync(`sudo kill ${Number(matches[0])}`);
                return true;
            }
        }
        return false;
    } catch (error) {
        console.log({ error })
        return true;
    }
}
const DisplayUserLog = (path) => {
    try {
        console.log("Not Ready yet")
        return;
        const outStream = fs.createReadStream(path + "/out.log");

        outStream.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        outStream.on('error', (error) => {
            console.error(`Error reading stdout: ${error.message}`);
        });
        return false;
    } catch (error) {
        console.log({ error })
        return true;
    }
}
const TerminalToSocket = (serverId, socket) => {
    if (!RunningServers[serverId]) {
        console.log("Server down")
        return false;
    }
    socket.on("terminalCommand", (data) => {
        RunningServers[serverId].stdin.write(data.command + "\n");
    })

    const streamData = (data) => {
        socket.emit("termianlOutput", data.toString());
    }
    RunningServers[serverId].stdout.on('data', streamData)
    socket.on('disconnect', function () {
        RunningServers[serverId].stdout.removeListener('data', streamData);

    });
    RunningServers[serverId].stderr.on('data', (data) => {
        socket.emit("termianlOutput", data.toString());
    })
}
const OneCommand = async (serverId, command) => {
    if (!RunningServers[serverId]) {
        console.log("Server down");
        return false;
    }

    return new Promise((resolve, reject) => {
        // Save the original listeners
        const originalStdoutListeners = RunningServers[serverId].stdout.listeners('data');
        const originalStderrListeners = RunningServers[serverId].stderr.listeners('data');

        // Remove all existing listeners

        // Listen for output of the command
        const onStdoutData = (data) => {
            cleanupListeners();
            resolve(data.toString());
        };

        const onStderrData = (data) => {
            cleanupListeners();
            resolve(data.toString());
        };

        // Temporary listeners for this command only
        RunningServers[serverId].stdout.on('data', onStdoutData);
        RunningServers[serverId].stderr.on('data', onStderrData);

        // Helper function to restore original listeners after the command completes
        const cleanupListeners = () => {
            // Restore the original listeners

            RunningServers[serverId].stdout.removeAllListeners('data');
            RunningServers[serverId].stderr.removeAllListeners('data');
            originalStdoutListeners.forEach(listener => RunningServers[serverId].stdout.on('data', listener));
            originalStderrListeners.forEach(listener => RunningServers[serverId].stderr.on('data', listener));
        };

        // Write the command to stdin
        RunningServers[serverId].stdin.write(command + "\n");
    });
};
const GetBannedPlayers = async (serverId) => {
    if (!RunningServers[serverId]) {
        console.log("Server down");
        return false;
    }

    return new Promise((resolve, reject) => {

        let outputBuffer = '';
        const bannedPlayers = [];
        let timeoutId = null;
        const originalStdoutListeners = RunningServers[serverId].stdout.listeners('data');
        const banListRegex = /\[.*\] \[Server thread\/INFO\]: (.*) was banned by Server: (.*)/;
        RunningServers[serverId].stdin.write("/banlist\n");

        RunningServers[serverId].stdout.on('data', (data) => {
            const lines = data.toString().split('\n');
            timeoutId = setTimeout(() => {
                processOutput(outputBuffer);
                outputBuffer = ''; // Clear the buffer after processing
            }, 2000);
            lines.forEach((line) => {
                const match = line.match(banListRegex);

                if (match) {
                    // If line matches, reset the timeout and add to buffer
                    outputBuffer += line + '\n';

                    // Reset the timer only for matching lines
                    clearTimeout(timeoutId);
                    timeoutId = setTimeout(() => {
                        processOutput(outputBuffer);
                        outputBuffer = ''; // Clear the buffer after processing
                    }, 2000);
                }
            });
        });


        function processOutput(output) {
            RunningServers[serverId].stdout.removeAllListeners('data');
            originalStdoutListeners.forEach(listener => RunningServers[serverId].stdout.on('data', listener));
            const lines = output.split('\n');
            lines.forEach((line) => {
                const match = line.match(banListRegex);
                if (match) {
                    const playerName = match[1];
                    const reason = match[2];
                    bannedPlayers.push({ playerName, reason });
                }
            });
            // Output the results
            resolve(bannedPlayers);
        }

    })
}
const GetLog = (path) => {
    try {

        return fs.readFileSync(path + "/outlog", { encoding: "utf-8" });
    } catch (error) {
        console.log({ error })
        return "No Log Yet";
    }
}
function isValidFileName(fileName) {
    // Ensure filename does not contain dangerous characters (e.g., `;`, `&`, `|`, etc.)
    const regex = /^[a-zA-Z0-9_\-\/.\[\]\(\)\s]+$/;
    return regex.test(fileName);
}

// Function to create a zip file
function CreateZip(files, path, subPath) {
    const zipName = `Download-${Date.now()}-${Math.floor(Math.random() * 1000)}.zip`;


    const validPaths = [];

    if (files.length == 1) {

        const filePath = pathLib.join(path, subPath, files[0]);
        const stats = fs.statSync(filePath);

        if (stats.isFile()) {
            return { fileName: files[0], fileType: pathLib.extname(pathLib.join(path, subPath, files[0])) }
        }
    }

    files.forEach(file => {
        if (isValidFileName(file)) {
            validPaths.push(`"${file}"`);
        } else {
            console.warn(`Skipping invalid file or directory name: ${file}`);
        }
    });

    const pathsString = validPaths.join(' ');

    const command = `cd "${pathLib.join(path, subPath)}" &&  zip -r "${zipName}" ${pathsString}`;

    try {

        const res = execSync(command, { encoding: "utf-8" });
        return { fileName: zipName, fileType: '.zip', delete: true }
    } catch (error) {
        return false;
    }
}
const RunScript = async (pathName, script, autoCancelAfter = 0) => {

    return new Promise((resolve, reject) => {
        const command = `cd "${pathName}" && ${script.replaceAll("[path]", pathName)}`;

        const res = exec(command, { encoding: "utf-8" });

        res.stdout.on('data', (data) => {
        });

        res.stderr.on('data', (err) => {
        });
        res.on("error", (data) => {
        })
        res.on("close", (code) => {
            resolve(code);
        })
        if (autoCancelAfter != 0) {
            setTimeout(() => {
                res.stdout.removeAllListeners('data');
                res.kill();
                resolve("Process Killed")
            })
        }

    })
}

const CreateService = (name, path, service) => {
    const serviceFilePath = `/etc/systemd/system/${name}.service`;
    const serviceContent = service.replaceAll("[path]", path).replaceAll("[sysuser]", name);
    console.log(serviceContent);
    try {
        // Create the service file
        execSync(`sudo touch ${serviceFilePath}`);

        // Write the service content
        execSync(`echo "${serviceContent}" | sudo tee ${serviceFilePath} > /dev/null`);

        // Set the correct permissions
        execSync(`sudo chmod 644 ${serviceFilePath}`);

        // Reload systemd to apply the new service
        execSync('sudo systemctl daemon-reload');

        console.log(`Service file ${serviceFilePath} created successfully.`);
    } catch (error) {
        console.error(`Error creating the service file: ${error.message}`);
    }
};

const TerminalService = { CreateService, RunScript, GetLog, CreateZip, DownloadServerDataByScript, GetBannedPlayers, OneCommand, TerminalToSocket, DisplayUserLog, StopUserProcesses, CheckUserHasProcess, CreateNewDirectory, SetupServerConfigForRestart, CheckPortOpen, CacheFile, CopyFile, CreateUser, OwnFile, DeleteUser, DeleteDir, DownloadServerData, RunGameServer, SetupRequiredFiles, SetupServerAfterStart, StartCreatedServer }
export default TerminalService