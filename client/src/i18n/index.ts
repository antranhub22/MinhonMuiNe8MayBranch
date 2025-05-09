import en from './en.json';
import fr from './fr.json';
import ko from './ko.json';

export type Lang = 'en' | 'fr' | 'ko';

const resources = { en, fr, ko };

export function t(key: string, lang: Lang = 'en'): string {
  return (resources[lang] as Record<string, string>)[key] || key;
} 