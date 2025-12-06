import { Archive, PlayArrow, Stop } from '@mui/icons-material';
import ArchiveIcon from '@mui/icons-material/Archive';
import ArrowBackIos from '@mui/icons-material/ArrowBackIos';
import FolderIcon from '@mui/icons-material/Folder';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import PersonIcon from '@mui/icons-material/Person';
import SignalWifiStatusbar4Bar from '@mui/icons-material/SignalWifiStatusbar4Bar';
import TerminalIcon from '@mui/icons-material/Terminal';
import { Box, Button, Divider, GlobalStyles, IconButton, Input, Link, Sheet, Typography } from '@mui/joy';
import { ColorSchemeToggle } from './ColorSchemeToggle';
import { closeSidebar } from '../utils';
import { useEffect, useState } from 'react';
import useApiRequests from './API';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import useSignOut from 'react-auth-kit/hooks/useSignOut';
import useHostUrl from '../hooks/useHostUrl';
import { notification } from "../Utils";

export default function Sidebar() {
  const { id } = useParams();
  const requests = useApiRequests();
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuthUser();
  const signOut = useSignOut();

  const [refreshed, setRefreshed] = useState(false);
  const [globalDisabled, setGlobalDisabled] = useState(false);
  const [actionsDisabled, setActionsDisabled] = useState({ start: true, stop: true });
  const [port, setPort] = useState(0);
  const [gameVersion, setGameVersion] = useState<any>(null);

  const { hostUrl } = useHostUrl(Number(id));

  useEffect(() => {
    checkStatus();
    const interval = setInterval(() => {
      setRefreshed((prev) => !prev);
      checkStatus();
    }, 5000);
    return () => clearInterval(interval);
  }, [hostUrl]);


  const checkStatus = async () => {
    var serverOn = false;
    if (id == null || !hostUrl) {
      return false;
    }
    try {
      const response = await requests.checkGameServerStatus(hostUrl, parseInt(id));
      if (response.status == 200) {
        const resdata = await response.data
        if (resdata.status) {
          setActionsDisabled({ start: true, stop: false });
          serverOn = true;
        } else {
          setActionsDisabled({ start: false, stop: true });
          serverOn = false;
        }
        if (resdata.config.port) setPort(resdata.config.port)
        if (resdata.gameVersion) setGameVersion(resdata.gameVersion)
      }
    } catch (e) {
      // console.error("Failed to check status", e);
    }

    return serverOn
  }

  const startSever = async () => {
    if (!hostUrl) return;
    setGlobalDisabled(true)
    const serverOn = await checkStatus();
    if (serverOn) {
      notification('Server already running', "success")

      setGlobalDisabled(false)
      return;
    }
    try {
      const response = await requests.startGameServer(hostUrl, parseInt(id!));
      if (response.status == 200) {
        const queueId = response.data.queueId;
        notification('Server start queued...', "success");

        const pollInterval = setInterval(async () => {
          try {
            const statusRes = await requests.getQueueStatus(hostUrl, queueId);
            if (statusRes.data.status === "COMPLETED") {
              clearInterval(pollInterval);
              notification('Server started successfully', "success");
              await checkStatus();
              setGlobalDisabled(false);
            } else if (statusRes.data.status === "FAILED") {
              clearInterval(pollInterval);
              notification("Server start failed: " + statusRes.data.logs, "error");
              setGlobalDisabled(false);
            }
          } catch (err) {
            clearInterval(pollInterval);
            notification("Error polling status", "error");
            setGlobalDisabled(false);
          }
        }, 2000);

      } else {
        notification(response.data.msg, "error")
        setGlobalDisabled(false)
      }
    } catch (e) {
      notification("Failed to start server", "error");
      setGlobalDisabled(false);
    }

  }

  const stopServer = async () => {
    if (!hostUrl) return;
    setGlobalDisabled(true)
    const serverOn = await checkStatus();
    if (!serverOn) {
      notification('Server already off', "success")

      setGlobalDisabled(false)
      return;
    }
    try {
      const response = await requests.stopGameServer(hostUrl, parseInt(id!));
      if (response.status == 200) {
        const queueId = response.data.queueId;
        notification('Server stop queued...', "success");

        const pollInterval = setInterval(async () => {
          try {
            const statusRes = await requests.getQueueStatus(hostUrl, queueId);
            if (statusRes.data.status === "COMPLETED") {
              clearInterval(pollInterval);
              notification('Server stopped successfully', "success");
              await checkStatus();
              setGlobalDisabled(false);
            } else if (statusRes.data.status === "FAILED") {
              clearInterval(pollInterval);
              notification("Server stop failed: " + statusRes.data.logs, "error");
              setGlobalDisabled(false);
            }
          } catch (err) {
            clearInterval(pollInterval);
            notification("Error polling status", "error");
            setGlobalDisabled(false);
          }
        }, 2000);
      } else {
        notification(response.data.msg, "error")
        setGlobalDisabled(false);
      }
    } catch (e) {
      notification("Failed to stop server", "error");
      setGlobalDisabled(false);
    }
  }

  const handleSignOut = () => {
    signOut();
    navigate('/Login');
  }

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + "/");

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

        <Link href={`/Servers`}><ArrowBackIos /></Link>
        <Typography level="title-lg">Zyxnware</Typography>
        <ColorSchemeToggle sx={{ ml: 'auto' }} />
      </Box>
      <Box
        sx={{
          minHeight: 0,
          overflow: 'hidden auto',
          flexGrow: 1,
          gap: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Link href={`/server/${id}`} underline="none" sx={{ gap: 1, backgroundColor: isActive(`/server/${id}`) ? 'background.level2' : "", py: .5, px: 1, borderRadius: 10 }} >
          <TerminalIcon />
          <Typography level="title-sm">Terminal</Typography>
        </Link>

        <Link href={`/server/${id}/players`} underline="none" sx={{ gap: 1, backgroundColor: isActive(`/server/${id}/players`) ? 'background.level2' : "", py: .5, px: 1, borderRadius: 10 }}>
          <PersonIcon />
          <Typography level="title-sm">Players</Typography>
        </Link>

        <Link href={`/server/${id}/logs`} underline="none" sx={{ gap: 1, backgroundColor: isActive(`/server/${id}/logs`) ? 'background.level2' : "", py: .5, px: 1, borderRadius: 10 }}>
          <ArchiveIcon />
          <Typography level="title-sm">Logs</Typography>
        </Link>

        <Link href={`/server/${id}/files`} underline="none" sx={{ gap: 1, backgroundColor: isActive(`/server/${id}/files`) ? 'background.level2' : "", py: .5, px: 1, borderRadius: 10 }}>
          <FolderIcon />
          <Typography level="title-sm">File Manager</Typography>
        </Link>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>

        {gameVersion && <Typography level="body-xs" sx={{}}>{gameVersion.game.name} | {gameVersion.version}</Typography>}
        {port != 0 && <Typography level="body-xs" sx={{}}>Server port: {port}</Typography>}
      </Box>
      <Divider />
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>

        <Button sx={{ mr: 1, mb: 1, size: "sm", py: 0, px: 1 }} disabled={globalDisabled} onClick={() => { checkStatus() }} title="Ping Server" color="primary" variant='outlined' ><SignalWifiStatusbar4Bar /></Button>
        <Button sx={{ mr: 1, mb: 1, size: "sm", py: 0, px: 1 }} disabled={globalDisabled || actionsDisabled.start} onClick={() => { startSever() }} color="success" ><PlayArrow /></Button>
        <Button sx={{ mr: 1, mb: 1, size: "sm", py: 0, px: 1 }} disabled={globalDisabled || actionsDisabled.stop} onClick={() => { stopServer() }} color="danger" variant='outlined'><Stop /></Button>
        <Button sx={{ mr: 1, mb: 1, size: "sm", py: 0, px: 1 }} onClick={() => navigate(`/Servers`)} title="All Servers" color="primary" variant='outlined'><FormatListBulletedIcon /></Button>
      </Box>
      <Divider />
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography level="title-sm">{auth?.username}</Typography>
          <Typography level="body-xs">{auth?.email}</Typography>
        </Box>
        <IconButton size="sm" variant="plain" color="neutral" onClick={handleSignOut}>
          <LogoutRoundedIcon />
        </IconButton>
      </Box>
    </Sheet >
  );
}
