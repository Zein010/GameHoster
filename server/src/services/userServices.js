
import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();
const StoreSysUser = async (username) => {
    return await prisma.sysUser.create({ data: { username } })
}
const sysUserService = { StoreSysUser };
export default sysUserService