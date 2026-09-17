// Import Vite's configuration helper for editor and build-time validation.
import { defineConfig } from 'vite'
// Enable JSX and React-specific transforms during development and builds.
import react from '@vitejs/plugin-react'

// Export the configuration shared by the development server and production build.
export default defineConfig({
  // Register the React plugin with Vite.
  plugins: [react()],
})
