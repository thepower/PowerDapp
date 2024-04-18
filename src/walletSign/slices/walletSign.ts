import { createSlice, PayloadAction } from '@reduxjs/toolkit';
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
  data: null,
};

const walletSignSlice = createSlice({
  name: 'walletSign',
  initialState,
  reducers: {
    setPopupData: (state, { payload }: PayloadAction<Maybe<PopupData>>) => {
      state.data = payload;
    },
  },
});

export const {
  actions: { setPopupData },
  reducer: walletSignReducer,
} = walletSignSlice;
