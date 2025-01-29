import { Email, InfoOutlined, Password, Person, Phone, RemoveRedEye } from "@mui/icons-material";
import { Button, FormControl, FormLabel, Input, Link, Stack } from "@mui/joy";
import { Dispatch, FormEvent, SetStateAction, useState } from "react";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { notification } from "../../Utils";
import { FormHelperText } from "@mui/material";

function SignUp({ setLoginState }: { setLoginState: Dispatch<SetStateAction<"loggedOut" | "2faRequired" | "2FAApp" | "2FAEmail" | "signUp">> }) {
    const [hidePasswords, setHidePasswords] = useState<{ password: boolean; passwordConfirm: boolean }>({ password: true, passwordConfirm: true });
    const changeHidePassword = (password: "password" | "passwordConfirm", status: boolean) => {
        setHidePasswords((old) => ({ ...old, [password]: status }));
    };
    const [errors, setErrors] = useState<{
        [key: string]: string
    }>({});
    const GetError = ({ inputName }: { inputName: string }) => {
        try {

            if (errors[inputName]) {
                return <FormHelperText>
                    <InfoOutlined />
                    {errors[inputName]}
                </FormHelperText>
            }
            return <></>

        } catch (e) {
            return <></>
        }
    }
    const submitForm = async (event: FormEvent<HTMLFormElement>) => {
        {
            event.preventDefault();

            const formElements = event.currentTarget.elements;
            const usernameInput = formElements.namedItem("username") as HTMLInputElement;
            const firstNameInput = formElements.namedItem("firstName") as HTMLInputElement;
            const lastNameInput = formElements.namedItem("lastName") as HTMLInputElement;
            const emailInput = formElements.namedItem("email") as HTMLInputElement;
            const phoneInput = formElements.namedItem("phone") as HTMLInputElement;
            const passwordInput = formElements.namedItem("password") as HTMLInputElement;
            const passwordConfirmInput = formElements.namedItem("passwordConfirm") as HTMLInputElement;
            const data = {
                username: usernameInput.value,
                firstName: firstNameInput.value,
                lastName: lastNameInput.value,
                email: emailInput.value,
                phone: phoneInput.value,
                password: passwordInput.value,
                passwordConfirm: passwordConfirmInput.value,
            };

            if (data.password !== data.passwordConfirm) {
                setErrors({ "passwordConfirm": "Password and password confirm must match", "password": "Password and password confirm must match" })
                return;

            }
            return;
            const response = await fetch(import.meta.env.VITE_API + "/User/signUp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            if (response.ok) {
                const resJson = await response.json();
                console.log(resJson);

            } else {
                notification((await response.json()).msg, "error");
            }
        }
    };
    return (
        <form onSubmit={submitForm}>
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
                    <Input required type="text" name="username" startDecorator={<Person />} />
                </FormControl>
                <GetError inputName="username" />
                <FormControl>
                    <FormLabel>First Name</FormLabel>
                    <Input required type="text" name="firstName" />
                </FormControl>
                <GetError inputName="firstName" />
                <FormControl>
                    <FormLabel>Last Name</FormLabel>
                    <Input required type="text" name="lastName" />
                </FormControl>
                <GetError inputName="lastName" />
                <FormControl>
                    <FormLabel>Email</FormLabel>
                    <Input required type="text" name="email" startDecorator={<Email />} />
                </FormControl>
                <GetError inputName="email" />
                <FormControl>
                    <FormLabel>Phone</FormLabel>
                    <Input required type="text" name="phone" startDecorator={<Phone />} />
                </FormControl>
                <GetError inputName="phone" />
                <FormControl>
                    <FormLabel>Password</FormLabel>
                    <Input required
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

                <GetError inputName="password" />
                <FormControl>
                    <FormLabel>Confirm Password</FormLabel>
                    <Input required
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
                <GetError inputName="passwordConfirm" />

                <Button type="submit" variant="outlined" fullWidth>
                    Sign Up
                </Button>
            </Stack>
        </form>
    );
}

export default SignUp;
