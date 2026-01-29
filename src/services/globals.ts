import type { Cookies, CookieValue } from "@/stores/cookie";

interface Globals {
  cookies?: Record<Cookies, CookieValue> | null;
}

const _globals: Globals = {
  cookies: null,
}

export const globals = {
  get(key: keyof Globals) {
    return _globals[key];
  },
  set(key: keyof Globals, value: Globals[typeof key]) {
    _globals[key] = value;
    return _globals[key];
  }
}
