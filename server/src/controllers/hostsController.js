import GameService from "../services/gameService.js";
import FileService from "../services/fileService.js";
import pathLib from "path";
import { fstat } from "fs";
import { isArray } from "util";
import TerminalService from "../services/TerminalService.js";
import UserService from "../services/userService.js";
import jwt from "jsonwebtoken";
import HostService from "../services/hostService.js";

const GetHosts = async (req, res) => {
    const data = await HostService.GetHosts();
    res.json({ data });
}
const HostController = { GetHosts };
export default HostController