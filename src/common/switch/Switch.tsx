import React from 'react';
import {
  Switch as MUISwitch,
  SwitchProps as MUISwitchProps
} from '@mui/material';

import styles from './Switch.module.scss';

type SwitchProps = MUISwitchProps;

export const Switch: React.FC<SwitchProps> = ({ ...otherProps }) => (
  <MUISwitch
    disableRipple
    disableFocusRipple
    disableTouchRipple
    classes={styles}
    {...otherProps}
  />
);
