import React from 'react';

import { ParkIcon, Button } from 'common';
import { useTranslation } from 'react-i18next';
import styles from './TariffCard.module.scss';

interface TariffCardProps {
  isActive?: boolean;
  isDisabled?: boolean;
  isLoading?: boolean;
  tariff: {
    id: number;
    title: string;
    price: string;
    description: string;
    list: string;
    isFree?: boolean;
  }
  onClick: () => void;
}

export const TariffCard: React.FC<TariffCardProps> = ({
  tariff, isActive, isDisabled, isLoading, onClick,
}) => {
  const { t } = useTranslation();

  const list = t(tariff.list).split('\n');
  return (
    <div key={tariff.id} className={isActive ? styles.tariffCard__isActive : styles.tariffCard}>
      <div className={!isActive ? styles.title__isActive : styles.title}>
        {t(tariff.title)}
      </div>
      <div className={!isActive ? styles.text__isActive : styles.text}>
        {t(tariff.description)}
      </div>
      <div className={styles.price}>
        {t(tariff.price)}
        {!tariff?.isFree && <span>{`/${t('month')}`}</span>}
      </div>

      <Button
        className={styles.button}
        fullWidth
        variant="outlined"
        disabled={isDisabled}
        onClick={onClick}
        loading={isLoading}
      >
        {isActive ? t('cancelSubscription') : t('chooseSubscription')}
      </Button>

      <div className={styles.list}>
        {list.map((item) => (
          <div className={!isActive ? styles.listItem__isActive : styles.listItem}>
            <ParkIcon />
            {item}
          </div>))}
      </div>
    </div>);
};
