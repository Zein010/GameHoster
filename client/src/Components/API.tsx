

import axios from 'axios';
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader';
import { API_BASE_URL } from '../Config/app.config';



const useApiRequests = () => {
    const authHeader = useAuthHeader()

    const getGameServers = () => axios.get(API_BASE_URL + '/Game/Servers', {
        headers: {
            Authorization: authHeader
        }
    })

    const getHosts = () => axios.get(API_BASE_URL + '/Hosts', {
        headers: {
            Authorization: authHeader
        }
    })
    const createServer = (versionId: number) => axios.get(API_BASE_URL + `/Game/CreateServer/${versionId}` ,{
        headers: { Authorization: authHeader }
    });

    

    const getGames = () => axios.get(API_BASE_URL + '/Game', {
        headers: {
            Authorization: authHeader
        }
    })
    const getGameLogs = (id:number) => axios.get(API_BASE_URL + `/Game/GetLog/${id}`, {
        headers: {
            Authorization: authHeader
        }
    })


    const checkGameServerStatus=(serverId:number)=>axios.get(API_BASE_URL + `/Game/CheckServer/${serverId}`,{headers:{Authorization:authHeader}})
    const startGameServer=(serverId:number)=>axios.get(API_BASE_URL + `/Game/StartServer/${serverId}`,{headers:{Authorization:authHeader}});
    const stopGameServer=(serverId:number)=>axios.get(API_BASE_URL + `/Game/StopServer/${serverId}`,{headers:{Authorization:authHeader}});
    const moveToHost=(serverId:number,hostId:number)=>axios.get(API_BASE_URL + `/Game/MoveToHost/${serverId}/${hostId}`,{headers:{Authorization:authHeader}});
    


    // -- Start Command Manager Actions
    const sendCommand=(serverId:number,command:string,body:any)=>axios.post(API_BASE_URL + `/Game/Command/${serverId}/${command}`,body,{headers:{Authorization:authHeader}});
    const getGameBannedPlayers=(serverId:number)=>axios.get(API_BASE_URL + `/Game/Command/${serverId}/GetBanned`,{headers:{Authorization:authHeader}})
    const getGamePlayers=(serverId:number)=>axios.get(API_BASE_URL + `/Game/Command/${serverId}/GetPlayers`,{headers:{Authorization:authHeader}})
    // -- End Command Manager Actions

    
    // -- Start File Manager Actions
    const getFileContent=(serverId:number,body:any)=>axios.post(API_BASE_URL + `/Files/${serverId}/GetContent`,body,{headers:{Authorization:authHeader}});
    const getFiles = (id: string, currentPath: string) => axios.post(API_BASE_URL + `/Files/${id}`, { path: currentPath }, {headers: { Authorization: authHeader }})
    const createFile = (id: string, currentPath: string, createType: string, createName: string) => axios.post(API_BASE_URL + `/Files/${id}/${createType}`, { name: createName, path: currentPath }, {headers: { Authorization: authHeader }})
    const saveFileContent=(serverId:number,body:any)=>axios.post(API_BASE_URL + `/Files/${serverId}/SaveContent`,body,{headers:{Authorization:authHeader}});
    const downloadFile=(serverId:number,selectedFiles:string[],currentPath:string)=>axios.post(API_BASE_URL + `/Files/${serverId}/Download`,{ files: selectedFiles, path: currentPath },{headers:{Authorization:authHeader}});
    const deleteFiles=(serverId:number,selectedFiles:string[],currentPath:string)=>axios.post(API_BASE_URL + `/Files/${serverId}/Delete`,{ files: selectedFiles, path: currentPath },{headers:{Authorization:authHeader}});
   
    // -- End File Manager Actions
    
    // -- Start Managers
    const fileManager={getFileContent,getFiles,saveFileContent,createFile,downloadFile,deleteFiles}
    const commandManager={sendCommand,getGameBannedPlayers,getGamePlayers,};
    // -- End Managers
    
    return {
        getGameServers,fileManager,commandManager, getGames,createServer,checkGameServerStatus,getGameLogs,startGameServer,stopGameServer,getHosts,moveToHost,downloadFile
    }
}
export default useApiRequests