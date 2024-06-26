import {
  Layout,
} from 'common';

import React from 'react';

import { RootState } from 'application/store';
import { ConnectedProps, connect } from 'react-redux';

import { useTranslation } from 'react-i18next';
import { getUserTariffLevel } from 'tariffs/selectors/tariffsSelectors';
import { getWalletAddress } from 'account/selectors/accountSelectors';
import { checkIfLoading } from 'network/selectors';
import { getIsVerified } from 'profiles/selectors/rolesSelectors';
import styles from './PricingPage.module.scss';
import { TariffCard } from '../tariffCard/TariffCard';
import { payTariffTrigger } from '../../slice/tariffSlice';

const tariffs = [
  {
    id: 0,
    title: 'tariff1Title',
    price: 'tariff1Price',
    description: 'tariff1Description',
    list: 'tariff1List',
    isFree: true,
  },
  {
    id: 1,
    title: 'tariff2Title',
    price: 'tariff2Price',
    description: 'tariff2Description',
    list: 'tariff2List',
  },
  {
    id: 2,
    title: 'tariff3Title',
    price: 'tariff3Price',
    description: 'tariff3Description',
    list: 'tariff3List',
  },
];

const mapDispatchToProps = {
  payTariffTrigger,
};

const mapStateToProps = (state: RootState) => ({
  userTariffLevel: getUserTariffLevel(state),
  walletAddress: getWalletAddress(state),
  isPayTariffLoading: checkIfLoading(state, payTariffTrigger.type),
  isVerified: getIsVerified(state),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PricingPageComponentProps = ConnectedProps<typeof connector>;

const PricingPageComponent: React.FC<PricingPageComponentProps> = ({
  walletAddress,
  userTariffLevel,
  payTariffTrigger,
  isPayTariffLoading,
  isVerified,
}) => {
  const { t } = useTranslation();

  const isFreeTariffActive = userTariffLevel?.foundTokenId !== 0;
  const isFirstTariffActive = userTariffLevel?.foundLevel === 1;
  const isSecondTariffActive = userTariffLevel?.foundLevel === 2;

  const onClickChooseTariff = (tariffId: number) => {
    payTariffTrigger({ tariffId, walletAddress });
  };

  return (
    <Layout>
      <div className={styles.content}>
        <div className={styles.title}>
          {t('selectSubscription')}
        </div>
        <div className={styles.text}>
          {t('byChoosingSubscription')}
        </div>

        <div className={styles.tariffCards}>
          <TariffCard
            isActive={isFreeTariffActive}
            isDisabled={isFreeTariffActive || !isVerified}
            tariff={tariffs[0]}
            onClick={() => onClickChooseTariff(tariffs[0].id)}
            isLoading={isPayTariffLoading}
          />
          <TariffCard
            isActive={isFirstTariffActive}
            isDisabled={isSecondTariffActive || !isFreeTariffActive || !isVerified}
            tariff={tariffs[1]}
            onClick={() => onClickChooseTariff(tariffs[1].id)}
            isLoading={isPayTariffLoading}
          />
          <TariffCard
            isActive={isSecondTariffActive}
            isDisabled={!isFreeTariffActive || !isVerified}
            tariff={tariffs[2]}
            onClick={() => onClickChooseTariff(tariffs[2].id)}
            isLoading={isPayTariffLoading}
          />
        </div>
      </div>

    </Layout>
  );
};

export const PricingPage = connector(PricingPageComponent);
