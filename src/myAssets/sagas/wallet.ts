import { put, select } from 'typed-redux-saga';
import { getWalletApi } from '../../application/selectors';
import { getWalletAddress } from '../../account/selectors/accountSelectors';
import { LoadBalancePayloadType } from '../types';
import { setWalletBalanceData } from '../slices/walletSlice';

export function* loadBalanceSaga() {
  const WalletAPI = (yield* select(getWalletApi))!;

  const walletAddress = yield* select(getWalletAddress);

  const balance: LoadBalancePayloadType = yield WalletAPI.loadBalance(walletAddress!);

  yield* put(setWalletBalanceData(balance));
}
