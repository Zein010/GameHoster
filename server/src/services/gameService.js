import { prisma } from "../../prisma.js";

const GetAll = async () => {
    return await prisma.game.findMany({ select: { name: true, id: true, gameVersion: { select: { version: true, id: true } } } });
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
const GetServers = async (filters) => {
    const whereCondition = {};
    if (filters && filters.userId) {
        whereCondition.userId = filters.userId
    }
    return await prisma.runningServers.findMany({ where: {serverid:parseInt(process.env.SERVER_ID), deleted: false, ...whereCondition }, include: { gameVersion: { include: { game: true } }, sysUser: true } });
}
const GetServer = async (serverId) => {
    return await prisma.runningServers.findUnique({ where: { id: parseInt(serverId), deleted: false }, include: { sysUser: true, gameVersion: { include: { game: true, getFilesSetup: true, changeFileAfterSetup: true } } } });
}
const ChangeHostId =async(serverId,hostId)=>{
    return await prisma.runningServers.update({where:{id:parseInt(serverId)},data:{serverId:parseInt(hostId)}});
}
const SetRunningServerPID = async (id, pid) => {
    return await prisma.runningServers.update({ where: { id }, data: { pid } });
}
const DeleteServer = async (id) => {
    return await prisma.runningServers.update({ where: { id }, data: { deleted: true, deletedAt: new Date() } })
}
const AddRunningServer = async (path, username, gameVersionId, scriptFile) => {
    const temp = await prisma.runningServers.create({ data: { path, scriptFile, gameVersion: { connect: { id: gameVersionId } }, sysUser: { connect: { username } },server:{connect:{id:parseInt( process.env.SERVER_ID)}} } })
    return await prisma.runningServers.findUnique({ where: { id: temp.id }, include: { gameVersion: true, sysUser: true } });
}
const SetGameVersionCache = async (id, cacheFile) => {
    const oldVersion=await prisma.gameVersion.findUnique({ where: { id } });
    const oldCacheData=oldVersion.cacheFile?JSON.parse(oldVersion.cacheFile):{};
    oldCacheData[process.env.SERVER_ID]=cacheFile;
    await prisma.gameVersion.update({ where: { id }, data: { cacheFile:JSON.stringify(oldCacheData)} });
}
const AppendToServerConfig = async (id, config) => {
    const server = await prisma.runningServers.findUnique({ where: { id } })

    if (!server.config) {
        server.config = {}
    }
    if (!server.config.startData)
        server.config.startData = [];
    server.config.startData.push(config)
    await prisma.runningServers.update({ where: { id }, data: { config: server.config } })

}
const SetServerTransferingStatus=async(serverId,transfering)=>{
return prisma.runningServers.update({where:{id:parseInt(serverId)},data:{transfering}})
}
const SetCopyToken= async(serverId,copyToken)=>{
return await prisma.runningServers.update({where:{id:parseInt(serverId)},data:{copyToken}})
}

const GameService = {SetServerTransferingStatus,SetCopyToken, GetAll,ChangeHostId, Get, GetVersion, GetServers, GetServer, GetVersions, SetRunningServerPID, AddRunningServer, DeleteServer, SetGameVersionCache, AppendToServerConfig };
export default GameService