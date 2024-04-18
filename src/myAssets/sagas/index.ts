import { takeLatest } from 'typed-redux-saga';
import { manageSagaState } from 'common';
import { loadBalanceTrigger } from '../slices/walletSlice';
import { loadBalanceSaga } from './wallet';

export default function* assetsSaga() {
  yield* takeLatest(loadBalanceTrigger, manageSagaState(loadBalanceSaga));
}
