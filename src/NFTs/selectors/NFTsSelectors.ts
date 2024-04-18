import { createSelector } from '@reduxjs/toolkit';
import { NFTsAdapter } from 'NFTs/slice/NFTsSlice';
import { RootState } from '../../application/store';

const getNFTsState = (state: RootState) => state.NFTs;

const { selectAll, selectById } = NFTsAdapter.getSelectors((state: RootState) => state.NFTs.items);

export const getNFTs = createSelector(selectAll, (list) => list);

export const getNFTsCount = createSelector(
  getNFTsState,
  (NFTs) => NFTs.NFTsCount,
);

export const getNFTById = createSelector(selectById, (NFT) => NFT);

export const getNFT = createSelector(getNFTsState, (state) => state.NFT);
