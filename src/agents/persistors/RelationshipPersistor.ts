import {
  GraphPersistor,
  type GraphNode,
} from "@epic-digital-im/agentify";
import { and, eq } from "drizzle-orm";
import { type DatabaseClient } from "@/services/database";
import * as schema from "./schema";


/* === GRAPH PERSISTOR === */
export class RelationshipPersistor extends GraphPersistor {
  private client: DatabaseClient;

  constructor(client: DatabaseClient) {
    super();
    this.client = client;
  }

  async initialize(): Promise<GraphNode[]> {
    // console.log('[relationship]', '[init]');
    const client = this.client;
    const domains = await client
      .select({ domain: schema.agentDomain, connections: schema.agentConnection })
      .from(schema.agentDomain)
      .leftJoin(schema.agentConnection, eq(schema.agentDomain.name, schema.agentConnection.domain))
      .all();
    const nodes = domains
      .flatMap((d) => d.connections)
      .filter((node) => node != null) as GraphNode[];
    return nodes;
  }
  
  async get(domain: string, url: string): Promise<GraphNode | null> {
    // console.log('[relationship]', '[get]');
    const node = await this.client.query.agentConnection.findFirst({
      where: and(
        eq(schema.agentConnection.domain, domain),
        eq(schema.agentConnection.url, url),
      ),
    });
    return node ?? null;
  }

  async set(domain: string, changes: GraphNode[]): Promise<void> {
    const client = this.client;
    const [d] = await client
      .insert(schema.agentDomain)
      .values({ name: domain })
      .onConflictDoUpdate({
        target: schema.agentDomain.name,
        set: { name: domain },
      })
      .returning();
    // console.log('[relationship]', '[sot]');
    if (d == null) {
      return;
    }
    
    await Promise.all(changes.map(async (node) => {
      const [ex] = await client
        .select()
        .from(schema.agentConnection)
        .where(and(
          eq(schema.agentConnection.domain, node.domain),
          eq(schema.agentConnection.url, node.url),
        ));
      
      return ex != null
        ? client
            .update(schema.agentConnection)
            .set({ parentUrl: node.parentUrl })
            .where(eq(schema.agentConnection.id, ex.id))
        : client
            .insert(schema.agentConnection)
            .values({
              domain: d.name,
              url: node.url,
              parentUrl: node.parentUrl,
            });
    }));
  }
}
