import { createSelector } from '@reduxjs/toolkit';
import { NFTsAdapter } from 'NFTs/slice/NFTsSlice';
import { RootState } from '../../application/store';

const getNFTsState = (state: RootState) => state.NFTs;

const { selectAll, selectById } = NFTsAdapter.getSelectors(
  (state: RootState) => state.NFTs.items
);

export const getNFTs = selectAll;

export const getNFTsCount = createSelector(
  getNFTsState,
  (NFTs) => NFTs.NFTsCount
);

export const getNFTById = selectById;

export const getNFT = createSelector(getNFTsState, (state) => state.NFT);
