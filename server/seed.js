import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const seed = async () => {
  try {
    await prisma.getFilesSetup.deleteMany({ where: { gameVersionId: 1 } });
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
      create: { id: 1, searchScript: "java", gameId: 1, version: "1.21.1", downloadLink: "https://piston-data.mojang.com/v1/objects/59353fb40c36d304f2035d51e7d6e6baa98dc05c/server.jar", runScript: "java -Xmx1024M -Xms1024M -jar  [{fileName}] nogui" },
      update: { searchScript: "java", gameId: 1, version: "1.21.1", downloadLink: "https://piston-data.mojang.com/v1/objects/59353fb40c36d304f2035d51e7d6e6baa98dc05c/server.jar", runScript: "java -Xmx1024M -Xms1024M -jar  [{fileName}] nogui" },
    });
    console.log("Created Minecraft Version")
    await prisma.changeFileAfterSetup.upsert({
      where: { id: 1 },
      create: {
        id: 1, gameVersionId: 1, actions: {
          toReplace: [
            { fileName: "eula.txt", data: [{ search: "eula=false", replaceWith: "eula=true" }] },
            { fileName: "server.properties", data: [{ search: "online-mode=true", replaceWith: "online-mode=false" }] }
          ], matchReplaceOrAppend: [
            {
              fileName: "server.properties", data: [
                { match: "server-port\\s*=\\s*\\d+", replace: "server-port=[port]" },
                { match: "level-seed\\s*=\\s*\\d+", replace: "level-seed=[seed]" }
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
            { fileName: "eula.txt", data: [{ search: "eula=false", replaceWith: "eula=true" }] },
            { fileName: "server.properties", data: [{ search: "online-mode=true", replaceWith: "online-mode=false" }] }
          ], matchReplaceOrAppend: [
            {
              fileName: "server.properties", data: [
                { match: "server-port\\s*=\\s*\\d+", replace: "server-port=[port]" },
                { match: "level-seed\\s*=\\s*\\d+", replace: "level-seed=[seed]" }
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
      }
    });
    console.log("Created minecraft file requirements")
  } catch (error) {
    console.log(error);
  }
};
await seed();
