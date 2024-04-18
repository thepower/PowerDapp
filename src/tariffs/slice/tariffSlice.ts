import {
  createAction,
  createSlice, PayloadAction,
} from '@reduxjs/toolkit';
import { BillData, PayTariffPayload, UserLevel } from 'tariffs/types';
import { Maybe } from 'typings/common';

interface TariffsState {
  userTariffLevel: Maybe<UserLevel>;
  billData: Maybe<BillData>;
}

const initialState: TariffsState = {
  userTariffLevel: null,
  billData: null,
};

const tariffsSlice = createSlice({
  name: 'tariffs',
  initialState,
  reducers: {
    setUserTariffLevel: (state: TariffsState, { payload }: PayloadAction<UserLevel>) => {
      state.userTariffLevel = payload;
    },
    setBillData: (state: TariffsState, { payload }: PayloadAction<Maybe<BillData>>) => {
      state.billData = payload;
    },
  },
});

export const payTariffTrigger = createAction<PayTariffPayload>('payTariff');

export const {
  actions: {
    setUserTariffLevel, setBillData,
  },
  reducer: tariffsReducer,
} = tariffsSlice;
