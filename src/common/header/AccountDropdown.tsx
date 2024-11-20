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
import { setWalletData } from 'account/slice/accountSlice';
import { resetAccountThunk } from 'account/thunks/account';
import { getLoadDataUrl } from 'api/openResty';
import { authenticateWithPopup } from 'api/popup';
import appEnvs from 'appEnvs';
import { useAppSelector, useAppDispatch } from 'application/hooks';
import { defaultChain } from 'application/thunks/initApplication';
import { RoutesEnum } from 'application/typings/routes';
import { setKeyToApplicationStorage } from 'application/utils/localStorageUtils';
import { openPopupCenter } from 'application/utils/popup';
import { UserIcon, LogInIcon, CoinsStackedIcon } from 'assets/icons';

import { getWalletNativeTokensAmountByID } from 'myAssets/selectors/walletSelectors';
import { loadBalanceThunk } from 'myAssets/thunks/wallet';
import { getUserProfile } from 'profiles/selectors/profilesSelectors';
import { getIsVerified } from 'profiles/selectors/rolesSelectors';
import { loadUserProfileThunk } from 'profiles/thunks/profiles';
import { objectToString, stringToObject } from 'sso/utils';
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

  const onClickLogin = async () => {
    const stringData = objectToString({
      callbackUrl: `${window.location.origin}/`,
      returnUrl: window.location.href,
      chainID: defaultChain
    });
    openPopupCenter({
      height: 600,
      width: 357,
      title: 'Wallet',
      url: `${appEnvs.WALLET_THEPOWER_URL}${RoutesEnum.sso}/${stringData}`
    });
    const response = await authenticateWithPopup();
    const data = stringToObject(response);
    setKeyToApplicationStorage('address', data?.address);
    dispatch(setWalletData({ address: data?.address, logged: true }));

    if (data.returnUrl) {
      window.location.replace(data.returnUrl);
    } else {
      navigate(RoutesEnum.root);
    }
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
                  {userProfile?.firstName && userProfile?.lastName && (
                    <>
                      {userProfile?.firstName} {userProfile?.lastName}
                      <br />
                    </>
                  )}
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
