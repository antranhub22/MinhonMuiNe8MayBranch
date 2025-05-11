import en from './en.json';
import fr from './fr.json';
import zh from './zh.json';

export type Lang = 'en' | 'fr' | 'zh';

const resources = { en, fr, zh };

export function t(key: string, lang: Lang = 'en'): string {
  return (resources[lang] as Record<string, string>)[key] || key;
} 