import { Box, Button, Card, Divider, FormControl, FormLabel, Input, Stack, Switch, Textarea, Typography } from "@mui/joy";
import ChangePassword from "./Security.ChangePassword";
import { useEffect, useState } from "react";
import Authentication from "./Security.Authentication";
function Security() {
    return (
        <Stack spacing={4} sx={{ display: "flex", maxWidth: "800px", mx: "auto", px: { xs: 2, md: 6 }, py: { xs: 2, md: 3 } }}>
            <ChangePassword />
            <Authentication />
        </Stack>
    );
}

export default Security;
