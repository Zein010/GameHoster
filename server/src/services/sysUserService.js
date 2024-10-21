
import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();
const StoreSysUser = async (username) => {
    return await prisma.sysUser.create({ data: { username } })
}
const GetAll = async () => {
    return await prisma.sysUser.findMany();
}
const Get = async (id) => {
    return await prisma.sysUser.findUnique({ where: { id }, include: { userAccess: true, runningServers: true } })
}
const DeleteUser = async (id) => {
    return await prisma.sysUser.update({ where: { id }, data: { delete: true, deletedAt: new Date() } })
}
const sysUserService = { StoreSysUser, GetAll, Get, DeleteUser };
export default sysUserService