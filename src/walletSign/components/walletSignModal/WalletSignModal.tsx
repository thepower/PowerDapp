import React from 'react';
import { Dialog, DialogContent, DialogProps } from '@mui/material';

import { useTranslation } from 'react-i18next';
import { ConnectedProps, connect } from 'react-redux';
import appEnvs from 'appEnvs';
import { RootState } from 'application/store';
import { openPopupCenter } from 'application/utils/popup';
import { FingerPrintIcon } from 'assets/icons';
import { Button } from 'common';

import { stopAction } from 'network/slice';
import { getPopupData } from 'walletSign/selectors/walletSelectors';
import { setPopupData } from 'walletSign/slices/walletSign';
import styles from './WalletSignModal.module.scss';

const dialogClasses = {
  paper: styles.modal
};

const mapDispatchToProps = {
  setPopupData,
  stopAction
};

const mapStateToProps = (state: RootState) => ({
  popupData: getPopupData(state)
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type ModalPropsComponentProps = ConnectedProps<typeof connector> &
  Omit<DialogProps, 'open'>;

const WalletSignModalComponent: React.FC<ModalPropsComponentProps> = ({
  popupData,
  setPopupData,
  stopAction
}) => {
  const { t } = useTranslation();

  return (
    <Dialog
      open={!!popupData}
      className={styles.modalRoot}
      classes={dialogClasses}
      onClose={() => {
        setPopupData(null);
        if (popupData?.action) {
          stopAction({ name: popupData.action });
        }
      }}
    >
      <DialogContent className={styles.modalContent}>
        <div className={styles.title}>{t('walletAuthorization')}</div>
        <FingerPrintIcon className={styles.icon} />
        <div className={styles.subtitle}>{t('pleaseConfirmYourAction')}</div>
        <div className={styles.description}>
          <p>{t('thisSecureStepIsNecessary')}</p>
          <p>{t('yourDigitalSignatureIsASafeguard')}</p>
        </div>
        {/* {popupData?.description && <div className={styles.description}>{popupData.description}</div>} */}
        <Button
          variant='contained'
          onClick={() => {
            openPopupCenter({
              height: 600,
              width: 357,
              title: 'Wallet',
              url: `${appEnvs.WALLET_THEPOWER_URL}/sign-and-send/${popupData?.requestUrlData}`
            });
            setPopupData(null);
          }}
        >
          {t('signWithWalletButton')}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export const WalletSignModal = connector(WalletSignModalComponent);
