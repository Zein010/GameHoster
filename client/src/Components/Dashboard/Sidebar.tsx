import GlobalStyles from '@mui/joy/GlobalStyles';
import Box from '@mui/joy/Box';
import Divider from '@mui/joy/Divider';
import IconButton from '@mui/joy/IconButton';
import Link from '@mui/joy/Link';
import Typography from '@mui/joy/Typography';
import Sheet from '@mui/joy/Sheet';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import TerminalIcon from '@mui/icons-material/Terminal';
import ColorSchemeToggle from '../ColorSchemeToggle';
import { closeSidebar, notification } from '../../Utils.ts';
import PersonIcon from '@mui/icons-material/Person';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ArchiveIcon from '@mui/icons-material/Archive';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import useSignOut from 'react-auth-kit/hooks/useSignOut';

export default function Sidebar() {

  const auth = useAuthUser<{ username: string, email: string }>()
  const signOut = useSignOut()

  const navigate = useNavigate();
  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    signOut();
    navigate('/');
  }
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
          gap: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Link href={`/Dashboard/Servers`} underline="none" sx={{ gap: 1, backgroundColor: isActive(`/Dashboard/Servers`) ? 'background.level2' : "", py: .5, px: 1, borderRadius: 10 }} >
          <TerminalIcon />
          <Typography level="title-sm">Serves</Typography>
        </Link>

        <Link href={`/Dashboard/Profile`} underline="none" sx={{ gap: 1, backgroundColor: isActive(`/Dashboard/Profile`) ? 'background.level2' : "", py: .5, px: 1, borderRadius: 10 }}>
          <PersonIcon />
          <Typography level="title-sm">Profile</Typography>
        </Link>

        <Link href={`/Dashboard/Friends`} underline="none" sx={{ gap: 1, backgroundColor: isActive(`/Dashboard/Friends`) ? 'background.level2' : "", py: .5, px: 1, borderRadius: 10 }}>
          <ArchiveIcon />
          <Typography level="title-sm">Friends</Typography>
        </Link>

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
