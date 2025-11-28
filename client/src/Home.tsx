import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import Box from '@mui/joy/Box';


import Header from './Components/Header';
import { Outlet } from 'react-router-dom';
import HomeSideBar from './Components/HomeSidebar';

export default function Home() {
  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100dvh' }}>
        <Header />
        <HomeSideBar />
        <Box
          component="main"
          className="MainContent"
          sx={{
            px: { sm: 2, md: 3 },
            pt: {
              xs: 'calc(12px + var(--Header-height))',
              sm: 'calc(12px + var(--Header-height))',
              md: 3,
            },
            pb: { xs: 2, sm: 2, md: 3 },
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            height: '100dvh',
            gap: 1,
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </CssVarsProvider>
  );
}
