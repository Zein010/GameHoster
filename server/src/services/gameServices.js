
import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();
const GetAll = async () => {
    return await prisma.game.findMany();
}
const Get = async (id) => {
    return await prisma.game.findUnique({ where: { id }, include: { gameVersion: true } })
}

const GetVersion = async () => {
    return await prisma.gameVersion.findMany({ where: { gameId: id }, include: { game: true } })
}
const Servers = async (gameVersionId) => {
    return await prisma.runningServers.findMany({ where: { gameVersionId } });
}
const GetServer = async (serverId) => {
    return await prisma.runningServers.findUnique({ where: { id: serverId } });
}

const GameService = {};
export default GameServiceF