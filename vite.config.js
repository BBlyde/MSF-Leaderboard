import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { devApiPlugin } from './vite-dev-api-plugin.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] === undefined) process.env[key] = value
  }

  return {
    envPrefix: ['VITE_'],
    plugins: [react(), devApiPlugin()],
  }
})
