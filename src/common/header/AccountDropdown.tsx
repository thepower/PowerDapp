import React, { useEffect } from 'react';
import {
  IconButton, Popover, List, ListItem, ListItemIcon, ListItemButton,
} from '@mui/material';
import {
  UserIcon, LogInIcon, CoinsStackedIcon,
} from 'assets/icons';

import cn from 'classnames';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from 'application/store';
import { getWalletAddress } from 'account/selectors/accountSelectors';
import { RoutesEnum } from 'application/typings/routes';
import { resetAccount } from 'account/slice/accountSlice';
import { push } from 'connected-react-router';
import { loadBalanceTrigger } from 'myAssets/slices/walletSlice';
import appEnvs from 'appEnvs';
import { getWalletNativeTokensAmountByID } from 'myAssets/selectors/walletSelectors';
import { getIsVerified } from 'profiles/selectors/rolesSelectors';
import { getLoadDataUrl } from 'api/openResty';
import { getProfile } from 'profiles/selectors/profilesSelectors';
import { loadProfileTrigger } from 'profiles/slice/profilesSlice';
import styles from './AccountDropdown.module.scss';

type AccountDropdownProps = {
  className?: string;
};

export const AccountDropdown: React.FC<AccountDropdownProps> = ({ className }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const walletAddress = useAppSelector(getWalletAddress);
  const isAuthor = useAppSelector(getIsVerified);
  const profile = useAppSelector(getProfile);
  const SKAmount = useAppSelector((state) => getWalletNativeTokensAmountByID(state, 'SK'));

  const [dropdown, setDropdown] = React.useState<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (walletAddress) {
      dispatch(loadProfileTrigger(walletAddress));
    }
  }, [loadProfileTrigger, walletAddress]);

  useEffect(() => {
    if (walletAddress) dispatch(loadBalanceTrigger());
  }, [walletAddress]);

  const open = Boolean(dropdown);
  const id = open ? 'account-dropdown-popover' : undefined;
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setDropdown(event.currentTarget);
  };

  const handleClose = () => {
    setDropdown(null);
  };

  const onClickLogin = () => {
    dispatch(push(RoutesEnum.login));
  };

  const onClickPowerLogOut = () => {
    dispatch(resetAccount());
    handleClose();
  };

  const profileImgUrl = `${getLoadDataUrl(appEnvs.OPEN_RESTY_PROFILE_BUCKET)}/${
    profile?.photoHash
  }`;

  return (
    <div className={className}>
      {walletAddress ? (
        <IconButton
          disableRipple
          aria-describedby={id}
          className={cn(styles.accountDropdown, open && styles.accountDropdownActive)}
          onClick={handleClick}
          size="large"
        >
          <UserIcon />
        </IconButton>
      ) : (
        <IconButton className={styles.accountDropdown} onClick={onClickLogin} disableRipple size="large">
          <LogInIcon />
        </IconButton>
      )}
      <Popover
        id={id}
        open={open}
        anchorEl={dropdown}
        onClose={handleClose}
        classes={{ paper: styles.popoverPaper, root: styles.popoverRoot }}
        marginThreshold={10}
        disableScrollLock
        anchorOrigin={{
          vertical: 64,
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <List>
          {profile && <ListItem disablePadding>
            <ListItemButton disableRipple className={styles.listButton} target="_blank" href={appEnvs.WALLET_THEPOWER_URL}>
              <ListItemIcon className={styles.listIcon}>
                <img src={profileImgUrl} alt="profileImg" className={styles.profileImg} />
              </ListItemIcon>
              <div className={styles.profileInfo}>
                {`${profile?.firstName} ${profile?.lastName}`}
                <br />
                <span>{walletAddress}</span>
              </div>
            </ListItemButton>
          </ListItem>}
          {walletAddress && <ListItem disablePadding>
            <ListItemButton disableRipple className={styles.listButton} target="_blank" href={appEnvs.WALLET_THEPOWER_URL}>
              <ListItemIcon className={styles.listIcon}>
                <CoinsStackedIcon />
              </ListItemIcon>
              {SKAmount || 0}
              {' '}
              SK
            </ListItemButton>
          </ListItem>}
          {(walletAddress && isAuthor) && <ListItem disablePadding>
            <ListItemButton className={styles.listButton} href={`${RoutesEnum.root}${walletAddress}`}>
              <ListItemIcon className={styles.listIcon}>
                <UserIcon />
              </ListItemIcon>
              {t('profile')}
            </ListItemButton>
          </ListItem>}
          {(walletAddress && isAuthor) && <ListItem disablePadding>
            <ListItemButton className={styles.listButton} href={RoutesEnum.editProfile}>
              <ListItemIcon className={styles.listIcon}>
                <UserIcon />
              </ListItemIcon>
              {t('editProfile')}
            </ListItemButton>
          </ListItem>}
          <ListItem disablePadding onClick={onClickPowerLogOut}>
            <ListItemButton className={styles.secondaryListButton}>
              <ListItemIcon className={styles.secondaryListIcon}>
                <LogInIcon />
              </ListItemIcon>
              {t('logOutOfYourAccount')}
            </ListItemButton>
          </ListItem>
        </List>
      </Popover>
    </div>
  );
};
