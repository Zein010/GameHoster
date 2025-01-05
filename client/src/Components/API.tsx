

import axios from 'axios';
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader';



const useApiRequests = () => {
    const authHeader = useAuthHeader()

    const getGameServers = () => axios.get(import.meta.env.VITE_API + '/Game/Servers', {
        headers: {
            Authorization: authHeader
        }
    })

    return {
        getGameServers
    }
}
export default useApiRequests