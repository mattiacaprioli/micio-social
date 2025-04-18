import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import en from '../translations/en.json';
import it from '../translations/it.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: en
      },
      it: {
        translation: it
      }
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false 
    }
  });

export default i18n;
