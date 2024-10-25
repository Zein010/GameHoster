import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'


export default defineConfig(({ mode }) => {
  // Load environment variables based on the current mode (e.g., 'development' or 'production')
  const env = loadEnv(mode, process.cwd());


  return {
    server: {
      host: env.VITE_HOST,
      port: parseInt(env.VITE_PORT, 10),
    },
    plugins: [react()],
  };
});