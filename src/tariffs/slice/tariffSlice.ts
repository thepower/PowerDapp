import { PayloadAction } from '@reduxjs/toolkit';
import { createAppSlice } from 'application/createAppSlice';
import { BillData, UserLevel } from 'tariffs/types';
import { Maybe } from 'typings/common';

interface TariffsState {
  tariffLevel: Maybe<UserLevel>;
  userTariffLevel: Maybe<UserLevel>;
  billData: Maybe<BillData>;
}

const initialState: TariffsState = {
  tariffLevel: null,
  userTariffLevel: null,
  billData: null
};

export const tariffsSlice = createAppSlice({
  name: 'tariffs',
  initialState,
  reducers: {
    setTariffLevel: (
      state: TariffsState,
      { payload }: PayloadAction<UserLevel>
    ) => {
      state.tariffLevel = payload;
    },
    setUserTariffLevel: (
      state: TariffsState,
      { payload }: PayloadAction<UserLevel>
    ) => {
      state.userTariffLevel = payload;
    },
    setBillData: (
      state: TariffsState,
      { payload }: PayloadAction<Maybe<BillData>>
    ) => {
      state.billData = payload;
    }
  }
});

export const {
  actions: { setTariffLevel, setUserTariffLevel, setBillData }
} = tariffsSlice;
