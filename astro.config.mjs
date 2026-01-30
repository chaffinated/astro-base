// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import partytown from '@astrojs/partytown';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  integrations: [react(), partytown()],
  adapter: cloudflare({
    workerEntryPoint: {
      path: './src/worker.ts',
    },
  }),
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
});
