import en from './en.json';
import fr from './fr.json';

export type Lang = 'en' | 'fr';

const resources = { en, fr };

export function t(key: string, lang: Lang = 'en'): string {
  return (resources[lang] as Record<string, string>)[key] || key;
} 