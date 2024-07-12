import { PayloadAction } from '@reduxjs/toolkit';
import { createAppSlice } from 'application/createAppSlice';
import { Maybe } from '../../typings/common';

type PopupData = {
  description?: string;
  requestUrlData: string;
  action: string;
};

type InitialState = {
  data: Maybe<PopupData>;
};

const initialState: InitialState = {
  data: null
};

export const walletSignSlice = createAppSlice({
  name: 'walletSign',
  initialState,
  reducers: {
    setPopupData: (state, { payload }: PayloadAction<Maybe<PopupData>>) => {
      state.data = payload;
    }
  }
});

export const {
  actions: { setPopupData }
} = walletSignSlice;
