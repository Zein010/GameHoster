import { Box, Button, Card, Divider, FormControl, FormLabel, Input, Stack, Switch, Textarea, Typography } from "@mui/joy";
import ChangePassword from "./Security.ChangePassword";
import { useEffect, useState } from "react";
import useApiRequests from "../../API";
function Authentication() {
    const requests = useApiRequests();
    const [enabled2FA, setEnabled2FA] = useState<{ email: boolean; app: boolean }>({ email: false, app: false });
    const [app2FACurrentState, setApp2FACurrentState] = useState<"configuring" | "enabled" | "disabled">("disabled");
    useEffect(() => {
        const getEnabled2FA = async () => {
            try {
                const response = await requests.getEnabled2FA();
                setEnabled2FA(response.data);
                setApp2FACurrentState(response.data.app ? "enabled" : "disabled");
            } catch (e) {}
        };
        getEnabled2FA();
    }, []);

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
                    ) : (
                        <Button variant="outlined" color="success">
                            Enable
                        </Button>
                    )}
                </Stack>
            </Stack>
        </Card>
    );
}

export default Authentication;
