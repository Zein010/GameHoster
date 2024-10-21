import TerminalService from "../services/TerminalService.js";
import GameService from "../services/gameService.js";
import sysUserService from "../services/sysUserService.js";

const GetAll = async (req, res) => {
    const data = await sysUserService.GetAll();
    res.json({ data })
}
const Get = async (req, res) => {
    const { id } = res.params
    const data = await sysUserService.Get(parseInt(id));
    res.json({ data })
}
const Delete = async (req, res) => {
    const { id } = res.params
    const sysUser = await sysUserService.Get(parseInt(id));
    for (let i = 0; i < sysUser.runningServers.length; i++) {

        TerminalService.DeleteDir(sysUser.runningServers[i].path)
        await GameService.DeleteServer(sysUser.runningServers[i].id);
    }
    TerminalService.DeleteUser(sysUser.username);
    sysUserService.DeleteUser(sysUser.id);
}
const GameController = { GetAll, Get, Delete };
export default GameController