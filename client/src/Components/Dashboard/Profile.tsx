import { Box, Sheet, Typography } from '@mui/joy'

import "../../index.css"
import { useEffect, useState } from 'react'
import useApiRequests from '../API';

function Profile() {
    const requests = useApiRequests()
    const [profile, setProfile] = useState<{ id: number, firstName: string, lastName: string, verified: boolean, createdAt: string }>();
    useEffect(() => {
        const getProfileDetails = async () => {
            const response = await requests.getProfile();
            setProfile(response.data.user)
        }
        getProfileDetails()
    }, [])
    console.log(profile)
    return (
        <Sheet className="mx-10 px-3 mt-6">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 2 }}>

                <Typography level="h3">Profile</Typography>

            </Box>

        </Sheet >

    )
}

export default Profile
