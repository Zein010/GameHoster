
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
    return await prisma.gameVersion.findUnique({ where: { id }, include: { game: true, getFilesSetup: true, changeFileAfterSetup: true } })
}
const GetServers = async (gameVersionId) => {
    return await prisma.runningServers.findMany({ where: { gameVersionId, deleted: false } });
}
const GetServer = async (serverId) => {
    return await prisma.runningServers.findUnique({ where: { id: serverId, deleted: false }, include: { sysUser: true, gameVersion: { include: { getFilesSetup: true, changeFileAfterSetup: true } } } });
}
const SetRunningServerPID = async (id, pid) => {
    return await prisma.runningServers.update({ where: { id }, data: { pid } });
}
const DeleteServer = async (id) => {
    return await prisma.runningServers.update({ where: { id }, data: { deleted: true, deletedAt: new Date() } })
}
const AddRunningServer = async (path, username, gameVersionId, scriptFile) => {
    const temp = await prisma.runningServers.create({ data: { path, scriptFile, gameVersion: { connect: { id: gameVersionId } }, sysUser: { connect: { username } } } })
    return await prisma.runningServers.findUnique({ where: { id: temp.id }, include: { gameVersion: true, sysUser: true } });
}
const SetGameVersionCache = async (id, cacheFile, scriptFile) => {
    await prisma.gameVersion.update({ where: { id }, data: { cacheFile, scriptFile } });
}
const GameService = { GetAll, Get, GetVersion, GetServers, GetServer, GetVersions, SetRunningServerPID, AddRunningServer, DeleteServer, SetGameVersionCache };
export default GameService