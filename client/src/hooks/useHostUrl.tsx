import { useState, useEffect } from 'react';
import useApiRequests from '../Components/API';

const useHostUrl = (serverId: number | undefined) => {
    const [hostUrl, setHostUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const requests = useApiRequests();

    useEffect(() => {
        const fetchHostUrl = async () => {
            if (!serverId || isNaN(serverId)) {
                setLoading(false);
                return;
            }
            try {
                const response = await requests.getGameServer(serverId);
                if (response.status === 200) {
                    const serverData = response.data.data;
                    if (serverData && serverData.server) {
                        setHostUrl(serverData.server.url);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch host URL", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHostUrl();
    }, [serverId]); // eslint-disable-next-line react-hooks/exhaustive-deps

    return { hostUrl, loading };
};

export default useHostUrl;
