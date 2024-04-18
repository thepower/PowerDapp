import { put, select } from 'typed-redux-saga';
import { toast } from 'react-toastify';
import { push } from 'connected-react-router';
import { RoutesEnum } from 'application/typings/routes';
import { defaultChain } from 'application/sagas/initApplicationSaga';
import { setProfilesRoles } from 'profiles/slice/profilesSlice';
import {
  clearAccountData,
  setWalletData,
} from '../slice/accountSlice';
import {
  GetChainResultType,
  LoginToWalletSagaInput,
} from '../typings/accountTypings';
import { clearApplicationStorage, setKeyToApplicationStorage } from '../../application/utils/localStorageUtils';
import { getNetworkApi } from '../../application/selectors';

export function* loginToWalletSaga({ payload }: { payload?: LoginToWalletSagaInput } = {}) {
  const { address } = payload!;
  const NetworkAPI = (yield* select(getNetworkApi))!;

  try {
    const subChain: GetChainResultType = yield NetworkAPI.getAddressChain(address!);

    if (subChain?.chain === defaultChain) {
      yield setKeyToApplicationStorage('address', address);

      yield* put(setWalletData({
        address: payload?.address!,
        logged: true,
      }));
    } else {
      toast.error('Wrong address chain');
    }
  } catch (e) {
    toast.error('Login error');
  }
}

export function* resetAccountSaga() {
  try {
    yield clearApplicationStorage();
    yield put(clearAccountData());
    yield put(setProfilesRoles([]));
    yield put(push(RoutesEnum.root));
  } catch (e) {
    toast.error('Reset account error. Try again in a few minutes.');
  }
}
