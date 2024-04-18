import React from 'react';
import {
  Select as MuiSelect,
  SelectProps as MuiSelectProps,
  MenuItem,
  SelectClasses,
  MenuClasses,
  MenuItemClasses,
} from '@mui/material';
import { OutlinedInput } from 'common';

import cn from 'classnames';
import { ChevronDownIcon } from 'assets/icons/ChevronDown';
import styles from './Select.module.scss';

type SelectProps = MuiSelectProps & {
  items: { label: string; value: string }[];
  label?: string;
  errorMessage?: string;
};

export class Select extends React.PureComponent<SelectProps> {
  private selectClasses: Partial<SelectClasses> = { icon: styles.icon };

  private menuClasses: Partial<MenuClasses> = { list: styles.menuList, paper: styles.menuPaper };

  private menuItemClasses: Partial<MenuItemClasses> = { selected: styles.menuItemSelected, root: styles.menuItemRoot };

  constructor(props: SelectProps) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      className, value, items, onChange, ...otherProps
    } = this.props;
    const {
      selectClasses, menuClasses, menuItemClasses,
    } = this;
    return (
      <MuiSelect
        className={cn(className, !!value && styles.selected)}
        input={<OutlinedInput label={this.props.label} errorMessage={this.props.errorMessage} />}
        classes={selectClasses}
        IconComponent={ChevronDownIcon}
        sx={{
          '& .MuiSelect-select .notranslate::after': this.props.placeholder
            ? {
              content: `"${this.props.placeholder}"`,
              opacity: 0.42,
            }
            : {},
        }}
        MenuProps={{
          classes: menuClasses,
          disableScrollLock: true,
          marginThreshold: 10,
          anchorOrigin: {
            vertical: 48,
            horizontal: 'center',
          },
        }}
        value={value}
        onChange={onChange}
        {...otherProps}
      >
        {items.map((item) => (
          <MenuItem key={item.value} value={item.value} classes={menuItemClasses}>
            {item.label}
          </MenuItem>
        ))}
      </MuiSelect>
    );
  }
}
