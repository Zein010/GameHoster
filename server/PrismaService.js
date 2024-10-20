import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const StoreUser = async (username) => {
    return await prisma.sysUser.create({ data: { username } });
}
const SetUserAccess = async (username, path) => {
    return await prisma.userAccess.create({ data: { sysUser: { connect: { username: username } }, path } })
}
const GetGameVersion = async (id) => {
    return await prisma.gameVersion.findUnique({ where: { id }, include: { game: true } })
}
const GetGameVersions = async (gameId) => {
    return await prisma.gameVersion.findMany({ where: { gameId: +gameId } })
}
const PrismaService = { StoreUser, SetUserAccess, GetGameVersion, GetGameVersions }
export default PrismaService;