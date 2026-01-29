import {
  Agent,
  type AgentSnapshot,
  type StateMap,
  BaseDomainKey,
  Message,
  MessageMethods,
  Transport,
  HttpTransport,
  AgentRegistry,
} from '@epic-digital-im/agentify';
import { useState, useEffect, useMemo } from 'react';
import { isEqual, merge } from 'lodash-es';

interface MakeAgentOptions {
  transport?: Transport;
}

const urlReg = /^http/;
const registry = new AgentRegistry()


export function makeAgent<S extends StateMap>(path: string, opts?: MakeAgentOptions): Agent<S> {
  const isServer = import.meta.env.SSR;
  const base = isServer ? import.meta.env.SITE : globalThis.location.origin;
  
  return useMemo(() => {
    const url = urlReg.test(path)
      ? new URL(path)
      : new URL(path, base)

    return new Agent<S>({
      url,
      transport: opts?.transport || new HttpTransport({
        registry,
        fetch: (input, init) => {
          return fetch(input, init);
        },
      }),
    });
  }, []);
}

export function useAgent<S extends StateMap>(agent: Agent<S> | null, domain: string) {
  const [snapshot, setSnapshot] = useState<null | AgentSnapshot<S>>(null);

  function checkNetworkError(message?: Message<any, any>) {
    const hasNetworkError = message && message.method === MessageMethods.NETWORK_ERROR && message.params.status === 401;
    const isUnauthorized = message && message.method === MessageMethods.UNAUTHORIZED;
    if (hasNetworkError || isUnauthorized) {
      console.log('[agent]', '[unauthorized]', agent?.getURLString(), message);
      // const url = new URL(globalThis.location.toString());
      // const path = url.pathname;
      // url.pathname = `/login`;
      // url.search = `?next=${encodeURIComponent(path)}`;
      // globalThis.location.replace(url);
    }
  }
  
  useEffect(() => {
    let subId: string | undefined;

    const subscribe = async () => {
      // const a = agent();
      const notificationDomains = [domain, BaseDomainKey];
      subId = agent?.subscribe((snap, message) => {
        if (!notificationDomains.includes(domain) || isEqual(snapshot, snap)) return;
        const newSnap = merge({}, snapshot, snap);
        newSnap.state = snap.state!;
        setSnapshot(newSnap);
      });
      const res = await agent?.initialize();
      checkNetworkError(res);
    };

    subscribe();
    
    return () => {
      agent?.unsubscribe(subId!);
      agent?.deconstruct();
    };
  }, [agent, snapshot]);

  return useMemo(() => ({
    url: agent?.url,
    state: snapshot?.state,
    initialize: agent?.initialize.bind(agent),
    hasInitialized: agent?.hasInitialized,
    async react(message: Message<any, any>) {
      const res = await agent?.react(message);
      checkNetworkError(res);
      return res;
    },
    async act(message: Message<any, any>) {
      const res = await agent?.act(message);
      checkNetworkError(res);
      return res;
    },
    async query(message: Message<any, any>) {
      const res = await agent?.act(message);
      checkNetworkError(res);
      return res;
    },
    snapshot,
  }), [agent, snapshot]);
}
