import { Email,  Password, Person, Phone, RemoveRedEye } from "@mui/icons-material";
import { Button, FormControl, FormLabel, Input, Link, Stack } from "@mui/joy";
import { Dispatch, SetStateAction, useState } from "react";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

function SignUp({ setLoginState }: { setLoginState: Dispatch<SetStateAction<"loggedOut" | "2faRequired" | "2FAApp" | "2FAEmail" | "signUp">> }) {
    const [hidePasswords, setHidePasswords] = useState<{ password: boolean; passwordConfirm: boolean }>({ password: true, passwordConfirm: true });
    const changeHidePassword = (password: "password" | "passwordConfirm", status: boolean) => {
        setHidePasswords((old) => ({ ...old, [password]: status }));
    };
    return (
        <form>
            <Link
                component="button"
                onClick={() => {
                    setLoginState("loggedOut");
                }}
            >
                Back to login
            </Link>
            <Stack spacing={2}>
                <FormControl>
                    <FormLabel>Username</FormLabel>
                    <Input type="text" name="username" startDecorator={<Person />} />
                </FormControl>

                <FormControl>
                    <FormLabel>First Name</FormLabel>
                    <Input type="text" name="firstName" />
                </FormControl>
                <FormControl>
                    <FormLabel>Last Name</FormLabel>
                    <Input type="text" name="lastName" />
                </FormControl>
                <FormControl>
                    <FormLabel>Email</FormLabel>
                    <Input type="text" name="email" startDecorator={<Email />} />
                </FormControl>
                <FormControl>
                    <FormLabel>Phone</FormLabel>
                    <Input type="text" name="phone" startDecorator={<Phone />} />
                </FormControl>
                <FormControl>
                    <FormLabel>Password</FormLabel>
                    <Input
                        type={hidePasswords.password ? "password" : "text"}
                        name="password"
                        startDecorator={<Password />}
                        endDecorator={
                            hidePasswords.password ? (
                                <RemoveRedEye
                                    onClick={() => {
                                        changeHidePassword("password", false);
                                    }}
                                />
                            ) : (
                                <VisibilityOffIcon
                                    onClick={() => {
                                        changeHidePassword("password", true);
                                    }}
                                />
                            )
                        }
                    />
                </FormControl>

                <FormControl>
                    <FormLabel>Confirm Password</FormLabel>
                    <Input
                        type={hidePasswords.passwordConfirm ? "password" : "text"}
                        name="passwordConfirm"
                        startDecorator={<Password />}
                        endDecorator={
                            hidePasswords.passwordConfirm ? (
                                <RemoveRedEye
                                    onClick={() => {
                                        changeHidePassword("passwordConfirm", false);
                                    }}
                                />
                            ) : (
                                <VisibilityOffIcon
                                    onClick={() => {
                                        changeHidePassword("passwordConfirm", true);
                                    }}
                                />
                            )
                        }
                    />
                </FormControl>

                <Button type="submit" fullWidth>
                    Sign Up
                </Button>
            </Stack>
        </form>
    );
}

export default SignUp;
