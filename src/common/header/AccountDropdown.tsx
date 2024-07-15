import React, { useEffect } from 'react';
import {
  IconButton,
  Popover,
  List,
  ListItem,
  ListItemIcon,
  ListItemButton
} from '@mui/material';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getWalletAddress } from 'account/selectors/accountSelectors';
import { resetAccountThunk } from 'account/thunks/account';
import { getLoadDataUrl } from 'api/openResty';
import appEnvs from 'appEnvs';
import { useAppSelector, useAppDispatch } from 'application/hooks';
import { RoutesEnum } from 'application/typings/routes';
import { UserIcon, LogInIcon, CoinsStackedIcon } from 'assets/icons';

import { getWalletNativeTokensAmountByID } from 'myAssets/selectors/walletSelectors';
import { loadBalanceThunk } from 'myAssets/thunks/wallet';
import { getUserProfile } from 'profiles/selectors/profilesSelectors';
import { getIsVerified } from 'profiles/selectors/rolesSelectors';
import { loadUserProfileThunk } from 'profiles/thunks/profiles';
import styles from './AccountDropdown.module.scss';

type AccountDropdownProps = {
  className?: string;
};

export const AccountDropdown: React.FC<AccountDropdownProps> = ({
  className
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const walletAddress = useAppSelector(getWalletAddress);
  const isAuthor = useAppSelector(getIsVerified);
  const userProfile = useAppSelector(getUserProfile);
  const SKAmount = useAppSelector((state) =>
    getWalletNativeTokensAmountByID(state, 'SK')
  );

  const [dropdown, setDropdown] = React.useState<HTMLButtonElement | null>(
    null
  );

  useEffect(() => {
    if (walletAddress) {
      dispatch(loadUserProfileThunk(walletAddress));
    }
  }, [loadUserProfileThunk, walletAddress]);

  useEffect(() => {
    if (walletAddress) dispatch(loadBalanceThunk());
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
    navigate(RoutesEnum.login);
  };

  const onClickPowerLogOut = () => {
    dispatch(resetAccountThunk(navigate));
    handleClose();
  };

  const profileImgUrl = `${getLoadDataUrl(
    appEnvs.OPEN_RESTY_PROFILE_BUCKET
  )}/${userProfile?.photoHash}`;
  return (
    <div className={className}>
      {walletAddress ? (
        <IconButton
          disableRipple
          aria-describedby={id}
          className={cn(
            styles.accountDropdown,
            open && styles.accountDropdownActive
          )}
          onClick={handleClick}
          size='large'
        >
          <UserIcon />
        </IconButton>
      ) : (
        <IconButton
          className={styles.accountDropdown}
          onClick={onClickLogin}
          disableRipple
          size='large'
        >
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
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        <List>
          {userProfile && userProfile?.firstName && userProfile?.lastName && (
            <ListItem disablePadding>
              <ListItemButton
                disableRipple
                className={styles.listButton}
                target='_blank'
                href={appEnvs.WALLET_THEPOWER_URL}
              >
                {userProfile?.photoHash && (
                  <ListItemIcon className={styles.listIcon}>
                    <img
                      src={profileImgUrl}
                      alt='profileImg'
                      className={styles.profileImg}
                    />
                  </ListItemIcon>
                )}
                <div className={styles.profileInfo}>
                  {`${userProfile?.firstName} ${userProfile?.lastName}`}
                  <br />
                  <span>{walletAddress}</span>
                </div>
              </ListItemButton>
            </ListItem>
          )}
          {walletAddress && (
            <ListItem disablePadding>
              <ListItemButton
                target='_blank'
                href={appEnvs.WALLET_THEPOWER_URL}
                disableRipple
                className={styles.listButton}
              >
                <ListItemIcon className={styles.listIcon}>
                  <CoinsStackedIcon />
                </ListItemIcon>
                {SKAmount || 0} SK
              </ListItemButton>
            </ListItem>
          )}
          {walletAddress && isAuthor && (
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => navigate(`${RoutesEnum.root}${walletAddress}`)}
                className={styles.listButton}
              >
                <ListItemIcon className={styles.listIcon}>
                  <UserIcon />
                </ListItemIcon>
                {t('profile')}
              </ListItemButton>
            </ListItem>
          )}
          {walletAddress && isAuthor && (
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => navigate(RoutesEnum.editProfile)}
                disableRipple
                className={styles.listButton}
              >
                <ListItemIcon className={styles.listIcon}>
                  <UserIcon />
                </ListItemIcon>
                {t('editProfile')}
              </ListItemButton>
            </ListItem>
          )}
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
