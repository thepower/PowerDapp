import { createAsyncThunk } from '@reduxjs/toolkit';
import { NetworkApi, WalletApi } from '@thepowereco/tssdk';
import { setWalletData } from 'account/slice/accountSlice';
import { loginToWallet } from 'account/thunks/account';
import appEnvs from 'appEnvs';
import { RootState } from 'application/store';
import { getIsRegistered } from 'profiles/selectors/rolesSelectors';
import { loadProfileRoles } from 'profiles/thunks/roles';
import { loadUserTariffLevel } from 'tariffs/thunks/tariffs';
import { setDynamicApis, setNetworkChains } from '../slice/applicationSlice';
import { CURRENT_NETWORK } from '../utils/applicationUtils';
import { getKeyFromApplicationStorage } from '../utils/localStorageUtils';

export const defaultChain = appEnvs.CHAIN_ID;

export const reInitApis = createAsyncThunk<
  {
    walletApi: WalletApi;
    networkApi: NetworkApi;
  },
  number
>('application/reInitApis', async (payload, { dispatch }) => {
  const chainId = payload || defaultChain;
  const networkApi = new NetworkApi(chainId);
  await networkApi.bootstrap();

  const walletApi = new WalletApi(networkApi);

  dispatch(setDynamicApis({ networkApi, walletApi }));

  return { walletApi, networkApi };
});

export const initApplication = createAsyncThunk(
  'application/initApplication',
  async (_, { dispatch, getState }) => {
    const state = getState() as RootState;
    await dispatch(reInitApis(defaultChain));

    let address: string | null = '';

    const chains = await NetworkApi.getNetworkChains(CURRENT_NETWORK);
    dispatch(setNetworkChains(chains.sort()));

    address = await getKeyFromApplicationStorage('address');

    if (address) {
      await dispatch(
        loginToWallet({
          address
        })
      );

      dispatch(
        setWalletData({
          address,
          logged: true
        })
      );

      await dispatch(loadProfileRoles(address));
      await dispatch(loadUserTariffLevel(address));

      const isRegistered = getIsRegistered(state);

      if (isRegistered) {
        // dispatch(push(window.location.pathname));
      } else {
        // dispatch(push(RoutesEnum.editProfile));
      }
    }
  }
);
