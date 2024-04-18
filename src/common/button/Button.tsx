import React from 'react';
import { LoadingButton as MuiLoadingButton, LoadingButtonProps as MuiLoadingButtonProps } from '@mui/lab';
import { Link, LinkProps } from 'react-router-dom';
import styles from './Button.module.scss';

type ButtonProps = MuiLoadingButtonProps & Partial<Pick<LinkProps, 'to'>> & {
  variant: 'outlined' | 'contained'
};

export const Button: React.FC<ButtonProps> = ({
  children,
  size = 'medium',
  loading,
  ...btnProps
}) => (
  <MuiLoadingButton
    {...btnProps}
    disableRipple
    size={size}
    disableElevation
    loading={loading}
    LinkComponent={Link}
    classes={styles}
  >
    {!loading && <span>{children}</span>}
  </MuiLoadingButton>
);
