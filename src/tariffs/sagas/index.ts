import { takeLatest } from 'typed-redux-saga';
import { manageSagaState } from 'common';
import { payTariffTrigger } from 'tariffs/slice/tariffSlice';
import { payTariffSaga } from './tariffs';

export default function* tariffsSaga() {
  yield* takeLatest(payTariffTrigger, manageSagaState(payTariffSaga));
}
