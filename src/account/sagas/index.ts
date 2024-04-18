import { takeLatest } from 'typed-redux-saga';
import { manageSagaState } from 'common';
import {
  loginToWallet,
  resetAccount,
} from '../slice/accountSlice';
import {
  loginToWalletSaga,
  resetAccountSaga,
} from './accountSaga';

export default function* () {
  yield* takeLatest(loginToWallet, manageSagaState(loginToWalletSaga));
  yield* takeLatest(resetAccount, manageSagaState(resetAccountSaga));
}
