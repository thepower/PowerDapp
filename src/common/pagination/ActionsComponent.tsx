import React from 'react';
import {
  Button,
  ButtonClasses,
  IconButton,
  IconButtonClasses
} from '@mui/material';
import cn from 'classnames';
import { PaginationArrow } from 'common';

import styles from './ActionsComponent.module.scss';

interface ActionsComponentProps {
  className?: string;
  count: number;
  onPageChange: (
    event: React.MouseEvent<HTMLButtonElement>,
    value: number
  ) => void;
  page: number;
  pageSize: number;
  loading?: boolean;
}

export class ActionsComponent extends React.PureComponent<ActionsComponentProps> {
  private buttonClasses: Partial<ButtonClasses> = {
    root: styles.buttonRoot,
    disabled: styles.buttonDisabled
  };

  private iconButtonClasses: Partial<IconButtonClasses> = {
    disabled: styles.iconButtonDisabled,
    root: styles.iconButtonRoot
  };

  constructor(props: ActionsComponentProps) {
    super(props);
    this.state = {};
  }

  handleFirstPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    this.props.onPageChange(event, 0);
  };

  handleBackButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const { page } = this.props;
    this.props.onPageChange(event, page - 1);
  };

  handleNextButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const { page } = this.props;
    this.props.onPageChange(event, page + 1);
  };

  handleLastPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const { count, pageSize } = this.props;
    this.props.onPageChange(
      event,
      Math.max(0, Math.ceil(count / pageSize) - 1)
    );
  };

  renderLabelDisplayedRows = ({
    to,
    count,
    page,
    pageSize
  }: {
    from: number;
    to: number;
    count: number;
    page: number;
    pageSize: number;
  }) => (
    <>
      <span>{page + 1}</span> /{' '}
      {count !== -1
        ? Math.max(0, Math.ceil(count / pageSize))
        : `more than ${to}`}
    </>
  );

  getLabelDisplayedRowsTo = () => {
    const { page, count, pageSize } = this.props;
    if (count === -1) {
      return (page + 1) * pageSize;
    }
    return pageSize === -1 ? count : Math.min(count, (page + 1) * pageSize);
  };

  render() {
    const {
      handleFirstPageButtonClick,
      handleBackButtonClick,
      handleNextButtonClick,
      handleLastPageButtonClick,
      renderLabelDisplayedRows,
      getLabelDisplayedRowsTo
    } = this;
    const { page, count, pageSize, loading, className } = this.props;
    const { buttonClasses, iconButtonClasses } = this;
    return (
      <div className={cn(styles.actionsComponent, className)}>
        <Button
          classes={buttonClasses}
          onClick={handleFirstPageButtonClick}
          disabled={page === 0 || loading}
          disableRipple
        >
          First
        </Button>
        <IconButton
          classes={iconButtonClasses}
          onClick={handleBackButtonClick}
          disabled={page === 0 || loading}
          disableRipple
        >
          <PaginationArrow type='left' />
        </IconButton>
        <div className={styles.displayedRows}>
          {renderLabelDisplayedRows({
            from: count === 0 ? 0 : page * pageSize + 1,
            to: getLabelDisplayedRowsTo(),
            count: count === -1 ? -1 : count,
            page,
            pageSize
          })}
        </div>
        <IconButton
          classes={iconButtonClasses}
          onClick={handleNextButtonClick}
          disabled={
            (count !== -1 ? page >= Math.ceil(count / pageSize) - 1 : false) ||
            loading
          }
          disableRipple
        >
          <PaginationArrow type='right' />
        </IconButton>
        <Button
          classes={buttonClasses}
          onClick={handleLastPageButtonClick}
          disabled={page >= Math.ceil(count / pageSize) - 1 || loading}
          disableRipple
        >
          Last
        </Button>
      </div>
    );
  }
}
