import React from 'react';
import { SelectChangeEvent } from '@mui/material';
import cn from 'classnames';

import { WithTranslation, withTranslation } from 'react-i18next';
import { ActionsComponent } from './ActionsComponent';

import styles from './Pagination.module.scss';
import { Select } from './Select';

interface PaginationProps extends WithTranslation {
  className?: string;
  loading?: boolean;
  tableTitle?: string;
  pageSize: number;
  rowsPerPageOptions: number[];
  page: number;
  count: number;
  onPageChange: (
    event: React.MouseEvent<HTMLButtonElement>,
    value: number
  ) => void;
  handleChangePageSize: (
    event: SelectChangeEvent<unknown>,
    child: React.ReactNode
  ) => void;
  beforeTableHeaderChild?: JSX.Element;
  isWithoutRowsPerPage?: boolean;
}

class PaginationComponent extends React.PureComponent<PaginationProps> {
  constructor(props: PaginationProps) {
    super(props);
    this.state = {};
  }
  // TODO ActionsComponent пагинацию при pageSize < 6

  renderSelect = () => {
    const { pageSize, rowsPerPageOptions, handleChangePageSize } = this.props;
    return (
      rowsPerPageOptions?.length > 1 && (
        <div className={styles.selectContainer}>
          <div className={styles.labelRowsPerPage}>
            {this.props.t('showBy')}
          </div>
          <Select
            className={styles.select}
            items={rowsPerPageOptions}
            value={pageSize}
            onChange={handleChangePageSize}
          />
          <div className={styles.labelRowsPerPage}>{this.props.t('rows')}</div>
        </div>
      )
    );
  };

  renderLeftCol = () => {
    const { tableTitle, beforeTableHeaderChild } = this.props;
    return tableTitle || beforeTableHeaderChild
      ? (tableTitle && <div className={styles.tableTitle}>{tableTitle}</div>) ||
          beforeTableHeaderChild
      : this.renderSelect();
  };

  render() {
    const {
      className,
      loading,
      tableTitle,
      page,
      onPageChange,
      count,
      pageSize,
      beforeTableHeaderChild,
      isWithoutRowsPerPage
    } = this.props;

    return (
      <div
        className={cn(
          className,
          styles.paginationContainer,
          (tableTitle || beforeTableHeaderChild) &&
            !isWithoutRowsPerPage &&
            styles.flexEnd,
          !(tableTitle || beforeTableHeaderChild) && styles.footer
        )}
      >
        {this.renderLeftCol()}
        <div className={styles.actionsContainer}>
          <ActionsComponent
            page={page}
            onPageChange={onPageChange}
            count={count}
            pageSize={pageSize}
            loading={loading}
          />
        </div>
      </div>
    );
  }
}

export const Pagination = withTranslation()(PaginationComponent);
