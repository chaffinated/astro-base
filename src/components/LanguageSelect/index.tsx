import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  // SelectGroup,
  // SelectLabel,
} from "@/components/ui/select";
import { translations } from "@/services/i18n";
import { $cookies, Cookies, cookies } from "@/stores/cookie";
import { useStoreMap, useUnit } from "effector-react";


type LanguageSelectProps = {

};


const LanguageSelectOptions = Object.entries(translations).reduce((memo, [k, v]) => {
  memo.push({ label: v.displayName, value: k });
  return memo;
}, [] as { label: string, value: string }[]);


export function LanguageSelect(props: LanguageSelectProps) {
  const cookieApi = useUnit(cookies);
  const currentLanguage = useStoreMap($cookies, (cookies) => {
    return cookies.locale?.value || 'en-US';
  });

  function handleSelectLanguage(value: string | null) {
    if (value == null) return;
    cookieApi.set({
      name: Cookies.Locale,
      value: value,
      options: { path: '/' },
    });
  }

  return (
    <Select
      items={LanguageSelectOptions}
      value={currentLanguage}
      onValueChange={handleSelectLanguage}
    >
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      
      <SelectContent>
        { LanguageSelectOptions.map((option) => {
          return (
            <SelectItem key={option.value} value={option.value}>
              { option.label }
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}
