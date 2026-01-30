import { env } from 'cloudflare:workers';
import { DrizzleD1Database, drizzle } from 'drizzle-orm/d1';
import * as schema from '@/schema';


export function useDatabase(locals: App.Locals) {
  const { DB } = env;
  const db = drizzle(DB!, { schema });
  return db;
}

export type DatabaseClient = DrizzleD1Database<typeof schema>;

// export * from './types';
// export { seedDB } from './seed';
