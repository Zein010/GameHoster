
import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();
const GetAll = async () => {
    return await prisma.sysUser.findMany();
}
const Get = async (id) => {
    return await prisma.sysUser.findUnique({ where: { id }, include: { runningServers: true, userAccess: true } });
}


const SysUserService = {};
export default SysUserService