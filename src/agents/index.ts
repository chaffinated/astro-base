import {
  AgentRegistry,
  type Event,
  type AggregateService,
  type InstallServiceOptions,
} from "@epic-digital-im/agentify";
import {
  makeLoggerAgentService,
} from "./Logger";


export const DefaultRegistry = new AgentRegistry();


export function installServices(options: InstallServiceOptions<App.Locals>): AggregateService<any> {
  const { transport, baseUrl, context, graph } = options;
  const loggerService = makeLoggerAgentService({ baseUrl, transport, context, graph });
  const allEvents = [
    loggerService.events,
  ];

  const events = Object.freeze(allEvents.reduce((memo, map) => {
    Object.entries(map).forEach(([key, val]) => {
      memo[val.domainKey] = memo[val.domainKey] || {};
      memo[val.domainKey]![key] = val;
    })
    return memo;
  }, {} as { [key: string]: { [key: string]: Event<any, any, any> }}));

  return {
    registry: transport.registry,
    events,
  };
}
