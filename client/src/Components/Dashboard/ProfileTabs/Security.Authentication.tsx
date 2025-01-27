import { Box, Button, Card, CircularProgress, Divider, FormControl, FormLabel, Input, Stack, Typography } from "@mui/joy";
import { useEffect, useRef, useState } from "react";
import useApiRequests from "../../API";

import { QRCodeSVG } from "qrcode.react";
function Authentication() {
    const requests = useApiRequests();
    const [enabled2FA, setEnabled2FA] = useState<{ email: boolean; app: boolean }>({ email: false, app: false });
    const [app2FACurrentState, setApp2FACurrentState] = useState<"configuring" | "enabled" | "disabled">("disabled");
    const [getNew2FACode, setGetNew2FACode] = useState<boolean>(false);
    const oldCodeRef = useRef<HTMLInputElement>(null);
    const new2FACodeRef = useRef<HTMLInputElement>(null);
    const [validatingNewCode, setValidatingNewCode] = useState(false);
    const [tempCodeForConfig, setTempCodeForConfig] = useState<{ secret: string; uri: string; qr: string } | null>(null);
    useEffect(() => {
        const getEnabled2FA = async () => {
            try {
                const response = await requests.getEnabled2FA();
                setEnabled2FA(response.data.data);
                setApp2FACurrentState(response.data.app ? "enabled" : "disabled");
            } catch (e) { console.log(e) }
        };

        getEnabled2FA();
    }, []);
    useEffect(() => {
        const getNewCode = async () => {
            const OldCode = oldCodeRef.current?.value || "";
            try {
                const response = await requests.getNew2FACode(OldCode);
                setTempCodeForConfig(response.data.data);
            } catch (e) { console.log(e) }
        };
        if (getNew2FACode) getNewCode();
    }, [getNew2FACode]);
    const setup2FA = async () => {
        const value = new2FACodeRef.current?.value || "";
        try {

            requests.validateNew2FACode(value);
        } catch (e) {

            console.log(e)
        }

    }
    return (
        <Card>
            <Box>
                <Typography level="title-md">Advanced</Typography>
            </Box>
            <Divider />
            <Stack sx={{ my: 1 }} spacing={2}>
                <Stack spacing={2}>
                    <Stack direction="row" sx={{ justifyContent: "space-between" }} spacing={2}>
                        <FormLabel>2FA Authentication By Email</FormLabel>
                        {enabled2FA.email ? (
                            <Button variant="outlined" color="danger">
                                Disable
                            </Button>
                        ) : (
                            <Button variant="outlined" color="success">
                                Enable
                            </Button>
                        )}
                    </Stack>
                </Stack>
                <Divider />
                <Stack direction="row" sx={{ justifyContent: "space-between" }} spacing={2}>
                    <FormLabel>2FA Authentication By App</FormLabel>
                    {enabled2FA.app ? (
                        <Button variant="outlined" color="danger">
                            Disable
                        </Button>
                    ) : app2FACurrentState == "configuring" ? (
                        <Button
                            variant="outlined"
                            onClick={() => {
                                setGetNew2FACode(false);
                                setApp2FACurrentState(enabled2FA.app ? "enabled" : "disabled");
                                setTempCodeForConfig(null);
                                setValidatingNewCode(false);
                            }}
                            color="danger"
                        >
                            Cancel
                        </Button>
                    ) : (
                        <Button
                            variant="outlined"
                            onClick={() => {
                                setApp2FACurrentState("configuring");
                                if (!enabled2FA.app) {
                                    setGetNew2FACode(true);
                                }
                            }}
                            color="success"
                        >
                            Enable
                        </Button>
                    )}
                </Stack>
                {app2FACurrentState == "configuring" ? (
                    <Stack>
                        {tempCodeForConfig ? (
                            <Stack sx={{ alignItems: "center" }} spacing={2}>
                                <QRCodeSVG style={{ padding: "10px", background: "white", borderRadius: "10px" }} value={tempCodeForConfig.uri} size={256} />
                                <FormLabel>Enter code provide by authenticator, only 6 characters authenticators work</FormLabel>
                                <FormControl>
                                    <Input
                                        type="text"
                                        disabled={validatingNewCode} slotProps={{ input: { maxLength: 6, ref: new2FACodeRef } }}
                                        endDecorator={validatingNewCode ? <CircularProgress /> : ""}
                                    />
                                </FormControl>
                                <Button variant="outlined" color="success" onClick={() => { setup2FA() }}>Next</Button>
                            </Stack>
                        ) : enabled2FA.app ? (
                            <>
                                <FormControl>
                                    <FormLabel>Current 2FA Code</FormLabel>
                                    <Input slotProps={{ input: { ref: oldCodeRef } }} type="text" />
                                </FormControl>
                            </>
                        ) : (
                            <Stack sx={{ alignItems: "center" }}>
                                <CircularProgress />
                            </Stack>
                        )}
                    </Stack>
                ) : (
                    ""
                )}
            </Stack>
        </Card>
    );
}

export default Authentication;
