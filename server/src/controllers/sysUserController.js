import TerminalService from "../services/TerminalService.js";
import GameService from "../services/gameService.js";
import sysUserService from "../services/sysUserService.js";

const GetAll = async (req, res) => {
    const data = await sysUserService.GetAll();
    res.json({ data })
}
const Get = async (req, res) => {
    const { id } = req.params
    const data = await sysUserService.Get(parseInt(id));
    res.json({ data })
}
const Delete = async (req, res) => {
    const { id } = req.params
    const sysUser = await sysUserService.Get(parseInt(id));
    if (!sysUser)
        return res.status(400).json({ msg: "SysUser not found" })
    for (let i = 0; i < sysUser.runningServers.length; i++) {

        TerminalService.DeleteDir(sysUser.runningServers[i].path)
        await GameService.DeleteServer(sysUser.runningServers[i].id);
    }
    TerminalService.DeleteUser(sysUser.username);
    sysUserService.DeleteUser(sysUser.id);
    res.json({ msg: "Deleted Successfully" });
}
const GameController = { GetAll, Get, Delete };
export default GameController