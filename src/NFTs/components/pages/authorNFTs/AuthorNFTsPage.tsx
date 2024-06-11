import {
  Layout, Pagination, Button, Filter,
} from 'common';
import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';

import { RootState } from 'application/store';
import { ConnectedProps, connect } from 'react-redux';
import { loadNFTTrigger, loadNFTsTrigger } from 'NFTs/slice/NFTsSlice';
import { getNFTs, getNFTsCount } from 'NFTs/selectors/NFTsSelectors';
import { checkIfLoading } from 'network/selectors';
import { SelectChangeEvent, Skeleton, IconButton } from '@mui/material';
import { range } from 'lodash';
import { isMobile } from 'application/components/App';
import {
  EditProfileIcon, UserIcon, WalletIcon,
} from 'assets/icons';
import { RoutesEnum } from 'application/typings/routes';
import { useTranslation } from 'react-i18next';
import {
  FilterModerationStatus,
  FilterCategory,
  FilterNameOfDAO,
  FilterNFTStatus,
} from 'NFTs/types';
import { push } from 'connected-react-router';
import { RouteComponentProps } from 'react-router';
import { getLoadDataUrl } from 'api/openResty';
import { getProfile } from 'profiles/selectors/profilesSelectors';
import appEnvs from 'appEnvs';
import {
  getIsVerified,
  getIsModerator,
  getIsRegistered,
} from 'profiles/selectors/rolesSelectors';
import { getWalletAddress } from 'account/selectors/accountSelectors';
import { nftCategoriesForSelect, userTariffLevelMap } from 'NFTs/constants';
import { getTariffLevel } from 'tariffs/selectors/tariffsSelectors';
import { daosForSelect } from 'application/constants';
import { toast } from 'react-toastify';
import { AlternateEmail } from '@mui/icons-material';
import { loadTariffLevelTrigger } from 'tariffs/slice/tariffSlice';
import styles from './AuthorNFTsPage.module.scss';
import { NFTCard } from '../../NFTCard/NFTCard';
import { loadProfileTrigger } from '../../../../profiles/slice/profilesSlice';

type OwnProps = RouteComponentProps<{
  walletAddress?: string;
}>;

const mapDispatchToProps = {
  loadNFTsTrigger,
  routeTo: push,
  loadProfileTrigger,
  loadTariffLevelTrigger,
};

const mapStateToProps = (state: RootState, props: OwnProps) => ({
  walletAddressParam: props?.match?.params?.walletAddress,
  walletAddress: getWalletAddress(state),
  NFTs: getNFTs(state),
  NFTsCount: getNFTsCount(state),
  isGetNFTsLoading: checkIfLoading(state, loadNFTTrigger.type),
  isProfileLoading: checkIfLoading(state, loadProfileTrigger.type),
  profile: getProfile(state),
  isRegistered: getIsRegistered(state),
  isModerator: getIsModerator(state),
  isAuthor: getIsVerified(state),
  tariffLevel: getTariffLevel(state),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type AuthorNFTsPageComponentProps = ConnectedProps<typeof connector>;

const AuthorNFTsPageComponent: React.FC<AuthorNFTsPageComponentProps> = ({
  NFTs,
  NFTsCount,
  isGetNFTsLoading,
  loadNFTsTrigger,
  walletAddressParam,
  walletAddress,
  profile,
  loadProfileTrigger,
  loadTariffLevelTrigger,
  isModerator,
  isProfileLoading,
  isAuthor,
  tariffLevel,
  isRegistered,
  routeTo,
}) => {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isReversed] = useState(false);
  const [moderationStatus, setModerationStatus] =
    useState<FilterModerationStatus>('all');
  const [NFTStatus, setNFTStatus] = useState<FilterNFTStatus>('published');
  const [category, setCategory] = useState<FilterCategory>('all');
  const [nameOfDAOSlug, setNameOfDAOSlug] = useState<FilterNameOfDAO>('all');
  const [isShowEmail, setIsShowEmail] = useState<boolean>(false);

  const isDraftBool = useMemo(() => NFTStatus === 'draft', [NFTStatus]);

  useEffect(() => {
    loadNFTsTrigger({
      page,
      pageSize,
      isReversed,
      status: moderationStatus,
      category,
      nameOfDAOSlug,
      walletAddress: walletAddressParam,
      isDraft: isDraftBool,
    });
  }, [
    page,
    pageSize,
    isReversed,
    moderationStatus,
    category,
    walletAddressParam,
    nameOfDAOSlug,
    isDraftBool,
    loadNFTsTrigger,
  ]);

  useEffect(() => {
    if (walletAddressParam) {
      loadProfileTrigger(walletAddressParam);
      loadTariffLevelTrigger(walletAddressParam);
    }
  }, [loadProfileTrigger, loadTariffLevelTrigger, walletAddressParam]);

  useEffect(() => {
    setPage(0);
  }, [moderationStatus, category]);

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setPage(newPage);
  };

  const handleChangePageSize = (event: SelectChangeEvent<unknown>) => {
    setPageSize(event.target.value as number);
    setPage(0);
  };

  // const handleClickSortButton = () => {
  //   setIsReversed(!isReversed);
  // };

  const isLoading = isGetNFTsLoading || !NFTs.length;

  const authorName = `${profile?.firstName} ${profile?.lastName}`;
  const profileImgUrl = `${getLoadDataUrl(appEnvs.OPEN_RESTY_PROFILE_BUCKET)}/${
    profile?.photoHash
  }`;

  const renderProfile = useCallback(() => {
    const email = isShowEmail ? profile?.email : t('clickToShow');
    const emailClassName = isShowEmail
      ? styles.profileColText
      : styles.profileColText__email;
    if (isProfileLoading) {
      return (
        <Skeleton
          height={isMobile ? 285.33 : 380}
          sx={{
            transform: 'none',
            transformOrigin: 'unset',
            borderRadius: '5px',
            margin: '50px 0 22px 0',
          }}
        />
      );
    }
    return (
      <div className={styles.profile}>
        <div className={styles.headCol}>
          <div className={styles.profileImageBlock}>
            <img className={styles.profileImg} src={profileImgUrl} alt="" />
            <div className={styles.profileUserTariffLevel}>
              {t(userTariffLevelMap?.[tariffLevel?.foundLevel || 0])}
            </div>
          </div>
          {((walletAddress === profile?.walletAddress && isAuthor) ||
            isModerator) && (
            <IconButton
              href={`${RoutesEnum.editProfile}/${walletAddressParam}`}
              disableRipple
              className={styles.profileEditButton}
            >
              <EditProfileIcon />
              {t('editProfile')}
            </IconButton>
          )}
        </div>
        <div>
          <div className={styles.profileColSet}>
            <div className={styles.profileCol}>
              <UserIcon className={styles.profileColIcon} />
              <div className={styles.profileColText}>{authorName}</div>
            </div>
            <div className={styles.profileCol}>
              <WalletIcon className={styles.profileColIcon} />
              <div className={styles.profileColText}>
                {profile?.walletAddress}
              </div>
            </div>
            {profile?.email && (
              <div className={styles.profileCol}>
                <AlternateEmail
                  className={styles.profileColIcon}
                  sx={{ color: '#86868B' }}
                />
                <div
                  className={emailClassName}
                  onClick={() => setIsShowEmail(true)}
                >
                  {email}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }, [
    isProfileLoading,
    profileImgUrl,
    t,
    tariffLevel?.foundLevel,
    walletAddress,
    profile?.walletAddress,
    profile?.email,
    isAuthor,
    isModerator,
    walletAddressParam,
    authorName,
    isShowEmail,
  ]);

  const renderHead = useCallback(() => renderProfile(), [renderProfile]);

  const onClickCategory = (category: string) => {
    setCategory(category);
  };

  const renderCards = useCallback(() => {
    if (isLoading) {
      return (
        <div className={styles.skeleton}>
          {range(0, pageSize).map((item) => (
            <Skeleton
              key={item}
              height={isMobile ? 371.33 : 340}
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
    if (!NFTs.length && walletAddress === profile?.walletAddress) {
      return (
        <div className={styles.noNFTs}>{t('youDontHaveAnyNFTssYet')}</div>
      );
    }
    return (
      <div className={styles.NFTs}>
        {NFTs.map((NFT) => (
          <NFTCard
            key={NFT.id}
            NFT={NFT}
            isDraft={isDraftBool}
            onClickCategory={onClickCategory}
          />
        ))}
      </div>
    );
  }, [
    isLoading,
    NFTs,
    walletAddress,
    profile?.walletAddress,
    pageSize,
    isDraftBool,
    t,
  ]);

  const onClickCreateNFT = useCallback(() => {
    if (isAuthor) {
      routeTo(walletAddress ? RoutesEnum.add : RoutesEnum.login);
    } else {
      toast.warn(t('profileOnModeration'));
    }
  }, [isAuthor, routeTo, walletAddress, t]);

  return (
    <Layout>
      <div className={styles.content}>
        {renderHead()}
        <div className={styles.row}>
          <div className={styles.col}>
            {isRegistered && (
              <Button
                variant="contained"
                size="small"
                onClick={onClickCreateNFT}
              >
                {t('createNFT')}
              </Button>
            )}
            <div className={styles.count}>
              {`${t('NFTs')}: ${NFTsCount || '-'}`}
            </div>
          </div>
          <div className={styles.col}>
            <div className={styles.colSet}>
              {/* <IconButton
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
              </IconButton> */}
              {isModerator && (
                <Filter
                  label={t('moderationStatus')}
                  value={moderationStatus}
                  onChange={(_e, v) => setModerationStatus(v as FilterModerationStatus)}
                  items={[
                    { label: t('displayAll'), value: 'all' },
                    { label: t('displayAccepted'), value: 'approved' },
                    { label: t('displayNotAccepted'), value: 'notApproved' },
                    { label: t('displayRejected'), value: 'rejected' },
                  ]}
                />
              )}
              {(isModerator ||
                (isAuthor && walletAddress === profile?.walletAddress)) && (
                <Filter
                  label={t('NFTStatus')}
                  value={NFTStatus}
                  onChange={(_e, v) => setNFTStatus(v as FilterNFTStatus)}
                  items={[
                    { label: t('displayPublished'), value: 'published' },
                    { label: t('displayDraft'), value: 'draft' },
                  ]}
                />
              )}
              <Filter
                label={t('category')}
                value={category}
                onChange={(_e, v) => setCategory(v as FilterCategory)}
                items={[
                  { label: t('displayAll'), value: 'all' },
                  ...nftCategoriesForSelect(t),
                ]}
              />
              <Filter
                label={t('organization')}
                value={nameOfDAOSlug}
                onChange={(_e, v) => setNameOfDAOSlug(v as FilterNameOfDAO)}
                items={[
                  { label: t('displayAll'), value: 'all' },
                  ...daosForSelect,
                ]}
              />
            </div>
          </div>
        </div>
        {renderCards()}
        <Pagination
          rowsPerPageOptions={[10, 16, 24, 48]}
          count={NFTsCount || 0}
          pageSize={pageSize}
          page={page}
          loading={isGetNFTsLoading}
          onPageChange={handleChangePage}
          handleChangePageSize={handleChangePageSize}
        />
      </div>
    </Layout>
  );
};

export const AuthorNFTsPage = connector(AuthorNFTsPageComponent);
