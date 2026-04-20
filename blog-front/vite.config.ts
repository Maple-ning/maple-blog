import { fileURLToPath, URL } from 'node:url';

import { federation } from '@module-federation/vite';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';
import { defineConfig, loadEnv } from 'vite';
import vueDevTools from 'vite-plugin-vue-devtools';

// Vite 配置文档：https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const appTitle = env.VITE_APP_TITLE || '枫叶小站';
  const mapleSharesRemote =
    env.VITE_MAPLE_SHARES_REMOTE || '/maple-shares/remote/remoteEntry.js';

  return {
    base: '/blog/',
    server: {
      proxy: {
        '/api-blog': { target: 'http://127.0.0.1:3001', changeOrigin: true },
      },
    },
    plugins: [
      {
        name: 'html-app-title',
        transformIndexHtml(html) {
          return html.replace(/__APP_TITLE__/g, appTitle);
        },
      },
      federation({
        name: 'blogFront',
        remotes: {
          mapleShares: {
            type: 'module',
            name: 'mapleShares',
            entry: mapleSharesRemote,
            entryGlobalName: 'mapleShares',
            shareScope: 'default',
          },
        },
        shared: ['vue'],
        moduleParseIdleTimeout: 30,
      }),
      vue(),
      tailwindcss(),
      Components({
        dts: 'src/components.d.ts',
        resolvers: [AntDesignVueResolver({ importStyle: false })],
      }),
      vueDevTools(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      target: 'chrome89',
    },
  };
});
