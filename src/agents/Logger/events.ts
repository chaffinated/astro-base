import { createDomain } from "@epic-digital-im/agentify";

type LoggerMessage = {
  level: number;
  message: string;
}

/* === EVENTS === */
export const domain = createDomain({ key: 'logger', overwrite: import.meta.env.DEV });

export const events = {
  updateLevel: domain.createEvent<[number]>({
    key: 'updateLevel',
    overwrite: import.meta.env.DEV,
  }),
  handleMessage: domain.createEvent<LoggerMessage>({
    key: 'handleMessage',
    overwrite: import.meta.env.DEV,
  }),
};

export const queries = {
  
};
