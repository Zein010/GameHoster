
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
const SetUserPassword = async (userId, password) => {

    return prisma.user.update({ where: { id: userId }, data: { password: bcrypt.hashSync(password, 10) } })
}
const ValidateUserPassword = async (userID, password) => {
    const user = await prisma.user.findUnique({ where: { id: userID } });

    return bcrypt.compareSync(password, user.password)
}
const GetUserByID = async (id) => {

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
        return null
    }
    const { password, enabled2FA, ...result } = user
    return result
}
const GetUserByEmail = async (email) => {

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        return null
    }
    const { password, enabled2FA, ...result } = user
    return result
}
const GetUser2FA = async (userID) => {

    const user = await prisma.user.findUnique({ where: { id: userID } });
    if (!user) {
        return null
    }
    return user.enabled2FA || { email: false, app: false }
}
const AddLoginAttempt = async (user, ip) => {
    await prisma.userLoginHistory.create({ data: { user: { connect: { id: user.id } }, ip } })

}
const UpdateUser = async (newData, id) => {
    const user = await prisma.user.findUnique({ where: { id } })
    const changes = {};
    Object.keys(newData).forEach(key => {
        if (user[key] !== newData[key]) {

            changes[key] = { old: user[key], new: newData[key], key: key }
        }
    })
    for (let i = 0; i < Object.keys(changes).length; i++) {

        await prisma.userProfileChangeLogs.create({ data: { user: { connect: { id } }, change: Object.values(changes)[i] } })
    }
    return await prisma.user.update({ where: { id }, data: newData })
}
const Update2FAApp = async (newSecret, id) => {
    const current2FA = await GetUser2FA(id);
    current2FA.app = {};
    current2FA.app.secret = newSecret;
    current2FA.app.time = new Date().getTime() / 1000;
    return await prisma.user.update({ data: { enabled2FA: current2FA }, where: { id } })
}
const FindMatch = async (fieldsAndValues) => {
    const condition = [];
    fieldsAndValues.forEach((fieldAndValue) => {
        condition.push({ [fieldAndValue.field]: fieldAndValue.value })
    })
    if (condition.length == 0) return [];
    const matches = await prisma.user.findMany({ where: { OR: condition } })
    const existingMatches = [];
    matches.forEach(match => {
        fieldsAndValues.forEach(fieldAndValue => { if (match[fieldAndValue.field] == fieldAndValue.value) existingMatches.push(fieldAndValue.field) })
    })
    return existingMatches
}
const GetIPRegistrationRequests = async (ip, timeFrame = "today") => {
    let time = new Date().toISOString();
    if (timeFrame == "today") {
        let time = Date.now() - (24 * 60 * 60 * 1000);
        time = new Date(time).toISOString();
    }

    return await prisma.userRegistration.findMany({ where: { IP: { equals: ip }, createdAt: { gte: time } } })
}
const AddIpRegistrationRequests = async (ip, userID) => {

    return await prisma.userRegistration.create({ data: { IP: ip, user: { connect: { id: userID } } } })
}
const CreateUser = async (user) => {
    return await prisma.user.create({ data: user })
}

const UserService = { GetUser, AddLoginAttempt, ValidateUserPassword, GetUserByID, UpdateUser, GetUserByEmail, GetUser2FA, SetUserPassword, Update2FAApp, FindMatch, GetIPRegistrationRequests, AddIpRegistrationRequests, CreateUser };
export default UserService