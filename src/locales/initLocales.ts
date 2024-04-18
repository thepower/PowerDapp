import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

import ru from './ru.json';
import en from './en.json';

const langs = {
  ru,
  en,
};

export const langsKeys = Object.keys(langs);

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: ['en'],
    resources: langs,
    interpolation: {
      escapeValue: true,
    },
  });

if (!langsKeys.includes(i18n.language)) {
  i18n.changeLanguage('en');
}

export default i18n;
