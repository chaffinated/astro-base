import { createStore, createApi } from "effector";
import browserCookies from 'browser-cookies';
import type { AstroCookies } from "astro";
import clone from 'lodash-es/clone';

export enum Cookies {
  Locale = 'locale',
}

export type CookieValue = {
  name: Cookies;
  value?: string;
  options?: {
    expires?: number;
    domain?: string;
    path?: string;
    secure?: boolean;
    httponly?: boolean;
    samesite?: "" | "Strict" | "Lax";
  };
};

const isServer = import.meta.env.SSR;

const initialValues = isServer
  ? {} as Record<Cookies, CookieValue>
  : Object.entries(browserCookies.all()).reduce((memo, [key, val]) => {
      memo[key as unknown as Cookies] = { name: key as unknown as Cookies, value: val };
      return memo;
    }, {} as Record<Cookies, CookieValue | null>);


export const $cookies = createStore(initialValues);
export const cookies = createApi($cookies, {
  set(store, v: CookieValue) {
    store[v.name] = v;
    return clone(store);
  },
  delete(store, v: CookieValue) {
    store[v.name] = null;
    return clone(store);
  },
});

if (!isServer) {
  (window as any).cookies = cookies;
  (window as any).$cookies = $cookies;
  $cookies.watch((store) => {
    Object.entries(store).forEach(([key, val]) => {
      if (val == null || val.value == null) {
        browserCookies.erase(key);
      } else {
        browserCookies.set(key, val.value!, val.options);
      }
    });
  });
}


export function setServerCookies(astroCookies: AstroCookies) {
  Object.values(Cookies).forEach((k) => {
    const cookie = astroCookies.get(k);
    if (cookie == null) return;
    cookies.set({
      name: k,
      value: cookie.value,
    });
  });
}
