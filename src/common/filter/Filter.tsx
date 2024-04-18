import React from 'react';

import {
  FormControl,
  FormControlLabel, IconButton, Popover, Radio, RadioGroup,
} from '@mui/material';
import { CloseIcon, FilterIcon } from 'assets/icons';
import { useTranslation } from 'react-i18next';
import cn from 'classnames';
import styles from './Filter.module.scss';

type FilterProps = {
  className?: string;
  label?: string;
  value?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>, value: string) => void;
  items: { label: string, value: string }[]
};

export const Filter: React.FC<FilterProps> = ({
  className, label, value, onChange, items,
}) => {
  const { t } = useTranslation();

  const [filter, setFilter] = React.useState<HTMLButtonElement | null>(null);

  const open = Boolean(filter);
  const id = open ? 'filter-popover' : undefined;
  const handleClickFilter = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilter(event.currentTarget);
  };

  const handleCloseFilter = () => {
    setFilter(null);
  };

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>, value: string) => {
    onChange(event, value);
    setFilter(null);
  };

  const onClickClose = () => {
    setFilter(null);
  };

  return (
    <FormControl className={className}>

      <IconButton
        disableRipple
        aria-describedby={id}
        className={cn(styles.filter, (open || value !== 'all') && styles.filterActive)}
        onClick={handleClickFilter}
      >
        <FilterIcon />
        <span>{label || t('filter')}</span>
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={filter}
        onClose={handleCloseFilter}
        classes={{ paper: styles.popoverPaper }}
        marginThreshold={10}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: -8,
          horizontal: 'right',
        }}
      >
        <CloseIcon
          className={styles.closeButton}
          onClick={onClickClose}
        />
        <RadioGroup
          aria-labelledby="aria-filter-radio-group"
          name="filter-radio-group"
          value={value}
          onChange={handleOnChange}
        >
          {items.map(({ label, value }) => <FormControlLabel
            className={styles.formControlLabel}
            value={value}
            control={<Radio
              disableRipple
              classes={{ root: styles.radio, checked: styles.radioChecked }}
            />}
            label={label}
            key={value}
          />)}
        </RadioGroup>
      </Popover>
    </FormControl>
  );
};
