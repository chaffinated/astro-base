import { AgentRegistry, LocalTransport, RelationshipGraph } from '@epic-digital-im/agentify';
import { defineMiddleware } from 'astro:middleware';
import { Cookies, setServerCookies } from '@/stores/cookie';
import { installServices } from '@/agents';


export const onRequest = defineMiddleware(async function onRequest(context, next) {
  const { locals, request, cookies, preferredLocale } = context;
  const origin = (new URL(request.url)).origin.replace(/\/\w{1,8}\./, '/');
  const baseURL = new URL(origin);
  const u = new URL(request.url, baseURL);

  const registry = new AgentRegistry({ context: locals, baseURL });
  const transport = new LocalTransport({ registry });
  const graph = new RelationshipGraph({});
  const AgentServices = installServices({
    baseUrl: u.origin,
    context: locals,
    transport,
    graph,
  });

  locals.AgentServices = AgentServices;

  // Set preferred locale in cookies if not present already
  const locale = cookies.get(Cookies.Locale);
  cookies.set(Cookies.Locale, locale?.value || preferredLocale || 'en-US', { path: '/' });

  // map/set cookie values for use elsewhere on the server
  setServerCookies(cookies as any);

  try {
    await registry.router.middleware(request);
  } catch(err) {
    console.log('err', err)
  }

  // return a Response or the result of calling `next()`
  const res = await next();
  return res;
});
