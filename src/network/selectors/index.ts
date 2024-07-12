import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'application/store';

export const getUiActions = (state: RootState) => state.network.actions;

export const checkIfLoading = (state: RootState, ...actionsToCheck: string[]) =>
  state.network.actions.some((a) => actionsToCheck.includes(a.name));

export const checkIfLoadingItemById = createSelector(
  [
    getUiActions,
    (_: RootState, props: { id: string | number; actionToCheck: string }) =>
      props
  ],
  (actions, { actionToCheck, id }) =>
    actions.some((a) => a.name === actionToCheck && a.params?.id === id)
);

export const getUpdatingItemIds = createSelector(
  [getUiActions, (_: RootState, actionToCheck: string) => actionToCheck],
  (actions, actionToCheck) =>
    actions.reduce(
      (acc, action) => {
        if (
          action.name === actionToCheck &&
          (Number.isInteger(action.params?.id) ||
            typeof action.params?.id === 'string')
        ) {
          acc.push(action.params.id);
        }
        return acc;
      },
      [] as (number | string)[]
    )
);
