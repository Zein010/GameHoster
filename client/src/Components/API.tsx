

import axios from 'axios';
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader';



const useApiRequests = () => {
    const authHeader = useAuthHeader()

    const getGameServers = () => axios.get(import.meta.env.VITE_API + '/Game/Servers', {
        headers: {
            Authorization: authHeader
        }
    })

    const getHosts = () => axios.get(import.meta.env.VITE_API + '/Hosts', {
        headers: {
            Authorization: authHeader
        }
    })
    const createServer = (versionId: number) => axios.get(import.meta.env.VITE_API + `/Game/CreateServer/${versionId}` ,{
        headers: { Authorization: authHeader }
    });



    const getFiles = (id: string, currentPath: string) => axios.post(import.meta.env.VITE_API + `/Files/${id}`, { path: currentPath }, {
        headers: { Authorization: authHeader }
    })

    const createFile = (id: string, currentPath: string, createType: string, createName: string) => axios.post(import.meta.env.VITE_API + `/Files/${id}/${createType}`, { name: createName, path: currentPath }, {
        headers: { Authorization: authHeader }
    })


    const getGames = () => axios.get(import.meta.env.VITE_API + '/Game', {
        headers: {
            Authorization: authHeader
        }
    })
    const getGameLogs = (id:number) => axios.get(import.meta.env.VITE_API + `/Game/GetLog/${id}`, {
        headers: {
            Authorization: authHeader
        }
    })
    const checkGameServerStatus=(serverId:number)=>axios.get(import.meta.env.VITE_API + `/Game/CheckServer/${serverId}`,{headers:{Authorization:authHeader}})
    const getGamePlayers=(serverId:number)=>axios.get(import.meta.env.VITE_API + `/Game/Command/${serverId}/GetPlayers`,{headers:{Authorization:authHeader}})
    const getGameBannedPlayers=(serverId:number)=>axios.get(import.meta.env.VITE_API + `/Game/Command/${serverId}/GetBanned`,{headers:{Authorization:authHeader}})
    const sendCommand=(serverId:number,command:string,body:any)=>axios.post(import.meta.env.VITE_API + `/Game/Command/${serverId}/${command}`,body,{headers:{Authorization:authHeader}});
    const getFileContent=(serverId:number,body:any)=>axios.post(import.meta.env.VITE_API + `/Files/${serverId}/GetContent`,body,{headers:{Authorization:authHeader}});
    const saveFileContent=(serverId:number,body:any)=>axios.post(import.meta.env.VITE_API + `/Files/${serverId}/SaveContent`,body,{headers:{Authorization:authHeader}});
    const startGameServer=(serverId:number)=>axios.get(import.meta.env.VITE_API + `/Game/StartServer/${serverId}`,{headers:{Authorization:authHeader}});
    const stopGameServer=(serverId:number)=>axios.get(import.meta.env.VITE_API + `/Game/StopServer/${serverId}`,{headers:{Authorization:authHeader}});
    return {
        getGameServers, getFiles, createFile,getGames,createServer,checkGameServerStatus,getGameLogs,getGamePlayers,getGameBannedPlayers,sendCommand,getFileContent,saveFileContent,startGameServer,stopGameServer,getHosts
    }
}
export default useApiRequests