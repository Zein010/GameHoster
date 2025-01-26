import { Tab, TabList, TabPanel, Tabs } from "@mui/joy";

const ReusableTabs = ({
    tabs,
}: {
    tabs: {
        title: string;
        component: JSX.Element;
        icon?: JSX.Element;
        slug?: string;
    }[];
}) => {
    return (
        <Tabs defaultValue={0} sx={{ bgcolor: "transparent" }}>
            <TabList>
                {tabs?.length > 0 &&
                    tabs?.map((tab, key) => (
                        <Tab key={tab.slug || tab.title} sx={{ borderRadius: "6px 6px 0 0", bgcolor: "transparent", ":focus": { outline: "none" } }} value={key}>
                            {tab.icon}
                            {tab.title}
                        </Tab>
                    ))}
            </TabList>
            {tabs?.length > 0 &&
                tabs?.map((tab, key) => (
                    <TabPanel key={tab.slug || tab.title} value={key}>
                        {tab.component}
                    </TabPanel>
                ))}
        </Tabs>
    );
};

export default ReusableTabs;
