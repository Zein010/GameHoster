import UserService from "../services/userService.js";
import jwt from "jsonwebtoken";
import twofactor from "node-2fa";

const Temp2FASecrets = {};
const Login = async (req, res) => {
    const { username, password } = req.body
    const user = await UserService.GetUser(username, password);
    if (!user)
        return res.status(404).json({ "msg": "User not found" })
    const required2FA = [];
    if (user.enabled2FA) {
        Object.keys(user.enabled2FA).forEach(authOption => {
            if (user.enabled2FA[authOption]) {
                required2FA.push(authOption)
            }
        })
    }
    user.enabled2FA = required2FA.length > 0 ? required2FA : false;
    await UserService.AddLoginAttempt(user, req.ip)
    const token = jwt.sign({ id: user.id, locked: required2FA.length > 0 ? true : false }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const refresh = jwt.sign({ id: user.id, locked: required2FA.length > 0 ? true : false }, process.env.JWT_REFRESH_SECRET, { expiresIn: '5h' });
    res.json({ "msg": "Login Success" + (required2FA.length > 0 ? ", 2FA Required" : ""), data: { user, token, refresh } });
}

const Profile = async (req, res) => {
    return res.status(200).json({ success: true, user: req.user });
}
const UpdateProfile = async (req, res) => {
    const userId = req.user.id
    const user = await UserService.GetUserByID(userId)
    if (!user)
        return res.status(404).json({ "msg": "User not found" })
    const { username, firstName, lastName, email, phone } = req.body

    // Verify email
    if (email && email !== user.email) {
        const emailExists = await UserService.GetUserByEmail(email)
        if (emailExists && emailExists.id !== userId)
            return res.status(400).json({ "msg": "Email already exists" })
    }
    // Verify Email Regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
        return res.status(400).json({ "msg": "Invalid email format" });
    }

    const updatedUser = await UserService.UpdateUser({ username, firstName, lastName, email, phone }, userId)
    if (updatedUser)
        return res.status(200).json({ "msg": "User updated successfully", data: updatedUser })
    else return res.status(400).json({ "msg": "User not updated" })

}
const GetEnabled2FA = async (req, res) => {
    const user = req.user;
    const user2FA = await UserService.GetUser2FA(user.id)
    if (!user2FA) {
        return res.status(404).json({ "msg": "User not found" })

    }
    const enabled2FA = {};
    Object.keys(user2FA).forEach(key => {
        enabled2FA[key] = user2FA[key] ? true : false

    })
    return res.status(200).json({ "success": true, "msg": "Enabled 2FA", data: enabled2FA })

}
const Generate2FASecret = async (req, res) => {
    const user = await UserService.GetUserByID(req.user.id)
    const Old2FA = await UserService.GetUser2FA(user.id)
    if (Old2FA.app) {

        // verifiy if provided get request works with the stored 2fa code
        const token = req.query.token
        if (!token) {
            return res.status(400).json({ "msg": "Code not provided" })
        }
        if (!twofactor.verifyToken(Old2FA.code, code)) {
            return res.status(400).json({ "msg": "Invalid 2FA Code" })
        }
    }
    const code = twofactor.generateSecret({ name: "Zyxnware", account: user.email })
    code.qrCodeUrl = twofactor.generateAuth
    Temp2FASecrets[user.id] = code
    Temp2FASecrets[user.id].time = new Date().getTime() / 1000;
    return res.status(200).json({ "success": true, "msg": "2FA Secret Generated", data: code })

}
const ValidateNew2FA = async (req, res) => {
    const user = req.user;
    if (!Temp2FASecrets[user.id]) {
        return res.status(400).json({ success: false, msg: "Something went wrong, please try again" });
    }
    if (!Temp2FASecrets[user.id].time + 300 >= new Date().getTime() / 1000) {
        delete Temp2FASecrets[user.id]
        return res.status(400).json({ success: false, msg: "Too long to process, kindly try again, but faster" });
    }

    const verification = twofactor.verifyToken(Temp2FASecrets[user.id].secret, req.body.code);
    if (!verification) {
        return res.status(400).json({ success: false, msg: "Invalid code, kindly try again, or rescan the QR code and try" });

    }
    if (verification.delta == 0 || verification.delta == 1 || verification.delta == -1) {
        UserService.Update2FAApp(Temp2FASecrets[user.id].secret, user.id);
        return res.status(200).json({ success: true, msg: "2FA has been setup on your profile" });
    } else {

        return res.status(400).json({ success: false, msg: "Code expired, kindly enter a new one" });
    }


}

const Authenticate2FAAppCode = async (req, res) => {
    const user = req.user;
    const code = req.body.code
    const user2FA = await UserService.GetUser2FA(user.id);
    if (user2FA.app) {
        const tokenVerification = twofactor.verifyToken(user2FA.app.secret, code);
        if (!tokenVerification) {
            return res.status(400).json({ success: false, msg: "Code invalid, kindly try again" })
        }
        if (tokenVerification.delta >= -1 && tokenVerification.delta <= 1) {
            const token = jwt.sign({ id: user.id, locked: false }, process.env.JWT_SECRET, { expiresIn: '1h' });
            const refresh = jwt.sign({ id: user.id, locked: false }, process.env.JWT_REFRESH_SECRET, { expiresIn: '5h' });
            const cleanUser = UserService.GetUserByID(user.id);
            return res.status(200).json({ success: true, msg: "Logging in", data: { token, refresh, user: cleanUser } });
        }
        return res.status(400).json({ success: false, msg: "Code expired, kindly try a new code" });

    }
}
const SignUp = async (req, res) => {
    const { username, firstName, lastName, email, phone, password, passwordConfirm } = req.body
    const ip = req.ip
    const ipRequests = await UserService.GetIPRegistrationRequests(ip);
    if (ipRequests.length > 0) {
        return res.status(400).json({
            success: false, errors: [
                { name: "custom", msg: "Registration limit reached" }]
        })

    }
    if (passwordConfirm !== password) {
        return res.status(400).json({
            success: false, errors: [
                { name: "passwordConfirm", msg: "Password and password confirm must match" },
                { name: "password", msg: "Password and password confirm must match" }
            ]
        })
    }

    const matches = await UserService.findMatch([
        { field: "username", value: username },
        { field: "email", value: email },
        { field: "phone", value: phone },
    ]);
    if (matches.length > 0) {
        const resErrors = [];
        matches.forEach(match => {
            resErrors.push({ "name": match, msg: `There already exists a using the same ${match}` });
        })
        return res.status(400).json({ success: false, resErrors });
    }

}
const UserController = { SignUp, Login, Profile, UpdateProfile, GetEnabled2FA, Generate2FASecret, ValidateNew2FA, Authenticate2FAAppCode };
export default UserController