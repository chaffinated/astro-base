import { createId } from '@paralleldrive/cuid2';
import { sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';


export const agentDomain = sqliteTable('AgentDomain', {
  name: text('name').unique().primaryKey(),
});

export const agentConnection = sqliteTable('AgentConnection', {
  id: text('id').primaryKey().unique().$defaultFn(createId),
  url: text('url').notNull(),
  parentUrl: text('parentUrl'),
  domain: text('domain').references(() => agentDomain.name).notNull(),
}, (table) => {
  return [
    uniqueIndex('url_domain_idx').on(table.url, table.domain),
  ];
});


export type AgentDomainInput = typeof agentDomain['$inferInsert'];
