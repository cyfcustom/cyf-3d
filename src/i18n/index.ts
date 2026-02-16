import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import common from './locales/es/common.json';
import landing from './locales/es/landing.json';
import calculator from './locales/es/calculator.json';
import configurator from './locales/es/configurator.json';
import admin from './locales/es/admin.json';

const resources = {
  es: {
    common,
    landing,
    calculator,
    configurator,
    admin,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'es',
  fallbackLng: 'es',
  defaultNS: 'common',
  ns: ['common', 'landing', 'calculator', 'configurator', 'admin'],
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
