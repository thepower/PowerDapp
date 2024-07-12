import { createEntityAdapter, PayloadAction } from '@reduxjs/toolkit';
import { createAppSlice } from 'application/createAppSlice';
import { CreatedNFT } from 'NFTs/types';

export const NFTsAdapter = createEntityAdapter<CreatedNFT>({});

interface NFTsState {
  items: ReturnType<typeof NFTsAdapter.getInitialState>;
  NFT?: CreatedNFT;
  NFTsCount?: number;
}

const initialState: NFTsState = {
  items: NFTsAdapter.getInitialState(),
  NFT: undefined,
  NFTsCount: undefined
};

export const NFTsSlice = createAppSlice({
  name: 'NFTs',
  initialState,
  reducers: {
    setNFTs: (state: NFTsState, { payload }: PayloadAction<CreatedNFT[]>) => {
      NFTsAdapter.setAll(state.items, payload);
    },
    setNFT: (state: NFTsState, { payload }: PayloadAction<CreatedNFT>) => {
      state.NFT = payload;
    },
    setNFTsCount: (state: NFTsState, { payload }: PayloadAction<number>) => {
      state.NFTsCount = payload;
    }
  }
});

export const {
  actions: { setNFTs, setNFT, setNFTsCount },
  reducer: NFTsReducer
} = NFTsSlice;
