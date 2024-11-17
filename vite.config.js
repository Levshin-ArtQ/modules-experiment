import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { visualizer } from 'rollup-plugin-visualizer';
import { moduleConfig } from './src/moduleConfig';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    // Only run the visualizer in production builds
    mode === 'production' &&
      visualizer({
        filename: './dist/report.html',
        open: true, // Automatically open the report in the browser
      }),
  ],
  define: {
    // Pass the module configuration to the app
    'process.env.MODULE_CONFIG': JSON.stringify(moduleConfig),
  },
  build: {
    rollupOptions: {
      // Treeshake disabled modules by only including enabled ones
      input: Object.entries(moduleConfig)
        .filter(([, enabled]) => enabled)
        .map(([moduleName]) => `src/modules/${moduleName}/index.js`),
    },
  },
}));
