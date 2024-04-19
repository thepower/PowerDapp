import { put, select } from 'typed-redux-saga';
import { push } from 'connected-react-router';
import { NetworkApi, WalletApi } from '@thepowereco/tssdk';
import { loginToWalletSaga } from 'account/sagas/accountSaga';
import { setWalletData } from 'account/slice/accountSlice';
import appEnvs from 'appEnvs';
import { getIsRegistered } from 'profiles/selectors/rolesSelectors';
import { RoutesEnum } from 'application/typings/routes';
import { loadProfileRoles } from 'profiles/sagas/roles';
import { loadUserTariffLevel } from 'tariffs/sagas/tariffs';
import { setDynamicApis, setNetworkChains } from '../slice/applicationSlice';
import { CURRENT_NETWORK } from '../utils/applicationUtils';
import { getKeyFromApplicationStorage } from '../utils/localStorageUtils';

export const defaultChain = appEnvs.CHAIN_ID;

export function* reInitApis({ payload }: { payload: number }) {
  const networkApi = new NetworkApi(payload || defaultChain);
  yield networkApi.bootstrap(true);

  const walletApi = new WalletApi(networkApi);

  yield* put(setDynamicApis({ networkApi, walletApi }));

  return { walletApi, networkApi };
}

export function* initApplicationSaga() {
  yield* reInitApis({ payload: defaultChain });
  let address = '';

  const chains: number[] = yield NetworkApi.getNetworkChains(CURRENT_NETWORK);
  yield put(setNetworkChains(chains.sort()));

  address = yield getKeyFromApplicationStorage('address');

  if (address) {
    yield loginToWalletSaga({
      payload: {
        address,
      },
    });

    yield* put(setWalletData({
      address,
      logged: true,
    }));

    yield loadProfileRoles(address);
    yield loadUserTariffLevel({ walletAddress: address });

    const isRegistered = yield* select(getIsRegistered);

    if (isRegistered) {
      yield* put(push(window.location.pathname));
    } else {
      yield* put(push(RoutesEnum.editProfile));
    }
  }
}
