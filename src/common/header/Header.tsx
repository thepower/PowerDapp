import React from 'react';

import {
  Link, NavLink,
} from 'react-router-dom';

import { LangSelect } from 'common';
import { useTranslation } from 'react-i18next';
import { langsKeys } from 'locales/initLocales';
import { RoutesEnum } from 'application/typings/routes';
import { useAppSelector } from 'application/store';
import { getWalletAddress } from 'account/selectors/accountSelectors';
import { getIsVerified, getIsModerator } from 'profiles/selectors/rolesSelectors';
import styles from './Header.module.scss';
import { AccountDropdown } from './AccountDropdown';

export const Header = () => {
  const { i18n, t } = useTranslation();
  const walletAddress = useAppSelector(getWalletAddress);
  const isModerator = useAppSelector(getIsModerator);
  const isAuthor = useAppSelector(getIsVerified);

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.title}>Power DApp</Link>
      <div className={styles.navNFTs}>
        <NavLink
          className={styles.navLink}
          exact
          activeClassName={styles.navLinkActive}
          to={RoutesEnum.root}
        >
          {t('allNFTs')}
        </NavLink>
        {isModerator && <>
          <div className={styles.navNFTsSeparator}>/</div>
          <NavLink
            className={styles.navLink}
            exact
            activeClassName={styles.navLinkActive}
            to={`${RoutesEnum.draft}`}
          >
            {t('draft')}
          </NavLink>
        </>}
        {isAuthor && <>
          <div className={styles.navNFTsSeparator}>/</div>
          <NavLink
            className={styles.navLink}
            exact
            activeClassName={styles.navLinkActive}
            to={`/${walletAddress}`}
          >
            {t('myNFTs')}
          </NavLink>
        </>}
        {isModerator && <>
          <div className={styles.navNFTsSeparator}>/</div>
          <NavLink
            className={styles.navLink}
            exact
            activeClassName={styles.navLinkActive}
            to={RoutesEnum.authors}
          >
            {t('authors')}
          </NavLink>
        </>}
      </div>
      <div className={styles.col}>
        <LangSelect
          items={langsKeys}
          value={i18n.language}
          onChange={(props) => {
            i18n.changeLanguage((props.target.value as string));
          }}
        />
        <div className={styles.login}>
          <AccountDropdown />
        </div>
      </div>
    </header>
  );
};
