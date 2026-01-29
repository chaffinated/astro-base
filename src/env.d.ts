/// <reference types="astro/client" />

type StateMap = import('@epic-digital-im/agentify').StateMap;
type Agent<S extends StateMap> = import('@epic-digital-im/agentify').Agent<S>;
type AggregateService = import('@epic-digital-im/agentify').AggregateService<any>;
type Authorizer = import('@epic-digital-im/agentify').Authorizer<any>;

type Env = {
  // CLOUDFLARE SERVICES

  // WORKER INFO
  CF_PAGES_BRANCH?: string;
  DEV: boolean;
  
  // MAILTRAP
  MAILTRAP_API_KEY?: string;
  MAILTRAP_ACCOUNT_ID?: string;

  // LOGGER SETTINGS
  LOG_LEVEL: string;
  
  // GTM SETTINGS
  GTM_ID?: string;
};

type Runtime = import('@astrojs/cloudflare').Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {
    AgentServices?: AggregateService;
    userIp?: string;
    service?: {
      key: string;
      name: string;
      host: string;
      createdAt: string;
      updatedAt: string;
    };
    url: URL;
    isDev?: boolean;
    logLevel: number;
  }
}
