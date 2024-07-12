import { PayloadAction } from '@reduxjs/toolkit';
import { createAppSlice } from 'application/createAppSlice';
import { Maybe } from '../../typings/common';
import { LoadBalancePayloadType } from '../types';

type InitialState = {
  amounts: { [key: string]: string };
  initialLastBlock: Maybe<string>;
  lastblk: Maybe<string>;
  pubkey: Maybe<string>;
  preblk: Maybe<string>;
};

const initialState: InitialState = {
  amounts: {},
  initialLastBlock: null,
  lastblk: null,
  pubkey: null,
  preblk: null
};

export const walletSlice = createAppSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setWalletBalanceData: {
      reducer: (_state, { payload }: PayloadAction<InitialState>) => payload,
      prepare: ({ amount, ...otherData }: LoadBalancePayloadType) => ({
        payload: {
          ...otherData,
          initialLastBlock: otherData.lastblk,
          amounts: Object.entries(amount).reduce(
            (acc, [key, value]) =>
              Object.assign(acc, { [key]: value?.toFixed(2) || '0' }),
            {}
          )
        }
      })
    },
    setLastBlock: (state, { payload }: PayloadAction<string | null>) => {
      state.lastblk = payload;
    },
    setLastBlockToInitialLastBlock: (state) => {
      state.lastblk = state.initialLastBlock;
    }
  }
});

export const {
  actions: {
    setWalletBalanceData,
    setLastBlockToInitialLastBlock,
    setLastBlock
  }
} = walletSlice;
