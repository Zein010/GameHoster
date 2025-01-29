
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
    const matches = await prisma.user.findMany({ where: { OR: { condition } } })
    const existingMatches = [];
    matches.forEach(match => {
        fieldsAndValues.forEach(fieldAndValue => { if (match[fieldAndValue.field] == fieldAndValue.value) existingMatches.push(fieldAndValue.field) })
    })
    return existingMatches
}
const GetIPRegistrationRequests = async (ip, timeFrame = "today") => {

    if (timeFrame == "today") {
        let time = Date.now() - (24 * 60 * 60 * 1000);
        time = new Date(time).toISOString();
    }

    return await prisma.userRegistration.findMany({ where: { ip: { equals: ip }, createdAt: { gte: time } } })
}
const UserService = { GetUser, AddLoginAttempt, GetUserByID, UpdateUser, GetUserByEmail, GetUser2FA, Update2FAApp, FindMatch, GetIPRegistrationRequests };
export default UserService