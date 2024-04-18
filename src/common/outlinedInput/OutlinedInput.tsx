import React from 'react';
import {
  FormControl,
  FormHelperText,
  OutlinedInput as MuiOutlinedInput,
  OutlinedInputProps as MuiOutlinedInputProps,
} from '@mui/material';

import cn from 'classnames';
import styles from './OutlinedInput.module.scss';

export interface OutlinedInputProps extends MuiOutlinedInputProps {
  label?: string;
  errorMessage?: string;
}

export const OutlinedInput: React.FC<OutlinedInputProps> = ({
  className,
  errorMessage,
  label,
  multiline,
  error,
  color = 'primary',
  fullWidth,
  classes,
  ...otherProps
}) => (
  <FormControl
    fullWidth={fullWidth}
    className={className}
  >
    {label && <div className={cn(styles.label, styles[`labelColor_${color}`])}>{label}</div>}
    <MuiOutlinedInput
      {...otherProps}
      classes={{ ...styles, ...classes }}
      multiline={multiline}
      color={color}
      className={multiline ? styles.multiline : ''}
      fullWidth={fullWidth}
    />
    {error && <FormHelperText className={styles[`${color}ErrorColor`]}>{errorMessage}</FormHelperText>}
  </FormControl>);
