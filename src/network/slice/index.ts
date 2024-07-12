import { PayloadAction } from '@reduxjs/toolkit';
import remove from 'lodash/remove';
import { createAppSlice } from 'application/createAppSlice';

export interface Action {
  name: string;
  requestId?: string;
}

export interface NetworkState {
  actions: Action[];
  loading: boolean;
}

const initialState: NetworkState = {
  actions: [],
  loading: false
};

export const networkSlice = createAppSlice({
  name: 'network',
  initialState,
  reducers: {
    startAction: (state, { payload }: PayloadAction<Action>) => {
      state.actions.push(payload);
    },
    stopAction: (
      state,
      { payload: { name, requestId } }: PayloadAction<Action>
    ) => {
      remove(state.actions, (a) =>
        requestId
          ? a.name === name && a.requestId === requestId
          : a.name === name
      );
    }
  }
});

export const {
  actions: { startAction, stopAction }
} = networkSlice;
