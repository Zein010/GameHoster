import { RemoveRedEye } from "@mui/icons-material";
import { Box, Card, Divider, FormControl, FormLabel, Input, Stack, Typography } from "@mui/joy";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useState } from "react";
function ChangePassword() {
    const initialShowPasswordState = { old: false, new: false, confirm: false };
    const [showPasswords, setShowPassword] = useState<{ old: boolean; new: boolean; confirm: boolean }>(initialShowPasswordState);
    const ChangeShowPassword = (password: "old" | "new" | "confirm", value: boolean) => {
        setShowPassword((prev) => ({ ...prev, [password]: value }));
    };

    return (
        <Card>
            <Box>
                <Typography level="title-md">Password</Typography>
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
                    <FormControl sx={{ px: 2, mb: 2, width: { lg: "50%" } }}>
                        <FormLabel>New Password</FormLabel>
                        <Input size="sm" type="text" placeholder="New Password" endDecorator={showPasswords.new ? <VisibilityOffIcon onClick={() => ChangeShowPassword("new", false)} /> : <RemoveRedEye onClick={() => ChangeShowPassword("new", true)} />} />
                    </FormControl>
                    <FormControl sx={{ px: 2, mb: 2, width: { lg: "50%" } }}>
                        <FormLabel>Confirm Password</FormLabel>
                        <Input size="sm" type="text" placeholder="Confirm Password" endDecorator={showPasswords.confirm ? <VisibilityOffIcon onClick={() => ChangeShowPassword("confirm", false)} /> : <RemoveRedEye onClick={() => ChangeShowPassword("confirm", true)} />} />
                    </FormControl>
                </Stack>
            </Stack>
        </Card>
    );
}

export default ChangePassword;
