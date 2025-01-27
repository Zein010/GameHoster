import { Button, Input, Stack, Typography } from "@mui/joy"
import { Dispatch, SetStateAction, useRef } from "react"
import { notification } from "../../Utils"
import useApiRequests from "../API"
import { AxiosError } from "axios"
import useSignIn from "react-auth-kit/hooks/useSignIn"

function AuthApp2FA({ setLoginState }: { setLoginState: Dispatch<SetStateAction<"loggedOut" | "2faRequired" | "2FAApp" | "2FAEmail">> }) {
    const requests = useApiRequests()
    const signIn = useSignIn();
    const verify2faCode = async () => {

        if (!codeInput.current) return
        if (codeInput.current.value.length != 6 || isNaN(codeInput.current.value)) {
            notification("Code should be 6 numbers only", "error");
            return
        }
        try {
            const response = await requests.authenticate2FA(codeInput.current.value)
            notification(response.data.msg, "success");
            console.log(response);
            if (signIn({
                auth: {
                    token: response.data.data.token,
                    type: 'Bearer'
                },
                userState: response.data.data.user
            })) {
                if (response.data.data.user.enabled2FA) {

                    setLoginState("2faRequired")
                } else {

                    window.location.href = "Dashboard/Servers";
                }
                // Redirect or do-something
            } else {
                //Throw error
            }
        } catch (e: any) {
            notification(e.response.data.msg, "error");
        }


    }
    const codeInput = useRef<HTMLInputElement>(null);
    return (
        <Stack sx={{ gap: 4, mt: 2 }}>
            <Typography sx={{ textAlign: 'center' }}>
                Kindly enter the code provided by your authenticator
            </Typography>
            <Input slotProps={{ input: { ref: codeInput } }} />
            <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                <Button variant="outlined" onClick={() => { setLoginState("2faRequired") }} color="danger">Back</Button>

                <Button variant="outlined" color="success" onClick={verify2faCode}>Confirm</Button>
            </Stack>
        </Stack>
    )
}

export default AuthApp2FA