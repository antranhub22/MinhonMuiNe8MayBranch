import en from './en.json';
import fr from './fr.json';
import zh from './zh.json';
import ru from './ru.json';
import ko from './ko.json';

export type Lang = 'en' | 'fr' | 'zh' | 'ru' | 'ko';

const resources = { en, fr, zh, ru, ko };

export function t(key: string, lang: Lang = 'en'): string {
  return (resources[lang] as Record<string, string>)[key] || key;
} 