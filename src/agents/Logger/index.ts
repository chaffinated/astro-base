import { AgentService, type InstallServiceOptions, } from "@epic-digital-im/agentify";
import { queries, events, domain } from './events';


export type Events = typeof events;
export type Queries = typeof queries;

export { domain };

/* === TYPES === */
type LoggerParams = {};
type LoggerState = {
  level: number;
};

/* === HELPERS === */


/* === SERVICE === */
export function makeLoggerAgentService(
  options: InstallServiceOptions<App.Locals>
): AgentService<App.Locals, Events, Queries> {
  const { transport, graph, context } = options;

  const LoggerService = new AgentService<typeof context, Events, Queries>({
    transport,
    graph,
    events,
    queries,
  });

  LoggerService
    .add<LoggerParams, LoggerState>({
      path: '/api/agents/logger',
      type: 'logger',
      transport,
      async getInitialState(_, params, locals: App.Locals) {
        return {
          level: 0,
        };
      },
      overwrite: import.meta.env.DEV,
    })
    .on({
      event: events.updateLevel,
      async handler(payload, state) {
        state.level = payload[0];
        return {
          state,
          next: [],
        };
      }
    })
    .on({
      event: events.handleMessage,
      async handler(payload, state, sender) {
        if (payload.level >= state.level) {
          const d = new Date();
          console.log('[LOG]', `[${d.toISOString()}]`, sender, payload.message);
        }
        return {
          state,
          next: [],
        }
      }
    });

  return LoggerService;
}
