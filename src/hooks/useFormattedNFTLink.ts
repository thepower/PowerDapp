import { useMemo } from 'react';
import slugify from 'slugify';
import { CreatedNFT } from 'NFTs/types';

export const getFormattedNFTLink = (
  NFT?: CreatedNFT,
  isDraft?: boolean,
  isShowSecondLink?: boolean
) => {
  if (NFT) {
    const sluggedTheme = slugify(NFT.theme);
    let id;
    if (isShowSecondLink) {
      if (isDraft) {
        id = NFT.publishedTokenId;
      } else {
        id = NFT.originTokenId;
      }
    } else {
      id = NFT.id;
    }
    const basePath = `/${NFT.walletAddress}/`;

    if (isShowSecondLink ? !isDraft : isDraft) {
      return {
        full: `${window.location.origin}${basePath}draft/${id}_${sluggedTheme}`,
        short: `${basePath}draft/${id}_${sluggedTheme}`
      };
    }

    return {
      full: `${window.location.origin}${basePath}${id}_${sluggedTheme}`,
      short: `${basePath}${id}_${sluggedTheme}`
    };
  }

  return { full: '', short: '' };
};

export function useFormattedNFTLink({
  NFT,
  isDraft,
  isShowSecondLink
}: {
  NFT?: CreatedNFT;
  isDraft?: boolean;
  isShowSecondLink?: boolean;
}) {
  const NFTLink = useMemo(
    () => getFormattedNFTLink(NFT, isDraft, isShowSecondLink),
    [NFT, isDraft, isShowSecondLink]
  );

  return NFTLink;
}
