import { RemoveRedEye } from "@mui/icons-material";
import { Box, Card, Divider, FormControl, FormLabel, Input, Stack, Switch, Textarea, Typography } from "@mui/joy";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useState } from "react";
function Security() {
    const initialShowPasswordState = { old: false, new: false, confirm: false };
    const [showPasswords, setShowPassword] = useState<{ old: boolean; new: boolean; confirm: boolean }>(initialShowPasswordState);
    const ChangeShowPassword = (password: "old" | "new" | "confirm", value: boolean) => {
        setShowPassword((prev) => ({ ...prev, [password]: value }));
    };

    return (
        <Stack spacing={4} sx={{ display: "flex", maxWidth: "800px", mx: "auto", px: { xs: 2, md: 6 }, py: { xs: 2, md: 3 } }}>
            <Card>
                <Box>
                    <Typography level="title-md">Personal info</Typography>
                </Box>
                <Divider />
                <Stack sx={{ my: 1 }}>
                    <Stack direction={{ md: "column", lg: "row" }}>
                        <FormControl sx={{ px: 2, mb: 2, width: { md: "100%" } }}>
                            <FormLabel>Old Password</FormLabel>
                            <Input size="sm" type="text" placeholder="Old Password" endDecorator={showPasswords.old ? <VisibilityOffIcon onClick={() => ChangeShowPassword("old", false)} /> : <RemoveRedEye onClick={() => ChangeShowPassword("old", true)} />} />
                        </FormControl>
                    </Stack>
                    <Stack direction={{ md: "column", lg: "row" }}>
                        <FormControl sx={{ px: 2, mb: 2, width: { md: "50%" } }}>
                            <FormLabel>New Password</FormLabel>
                            <Input size="sm" type="text" placeholder="New Password" endDecorator={showPasswords.new ? <VisibilityOffIcon onClick={() => ChangeShowPassword("new", false)} /> : <RemoveRedEye onClick={() => ChangeShowPassword("new", true)} />} />
                        </FormControl>
                        <FormControl sx={{ px: 2, mb: 2, width: { md: "50%" } }}>
                            <FormLabel>Confirm Password</FormLabel>
                            <Input size="sm" type="text" placeholder="Confirm Password" endDecorator={showPasswords.confirm ? <VisibilityOffIcon onClick={() => ChangeShowPassword("confirm", false)} /> : <RemoveRedEye onClick={() => ChangeShowPassword("confirm", true)} />} />
                        </FormControl>
                    </Stack>
                </Stack>
            </Card>
            <Card>
                <Box>
                    <Typography level="title-md">Advanced</Typography>
                </Box>
                <Divider />
                <Stack sx={{ my: 1 }} spacing={2}>
                    <Stack direction="row" spacing={2}>
                        <FormLabel>2FA Authentication By Email</FormLabel>
                        <Switch  />
                    </Stack>
                    <Divider />
                    <Stack direction="row" spacing={2}>
                        <FormLabel>2FA Authentication By App</FormLabel>
                        <Switch  />
                    </Stack>
                </Stack>
            </Card>
        </Stack>
    );
}

export default Security;
