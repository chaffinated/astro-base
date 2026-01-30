
import { handle } from '@astrojs/cloudflare/handler';
import type { SSRManifest } from 'astro';
import { App } from 'astro/app';


export function createExports(manifest: SSRManifest) {
  const app = new App(manifest);
  return {
    default: {
      async fetch(request, env, ctx) {
        console.log("[fetch]", request, env, ctx);
        return handle(request, env, ctx);
      },
      async queue(batch, _env) {
        let messages = JSON.stringify(batch.messages);
        console.log(`consumed from our queue: ${messages}`);
      }
    } satisfies ExportedHandler<Env>,
  };
}
