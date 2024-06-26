import React, { useCallback, useEffect, useState } from 'react';

import {
  Button, Filter, Layout, Pagination,
} from 'common';
import { ConnectedProps, connect } from 'react-redux';
import { RootState } from 'application/store';

import { push } from 'connected-react-router';

import { useTranslation } from 'react-i18next';
import { getWalletAddress } from 'account/selectors/accountSelectors';
import {
  CubeIcon, SortIcon, UserIcon,
} from 'assets/icons';
import { checkIfLoading } from 'network/selectors';
import {
  getProfiles,
  getProfilesCount,
} from 'profiles/selectors/profilesSelectors';
import { range } from 'lodash';
import { IconButton, SelectChangeEvent, Skeleton } from '@mui/material';
import { isMobile } from 'react-device-detect';
import { UserRole } from 'profiles/constants';
import { Profile, ProfileFilterStatus } from 'profiles/types';
import { Link } from 'react-router-dom';
import cn from 'classnames';
import {
  loadProfilesTrigger,
  grantRoleTrigger,
  revokeRoleTrigger,
} from '../../../slice/profilesSlice';
import styles from './ProfilesPage.module.scss';

const mapDispatchToProps = {
  routeTo: push,
  loadProfilesTrigger,
  grantRoleTrigger,
  revokeRoleTrigger,
};

const mapStateToProps = (state: RootState) => ({
  profiles: getProfiles(state),
  profilesCount: getProfilesCount(state),
  walletAddress: getWalletAddress(state),
  isGetProfilesLoading: checkIfLoading(state, loadProfilesTrigger.type),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type ProfilesPageComponentProps = ConnectedProps<typeof connector>;

const ProfilesPageComponent: React.FC<ProfilesPageComponentProps> = ({
  profiles,
  profilesCount,
  loadProfilesTrigger,
  isGetProfilesLoading,
  grantRoleTrigger,
  revokeRoleTrigger,
}) => {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(6);
  const [isReversed, setIsReversed] = useState(true);
  const [status, setStatus] = useState<ProfileFilterStatus>('REGISTERED');

  useEffect(() => {
    loadProfilesTrigger({
      page,
      pageSize,
      isReversed,
      status,
    });
  }, [page, pageSize, isReversed, status]);

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setPage(newPage);
  };

  const handleChangePageSize = (
    event: SelectChangeEvent<unknown>,
    child: React.ReactNode,
  ) => {
    setPage(0);
    setPageSize(event.target.value as number);
  };

  const handleChangeStatus = (event: SelectChangeEvent<unknown>, v: string) => {
    setPage(0);
    setStatus(v as ProfileFilterStatus);
  };

  const handleClickSortButton = () => {
    setIsReversed(!isReversed);
  };

  const handleClickAcceptButton = (walletAddress: string) => {
    grantRoleTrigger({
      role: UserRole.VERIFIED_USER,
      walletAddress,
      additionalActionOnSuccess: () => {
        loadProfilesTrigger({
          page: 0,
          pageSize,
          isReversed,
          status,
        });
      },
    });
  };

  const handleRevokeVerifiedButton = (walletAddress: string) => {
    revokeRoleTrigger({
      role: UserRole.VERIFIED_USER,
      walletAddress,
      additionalActionOnSuccess: () => {
        loadProfilesTrigger({
          page: 0,
          pageSize,
          isReversed,
          status,
        });
      },
    });
  };

  const handleClickRejectButton = (walletAddress: string) => {
    grantRoleTrigger({
      role: UserRole.LOCKED_USER,
      walletAddress,
      additionalActionOnSuccess: () => {
        loadProfilesTrigger({
          page: 0,
          pageSize,
          isReversed,
          status,
        });
      },
    });
  };

  const handleClickUnlockButton = (walletAddress: string) => {
    revokeRoleTrigger({
      role: UserRole.LOCKED_USER,
      walletAddress,
      additionalActionOnSuccess: () => {
        loadProfilesTrigger({
          page: 0,
          pageSize,
          isReversed,
          status,
        });
      },
    });
  };

  const isLoading = isGetProfilesLoading || !profiles.length;

  const renderProfiles = useCallback(() => {
    const buttons = (profile: Profile) => {
      switch (status) {
        case 'all':
          return (
            null
          );
        case 'LOCKED':
          return (
            <Button
              size="small"
              onClick={() => handleClickUnlockButton(profile.walletAddress)}
              variant="contained"
            >
              {t('unlock')}
            </Button>
          );
        case 'VERIFIED':
          return (
            <Button
              size="small"
              onClick={() => handleRevokeVerifiedButton(profile.walletAddress)}
              variant="contained"
            >
              {t('revokeVerified')}
            </Button>
          );
        default:
          return (
            <>
              <Button
                size="small"
                onClick={() => handleClickAcceptButton(profile.walletAddress)}
                variant="contained"
              >
                {t('accept')}
              </Button>
              <Button
                size="small"
                onClick={() => handleClickRejectButton(profile.walletAddress)}
                variant="outlined"
              >
                {t('reject')}
              </Button>
            </>
          );
      }
    };
    if (isLoading) {
      return (
        <div className={styles.skeleton}>
          {range(0, pageSize).map((item) => (
            <Skeleton
              key={item}
              height={isMobile ? 80 : 40}
              sx={{
                transform: 'none',
                transformOrigin: 'unset',
                borderRadius: '5px',
              }}
            />
          ))}
        </div>
      );
    }

    return (
      <div className={styles.profiles}>
        {profiles.map((profile) => (
          <div key={profile.walletAddress} style={{ display: 'contents' }}>
            <Link
              to={`/${profile.walletAddress}`}
              className={cn(styles.item, styles.link)}
            >
              <UserIcon className={styles.itemIcon} />
              {`${profile.firstName} ${profile.lastName}`}
            </Link>
            <div className={styles.item}>
              <CubeIcon className={styles.itemIcon} />
              {profile?.walletAddress}
            </div>
            <div className={styles.buttons}>{buttons(profile)}</div>
          </div>
        ))}
      </div>
    );
  }, [
    isLoading,
    pageSize,
    profiles,
    status,
    t,
  ]);
  return (
    <Layout>
      <div className={styles.content}>
        <div className={styles.row}>
          <div className={styles.col}>
            <div className={styles.count}>
              {`${t('profiles')}: ${profilesCount || '-'}`}
            </div>
          </div>
          <div className={styles.col}>
            <div className={styles.colSet}>
              <IconButton
                disableRipple
                className={styles.controlBtn}
                onClick={handleClickSortButton}
              >
                <SortIcon
                  transform={isReversed ? 'scale(1, -1)' : 'scale(1, 1)'}
                />
                <span>
                  {isReversed ? t('firstNewOnes') : t('firstOldOnes')}
                </span>
              </IconButton>
              <Filter
                label={t('status')}
                value={status}
                onChange={handleChangeStatus}
                items={[
                  { label: t('displayAll'), value: 'all' },
                  { label: t('registered'), value: 'REGISTERED' },
                  { label: t('verified'), value: 'VERIFIED' },
                  { label: t('locked'), value: 'LOCKED' },
                ]}
              />
            </div>
          </div>
        </div>
        {renderProfiles()}
        <Pagination
          rowsPerPageOptions={[6, 12, 24, 48]}
          count={profilesCount || 0}
          pageSize={pageSize}
          page={page}
          loading={isGetProfilesLoading}
          onPageChange={handleChangePage}
          handleChangePageSize={handleChangePageSize}
        />
      </div>
    </Layout>
  );
};

export const ProfilesPage = connector(ProfilesPageComponent);
