import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Listen on all network interfaces
    port: 3000,      // You can specify a port (default is 5173)
    // Enable if you need CORS (usually not needed for local network access)
    cors: true
  }
})