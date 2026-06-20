import { useWealthStore } from '../store/wealthStore';
import { translations, type TranslationKey, type Language } from '../i18n/translations';

export function useTranslation() {
  const language = useWealthStore((s) => s.language);
  const setLanguage = useWealthStore((s) => s.setLanguage);

  const t = (key: string, fallback?: string): string => {
    const dict = (translations as any)[language] || translations.en;
    return dict[key] || translations.en[key as TranslationKey] || fallback || key;
  };

  const isHindi = (): boolean => language === 'hi';

  return {
    t,
    language,
    isHindi,
    setLanguage,
    languages: [
      { code: 'en' as Language, label: 'English' },
      { code: 'hi' as Language, label: 'हिंदी' },
    ] as { code: Language; label: string }[],
  };
}

export { translations, type TranslationKey, type Language };
