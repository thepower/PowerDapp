import {
  Layout, Pagination, Filter,
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
import { useTranslation } from 'react-i18next';
import {
  FilterModerationStatus,
  FilterCategory,
  FilterNFTStatus,
} from 'NFTs/types';
import { RouteComponentProps } from 'react-router';
import { getLoadDataUrl } from 'api/openResty';
import {
  getIsModerator,
} from 'profiles/selectors/rolesSelectors';
import {
  nftCategoriesForSelect,
} from 'NFTs/constants';
import { daos } from 'application/constants';

import styles from './DAONFTsPage.module.scss';
import { NFTCard } from '../../NFTCard/NFTCard';

type OwnProps = RouteComponentProps<{
  daoSlug?: string;
}>;

const mapDispatchToProps = {
  loadNFTsTrigger,
};

const mapStateToProps = (state: RootState, props: OwnProps) => ({
  daoSlugParam: props?.match?.params?.daoSlug,
  NFTs: getNFTs(state),
  NFTsCount: getNFTsCount(state),
  isGetNFTsLoading: checkIfLoading(state, loadNFTsTrigger.type),
  isModerator: getIsModerator(state),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type DAONFTsPageComponentProps = ConnectedProps<typeof connector>;

const DAONFTsPageComponent: React.FC<DAONFTsPageComponentProps> = ({
  NFTs,
  NFTsCount,
  isGetNFTsLoading,
  loadNFTsTrigger,
  daoSlugParam,
  isModerator,
}) => {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isReversed] = useState(false);
  const [moderationStatus, setModerationStatus] =
    useState<FilterModerationStatus>('all');
  const [NFTStatus, setNFTStatus] =
    useState<FilterNFTStatus>('published');
  const [category, setCategory] = useState<FilterCategory>('all');

  const isDraftBool = useMemo(
    () => (NFTStatus === 'draft'),
    [NFTStatus],
  );

  useEffect(() => {
    if (daoSlugParam) {
      loadNFTsTrigger({
        page,
        pageSize,
        isReversed,
        status: moderationStatus,
        category,
        nameOfDAOSlug: daoSlugParam,
        isDraft: isDraftBool,
      });
    }
  }, [
    page,
    pageSize,
    isReversed,
    moderationStatus,
    category,
    loadNFTsTrigger,
    daoSlugParam,
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

  const isLoading = isGetNFTsLoading || !NFTs.length;

  const renderOrg = useCallback(() => {
    const org = daos?.find((org) => org.slug === daoSlugParam);
    const orgImgUrl = `${getLoadDataUrl('')}/${
      org?.img
    }`;

    return (
      <div className={styles.org}>
        <img className={styles.orgImg} src={orgImgUrl} alt="" />
        <div className={styles.orgCol}>
          <div className={styles.orgTitle}>{org?.name}</div>
          <div className={styles.orgDescription}>{org?.description}</div>
        </div>
      </div>
    );
  }, [daoSlugParam]);

  const renderHead = useCallback(() => renderOrg(), [renderOrg]);

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
    if (
      !NFTs.length
    ) {
      return (
        <div className={styles.noNFTs}>
          {t('youDontHaveAnyNFTsYet')}
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
  }, [isLoading, NFTs, pageSize, isDraftBool, t]);

  return (
    <Layout>
      <div className={styles.content}>
        {renderHead()}
        <div className={styles.row}>
          <div className={styles.col}>
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

export const DAONFTsPage = connector(DAONFTsPageComponent);
