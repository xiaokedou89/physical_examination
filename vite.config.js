import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
const { resolve } = require('path')
function pathResolve(dir) {
  return resolve(__dirname, '.', dir);
}

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: 'examination'  
  },
  plugins: [vue()],
  resolve: {
    alias: {
      '@': pathResolve('src')
    },
    extensions: ['.js', '.vue', '.json', '.scss', '.css']
  },
  server: {
    host: '0.0.0.0',
    https: false,
    cors: true,
    proxy: {
     "/dev-api/": {
        target: 'http://192.168.1.104:33334',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/dev-api/, '')
       }
    }
  }
})
