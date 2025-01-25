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
import Tabs from "@mui/joy/Tabs";
import TabList from "@mui/joy/TabList";
import Tab, { tabClasses } from "@mui/joy/Tab";
import Card from "@mui/joy/Card";

import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import { PhoneRounded } from "@mui/icons-material";
import { useEffect, useState } from "react";
import useApiRequests from "../API";

export default function Profile() {
    const requests = useApiRequests();
    const [Profile, SetProfile] = useState<{ firstName: string; lastName: string; email: string; phone: string; bio: string; icon: string; username: string }>({ firstName: "", lastName: "", email: "", phone: "", bio: "", icon: "", username: "" });
    useEffect(() => {
        const getProfile = async () => {
            const profileResponse = await requests.getProfile();
            if (profileResponse.status === 200) {
                SetProfile(profileResponse.data.user);
            }
        };
        getProfile();
    }, []);
    return (
        <Box sx={{ flex: 1, width: "100%" }}>
            <Box sx={{ position: "sticky", top: { sm: -100, md: -110 }, bgcolor: "background.body", zIndex: 9995 }}>
                <Tabs defaultValue={0} sx={{ bgcolor: "transparent" }}>
                    <TabList tabFlex={1} size="sm" sx={{ pl: { xs: 0, md: 4 }, justifyContent: "left", [`&& .${tabClasses.root}`]: { fontWeight: "600", flex: "initial", color: "text.tertiary", [`&.${tabClasses.selected}`]: { bgcolor: "transparent", color: "text.primary", "&7::after": { height: "2px", bgcolor: "primary.500" }, outline: "none" } } }}>
                        <Tab sx={{ borderRadius: "6px 6px 0 0" }} indicatorInset value={0}>
                            General
                        </Tab>
                        <Tab sx={{ borderRadius: "6px 6px 0 0" }} indicatorInset value={3}>
                            Security
                        </Tab>
                        <Tab sx={{ borderRadius: "6px 6px 0 0" }} indicatorInset value={1}>
                            Logs
                        </Tab>
                        <Tab sx={{ borderRadius: "6px 6px 0 0" }} indicatorInset value={2}>
                            {" "}
                            Transactions History
                        </Tab>
                    </TabList>
                </Tabs>
            </Box>
            <Stack spacing={4} sx={{ display: "flex", maxWidth: "800px", mx: "auto", px: { xs: 2, md: 6 }, py: { xs: 2, md: 3 } }}>
                <Card>
                    <Box sx={{ mb: 1 }}>
                        <Typography level="title-md">Personal info</Typography>
                    </Box>
                    <Divider />
                    <Stack direction={{ md: "column", lg: "row" }} sx={{ my: 1 }}>
                        <Stack direction="column" sx={{ px: 2 }}>
                            <AspectRatio ratio="1" maxHeight={200} sx={{ flex: 1, minWidth: 120, borderRadius: "100%" }}>
                                <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=286" srcSet="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=286&dpr=2 2x" loading="lazy" alt="" />
                            </AspectRatio>
                            <IconButton aria-label="upload new picture" size="sm" variant="outlined" color="neutral" sx={{ bgcolor: "background.body", position: "absolute", zIndex: 2, borderRadius: "50%", left: 100, top: 170, boxShadow: "sm" }}>
                                <EditRoundedIcon />
                            </IconButton>
                        </Stack>
                        <Stack>
                            <Stack>
                                <FormControl sx={{ px: 2 }}>
                                    <FormLabel>Username</FormLabel>
                                    <Input size="sm" readOnly placeholder="Username" value={Profile.username} endDecorator={<EditRoundedIcon />} />
                                </FormControl>
                            </Stack>
                            <Stack direction={{ md: "column", lg: "row" }}>
                                <FormControl sx={{ px: 2 }}>
                                    <FormLabel>First Name</FormLabel>
                                    <Input size="sm" readOnly placeholder="First name" value={Profile.firstName} endDecorator={<EditRoundedIcon />} />
                                </FormControl>

                                <FormControl sx={{ px: 2 }}>
                                    <FormLabel>Last Name</FormLabel>
                                    <Input size="sm" readOnly placeholder="Last name" value={Profile.lastName} endDecorator={<EditRoundedIcon />} />
                                </FormControl>
                            </Stack>
                            <Stack direction={{ md: "column", lg: "row" }}>
                                <FormControl sx={{ px: 2 }}>
                                    <FormLabel>Phone</FormLabel>
                                    <Input size="sm" readOnly type="text" startDecorator={<PhoneRounded />} placeholder="Phone" value={Profile.phone} endDecorator={<EditRoundedIcon />} />
                                </FormControl>
                                <FormControl sx={{ px: 2 }}>
                                    <FormLabel>Email</FormLabel>
                                    <Input size="sm" readOnly type="email" startDecorator={<EmailRoundedIcon />} placeholder="email" value={Profile.email} endDecorator={<EditRoundedIcon />} />
                                </FormControl>
                            </Stack>
                        </Stack>
                    </Stack>
                </Card>
                <Card>
                    <Box sx={{ mb: 1 }}>
                        <Typography level="title-md">Bio</Typography>
                        <Typography level="body-sm">Write a short introduction to be displayed on your profile</Typography>
                    </Box>
                    <Divider />
                    <Stack sx={{ my: 1 }}>
                        <Textarea size="sm" minRows={4} sx={{ mt: 1.5 }} readOnly value={Profile.bio} />
                    </Stack>
                </Card>
            </Stack>
        </Box>
    );
}
