import GameService from "../services/gameService.js";
import FileService from "../services/fileService.js";
import pathLib from "path";
import { fstat } from "fs";
import { isArray } from "util";
import TerminalService from "../services/TerminalService.js";
import UserService from "../services/userService.js";
import jwt from "jsonwebtoken";
const Login = async (req, res) => {
    const { username, password } = req.body
    const user = await UserService.GetUser(username, password);
    if (!user)
        return res.status(404).json({ "msg": "User not found" })

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const refresh = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '5h' });
    await UserService.AddLoginAttempt(user, req.ip)
    res.json({ "msg": "Login Success", data: { user, token, refresh } });
}

const Profile = async (req, res) => {
    return res.status(200).json({ success: true, user: req.user });
}
const UserController = { Login, Profile };
export default UserController