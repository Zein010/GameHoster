import AspectRatio from "@mui/joy/AspectRatio";
import Box from "@mui/joy/Box";
import Divider from "@mui/joy/Divider";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import IconButton from "@mui/joy/IconButton";
import Textarea from "@mui/joy/Textarea";
import Stack from "@mui/joy/Stack";
import Typography from "@mui/joy/Typography";
import Card from "@mui/joy/Card";

import CardActions from "@mui/joy/CardActions";
import CardOverflow from "@mui/joy/CardOverflow";
import Button from "@mui/joy/Button";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import { PhoneRounded } from "@mui/icons-material";
import { useEffect, useState } from "react";
import useApiRequests from "../../API";
import { notification } from "../../../Utils";

export default function General() {
    const requests = useApiRequests();
    const [profile, setProfile] = useState<{ firstName: string; lastName: string; email: string; phone: string; bio: string; icon: string; username: string }>({ firstName: "", lastName: "", email: "", phone: "", bio: "", icon: "", username: "" });

    const [readonly, setReadOnly] = useState<boolean>(true);
    const [saveProfile, setSaveProfile] = useState<boolean>(false);

    useEffect(() => {
        const getProfile = async () => {
            const profileResponse = await requests.getProfile();
            if (profileResponse.status === 200) {
                setProfile(profileResponse.data.user);
            }
        };

        if (readonly == true) getProfile();
    }, [readonly]);

    useEffect(() => {
        const updateProfile = async () => {
            try {
                await requests.updateProfile(profile);
                notification("Profile updated successfully", "success");
                setReadOnly(true);
                setSaveProfile(false);
            } catch (e: any) {
                notification(e.response.data.msg, "error");
            }
        };
        if (saveProfile) updateProfile();
    }, [saveProfile]);

    const onChange = (e: any) => {
        const name = e.target.name;
        setProfile((prev) => ({ ...prev, [name]: e.target.value }));
    };

    return (
        <Stack spacing={4} sx={{ display: "flex", maxWidth: "800px", mx: "auto", px: { xs: 2, md: 6 }, py: { xs: 2, md: 3 } }}>
            <Card>
                <Box>
                    <Typography level="title-md">Personal info</Typography>
                </Box>
                <Divider />
                <Stack direction={{ md: "column", lg: "row" }} sx={{ my: 1 }}>
                    <Stack direction="column" sx={{ px: 2 }}>
                        <AspectRatio ratio="1" maxHeight={200} sx={{ flex: 1, width: 120, borderRadius: "100%" }}>
                            <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=286" srcSet="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=286&dpr=2 2x" loading="lazy" alt="" />
                        </AspectRatio>
                        <IconButton aria-label="upload new picture" size="sm" variant="outlined" color="neutral" sx={{ bgcolor: "background.body", position: "absolute", zIndex: 2, borderRadius: "50%", left: 100, top: 170, boxShadow: "sm" }}>
                            <EditRoundedIcon />
                        </IconButton>
                    </Stack>
                    <Stack>
                        <Stack>
                            <FormControl sx={{ px: 2, mb: 2, mt: { sm: 2, lg: 0 }, width: { lg: "96%", md: "100%" } }}>
                                <FormLabel>Username</FormLabel>

                                <Input size="sm" readOnly={readonly} placeholder="Username" onChange={onChange} name="username" value={profile.username} />
                            </FormControl>
                        </Stack>
                        <Stack direction={{ md: "column", lg: "row" }}>
                            <FormControl sx={{ px: 2, mb: 2, width: { lg: "48%", md: "100%" } }}>
                                <FormLabel>First Name</FormLabel>
                                <Input size="sm" readOnly={readonly} placeholder="First name" onChange={onChange} name="firstName" value={profile.firstName} />
                            </FormControl>

                            <FormControl sx={{ px: 2, mb: 2, width: { lg: "48%", md: "100%" } }}>
                                <FormLabel>Last Name</FormLabel>
                                <Input size="sm" readOnly={readonly} placeholder="Last name" onChange={onChange} name="lastName" value={profile.lastName} />
                            </FormControl>
                        </Stack>
                        <Stack direction={{ md: "column", lg: "row" }}>
                            <FormControl sx={{ px: 2, mb: 2, width: { lg: "48%", md: "100%" } }}>
                                <FormLabel>Phone</FormLabel>
                                <Input size="sm" readOnly={readonly} type="text" name="phone" onChange={onChange} startDecorator={<PhoneRounded />} placeholder="Phone" value={profile.phone} />
                            </FormControl>
                            <FormControl sx={{ px: 2, mb: 2, width: { lg: "48%", md: "100%" } }}>
                                <FormLabel>Email</FormLabel>
                                <Input size="sm" readOnly={readonly} type="email" name="email" onChange={onChange} startDecorator={<EmailRoundedIcon />} placeholder="email" value={profile.email} />
                            </FormControl>
                        </Stack>
                    </Stack>
                </Stack>

                <CardOverflow sx={{ borderTop: "1px solid", borderColor: "divider" }}>
                    <CardActions sx={{ alignSelf: "flex-end" }}>
                        {readonly ? (
                            <>
                                <Button size="sm" variant="outlined" onClick={() => setReadOnly(false)}>
                                    Edit
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button size="sm" variant="outlined" onClick={() => setReadOnly(true)}>
                                    Cancel
                                </Button>
                                <Button size="sm" variant="outlined" onClick={() => setSaveProfile((old) => !old)}>
                                    Save
                                </Button>
                            </>
                        )}
                    </CardActions>
                </CardOverflow>
            </Card>
            <Card>
                <Box sx={{ mb: 1 }}>
                    <Typography level="title-md">Bio</Typography>
                    <Typography level="body-sm">Write a short introduction to be displayed on your profile</Typography>
                </Box>
                <Divider />
                <Stack sx={{ my: 1 }}>
                    <Textarea size="sm" minRows={4} sx={{ mt: 1.5 }} readOnly name="bio" defaultValue={profile.bio} />
                </Stack>
            </Card>
        </Stack>
    );
}
