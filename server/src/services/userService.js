
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
const prisma = new PrismaClient();

const GetUser = async (username, tpassword) => {

    const user = await prisma.user.findUnique({ where: { email: username } });
    if (!user) {
        return null
    }

    if (!bcrypt.compareSync(tpassword, user.password)) {
        return null
    }
    const { password, ...result } = user
    return result

}
const GetUserByID = async (id) => {

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
        return null
    }
    const { password, ...result } = user
    return result
}
const GetUserByEmail = async (email) => {

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        return null
    }
    const { password, ...result } = user
    return result
}
const AddLoginAttempt = async (user, ip) => {
    await prisma.userLoginHistory.create({ data: { user: { connect: { id: user.id } }, ip } })

}
const UpdateUser = async (newData, id) => {
    return await prisma.user.update({ where: { id }, data: newData })
}
const UserService = { GetUser, AddLoginAttempt, GetUserByID, UpdateUser, GetUserByEmail };
export default UserService