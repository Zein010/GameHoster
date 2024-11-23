import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import bcrypt from "bcrypt";
const seed = async () => {
  try {
    await prisma.user.upsert({
      where: { id: 1 },
      create: { id: 1, username: "zzzxxx", firstName: "zzz", lastName: "xxx", email: "zzz@xxx.com", password: bcrypt.hashSync("123123aA@", 10) },
      update: { username: "zzzxxx", email: "zzz@xxx.com", password: bcrypt.hashSync("123123aA@", 10) },
    });
    console.log("Created Default User")
    await prisma.game.upsert({
      where: { id: 1 },
      create: { id: 1, name: "Minecraft", dirName: "minecraft" },
      update: { name: "Minecraft", dirName: "minecraft" },
    });
    console.log("Created Minecraft Server")
    await prisma.game.upsert({
      where: { id: 2 },
      create: { id: 2, name: "Rust", dirName: "rust" },
      update: { name: "Rust", dirName: "rust" },
    });
    console.log("Created Rust Server")
    await prisma.game.upsert({
      where: { id: 3 },
      create: { id: 3, name: "Astroneer", dirName: "astroneer" },
      update: { name: "Astroneer", dirName: "astroneer" },
    });
    console.log("Created Astroneer Server")
    await prisma.gameVersion.upsert({
      where: { id: 1 },
      create: { id: 1, searchShScript: "sh", searchScript: "java", gameId: 1, version: "Vanilla-1.21.1", cacheFile: null, downloadLink: "https://piston-data.mojang.com/v1/objects/59353fb40c36d304f2035d51e7d6e6baa98dc05c/server.jar", scriptFile: "server.jar", runScript: "java -Xmx1024M -Xms1024M -jar  [{fileName}] nogui" },
      update: { searchShScript: "sh", searchScript: "java", gameId: 1, version: "Vanilla-1.21.1", cacheFile: null, downloadLink: "https://piston-data.mojang.com/v1/objects/59353fb40c36d304f2035d51e7d6e6baa98dc05c/server.jar", scriptFile: "server.jar", runScript: "java -Xmx1024M -Xms1024M -jar  [{fileName}] nogui" },
    });

    await prisma.gameVersion.upsert({
      where: { id: 2 },
      create: { id: 2, searchShScript: "sh", searchScript: "java", gameId: 1, downloadLink: "", version: "Forge-1.21.3", cacheFile: "DownloadCache/Minecraft/2", scriptFile: "forge-1.21.3-53.0.9-shim.jar", runScript: "java -Xmx1024M -Xms1024M -jar  [{fileName}] nogui" },
      update: { searchShScript: "sh", searchScript: "java", gameId: 1, downloadLink: "", version: "Forge-1.21.3", cacheFile: "DownloadCache/Minecraft/2", scriptFile: "forge-1.21.3-53.0.9-shim.jar", runScript: "java -Xmx1024M -Xms1024M -jar  [{fileName}] nogui" },
    });

    await prisma.gameVersion.upsert({
      where: { id: 3 },
      create: { id: 3, searchShScript: "sh", searchScript: "java", gameId: 1, downloadLink: "", version: "Forge-1.21.1", cacheFile: "DownloadCache/Minecraft/3", scriptFile: "forge-1.21.1-52.0.26-shim.jar", runScript: "java -Xmx2024M -Xms2024M -jar  [{fileName}] nogui" },
      update: { searchShScript: "sh", searchScript: "java", gameId: 1, downloadLink: "", version: "Forge-1.21.1", cacheFile: "DownloadCache/Minecraft/3", scriptFile: "forge-1.21.1-52.0.26-shim.jar", runScript: "java -Xmx2024M -Xms2024M -jar  [{fileName}] nogui" },
    });

    await prisma.gameVersion.upsert({
      where: { id: 4 },
      create: { id: 4, service: `[Unit]\nDescription=[sysuser]\nAfter=network.target\n[Service]\nWorkingDirectory=[path]\nUser=[sysuser]\nGroup=[sysuser]\nType=simple\nExecStart=/usr/bin/wine [path]/AstroServer.exe\nRestartSec=15\nRestart=always\nKillSignal=SIGINT\n[Install]\nWantedBy=multi-user.target`, searchShScript: "astro", version: "Astroneer Vanilla", searchScript: "astro", gameId: 3, downloadLink: null, installScript: "steamcmd +@sSteamCmdForcePlatformType windows +force_install_dir [path] +login anonymous +app_update 728470 validate +quit", runOnce: [{ script: "wine AstroServer.exe", timeOut: 5000 }] },
      update: { service: `[Unit]\nDescription=[sysuser]\nAfter=network.target\n[Service]\nWorkingDirectory=[path]\nUser=[sysuser]\nGroup=[sysuser]\nType=simple\nExecStart=/usr/bin/wine [path]/AstroServer.exe\nRestartSec=15\nRestart=always\nKillSignal=SIGINT\n[Install]\nWantedBy=multi-user.target`, searchShScript: "astro", version: "Astroneer Vanilla", searchScript: "astro", gameId: 3, downloadLink: null, installScript: "steamcmd +@sSteamCmdForcePlatformType windows +force_install_dir [path] +login anonymous +app_update 728470 validate +quit", runOnce: [{ script: "wine AstroServer.exe", timeOut: 5000 }] },
    });
    console.log("Created Astronner Version")
    await prisma.changeFileAfterSetup.upsert({
      where: { id: 1 },
      create: {
        id: 1, gameVersionId: 1, actions: {
          toReplace: [
            { fileName: "eula.txt", data: [{ search: "eula=false", replace: "eula=true" }] },
          ], matchReplaceOrAppend: [
            {
              fileName: "server.properties", data: [
                { match: "server-port\\s*=\\s*\\d+", replace: "server-port=[port]" },
                { match: "level-seed\\s*=\\s*\\d+", replace: "level-seed=[seed]" },
                { match: "online-mode\\s*=\\s*true", replace: "online-mode=false" }
              ]
            }

          ], afterRestartMatchReplaceOrAppend: [
            {
              fileName: "server.properties", data: [
                { match: "server-port\\s*=\\s*\\d+", replace: "server-port=[port]" },
              ]
            }

          ]
        },
      },
      update: {
        gameVersionId: 1,
        actions: {
          toReplace: [
            { fileName: "eula.txt", data: [{ search: "eula=false", replace: "eula=true" }] },
          ], matchReplaceOrAppend: [
            {
              fileName: "server.properties", data: [
                { match: "server-port\\s*=\\s*\\d+", replace: "server-port=[port]" },
                { match: "level-seed\\s*=\\s*\\d+", replace: "level-seed=[seed]" },
                { match: "online-mode\\s*=\\s*true", replace: "online-mode=false" }
              ]
            }

          ], afterRestartMatchReplaceOrAppend: [
            {
              fileName: "server.properties", data: [
                { match: "server-port\\s*=\\s*\\d+", replace: "server-port=[port]" }
              ]
            }

          ]
        },
      }
    });

    await prisma.changeFileAfterSetup.upsert({
      where: { id: 2 },
      create: {
        id: 2, gameVersionId: 2, actions: {
          toReplace: [
            { fileName: "eula.txt", data: [{ search: "eula=false", replace: "eula=true" }] },
          ],
          matchReplaceOrAppend: [{
            fileName: "server.properties", data: [
              { match: "server-port\\s*=\\s*\\d+", replace: "server-port=[port]" },
              { match: "level-seed\\s*=\\s*\\d+", replace: "level-seed=[seed]" },
              { match: "online-mode\\s*=\\s*true", replace: "online-mode=false" }
            ]
          }],
          afterRestartMatchReplaceOrAppend: [
            {
              fileName: "server.properties", data: [
                { match: "server-port\\s*=\\s*\\d+", replace: "server-port=[port]" }]
            }
          ]
        },
      },
      update: {
        gameVersionId: 2,
        actions: {
          toReplace: [
            { fileName: "eula.txt", data: [{ search: "eula=false", replace: "eula=true" }] },
          ],
          matchReplaceOrAppend: [{
            fileName: "server.properties", data: [
              { match: "server-port\\s*=\\s*\\d+", replace: "server-port=[port]" },
              { match: "level-seed\\s*=\\s*\\d+", replace: "level-seed=[seed]" },
              { match: "online-mode\\s*=\\s*true", replace: "online-mode=false" }
            ]
          }],
          afterRestartMatchReplaceOrAppend: [
            {
              fileName: "server.properties", data: [
                { match: "server-port\\s*=\\s*\\d+", replace: "server-port=[port]" }]
            }
          ]
        },
      }
    });
    await prisma.changeFileAfterSetup.upsert({
      where: { id: 3 },
      create: {
        id: 3, gameVersionId: 3, actions: {
          toReplace: [
            { fileName: "eula.txt", data: [{ search: "eula=false", replace: "eula=true" }] },
          ],
          matchReplaceOrAppend: [{
            fileName: "server.properties", data: [
              { match: "server-port\\s*=\\s*\\d+", replace: "server-port=[port]" },
              { match: "level-seed\\s*=\\s*\\d+", replace: "level-seed=[seed]" },
              { match: "online-mode\\s*=\\s*true", replace: "online-mode=false" }
            ]
          }],
          afterRestartMatchReplaceOrAppend: [
            {
              fileName: "server.properties", data: [
                { match: "server-port\\s*=\\s*\\d+", replace: "server-port=[port]" }]
            }
          ]
        },
      },
      update: {
        gameVersionId: 3,
        actions: {
          toReplace: [
            { fileName: "eula.txt", data: [{ search: "eula=false", replace: "eula=true" }] },
          ],
          matchReplaceOrAppend: [{
            fileName: "server.properties", data: [
              { match: "server-port\\s*=\\s*\\d+", replace: "server-port=[port]" },
              { match: "level-seed\\s*=\\s*\\d+", replace: "level-seed=[seed]" },
              { match: "online-mode\\s*=\\s*true", replace: "online-mode=false" }
            ]
          }],
          afterRestartMatchReplaceOrAppend: [
            {
              fileName: "server.properties", data: [
                { match: "server-port\\s*=\\s*\\d+", replace: "server-port=[port]" }]
            }
          ]
        },
      }
    });

    await prisma.changeFileAfterSetup.upsert({
      where: { id: 4 },
      create: {
        id: 3, gameVersionId: 4, actions: {
          toReplace: [],
          matchReplaceOrAppend: [{
            fileName: "Astro/Saved/Config/WindowsServer/Engine.ini", data: [
              { match: "[URL]\s*\nPort\s*=\s*\d+\s*\n[SystemSettings]\s*\nnet.AllowEncryption\s*=\s*False", replace: "[URL]\nPort=[port]\n[SystemSettings]\nnet.AllowEncryption=False" },
            ],
            fileName: "Astro/Saved/Config/WindowsServer/AstroServerSettings.ini", data: [
              { match: "OwnerGuid\s*=\s*\d\s*", replace: "OwnerGuid=0" },
            ]
          }],
          afterRestartMatchReplaceOrAppend: [
            {
              fileName: "server.properties", data: [
                { match: "Port\s*=\s*\d+\s*", replace: "Port=[port]" }]
            }
          ]
        },
      }, update: {
        gameVersionId: 4, actions: {
          toReplace: [],
          matchReplaceOrAppend: [{
            fileName: "Astro/Saved/Config/WindowsServer/Engine.ini", data: [
              { match: "[URL]\s*\nPort\s*=\s*\d+\s*\n[SystemSettings]\s*\nnet.AllowEncryption\s*=\s*False", replace: "[URL]\nPort=[port]\n[SystemSettings]\nnet.AllowEncryption=False" },
            ],
            fileName: "Astro/Saved/Config/WindowsServer/AstroServerSettings.ini", data: [
              { match: "OwnerGuid\s*=\s*\d\s*", replace: "OwnerGuid=0" },
            ]
          }],
          afterRestartMatchReplaceOrAppend: [
            {
              fileName: "Astro/Saved/Config/WindowsServer/Engine.ini", data: [
                { match: "Port\s*=\s*\d+\s*", replace: "Port=[port]" }]
            }
          ]
        },
      },
    })
    console.log("Created minecraft file requirements")


    await prisma.getFilesSetup.upsert({ where: { id: 1 }, create: { id: 1, gameVersionId: 2, fileName: "eula.txt", content: "eula=true" }, update: { fileName: "eula.txt", gameVersionId: 2, content: "eula=true" } });

    await prisma.getFilesSetup.upsert({ where: { id: 2 }, create: { id: 2, gameVersionId: 2, fileName: "server.properties", content: "" }, update: { fileName: "server.properties", gameVersionId: 2, content: "" } });

    await prisma.getFilesSetup.upsert({ where: { id: 3 }, create: { id: 3, gameVersionId: 3, fileName: "eula.txt", content: "eula=true" }, update: { fileName: "eula.txt", gameVersionId: 2, content: "eula=true" } });

    await prisma.getFilesSetup.upsert({ where: { id: 4 }, create: { id: 4, gameVersionId: 3, fileName: "server.properties", content: "" }, update: { fileName: "server.properties", gameVersionId: 2, content: "" } });












  } catch (error) {
    console.log(error);
  }
};
await seed();
