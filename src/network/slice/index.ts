import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import isEqual from 'lodash/isEqual';
import remove from 'lodash/remove';

export interface Action {
  name: string;
  withParams?: boolean;
  params?: any;
}

export interface NetworkState {
  actions: Action[];
  loading: boolean;
}

const initialState: NetworkState = {
  actions: [],
  loading: false,
};

const networkSlice = createSlice({
  name: 'network',
  initialState,
  reducers: {
    startAction: (state, { payload }: PayloadAction<Action>) => {
      state.actions.push(payload);
    },
    stopAction: (
      state,
      { payload: { name, params, withParams = true } }: PayloadAction<Action>,
    ) => {
      remove(state.actions, (a) => (withParams && a?.params
        ? a.name === name && isEqual(a.params, params)
        : a.name === name));
    },
  },
});

export const {
  reducer: networkReducer,
  actions: { startAction, stopAction },
} = networkSlice;
