import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
const apiUrl = import.meta.env
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()], server: { host: "zyxnware.com" }
})
