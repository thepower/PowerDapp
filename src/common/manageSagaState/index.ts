import { PayloadAction } from '@reduxjs/toolkit';
import { put } from 'typed-redux-saga';
import { toast } from 'react-toastify';
import { startAction, stopAction } from 'network/slice';

export const manageSagaState = (saga: any) => (function* (action: PayloadAction<any>) {
  try {
    yield* put(startAction({ name: action.type, params: action.payload }));
    yield* saga(action);
  } catch (err: any) {
    if (err.networkError) {
      toast.error('Network error');
    } else {
      console.error(err);
    }
  } finally {
    yield* put(stopAction({ name: action.type, params: action.payload }));
  }
});
