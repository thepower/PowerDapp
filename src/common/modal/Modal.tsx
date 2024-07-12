import React from 'react';
import { Close } from '@mui/icons-material';
import { DialogProps, Dialog, DialogContent, IconButton } from '@mui/material';
import classnames from 'classnames';
import styles from './Modal.module.scss';

export interface ModalProps extends DialogProps {
  children?: JSX.Element | JSX.Element[];
  onClose?: (data?: any) => void;
  className?: string;
  contentClassName?: string;
  alwaysShowCloseIcon?: boolean;
}

const dialogClasses = {
  paper: styles.modal
};

export const Modal: React.FC<ModalProps> = (props: ModalProps) => {
  const {
    open,
    onClose,
    children,
    className,
    contentClassName,
    alwaysShowCloseIcon = false
  } = props;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className={classnames(styles.modalRoot, className)}
      classes={dialogClasses}
    >
      <DialogContent
        className={classnames(contentClassName, styles.modalContent)}
      >
        <IconButton
          className={classnames(
            styles.closeIcon,
            alwaysShowCloseIcon && styles.alwaysShowCloseIcon
          )}
          onClick={onClose}
        >
          <Close />
        </IconButton>
        {children}
      </DialogContent>
    </Dialog>
  );
};
