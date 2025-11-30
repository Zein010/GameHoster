
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
const prisma = new PrismaClient();

const GetHost = async (serverId) => {
    const server = await prisma.server.findUnique({ where: {id:serverId } });
    if (!server) {
        return null
    }
    return server
}


const GetHosts = async (filters) => {
    return await prisma.server.findMany({ where: { deleted: false },select:{id:true,url:true,deleted:true,frontendUrl:true} });
}
const HostService = {GetHost ,GetHosts};
export default HostService