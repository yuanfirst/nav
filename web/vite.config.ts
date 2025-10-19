import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  },
  build: {
    // 确保静态资源被正确复制
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        // 保持静态资源的原始文件名
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `[name].[ext]`
          }
          return `assets/[name]-[hash].[ext]`
        }
      }
    }
  },
  // 确保 public 目录下的文件被正确处理
  publicDir: 'public'
})
