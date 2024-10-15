import { createAsyncThunk } from '@reduxjs/toolkit';
import { NetworkApi, WalletApi } from '@thepowereco/tssdk';
import { NavigateFunction } from 'react-router-dom';
import { setWalletData } from 'account/slice/accountSlice';
import { loginToWalletThunk } from 'account/thunks/account';
import appEnvs from 'appEnvs';
import { RoutesEnum } from 'application/typings/routes';
import { UserRole } from 'profiles/constants';
import { loadProfileRolesThunk } from 'profiles/thunks/roles';
import { setDynamicApis, setNetworkChains } from '../slice/applicationSlice';
import { CURRENT_NETWORK } from '../utils/applicationUtils';
import { getKeyFromApplicationStorage } from '../utils/localStorageUtils';

export const defaultChain = appEnvs.CHAIN_ID;

export const reInitApisThunk = createAsyncThunk<
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

export const initApplicationThunk = createAsyncThunk<void, NavigateFunction>(
  'application/initApplication',
  async (navigate, { dispatch }) => {
    await dispatch(reInitApisThunk(defaultChain));

    let address: string | null = '';

    const chains = await NetworkApi.getNetworkChains(CURRENT_NETWORK);

    dispatch(setNetworkChains(chains.sort()));

    address = await getKeyFromApplicationStorage('address');

    if (address) {
      await dispatch(
        loginToWalletThunk({
          address
        })
      );

      dispatch(
        setWalletData({
          address,
          logged: true
        })
      );

      const roles = await dispatch(loadProfileRolesThunk(address)).unwrap();

      const isRegistered = roles.includes(UserRole.REGISTERED);

      if (isRegistered) {
        navigate(window.location.pathname);
      } else {
        navigate(RoutesEnum.editProfile);
      }
    }
  }
);
