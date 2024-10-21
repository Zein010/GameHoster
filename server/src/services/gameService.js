
import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();
const GetAll = async () => {
    return await prisma.game.findMany();
}
const Get = async (id) => {
    return await prisma.game.findUnique({ where: { id }, include: { gameVersion: true } })
}
const GetVersions = async (id) => {
    return await prisma.gameVersion.findMany({ where: { gameId: id }, include: { game: true } })
}
const GetVersion = async (id) => {
    return await prisma.gameVersion.findUnique({ where: { id }, include: { game: true, getFilesSetup: true } })
}
const GetServers = async (gameVersionId) => {
    return await prisma.runningServers.findMany({ where: { gameVersionId } });
}
const GetServer = async (serverId) => {
    return await prisma.runningServers.findUnique({ where: { id: serverId }, include: { sysUser: true, gameVersion: true } });
}
const SetRunningServerPID = async (id, pid) => {
    return await prisma.runningServers.update({ where: { id }, data: { pid } });
}
const AddRunningServer = async (path, username, gameVersionId, scriptFile) => {
    return await prisma.runningServers.create({ data: { path, scriptFile, gameVersion: { connect: { id: gameVersionId } }, sysUser: { connect: { username } } } })
}
const GameService = { GetAll, Get, GetVersion, GetServers, GetServer, GetVersions, SetRunningServerPID, AddRunningServer };
export default GameService