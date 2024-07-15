import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { IconButton, SelectChangeEvent, Skeleton } from '@mui/material';
import { range } from 'lodash';
import { useTranslation } from 'react-i18next';
import { ConnectedProps, connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getWalletAddress } from 'account/selectors/accountSelectors';
import { isMobile } from 'application/components/App';
import { daosForSelect } from 'application/constants';
import { RootState } from 'application/store';
import { RoutesEnum } from 'application/typings/routes';
import { SortIcon } from 'assets/icons';
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
import {
  getIsVerified,
  getIsModerator,
  getIsRegistered
} from 'profiles/selectors/rolesSelectors';
import styles from './NFTsPage.module.scss';
import { NFTCard } from '../../NFTCard/NFTCard';

const mapDispatchToProps = {
  loadNFTsThunk
};

const mapStateToProps = (state: RootState) => ({
  walletAddress: getWalletAddress(state),
  NFTs: getNFTs(state),
  NFTsCount: getNFTsCount(state),
  isGetNFTssLoading: checkIfLoading(state, loadNFTsThunk.typePrefix),
  isRegistered: getIsRegistered(state),
  isModerator: getIsModerator(state),
  isAuthor: getIsVerified(state)
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type NFTsPageComponentProps = ConnectedProps<typeof connector> & {
  isDraft?: boolean;
};

const NFTsPageComponent: React.FC<NFTsPageComponentProps> = ({
  NFTs,
  NFTsCount,
  isGetNFTssLoading,
  loadNFTsThunk,
  isDraft,
  isModerator,
  isAuthor,
  isRegistered,
  walletAddress
}) => {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isReversed, setIsReversed] = useState(false);
  const [moderationStatus, setModerationStatus] =
    useState<FilterModerationStatus>('all');
  const [NFTStatus, setNFTsStatus] = useState<FilterNFTStatus>('published');
  const [category, setCategory] = useState<FilterCategory>('all');
  const [nameOfDAO, setNameOfDAO] = useState<FilterNameOfDAO>('all');

  const isDraftBool = useMemo(() => NFTStatus === 'draft', [NFTStatus]);

  useEffect(() => {
    loadNFTsThunk({
      page,
      pageSize,
      isReversed,
      status: moderationStatus,
      category,
      nameOfDAOSlug: nameOfDAO,
      isDraft: isDraftBool
    });
  }, [
    page,
    pageSize,
    isReversed,
    moderationStatus,
    category,
    isDraft,
    nameOfDAO,
    isDraftBool
  ]);

  useEffect(() => {
    setPage(0);
  }, [moderationStatus, category]);

  useEffect(() => {
    if (isDraft) {
      setNFTsStatus('draft');
    } else {
      setNFTsStatus('published');
    }
  }, [isDraft]);

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

  const isLoading = isGetNFTssLoading;

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
    if (!NFTs.length) {
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
  }, [isLoading, NFTs, pageSize, isDraftBool, t]);

  const navigate = useNavigate();

  const onClickCreateNFT = useCallback(() => {
    if (isAuthor) {
      navigate(walletAddress ? RoutesEnum.add : RoutesEnum.login);
    } else {
      toast.warn(t('profileOnModeration'));
    }
  }, [isAuthor, walletAddress, t]);

  return (
    <Layout>
      <div className={styles.content}>
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
              {isModerator && (
                <Filter
                  label={t('NFTStatus')}
                  value={NFTStatus}
                  onChange={(_e, v) => setNFTsStatus(v as FilterNFTStatus)}
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
                label={t('DAO')}
                value={nameOfDAO}
                onChange={(_e, v) => setNameOfDAO(v as FilterNameOfDAO)}
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
          loading={isGetNFTssLoading}
          onPageChange={handleChangePage}
          handleChangePageSize={handleChangePageSize}
        />
      </div>
    </Layout>
  );
};

export default connector(NFTsPageComponent);
