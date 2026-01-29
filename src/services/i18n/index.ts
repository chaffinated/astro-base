import type { JSONValue } from '@epic-digital-im/agentify';
import { useUnit } from 'effector-react';
import { use, cache } from 'react';
import { I18n } from 'i18n-js';
import { $cookies } from '@/stores/cookie';
import enUS from './translations/en-US.json';


type TranslationObject = {
  displayName: string,
  fetch: () => Promise<JSONValue>;
}

export const translations: Record<string, TranslationObject> = {
  'en-US': {
    displayName: 'English (US)',
    fetch: createTranslationLoader('en-US'),
  },
  'es': {
    displayName: 'Español',
    fetch: createTranslationLoader('es'),
  },
};

function createTranslationLoader(locale: string) {
  return cache(async () => {
    const t = await import(`./translations/${locale}.json`);
    return t.default;
  });
}


export function useI18n() {
  const cookies = useUnit($cookies);
  const locale = cookies?.['locale']?.value || 'en-US';
  const tfn = translations[locale]?.fetch || translations['en-US'].fetch;
  const t = use(tfn());
  const i18n = new I18n({
    [locale]: t,
    'en-US': enUS,
  });
  i18n.defaultLocale = 'en-US';
  i18n.enableFallback = true;
  i18n.locale = locale;
  return i18n;
}
