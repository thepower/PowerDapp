import React from 'react';

import { useTranslation } from 'react-i18next';

import { Link } from 'react-router-dom';
import { RoutesEnum } from 'application/typings/routes';
import styles from './Footer.module.scss';

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className={styles.footer}>
      <Link className={styles.link} to={RoutesEnum.about}>{t('aboutProject')}</Link>
      <Link className={styles.link} to={RoutesEnum.pricing}>{t('pricing')}</Link>
      <div className={styles.text}>2024 DeInfra DAO</div>
    </footer>
  );
};
