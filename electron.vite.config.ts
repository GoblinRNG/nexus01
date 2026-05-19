import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import type { Plugin } from 'vite'

// Removes `crossorigin` attribute from built HTML.
// When Vite builds ES module scripts it adds `crossorigin` to every <script>
// and <link> tag.  In a packaged Electron app the renderer is served via the
// file:// protocol; Chromium treats `crossorigin` module requests as
// cross-origin, which file:// cannot satisfy → "Not allowed to load local
// resource".  Stripping the attribute restores normal same-origin loading.
function removeElectronCrossOrigin(): Plugin {
  return {
    name: 'remove-electron-cross-origin',
    transformIndexHtml(html: string) {
      return html.replace(/ crossorigin/g, '')
    },
  }
}

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      lib: {
        entry: resolve(__dirname, 'electron/main.ts'),
      },
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      lib: {
        entry: resolve(__dirname, 'electron/preload.ts'),
      },
    },
  },
  renderer: {
    root: '.',
    base: './',
    build: {
      outDir: 'out/renderer',
      rollupOptions: {
        input: resolve(__dirname, 'index.html'),
      },
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    plugins: [react(), removeElectronCrossOrigin()],
    css: {
      postcss: {
        plugins: [tailwindcss, autoprefixer],
      },
    },
  },
})
