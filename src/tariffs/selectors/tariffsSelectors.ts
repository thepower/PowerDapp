import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../application/store';

const getTariffsState = (state: RootState) => state.tariffs;

export const getTariffLevel = createSelector(
  getTariffsState,
  (tariffs) => tariffs.tariffLevel
);

export const getUserTariffLevel = createSelector(
  getTariffsState,
  (tariffs) => tariffs.userTariffLevel
);

export const getBillData = createSelector(
  getTariffsState,
  (tariffs) => tariffs.billData
);
