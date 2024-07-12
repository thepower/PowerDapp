import React, { FC, useEffect } from 'react';

import { useTranslation } from 'react-i18next';
import { connect, ConnectedProps } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getWalletAddress } from 'account/selectors/accountSelectors';
import appEnvs from 'appEnvs';
import { isMobile } from 'application/components/App';
import { RootState } from 'application/store';
import { defaultChain } from 'application/thunks/initApplication';
import { RoutesEnum } from 'application/typings/routes';
import { Button, Layout } from 'common';
import { objectToString } from 'sso/utils';
import styles from './LogInPage.module.scss';

const mapStateToProps = (state: RootState) => ({
  walletAddress: getWalletAddress(state)
});

const connector = connect(mapStateToProps);
type LogInPageComponentProps = ConnectedProps<typeof connector>;

const callbackUrl = appEnvs.BASENAME
  ? `${window.location.origin}${appEnvs.BASENAME}`
  : `${window.location.origin}/`;

const LogInPageComponent: FC<LogInPageComponentProps> = ({ walletAddress }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  useEffect(() => {
    if (walletAddress) {
      navigate(RoutesEnum.root);
    }
  }, []);

  const onClickCreateWallet = () => {
    const stringData = objectToString({
      callbackUrl,
      returnUrl: `${window.location.origin}${RoutesEnum.editProfile}`,
      chainID: defaultChain
    });
    window.location.replace(
      `${appEnvs.WALLET_THEPOWER_URL}/signup/${stringData}`
    );
  };

  const onClickLogin = () => {
    const stringData = objectToString({
      callbackUrl,
      returnUrl: window.location.href,
      chainID: defaultChain
    });
    window.location.replace(
      `${appEnvs.WALLET_THEPOWER_URL}${RoutesEnum.sso}/${stringData}`
    );
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
          <Button
            onClick={onClickCreateWallet}
            fullWidth
            variant='outlined'
            size={buttonSize}
          >
            {t('createPowerWallet')}
          </Button>
          <Button
            onClick={onClickLogin}
            fullWidth
            variant='contained'
            size={buttonSize}
          >
            {t('logViaPowerWallet')}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export const LogInPage = connector(LogInPageComponent);
