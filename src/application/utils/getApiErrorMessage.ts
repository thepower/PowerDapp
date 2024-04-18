import i18n from 'locales/initLocales';

const defaultErrorMessage = i18n.t('defaultErrorMessage');

export const getErrorMessage = (error: any): string => {
  if (error && error.message) {
    return error.message;
  }

  return defaultErrorMessage;
};
