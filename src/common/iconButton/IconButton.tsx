import React from 'react';
import {
  IconButton as MuiIconButton,
  IconButtonProps as MuiIconButtonProps
} from '@mui/material';
import { LinkProps } from 'react-router-dom';
import styles from './IconButton.module.scss';

type IconButtonProps = MuiIconButtonProps & Partial<Pick<LinkProps, 'to'>>;

export const IconButton: React.FC<IconButtonProps> = ({
  children,
  ...iconBtnProps
}) => (
  <MuiIconButton {...iconBtnProps} disableRipple classes={styles}>
    {children}
  </MuiIconButton>
);
