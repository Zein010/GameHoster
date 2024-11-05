import GlobalStyles from '@mui/joy/GlobalStyles';
import Box from '@mui/joy/Box';
import Divider from '@mui/joy/Divider';
import IconButton from '@mui/joy/IconButton';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemButton, { listItemButtonClasses } from '@mui/joy/ListItemButton';
import ListItemContent from '@mui/joy/ListItemContent';
import Typography from '@mui/joy/Typography';
import Sheet from '@mui/joy/Sheet';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import TerminalIcon from '@mui/icons-material/Terminal';
import ColorSchemeToggle from './ColorSchemeToggle';
import { closeSidebar, notification } from '../Utils.ts';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate, useParams } from 'react-router-dom';
import ArchiveIcon from '@mui/icons-material/Archive';
import { useEffect, useState } from 'react';
import { Button } from '@mui/joy';
import { PlayArrow, SignalWifiStatusbar4Bar, Stop } from '@mui/icons-material'

export default function Sidebar() {

  const [actionsDisabled, setActionsDisabled] = useState<{ start: boolean, stop: boolean }>({ start: false, stop: false });
  const [globalDisabled, setGlobalDisabled] = useState<boolean>(false)
  const [refreshed, setRefreshed] = useState<boolean>(false)

  const navigate = useNavigate();
  const { id } = useParams();
  const startSever = async () => {
    setGlobalDisabled(true)
    const serverOn = await checkStatus();
    if (serverOn) {
      notification('Server already running', "success")

      setGlobalDisabled(false)
      return;
    }
    const response = await fetch(import.meta.env.VITE_API + `/Game/StartServer/${id}`)
    if (response.ok) {
      notification('Server is running', "success")
      await checkStatus();

    } else {
      notification((await response.json()).msg, "error")
    }
    setGlobalDisabled(false)

  }
  const stopServer = async () => {
    setGlobalDisabled(true)
    const serverOn = await checkStatus();
    if (!serverOn) {
      notification('Server already off', "success")

      setGlobalDisabled(false)
      return;
    }
    const response = await fetch(import.meta.env.VITE_API + `/Game/StopServer/${id}`)
    if (response.ok) {
      notification('Server is stopped', "success")
      await checkStatus();

    } else {
      notification((await response.json()).msg, "error")
    }
    setGlobalDisabled(false)
  }
  const checkStatus = async () => {
    var serverOn = false;
    const response = await fetch(import.meta.env.VITE_API + `/Game/CheckServer/${id}`)
    if (response.ok) {
      if ((await response.json()).status) {
        setActionsDisabled({ start: true, stop: false });
        serverOn = true;
      } else {
        setActionsDisabled({ start: false, stop: true });
        serverOn = false;
      }

    }
    return serverOn
  }

  useEffect(() => {
    setTimeout(() => {
      setRefreshed((refreshed) => !refreshed)
      console.log("xx")
      checkStatus()
    }, 5000)
  }, [refreshed])

  return (
    <Sheet
      className="Sidebar"
      sx={{
        position: { xs: 'fixed', md: 'sticky' },
        transform: {
          xs: 'translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1)))',
          md: 'none',
        },
        transition: 'transform 0.4s, width 0.4s',
        zIndex: 10000,
        height: '100dvh',
        width: 'var(--Sidebar-width)',
        top: 0,
        p: 2,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        borderRight: '1px solid',
        borderColor: 'divider',
      }}
    >
      <GlobalStyles
        styles={(theme) => ({
          ':root': {
            '--Sidebar-width': '220px',
            [theme.breakpoints.up('lg')]: {
              '--Sidebar-width': '240px',
            },
          },
        })}
      />
      <Box
        className="Sidebar-overlay"
        sx={{
          position: 'fixed',
          zIndex: 9998,
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          opacity: 'var(--SideNavigation-slideIn)',
          backgroundColor: 'var(--joy-palette-background-backdrop)',
          transition: 'opacity 0.4s',
          transform: {
            xs: 'translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1) + var(--SideNavigation-slideIn, 0) * var(--Sidebar-width, 0px)))',
            lg: 'translateX(-100%)',
          },
        }}
        onClick={() => closeSidebar()}
      />
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>

        <Typography level="title-lg">Zyxnware</Typography>
        <ColorSchemeToggle sx={{ ml: 'auto' }} />
      </Box>
      <Box
        sx={{
          minHeight: 0,
          overflow: 'hidden auto',
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          [`& .${listItemButtonClasses.root}`]: {
            gap: 1.5,
          },
        }}
      >
        <List
          size="sm"
          sx={{
            gap: 1,
            '--List-nestedInsetStart': '30px',
            '--ListItem-radius': (theme) => theme.vars.radius.sm,
          }}
        >

          <ListItem>
            <ListItemButton onClick={() => navigate(`/server/${id}`)}>
              <TerminalIcon />
              <div>
                <Typography level="title-sm">Terminal</Typography>
              </div>
            </ListItemButton>
          </ListItem>

          <ListItem>
            <ListItemButton onClick={() => navigate(`/server/${id}/players`)}>
              <PersonIcon />
              <div>
                <Typography level="title-sm">Players</Typography>
              </div>
            </ListItemButton>
          </ListItem>

          <ListItem>
            <ListItemButton onClick={() => navigate(`/server/${id}/logs`)}>
              <ArchiveIcon />
              <div>
                <Typography level="title-sm">Logs</Typography>
              </div>
            </ListItemButton>
          </ListItem>

        </List>
      </Box>
      <Divider />
      <Box sx={{ display: "flex", gap: 2 }}>

        <Button sx={{ mr: 1, mb: 1, size: "sm", py: 0, px: 1 }} disabled={globalDisabled} onClick={() => { checkStatus() }} title="Ping Server" color="primary" variant='outlined' ><SignalWifiStatusbar4Bar /></Button>
        <Button sx={{ mr: 1, mb: 1, size: "sm", py: 0, px: 1 }} disabled={globalDisabled || actionsDisabled.start} onClick={() => { startSever() }} color="success" ><PlayArrow /></Button>
        <Button sx={{ mr: 1, mb: 1, size: "sm", py: 0, px: 1 }} disabled={globalDisabled || actionsDisabled.stop} onClick={() => { stopServer() }} color="danger" variant='outlined'><Stop /></Button>
      </Box>
      <Divider />
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography level="title-sm">Zyxnware</Typography>
          <Typography level="body-xs">Zyxnware@admin.com</Typography>
        </Box>
        <IconButton size="sm" variant="plain" color="neutral">
          <LogoutRoundedIcon />
        </IconButton>
      </Box>
    </Sheet>
  );
}
