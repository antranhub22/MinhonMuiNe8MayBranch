import en from './en.json';
import fr from './fr.json';
<<<<<<< HEAD
import ko from './ko.json';

export type Lang = 'en' | 'fr' | 'ko';

const resources = { en, fr, ko };
=======
import zh from './zh.json';
import ru from './ru.json';

export type Lang = 'en' | 'fr' | 'zh' | 'ru';

const resources = { en, fr, zh, ru };
>>>>>>> Russian_Ui

export function t(key: string, lang: Lang = 'en'): string {
  return (resources[lang] as Record<string, string>)[key] || key;
} 