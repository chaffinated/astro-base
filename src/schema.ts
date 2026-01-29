import { sqliteTable, text, unique, integer } from 'drizzle-orm/sqlite-core';
import type { JSONValue } from '@epic-digital-im/agentify';
import { createId } from '@paralleldrive/cuid2';
import { sql, relations } from 'drizzle-orm';
export * from './agents/persistors/schema';


/* === Custom Column Types === */
const addTimeStamps = () => ({
  createdAt: integer('createdAt', { mode: 'timestamp_ms' })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp_ms' })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

/* === TABLES === */
export const document = sqliteTable('Document', {
  id: text('id').$defaultFn(createId).primaryKey(),
  name: text('name').unique(),
  description: text('description'),
  contents: text('contents', { mode: 'json' }).$type<JSONValue>(),
  ...addTimeStamps(),
});
