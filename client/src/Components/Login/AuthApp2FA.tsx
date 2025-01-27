import { Button, Input, Stack, Typography } from "@mui/joy";
import { Dispatch, SetStateAction, useRef } from "react";
import { notification } from "../../Utils";
import useApiRequests from "../API";
import useSignIn from "react-auth-kit/hooks/useSignIn";
import axios, { AxiosError } from "axios";

function AuthApp2FA({ setLoginState }: { setLoginState: Dispatch<SetStateAction<"signUp" | "loggedOut" | "2faRequired" | "2FAApp" | "2FAEmail">> }) {
    const requests = useApiRequests();
    const signIn = useSignIn();

    const validateInput = (input: string): boolean => {
        // Check if the input is exactly 6 characters long
        if (input.length !== 6) {
            notification("Input must be exactly 6 characters long", "error");
            return false;
        }

        if (!/^\d+$/.test(input)) {
            notification("Input must contain only numeric digits", "error");
            return false;
        }

        return true;
    };

    const verify2faCode = async () => {
        if (!codeInput.current) return;
        if (!validateInput(codeInput.current.value)) {
            notification("Code should be 6 numbers only", "error");
            return;
        }

        try {
            const response = await requests.authenticate2FA(codeInput.current.value);
            notification(response.data.msg, "success");
            console.log(response);
            if (
                signIn({
                    auth: {
                        token: response.data.data.token,
                        type: "Bearer",
                    },
                    userState: response.data.data.user,
                })
            ) {
                if (response.data.data.user.enabled2FA) {
                    setLoginState("2faRequired");
                } else {
                    window.location.href = "Dashboard/Servers";
                }
                // Redirect or do-something
            } else {
                //Throw error
            }
        } catch (e) {
            if (axios.isAxiosError(e)) {
                const axiosError = e as AxiosError<{ msg: string }>;

                if (axiosError.response && axiosError.response.data) {
                    // Access the `msg` property safely
                    notification(axiosError.response.data.msg, "error");
                } else {
                    // Handle cases where `response` or `response.data` is undefined
                    notification("An unexpected error occurred", "error");
                }
            } else {
                notification("An unexpected error occurred", "error");
            }
        }
    };

    const codeInput = useRef<HTMLInputElement>(null);
    return (
        <Stack sx={{ gap: 4, mt: 2 }}>
            <Typography sx={{ textAlign: "center" }}>Kindly enter the code provided by your authenticator</Typography>
            <Input slotProps={{ input: { ref: codeInput } }} />
            <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                <Button
                    variant="outlined"
                    onClick={() => {
                        setLoginState("2faRequired");
                    }}
                    color="danger"
                >
                    Back
                </Button>

                <Button variant="outlined" color="success" onClick={verify2faCode}>
                    Confirm
                </Button>
            </Stack>
        </Stack>
    );
}

export default AuthApp2FA;
