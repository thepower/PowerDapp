import React, { PropsWithChildren } from 'react';
import cn from 'classnames';

import { Header, Footer } from 'common';
import { PayTariffModal } from 'tariffs/components/payTariffModal/PayTariffModal';
import { WalletSignModal } from 'walletSign/components/walletSignModal/WalletSignModal';
import styles from './Layout.module.scss';

interface LayoutProps {
  className?: string;
  contentClassName?: string;
  isWithoutHeader?: boolean;
}
export const Layout: React.FC<PropsWithChildren<LayoutProps>> = ({
  className,
  contentClassName,
  isWithoutHeader,
  children
}) => (
  <div
    className={cn(
      styles[!isWithoutHeader ? 'layout' : 'layout--without-header'],
      className
    )}
  >
    <WalletSignModal />
    <PayTariffModal />
    {!isWithoutHeader && (
      <div className={styles.layoutHeader}>
        <Header />
      </div>
    )}
    <div className={cn(contentClassName, styles.layoutContent)}>{children}</div>
    <div className={styles.layoutFooter}>
      <Footer />
    </div>
  </div>
);
