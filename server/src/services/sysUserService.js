import { prisma } from "../../prisma.js";


const StoreSysUser = async (username) => {
    try{
        return await prisma.sysUser.create({ data: { username } })
    }catch (err){
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
        return await prisma.sysUser.findFirst({where:{username}});
        }
      }
    }
}
const GetAll = async () => {
    return await prisma.sysUser.findMany({ where: { deleted: false } });
}
const Get = async (id) => {
    return await prisma.sysUser.findUnique({ where: { id }, include: { userAccess: true, runningServers: true } })
}
const DeleteUser = async (id) => {
    return await prisma.sysUser.update({ where: { id }, data: { deleted: true, deletedAt: new Date() } })
}
const sysUserService = { StoreSysUser, GetAll, Get, DeleteUser };
export default sysUserService