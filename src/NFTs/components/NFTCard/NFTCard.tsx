import React, { memo } from 'react';
import { CategoryIcon, MarkerIcon, UserIcon } from 'assets/icons';
import { CreatedNFT } from 'NFTs/types';

import { Link } from 'react-router-dom';

import { getLoadDataUrl } from 'api/openResty';
import { daosForSelect } from 'application/constants';
import { RoutesEnum } from 'application/typings/routes';
import hooks from 'hooks';
import { useTranslation } from 'react-i18next';
import styles from './NFTCard.module.scss';

type NFTCardProps = {
  NFT: CreatedNFT;
  isDraft?: boolean;
  onClickCategory?: (category: string) => void;
};

const NFTCardComponent: React.FC<NFTCardProps> = memo(
  ({ NFT, isDraft, onClickCategory }) => {
    const { t } = useTranslation();

    const nameOfDAO =
      daosForSelect?.find(
        ({ value }) => value === NFT?.nameOfDAOSlug,
      )?.label || '-';
    const to = hooks.useFormattedNFTLink({ NFT, isDraft });

    const imgSrc = isDraft
      ? `${getLoadDataUrl(NFT.id.toString())}/${NFT.imageHash}`
      : `${getLoadDataUrl(NFT.originTokenId?.toString())}/${NFT.imageHash}`;
    return (
      <div className={styles.card}>
        <img
          className={styles.img}
          src={imgSrc}
          alt=""
        />
        <div className={styles.secondCol}>
          <Link to={to.short} className={styles.title} title={NFT.theme}>
            {NFT.theme}
          </Link>
          <div className={styles.description}>{NFT.description}</div>
          <div className={styles.colSet}>
            <div className={styles.col}>
              <UserIcon className={styles.colIcon} />
              <Link to={`/${NFT.walletAddress}`} className={styles.colText}>
                {`${NFT?.firstName} ${NFT?.lastName}`}
              </Link>
            </div>
            {
              <div className={styles.col}>
                <MarkerIcon className={styles.colIcon} />
                <Link
                  to={`${RoutesEnum.dao}/${NFT?.nameOfDAOSlug}`}
                  className={styles.colText}
                >
                  {nameOfDAO}
                </Link>
              </div>
            }
            <div className={styles.col}>
              <CategoryIcon className={styles.colIcon} />
              <div
                className={styles.colText}
                onClick={() => {
                  onClickCategory?.(NFT?.category);
                }}
              >
                {NFT?.category ? t(NFT.category) : NFT?.category}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

export const NFTCard = NFTCardComponent;
