import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from 'common';

import styles from './AboutPage.module.scss';

const AboutPageComponent: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className={styles.content}>
        <div className={styles.title}>{t('aboutProject')}</div>
        <div className={styles.text}>{t('aboutProjectText')}</div>
      </div>
    </Layout>
  );
};

export default AboutPageComponent;
