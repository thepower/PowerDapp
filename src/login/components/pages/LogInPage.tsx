import React, { FC, useEffect } from 'react';

import { Button, Layout } from 'common';
import { RoutesEnum } from 'application/typings/routes';
import { objectToString } from 'sso/utils';
import { isMobile } from 'application/components/App';
import { RootState } from 'application/store';
import { push } from 'connected-react-router';
import { connect, ConnectedProps } from 'react-redux';
import { getWalletAddress } from 'account/selectors/accountSelectors';
import { useTranslation } from 'react-i18next';
import { defaultChain } from 'application/sagas/initApplicationSaga';
import appEnvs from 'appEnvs';
import styles from './LogInPage.module.scss';

const mapDispatchToProps = {
  routeTo: push,
};

const mapStateToProps = (state: RootState) => ({
  walletAddress: getWalletAddress(state),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type LogInPageComponentProps = ConnectedProps<typeof connector>;

const LogInPageComponent:FC<LogInPageComponentProps> = ({ routeTo, walletAddress }) => {
  const { t } = useTranslation();

  useEffect(() => {
    if (walletAddress) {
      routeTo(RoutesEnum.root);
    }
  }, []);

  const onClickCreateWallet = () => {
    const stringData = objectToString({
      callbackUrl:
        `${window.location.origin}/`,
      returnUrl: `${window.location.origin}${RoutesEnum.editProfile}`,
      chainID: defaultChain,
      isShowSeedAfterRegistration: false,
      isAutoDownloadSeed: true,
    });
    window.location.replace(`${appEnvs.WALLET_THEPOWER_URL}/registration-for-apps/${stringData}`);
  };

  const onClickLogin = () => {
    const stringData = objectToString({
      callbackUrl:
        `${window.location.origin}/`,
      returnUrl: window.location.href,
    });
    window.location.replace(`${appEnvs.WALLET_THEPOWER_URL}${RoutesEnum.sso}/${stringData}`);
  };

  const buttonSize = isMobile ? 'small' : 'large';

  return (
    <Layout>
      <div className={styles.content}>
        <div className={styles.title}>{t('authorization')}</div>
        <div className={styles.text}>
          <p>{t('searchProvideAssistance')}</p>
          <p>{t('IfYouDontHavePowerWallet')}</p>
        </div>
        <div className={styles.buttons}>
          <Button onClick={onClickCreateWallet} fullWidth variant="outlined" size={buttonSize}>{t('createPowerWallet')}</Button>
          <Button onClick={onClickLogin} fullWidth variant="contained" size={buttonSize}>{t('logViaPowerWallet')}</Button>
        </div>
      </div>
    </Layout>
  );
};

export const LogInPage = connector(LogInPageComponent);
