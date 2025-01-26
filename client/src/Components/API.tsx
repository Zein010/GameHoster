import axios from "axios";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";

const useApiRequests = () => {
    const authHeader = useAuthHeader();
    const getGameServers = () =>
        axios.get(import.meta.env.VITE_API + "/Game/Servers", {
            headers: {
                Authorization: authHeader,
            },
        });

    const getFiles = (id: string, currentPath: string) =>
        axios.post(
            import.meta.env.VITE_API + `/Files/${id}`,
            { path: currentPath },
            {
                headers: { Authorization: authHeader },
            }
        );

    const createFile = (id: string, currentPath: string, createType: string, createName: string) =>
        axios.post(
            import.meta.env.VITE_API + `/Files/${id}/${createType}`,
            { name: createName, path: currentPath },
            {
                headers: { Authorization: authHeader },
            }
        );

    const getProfile = () =>
        axios.get(import.meta.env.VITE_API + `/user/profile`, {
            headers: { Authorization: authHeader },
        });

    const updateProfile = (profileData: { username: string; email: string; firstName: string; lastName: string; phone: string }) =>
         axios.put(import.meta.env.VITE_API + `/user/profile`, profileData, {
            headers: { Authorization: authHeader },
        });
    return {
        getGameServers,
        getFiles,
        createFile,
        getProfile,
        updateProfile,
    };
};
export default useApiRequests;
