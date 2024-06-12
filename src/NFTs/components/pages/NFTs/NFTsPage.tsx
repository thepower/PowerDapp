import {
  Layout, Pagination, Button, Filter,
} from 'common';
import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';

import { RootState } from 'application/store';
import { ConnectedProps, connect } from 'react-redux';
import { loadNFTsTrigger } from 'NFTs/slice/NFTsSlice';
import {
  getNFTs,
  getNFTsCount,
} from 'NFTs/selectors/NFTsSelectors';
import { checkIfLoading } from 'network/selectors';
import { SelectChangeEvent, Skeleton } from '@mui/material';
import { range } from 'lodash';
import { isMobile } from 'application/components/App';
// import {
//   SortIcon,
// } from 'assets/icons';
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
import {
  getIsVerified,
  getIsModerator,
  getIsRegistered,
} from 'profiles/selectors/rolesSelectors';
import { getWalletAddress } from 'account/selectors/accountSelectors';
import {
  nftCategoriesForSelect,
} from 'NFTs/constants';
import { daosForSelect } from 'application/constants';
import { toast } from 'react-toastify';
import styles from './NFTsPage.module.scss';
import { NFTCard } from '../../NFTCard/NFTCard';

type OwnProps = RouteComponentProps<{
  walletAddress?: string;
  daoSlug?: string;
}>;

const mapDispatchToProps = {
  loadNFTsTrigger,
  routeTo: push,
};

const mapStateToProps = (state: RootState, props: OwnProps) => ({
  walletAddress: getWalletAddress(state),
  NFTs: getNFTs(state),
  NFTsCount: getNFTsCount(state),
  isGetNFTssLoading: checkIfLoading(state, loadNFTsTrigger.type),
  isRegistered: getIsRegistered(state),
  isModerator: getIsModerator(state),
  isAuthor: getIsVerified(state),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type NFTsPageComponentProps = ConnectedProps<typeof connector> & {
  isDraft?: boolean;
};

const NFTsPageComponent: React.FC<NFTsPageComponentProps> = ({
  NFTs,
  NFTsCount,
  isGetNFTssLoading,
  loadNFTsTrigger,
  walletAddress,
  isDraft,
  isModerator,
  isAuthor,
  isRegistered,
  routeTo,
}) => {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isReversed] = useState(false);
  const [moderationStatus, setModerationStatus] =
    useState<FilterModerationStatus>('all');
  const [NFTStatus, setNFTsStatus] =
    useState<FilterNFTStatus>('published');
  const [category, setCategory] = useState<FilterCategory>('all');
  const [nameOfDAO, setNameOfDAO] =
    useState<FilterNameOfDAO>('all');

  const isDraftBool = useMemo(
    () => (NFTStatus === 'draft'),
    [NFTStatus],
  );

  useEffect(() => {
    loadNFTsTrigger({
      page,
      pageSize,
      isReversed,
      status: moderationStatus,
      category,
      nameOfDAOSlug: nameOfDAO,
      isDraft: isDraftBool,
    });
  }, [
    page,
    pageSize,
    isReversed,
    moderationStatus,
    category,
    isDraft,
    loadNFTsTrigger,
    nameOfDAO,
    isDraftBool,
  ]);

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

  const isLoading = isGetNFTssLoading || !NFTs.length;

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
    if (!NFTs.length) {
      return (
        <div className={styles.noNFTs}>
          {t('youDontHaveAnyNFTssYet')}
        </div>
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
              {isModerator && (
                <Filter
                  label={t('NFTStatus')}
                  value={NFTStatus}
                  onChange={(_e, v) => setNFTsStatus(v as FilterNFTStatus)}
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
                label={t('DAO')}
                value={nameOfDAO}
                onChange={(_e, v) => setNameOfDAO(v as FilterNameOfDAO)}
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
          loading={isGetNFTssLoading}
          onPageChange={handleChangePage}
          handleChangePageSize={handleChangePageSize}
        />
      </div>
    </Layout>
  );
};

export const NFTsPage = connector(NFTsPageComponent);
