import { RootState } from 'application/store';

export const getUiActions = (state: RootState) => state.network.actions;

export const checkIfLoading = (state: RootState, actionToCheck: string) =>
  state.network.actions.some((a) => actionToCheck === a.name);
