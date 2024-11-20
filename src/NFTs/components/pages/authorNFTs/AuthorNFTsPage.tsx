import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlternateEmail } from '@mui/icons-material';
import { SelectChangeEvent, Skeleton, IconButton } from '@mui/material';
import { range } from 'lodash';
import { useTranslation } from 'react-i18next';
import { ConnectedProps, connect } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getWalletAddress } from 'account/selectors/accountSelectors';
import { getLoadDataUrl } from 'api/openResty';
import appEnvs from 'appEnvs';
import { isMobile } from 'application/components/App';
import { daosForSelect } from 'application/constants';
import { RootState } from 'application/store';
import { RoutesEnum } from 'application/typings/routes';
import { EditProfileIcon, UserIcon, WalletIcon, SortIcon } from 'assets/icons';
import { Layout, Pagination, Button, Filter } from 'common';

import { checkIfLoading } from 'network/selectors';
import { nftCategoriesForSelect } from 'NFTs/constants';
import { getNFTs, getNFTsCount } from 'NFTs/selectors/NFTsSelectors';
import { loadNFTsThunk } from 'NFTs/thunks/NFTs';
import {
  FilterModerationStatus,
  FilterCategory,
  FilterNameOfDAO,
  FilterNFTStatus
} from 'NFTs/types';
import { getProfile } from 'profiles/selectors/profilesSelectors';
import {
  getIsVerified,
  getIsModerator,
  getIsRegistered
} from 'profiles/selectors/rolesSelectors';
import styles from './AuthorNFTsPage.module.scss';
import { loadProfileThunk } from '../../../../profiles/thunks/profiles';
import { NFTCard } from '../../NFTCard/NFTCard';

const mapDispatchToProps = {
  loadProfileThunk,
  loadNFTsThunk
};

const mapStateToProps = (state: RootState) => ({
  walletAddress: getWalletAddress(state),
  NFTs: getNFTs(state),
  NFTsCount: getNFTsCount(state),
  isGetNFTsLoading: checkIfLoading(state, loadNFTsThunk.typePrefix),
  isProfileLoading: checkIfLoading(state, loadProfileThunk.typePrefix),
  profile: getProfile(state),
  isRegistered: getIsRegistered(state),
  isModerator: getIsModerator(state),
  isAuthor: getIsVerified(state)
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type AuthorNFTsPageComponentProps = ConnectedProps<typeof connector>;

const AuthorNFTsPageComponent: React.FC<AuthorNFTsPageComponentProps> = ({
  NFTs,
  NFTsCount,
  isGetNFTsLoading,
  loadNFTsThunk,
  walletAddress,
  profile,
  loadProfileThunk,
  isModerator,
  isProfileLoading,
  isAuthor,
  isRegistered
}) => {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isReversed, setIsReversed] = useState(false);
  const [moderationStatus, setModerationStatus] =
    useState<FilterModerationStatus>('all');
  const [NFTStatus, setNFTStatus] = useState<FilterNFTStatus>('published');
  const [category, setCategory] = useState<FilterCategory>('all');
  const [nameOfDAOSlug, setNameOfDAOSlug] = useState<FilterNameOfDAO>('all');
  const [isShowEmail, setIsShowEmail] = useState<boolean>(false);

  const isDraftBool = useMemo(() => NFTStatus === 'draft', [NFTStatus]);

  const navigate = useNavigate();

  const { walletAddress: walletAddressParam } = useParams<{
    walletAddress: string;
  }>();

  useEffect(() => {
    loadNFTsThunk({
      page,
      pageSize,
      isReversed,
      status: moderationStatus,
      category,
      nameOfDAOSlug,
      walletAddress: walletAddressParam,
      isDraft: isDraftBool
    });
  }, [
    page,
    pageSize,
    isReversed,
    moderationStatus,
    category,
    walletAddressParam,
    nameOfDAOSlug,
    isDraftBool
  ]);

  useEffect(() => {
    if (walletAddressParam) {
      loadProfileThunk({
        walletAddressOrId: walletAddressParam,
        isSetProfile: true
      });
    }
  }, [walletAddressParam]);

  useEffect(() => {
    setPage(0);
  }, [moderationStatus, category]);

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleChangePageSize = (event: SelectChangeEvent<unknown>) => {
    setPageSize(event.target.value as number);
    setPage(0);
  };

  const handleClickSortButton = () => {
    setIsReversed(!isReversed);
  };

  const isLoading = isGetNFTsLoading;

  const authorName = `${profile?.firstName} ${profile?.lastName}`;
  const profileImgUrl = `${getLoadDataUrl(
    appEnvs.OPEN_RESTY_PROFILE_BUCKET
  )}/${profile?.photoHash}`;

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
            margin: '50px 0 22px 0'
          }}
        />
      );
    }
    return (
      <div className={styles.profile}>
        <div className={styles.headCol}>
          <div className={styles.profileImageBlock}>
            <img className={styles.profileImg} src={profileImgUrl} alt='' />
          </div>
          {((walletAddress === profile?.walletAddress && isAuthor) ||
            isModerator) && (
            <IconButton
              onClick={() =>
                navigate(`${RoutesEnum.editProfile}/${walletAddressParam}`)
              }
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
    walletAddress,
    profile?.walletAddress,
    profile?.email,
    isAuthor,
    isModerator,
    walletAddressParam,
    authorName,
    isShowEmail
  ]);

  const onClickCategory = (value: string) => {
    setCategory(value);
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
                borderRadius: '5px'
              }}
            />
          ))}
        </div>
      );
    }
    if (!NFTs.length && walletAddress === profile?.walletAddress) {
      return <div className={styles.noNFTs}>{t('youDontHaveAnyNFTssYet')}</div>;
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
    t
  ]);

  const onClickCreateNFT = useCallback(() => {
    if (isAuthor) {
      navigate(walletAddress ? RoutesEnum.add : RoutesEnum.root);
    } else {
      toast.warn(t('profileOnModeration'));
    }
  }, [isAuthor, walletAddress, t]);

  return (
    <Layout>
      <div className={styles.content}>
        {renderProfile()}
        <div className={styles.row}>
          <div className={styles.col}>
            {isRegistered && (
              <Button
                variant='contained'
                size='small'
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
              {isModerator && (
                <Filter
                  label={t('moderationStatus')}
                  value={moderationStatus}
                  onChange={(_e, v) =>
                    setModerationStatus(v as FilterModerationStatus)
                  }
                  items={[
                    { label: t('displayAll'), value: 'all' },
                    { label: t('displayAccepted'), value: 'approved' },
                    { label: t('displayNotAccepted'), value: 'notApproved' },
                    { label: t('displayRejected'), value: 'rejected' }
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
                    { label: t('displayDraft'), value: 'draft' }
                  ]}
                />
              )}
              <Filter
                label={t('category')}
                value={category}
                onChange={(_e, v) => setCategory(v as FilterCategory)}
                items={[
                  { label: t('displayAll'), value: 'all' },
                  ...nftCategoriesForSelect(t)
                ]}
              />
              <Filter
                label={t('organization')}
                value={nameOfDAOSlug}
                onChange={(_e, v) => setNameOfDAOSlug(v as FilterNameOfDAO)}
                items={[
                  { label: t('displayAll'), value: 'all' },
                  ...daosForSelect
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

export default connector(AuthorNFTsPageComponent);
