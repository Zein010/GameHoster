import ReusableTabs from "../ReusableTabs";
import General from "./ProfileTabs/General";
import Security from "./ProfileTabs/Security";
import AbcIcon from "@mui/icons-material/Abc";
import SecurityIcon from "@mui/icons-material/Security";
export default function profile() {
    return (
        <ReusableTabs
            tabs={[
                { title: "General", component: <General />, icon: <AbcIcon /> },
                { title: "Security", component: <Security />, icon: <SecurityIcon /> },
            ]}
        />
    );
}
