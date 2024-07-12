import React from 'react';

import { useTranslation } from 'react-i18next';
import { Link, NavLink } from 'react-router-dom';

import { getWalletAddress } from 'account/selectors/accountSelectors';
import { useAppSelector } from 'application/hooks';
import { RoutesEnum } from 'application/typings/routes';
import { LangSelect } from 'common';
import { langsKeys } from 'locales/initLocales';
import {
  getIsVerified,
  getIsModerator
} from 'profiles/selectors/rolesSelectors';
import { AccountDropdown } from './AccountDropdown';
import styles from './Header.module.scss';

export const Header = () => {
  const { i18n, t } = useTranslation();
  const walletAddress = useAppSelector(getWalletAddress);
  const isModerator = useAppSelector(getIsModerator);
  const isAuthor = useAppSelector(getIsVerified);

  return (
    <header className={styles.header}>
      <Link to='/' className={styles.title}>
        Power DApp
      </Link>
      <div className={styles.navNFTs}>
        <NavLink
          className={({ isActive }) =>
            isActive ? styles.navLinkActive : styles.navLink
          }
          to={RoutesEnum.root}
        >
          {t('allNFTs')}
        </NavLink>
        {isModerator && (
          <>
            <div className={styles.navNFTsSeparator}>/</div>
            <NavLink
              className={({ isActive }) =>
                isActive ? styles.navLinkActive : styles.navLink
              }
              to={`${RoutesEnum.draft}`}
            >
              {t('draft')}
            </NavLink>
          </>
        )}
        {isAuthor && (
          <>
            <div className={styles.navNFTsSeparator}>/</div>
            <NavLink
              className={({ isActive }) =>
                isActive ? styles.navLinkActive : styles.navLink
              }
              to={`/${walletAddress}`}
            >
              {t('myNFTs')}
            </NavLink>
          </>
        )}
        {isModerator && (
          <>
            <div className={styles.navNFTsSeparator}>/</div>
            <NavLink
              className={({ isActive }) =>
                isActive ? styles.navLinkActive : styles.navLink
              }
              to={RoutesEnum.authors}
            >
              {t('authors')}
            </NavLink>
          </>
        )}
      </div>
      <div className={styles.col}>
        <LangSelect
          items={langsKeys}
          value={i18n.language}
          onChange={(props) => {
            i18n.changeLanguage(props.target.value as string);
          }}
        />
        <div className={styles.login}>
          <AccountDropdown />
        </div>
      </div>
    </header>
  );
};
