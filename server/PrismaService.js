import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const StoreUser = async (username) => {
    return await prisma.sysUser.create({ data: { username } });
}
const SetUserAccess = async (username, path) => {
    return await prisma.userAccess.create({ data: { sysUser: { connect: { username: username } }, path } })
}
const PrismaService = { StoreUser, SetUserAccess }
export default PrismaService;