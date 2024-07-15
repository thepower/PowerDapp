import {
  ThunkMiddleware,
  isAsyncThunkAction,
  isFulfilled,
  isPending,
  isRejected
} from '@reduxjs/toolkit';
import { RootState } from 'application/store';
import { startAction, stopAction } from 'network/slice';

export const manageThunkStateMiddleware: ThunkMiddleware<RootState> =
  ({ dispatch }) =>
  (next) =>
  (action) => {
    if (isAsyncThunkAction(action)) {
      const name = action.type.split('/').slice(0, 2).join('/');
      if (isPending(action)) {
        dispatch(
          startAction({
            name,
            requestId: action.meta.requestId
          })
        );
      } else if (isFulfilled(action) || isRejected(action)) {
        dispatch(stopAction({ name, requestId: action.meta.requestId }));
      }
    }

    return next(action);
  };
