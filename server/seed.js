import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const seed = async () => {
  try {
    await prisma.user.upsert({
      where: { id: 1 },
      create: { id: 1, username: "Zyxn010", password: "123123aA@" },
      update: { username: "Zyxn010", password: "123123aA@" },
    });
    console.log("Created Default User")
    await prisma.game.upsert({
      where: { id: 1 },
      create: { id: 1, name: "Minecraft", dirName: "minecraft" },
      update: { name: "Minecraft", dirName: "minecraft" },
    });
    console.log("Created Minecraft Server")
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
    console.log("Created Minecraft Version")
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
    console.log("Created minecraft file requirements")


    await prisma.getFilesSetup.upsert({ where: { id: 1 }, create: { id: 1, gameVersionId: 2, fileName: "eula.txt", content: "eula=true" }, update: { fileName: "eula.txt", gameVersionId: 2, content: "eula=true" } });
    console.log("Created eula.txt")

    await prisma.getFilesSetup.upsert({ where: { id: 2 }, create: { id: 2, gameVersionId: 2, fileName: "server.properties", content: "" }, update: { fileName: "server.properties", gameVersionId: 2, content: "" } });
    console.log("Created eula.txt")

  } catch (error) {
    console.log(error);
  }
};
await seed();
