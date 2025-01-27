import { Box, Button, FormControl, FormLabel, Input, Stack } from '@mui/joy'
import { notification } from '../../Utils';

import useSignIn from 'react-auth-kit/hooks/useSignIn';
import { Dispatch, SetStateAction } from 'react';
function SignIn({ setLoginState }: { setLoginState: Dispatch<SetStateAction<"loggedOut" | "2faRequired" | "2FAApp" | "2FAEmail">> }) {



    const signIn = useSignIn();
    const submitForm = async (event: any) => {
        {


            event.preventDefault();
            const formElements = event.currentTarget.elements;
            const data = {
                username: formElements.email.value,
                password: formElements.password.value,
            };
            const response = await fetch(import.meta.env.VITE_API + '/User/Login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
            if (response.ok) {
                const resJson = await response.json();

                if (signIn({
                    auth: {
                        token: resJson.data.token,
                        type: 'Bearer'
                    },
                    userState: resJson.data.user
                })) {
                    if (resJson.data.user.enabled2FA) {

                        setLoginState("2faRequired")
                    } else {

                        window.location.href = "Dashboard/Servers";
                    }
                    // Redirect or do-something
                } else {
                    //Throw error
                }
            } else {
                notification((await response.json()).msg, "error")
            }

        }
    }
    return (
        <form
            onSubmit={(e) => { submitForm(e) }}
        >
            <FormControl required>
                <FormLabel>Email</FormLabel>
                <Input type="email" name="email" />
            </FormControl>
            <FormControl required>
                <FormLabel>Password</FormLabel>
                <Input type="password" name="password" />
            </FormControl>
            <Stack sx={{ gap: 4, mt: 2 }}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >

                </Box>
                <Button type="submit" fullWidth>
                    Sign in
                </Button>
            </Stack>
        </form>
    )
}

export default SignIn