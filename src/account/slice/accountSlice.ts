import { PayloadAction } from '@reduxjs/toolkit';
import { createAppSlice } from 'application/createAppSlice';
import { Maybe } from '../../typings/common';

export type WalletData = {
  address: string;
};

export interface AccountState {
  walletData: WalletData;
  chain: Maybe<number>;
  logged: boolean;
  openedMenu: boolean;
}

const SLICE_NAME = 'account';

const initialState: AccountState = {
  walletData: {
    address: ''
  },
  chain: null,
  logged: false,
  openedMenu: false
};

export const accountSlice = createAppSlice({
  name: SLICE_NAME,
  initialState,
  reducers: {
    setWalletData: (
      state: AccountState,
      action: PayloadAction<WalletData & { logged?: boolean }>
    ) => {
      state.walletData = {
        ...state.walletData,
        ...action.payload
      };
    },
    setLoggedToAccount: (
      state: AccountState,
      action: PayloadAction<boolean>
    ) => {
      state.logged = action.payload;
    },
    clearAccountData: () => initialState,
    toggleOpenedAccountMenu: (state: AccountState) => {
      state.openedMenu = !state.openedMenu;
    },
    closeAccountMenu: (state: AccountState) => {
      state.openedMenu = false;
    }
  }
});

export const {
  actions: {
    setWalletData,
    setLoggedToAccount,
    clearAccountData,
    toggleOpenedAccountMenu,
    closeAccountMenu
  }
} = accountSlice;
