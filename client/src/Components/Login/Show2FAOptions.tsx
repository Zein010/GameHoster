import { Button, Stack } from "@mui/joy";
import { Dispatch, SetStateAction } from "react";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";

function Show2FAOptions({ setLoginState }: { setLoginState: Dispatch<SetStateAction<"signUp" | "loggedOut" | "2faRequired" | "2FAApp" | "2FAEmail">> }) {
    const authUser = useAuthUser<{ enabled2FA: ("app" | "email" | "phone")[] }>();
    const optionsStateMapper = { app: { state: "2FAApp", name: "Authenticator App" }, phone: { state: "2FAApp", name: "Authenticator App" }, email: { state: "2FAEmail", name: "Email Verification" } };
    return (
        <Stack sx={{ gap: 4, mt: 2 }}>
            {authUser?.enabled2FA.map((option: "app" | "email" | "phone") => (
                <Button
                    onClick={() => {
                        setLoginState(optionsStateMapper[option].state as "loggedOut" | "2faRequired" | "2FAApp" | "2FAEmail");
                    }}
                    color="success"
                >
                    {optionsStateMapper[option].name}
                </Button>
            ))}
            <Button
                onClick={() => {
                    setLoginState("loggedOut");
                }}
                variant="outlined"
                color="danger"
            >
                Back
            </Button>
        </Stack>
    );
}

export default Show2FAOptions;
