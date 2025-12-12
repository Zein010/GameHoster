

import bcrypt from "bcrypt";
import { prisma } from "../../prisma.js";


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
const CreateUser = async (data) => {
    data.password = bcrypt.hashSync(data.password, 10);
    const user = await prisma.user.create({ data });
    const { password, ...result } = user;
    return result;
}

const GetAllUsers = async () => {
    const users = await prisma.user.findMany();
    return users.map(user => {
        const { password, ...result } = user;
        return result;
    });
}

const AddLoginAttempt = async (user, ip) => {
    await prisma.userLoginHistory.create({ data: { user: { connect: { id: user.id } }, ip } })

}
const UserService = { GetUser, AddLoginAttempt, GetUserByID, CreateUser, GetAllUsers };
export default UserService