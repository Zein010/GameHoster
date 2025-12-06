
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
    const getGameServer = (id: number) => axios.get(API_BASE_URL + `/Game/Server/${id}`, {
        headers: {
            Authorization: authHeader
        }
    })

    const getHosts = () => axios.get(API_BASE_URL + '/Hosts', {
        headers: {
            Authorization: authHeader
        }
    })
    const createServer = (versionId: number) => axios.get(API_BASE_URL + `/Game/CreateServer/${versionId}`, {
        headers: { Authorization: authHeader }
    });



    const getGames = () => axios.get(API_BASE_URL + '/Game', {
        headers: {
            Authorization: authHeader
        }
    })
    const getGameLogs = (hostUrl: string, id: number) => axios.get((hostUrl.startsWith("http") ? hostUrl : `http://${hostUrl}`) + `/Game/GetLog/${id}`, {
        headers: {
            Authorization: authHeader
        }
    })


    const checkGameServerStatus = (hostUrl: string, serverId: number) => axios.get((hostUrl.startsWith("http") ? hostUrl : `http://${hostUrl}`) + `/Game/CheckServer/${serverId}`, { headers: { Authorization: authHeader } })
    const getQueueStatus = (hostUrl: string, queueId: number) => axios.get((hostUrl.startsWith("http") ? hostUrl : `http://${hostUrl}`) + `/Game/queue/${queueId}`, { headers: { Authorization: authHeader } });
    const startGameServer = (hostUrl: string, serverId: number) => axios.get((hostUrl.startsWith("http") ? hostUrl : `http://${hostUrl}`) + `/Game/StartServer/${serverId}`, { headers: { Authorization: authHeader } });
    const stopGameServer = (hostUrl: string, serverId: number) => axios.get((hostUrl.startsWith("http") ? hostUrl : `http://${hostUrl}`) + `/Game/StopServer/${serverId}`, { headers: { Authorization: authHeader } });
    const restartGameServer = (hostUrl: string, serverId: number) => axios.get((hostUrl.startsWith("http") ? hostUrl : `http://${hostUrl}`) + `/Game/RestartServer/${serverId}`, { headers: { Authorization: authHeader } });
    const moveToHost = (hostUrl: string, serverId: number, hostId: number) => axios.get((hostUrl.startsWith("http") ? hostUrl : `http://${hostUrl}`) + `/Game/MoveToHost/${serverId}/${hostId}`, { headers: { Authorization: authHeader } });

    // -- Start Command Manager Actions
    const sendCommand = (hostUrl: string, serverId: number, command: string, body: any) => axios.post((hostUrl.startsWith("http") ? hostUrl : `http://${hostUrl}`) + `/Game/Command/${serverId}/${command}`, body, { headers: { Authorization: authHeader } });
    const getGameBannedPlayers = (hostUrl: string, serverId: number) => axios.get((hostUrl.startsWith("http") ? hostUrl : `http://${hostUrl}`) + `/Game/Command/${serverId}/GetBanned`, { headers: { Authorization: authHeader } })
    const getGamePlayers = (hostUrl: string, serverId: number) => axios.get((hostUrl.startsWith("http") ? hostUrl : `http://${hostUrl}`) + `/Game/Command/${serverId}/GetPlayers`, { headers: { Authorization: authHeader } })
    // -- End Command Manager Actions


    // -- Start File Manager Actions
    const getFileContent = (hostUrl: string, serverId: number, body: any) => axios.post((hostUrl.startsWith("http") ? hostUrl : `http://${hostUrl}`) + `/Files/${serverId}/GetContent`, body, { headers: { Authorization: authHeader } });
    const getFiles = (hostUrl: string, id: string, currentPath: string) => axios.post((hostUrl.startsWith("http") ? hostUrl : `http://${hostUrl}`) + `/Files/${id}`, { path: currentPath }, { headers: { Authorization: authHeader } })
    const createFile = (hostUrl: string, id: string, currentPath: string, createType: string, createName: string) => axios.post((hostUrl.startsWith("http") ? hostUrl : `http://${hostUrl}`) + `/Files/${id}/${createType}`, { name: createName, path: currentPath }, { headers: { Authorization: authHeader } })
    const saveFileContent = (hostUrl: string, serverId: number, body: any) => axios.post((hostUrl.startsWith("http") ? hostUrl : `http://${hostUrl}`) + `/Files/${serverId}/SaveContent`, body, { headers: { Authorization: authHeader } });
    const downloadFile = (hostUrl: string, serverId: number, selectedFiles: string[], currentPath: string) => axios.post((hostUrl.startsWith("http") ? hostUrl : `http://${hostUrl}`) + `/Files/${serverId}/Download`, { files: selectedFiles, path: currentPath }, { headers: { Authorization: authHeader } });
    const deleteFiles = (hostUrl: string, serverId: number, selectedFiles: string[], currentPath: string) => axios.post((hostUrl.startsWith("http") ? hostUrl : `http://${hostUrl}`) + `/Files/${serverId}/Delete`, { files: selectedFiles, path: currentPath }, { headers: { Authorization: authHeader } });

    // -- End File Manager Actions

    // -- Start Managers
    const fileManager = { getFileContent, getFiles, saveFileContent, createFile, downloadFile, deleteFiles }
    const commandManager = { sendCommand, getGameBannedPlayers, getGamePlayers, };
    // -- End Managers

    return {
        getGameServers, getGameServer, fileManager, commandManager, getGames, createServer, checkGameServerStatus, getGameLogs, startGameServer, stopGameServer, restartGameServer, getHosts, moveToHost, downloadFile, getQueueStatus
    }
}
export default useApiRequests