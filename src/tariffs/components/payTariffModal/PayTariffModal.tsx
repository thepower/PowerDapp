import React from 'react';
import { Dialog, DialogContent, DialogProps } from '@mui/material';

import { ConnectedProps, connect } from 'react-redux';
import { RootState } from 'application/store';
import { Button } from 'common';

import { stopAction } from 'network/slice';
import { getBillData } from 'tariffs/selectors/tariffsSelectors';
import { setBillData } from 'tariffs/slice/tariffSlice';
import styles from './PayTariffModal.module.scss';

const dialogClasses = {
  paper: styles.modal
};

const mapDispatchToProps = {
  setBillData,
  stopAction
};

const mapStateToProps = (state: RootState) => ({
  billData: getBillData(state)
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type ModalPropsComponentProps = ConnectedProps<typeof connector> &
  Omit<DialogProps, 'open'>;

const PayTariffModalComponent: React.FC<ModalPropsComponentProps> = ({
  billData,
  setBillData
}) => (
  <Dialog
    open={!!billData}
    className={styles.modalRoot}
    classes={dialogClasses}
    onClose={() => {
      setBillData(null);
    }}
  >
    <DialogContent className={styles.modalContent}>
      <Button
        variant='contained'
        onClick={() => {
          window.open(billData?.url, '_blank', 'noreferrer');
          setBillData(null);
        }}
      >
        Pay with Robokassa
      </Button>
    </DialogContent>
  </Dialog>
);

export const PayTariffModal = connector(PayTariffModalComponent);
