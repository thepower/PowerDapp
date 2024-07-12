import React from 'react';
import {
  Tab,
  Box,
  Tabs as MUITabs,
  TabsProps as MUITabsProps
} from '@mui/material';
import classnames from 'classnames';
import styles from './Tabs.module.scss';

interface TabsProps extends MUITabsProps {
  tabs: any;
  tabsLabels: any;
  tabsRootClassName?: string;
  tabsHolderClassName?: string;
  tabClassName?: string;
  tabIndicatorClassName?: string;
  tabSelectedClassName?: string;
}

const boxSx = { borderBottom: 1, borderColor: 'divider' };

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  tabsLabels,
  tabClassName,
  tabSelectedClassName,
  tabsRootClassName,
  tabIndicatorClassName,
  value,
  onChange,
  tabsHolderClassName
}) => {
  const getTabClasses = () => ({
    selected: classnames(styles.selectedTab, tabSelectedClassName)
  });

  const getTabsClasses = () => ({
    root: classnames(styles.tabsRoot, tabsRootClassName),
    flexContainer: styles.tabsFlexContainer,
    indicator: classnames(styles.tabsIndicator, tabIndicatorClassName)
  });

  const renderTab = (key: string) => {
    const labels = tabsLabels || tabs;

    return (
      <Tab
        key={key}
        className={classnames(styles.tab, tabClassName)}
        classes={getTabClasses()}
        label={labels[key as keyof typeof labels]}
        value={key}
        disableFocusRipple
        disableRipple
        wrapped
      />
    );
  };

  return (
    <Box
      className={classnames(styles.tabsHolder, tabsHolderClassName)}
      sx={boxSx}
    >
      <MUITabs value={value} onChange={onChange} classes={getTabsClasses()}>
        {Object.keys(tabs).map(renderTab)}
      </MUITabs>
    </Box>
  );
};
