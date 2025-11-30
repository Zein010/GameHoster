import GlobalStyles from '@mui/joy/GlobalStyles';
import Box from '@mui/joy/Box';
import Divider from '@mui/joy/Divider';
import IconButton from '@mui/joy/IconButton';
import Link from '@mui/joy/Link';
import Typography from '@mui/joy/Typography';
import Sheet from '@mui/joy/Sheet';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import TerminalIcon from '@mui/icons-material/Terminal';
import ColorSchemeToggle from './ColorSchemeToggle.tsx';
import { closeSidebar, notification } from '../Utils.ts';
import PersonIcon from '@mui/icons-material/Person';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ArchiveIcon from '@mui/icons-material/Archive';
import { useEffect, useState } from 'react';
import { Button } from '@mui/joy';
import FolderIcon from '@mui/icons-material/Folder';
import { ArrowBack, ArrowBackIos, PlayArrow, SignalWifiStatusbar4Bar, Stop } from '@mui/icons-material'
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import useSignOut from 'react-auth-kit/hooks/useSignOut';
import useApiRequests from './API.tsx';

export default function Sidebar() {
  const requests=useApiRequests();
  const [port, setPort] = useState(0)
  const [gameVersion, setGameVersion] = useState<null | { version: string, id: number, game: { name: string, id: number } }>(null)
  const [actionsDisabled, setActionsDisabled] = useState<{ start: boolean, stop: boolean }>({ start: false, stop: false });
  const [globalDisabled, setGlobalDisabled] = useState<boolean>(false)
  const [refreshed, setRefreshed] = useState<boolean>(false)
  const location = useLocation();
  const auth = useAuthUser<{ username: string, email: string }>()
  const signOut = useSignOut()

  const isActive = (path: string) => location.pathname === path;
  const navigate = useNavigate();
  const { id } = useParams();
  const handleSignOut = async () => {
    signOut();
    navigate('/');
  }
  const startSever = async () => {
    setGlobalDisabled(true)
    const serverOn = await checkStatus();
    if (serverOn) {
      notification('Server already running', "success")

      setGlobalDisabled(false)
      return;
    }
    const response=await requests.startGameServer(parseInt(id!));
    if (response.status==200) {
      notification('Server is running', "success")
      await checkStatus();

    } else {
      notification(response.data.msg, "error")
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
    const response=await requests.stopGameServer(parseInt(id!));
    if (response.status==200) {
      notification('Server is stopped', "success")
      await checkStatus();

    } else {
      notification( response.data.msg, "error")
    }
    setGlobalDisabled(false)
  }
  const checkStatus = async () => {
    var serverOn = false;
    if(id==null){
      return
    }
    const response = await requests.checkGameServerStatus(parseInt(id));
    if (response.status==200) {
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
    return serverOn
  }

  useEffect(() => {
    setTimeout(() => {
      setRefreshed((refreshed) => !refreshed)
      checkStatus()
    }, 5000)
    checkStatus()
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
