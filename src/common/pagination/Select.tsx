import React from 'react';
import {
  Select as MuiSelect,
  SelectProps as MuiSelectProps,
  MenuItem,
  InputBase,
  SelectClasses,
  InputBaseClasses,
  MenuClasses,
  MenuItemClasses
} from '@mui/material';

import { SelectIcon } from 'common';
import styles from './Select.module.scss';

type SelectProps = MuiSelectProps & {
  items: number[];
};

// TODO доделать смену цвета при фокусе иконки
export class Select extends React.PureComponent<SelectProps> {
  private selectClasses: Partial<SelectClasses> = {
    select: styles.select,
    icon: styles.selectIcon
  };

  private inputBaseClasses: Partial<InputBaseClasses> = {
    root: styles.inputBaseRoot,
    input: styles.inputBaseInput,
    focused: styles.inputBaseFocused
  };

  private menuClasses: Partial<MenuClasses> = {
    list: styles.menuNFTs,
    paper: styles.menuPaper
  };

  private menuItemClasses: Partial<MenuItemClasses> = {
    selected: styles.menuItemSelected,
    root: styles.menuItemRoot
  };

  constructor(props: SelectProps) {
    super(props);
    this.state = {};
  }

  render() {
    const { className, value, items, onChange, ...otherProps } = this.props;
    const { selectClasses, inputBaseClasses, menuClasses, menuItemClasses } =
      this;

    return (
      <MuiSelect
        className={className}
        variant='standard'
        input={<InputBase classes={inputBaseClasses} />}
        classes={selectClasses}
        MenuProps={{
          classes: menuClasses,
          disableScrollLock: true,
          anchorOrigin: {
            vertical: 32,
            horizontal: 'center'
          }
        }}
        IconComponent={SelectIcon}
        value={value}
        onChange={onChange}
        {...otherProps}
      >
        {items.map((rowsPerPageOption) => (
          <MenuItem
            disableRipple
            key={rowsPerPageOption}
            value={rowsPerPageOption}
            classes={menuItemClasses}
          >
            {rowsPerPageOption}
          </MenuItem>
        ))}
      </MuiSelect>
    );
  }
}
