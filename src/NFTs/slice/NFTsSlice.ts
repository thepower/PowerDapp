import {
  createEntityAdapter, createSlice, createAction, PayloadAction,
} from '@reduxjs/toolkit';
import {
  CreatedNFT, EditNFTPayload, LoadNFTsPayload, MintNftPayload, SaveNFTDataPayload,
} from 'NFTs/types';
import { AddActionOnSuccessAndErrorType } from 'typings/common';

export const NFTsAdapter = createEntityAdapter<CreatedNFT>({
  selectId: (NFT) => NFT.id,
});

interface NFTsState {
  items: ReturnType<typeof NFTsAdapter.getInitialState>;
  NFT?: CreatedNFT
  NFTsCount?: number;
}

const initialState: NFTsState = {
  items: NFTsAdapter.getInitialState(),
  NFT: undefined,
  NFTsCount: undefined,
};

const NFTsSlice = createSlice({
  name: 'NFTs',
  initialState,
  reducers: {
    setNFTs: (state: NFTsState, { payload }: PayloadAction<CreatedNFT[]>) => {
      NFTsAdapter.setAll(
        state.items,
        payload,
      );
    },
    setNFT: (state: NFTsState, { payload }: PayloadAction<CreatedNFT>) => {
      state.NFT = payload;
    },
    setNFTsCount: (state: NFTsState, { payload }: PayloadAction<number>) => {
      state.NFTsCount = payload;
    },
  },
});

export const mintNftTrigger = createAction<AddActionOnSuccessAndErrorType<MintNftPayload>>('mintNftNFT');
export const saveNFTDataTrigger = createAction<AddActionOnSuccessAndErrorType<SaveNFTDataPayload>>('saveNFTData');
export const editNFTTrigger = createAction<EditNFTPayload>('editNFT');
export const approveOrRejectNFTTrigger = createAction<{ id: number, isApproved: boolean }>('approveOrRejectNFT');
export const publishNFTTrigger = createAction<{ id: number }>('publishNFT');

export const loadNFTsTrigger = createAction<LoadNFTsPayload>('loadNFTs');
export const loadNFTTrigger = createAction<{ id: string; isDraft?: boolean; }>('loadNFT');

export const {
  actions: { setNFTs, setNFT, setNFTsCount },
  reducer: NFTsReducer,
} = NFTsSlice;
