import { RemoveRedEye } from "@mui/icons-material";
import { Box, Button, Card, Divider, FormControl, FormLabel, Input, Stack, Typography } from "@mui/joy";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { FormEvent, useState } from "react";
import { notification } from "../../../Utils";
import useApiRequests from "../../API";
import { isAxiosError } from "axios";
function ChangePassword() {
    const requests = useApiRequests();
    const initialShowPasswordState = { old: false, new: false, confirm: false };
    const initialFieldsState = {
        oldPassword: "",
        password: "",
        passwordConfirm: "",
    };
    const [showPasswords, setShowPassword] = useState<{ old: boolean; new: boolean; confirm: boolean }>(initialShowPasswordState);
    const ChangeShowPassword = (password: "old" | "new" | "confirm", value: boolean) => {
        setShowPassword((prev) => ({ ...prev, [password]: value }));
    };
    const [fields, setFields] = useState<{ oldPassword: string; password: string; passwordConfirm: string }>({ oldPassword: "", password: "", passwordConfirm: "" });
    const changePassword = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (fields.password !== fields.passwordConfirm) {
            notification("Password and password confirm must match", "error");
            return;
        }
        try {
            const res = await requests.changePassword(fields);
            res.data.msg && notification(res.data.msg, "success");
            setFields(initialFieldsState);
        } catch (e) {
            if (isAxiosError(e)) {
                e.response?.data?.msg && notification(e.response.data.msg, "error");
            }
        }
    };
    return (
        <form onSubmit={changePassword}>
            <Card>
                <Box>
                    <Typography level="title-md">Change Password</Typography>
                </Box>
                <Divider />
                <Stack sx={{ my: 1 }}>
                    <Stack direction={{ md: "column", lg: "row" }}>
                        <FormControl sx={{ px: 2, mb: 2, width: { md: "100%" } }}>
                            <FormLabel>Old Password</FormLabel>
                            <Input
                                required
                                onChange={(event) => {
                                    setFields((old) => ({ ...old, oldPassword: event.target.value }));
                                }}
                                value={fields.oldPassword}
                                size="sm"
                                type={showPasswords.old ? "text" : "password"}
                                name="oldPassword"
                                placeholder="Old Password"
                                endDecorator={showPasswords.old ? <VisibilityOffIcon onClick={() => ChangeShowPassword("old", false)} /> : <RemoveRedEye onClick={() => ChangeShowPassword("old", true)} />}
                            />
                        </FormControl>
                    </Stack>
                    <Stack direction={{ md: "column", lg: "row" }}>
                        <FormControl sx={{ px: 2, mb: 2, width: { lg: "50%" } }}>
                            <FormLabel>New Password</FormLabel>
                            <Input
                                required
                                onChange={(event) => {
                                    setFields((old) => ({ ...old, password: event.target.value }));
                                }}
                                value={fields.password}
                                size="sm"
                                type={showPasswords.new ? "text" : "password"}
                                name="password"
                                placeholder="New Password"
                                endDecorator={showPasswords.new ? <VisibilityOffIcon onClick={() => ChangeShowPassword("new", false)} /> : <RemoveRedEye onClick={() => ChangeShowPassword("new", true)} />}
                            />
                        </FormControl>
                        <FormControl sx={{ px: 2, mb: 2, width: { lg: "50%" } }}>
                            <FormLabel>Confirm Password</FormLabel>
                            <Input
                                required
                                onChange={(event) => {
                                    setFields((old) => ({ ...old, passwordConfirm: event.target.value }));
                                }}
                                value={fields.passwordConfirm}
                                size="sm"
                                type={showPasswords.confirm ? "text" : "password"}
                                name="passwordConfirm"
                                placeholder="Confirm Password"
                                endDecorator={showPasswords.confirm ? <VisibilityOffIcon onClick={() => ChangeShowPassword("confirm", false)} /> : <RemoveRedEye onClick={() => ChangeShowPassword("confirm", true)} />}
                            />
                        </FormControl>
                    </Stack>
                </Stack>
                <Stack sx={{ alignItems: "flex-end", px: 2 }}>
                    <Button type="submit" variant="outlined" color="success">
                        Confirm
                    </Button>
                </Stack>
            </Card>
        </form>
    );
}

export default ChangePassword;
