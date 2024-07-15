import { createAsyncThunk } from '@reduxjs/toolkit';
import { NavigateFunction } from 'react-router-dom';
import { toast } from 'react-toastify';
import { RootState } from 'application/store';
import { defaultChain } from 'application/thunks/initApplication';
import { RoutesEnum } from 'application/typings/routes';
import { setProfilesRoles } from 'profiles/slice/profilesSlice';
import { getNetworkApi } from '../../application/selectors';
import {
  clearApplicationStorage,
  setKeyToApplicationStorage
} from '../../application/utils/localStorageUtils';
import { clearAccountData, setWalletData } from '../slice/accountSlice';
import {
  GetChainResultType,
  LoginToWalletSagaInput
} from '../typings/accountTypings';

export const loginToWalletThunk = createAsyncThunk<
  void,
  LoginToWalletSagaInput
>(
  'account/loginToWallet',
  async ({ address }, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as RootState;
    const NetworkAPI = getNetworkApi(state);

    try {
      const subChain: GetChainResultType = await NetworkAPI?.getAddressChain(
        address!
      );

      if (subChain?.chain === defaultChain) {
        setKeyToApplicationStorage('address', address);

        dispatch(
          setWalletData({
            address: address!,
            logged: true
          })
        );
      } else {
        toast.error('Wrong address chain');
        return rejectWithValue('Wrong address chain');
      }
    } catch (e) {
      toast.error('Login error');
      return rejectWithValue('Login error');
    }
  }
);

export const resetAccountThunk = createAsyncThunk<void, NavigateFunction>(
  'account/resetAccount',
  async (navigate, { dispatch, rejectWithValue }) => {
    try {
      clearApplicationStorage();
      dispatch(clearAccountData());
      dispatch(setProfilesRoles([]));
      navigate(RoutesEnum.root);
    } catch (e) {
      toast.error('Reset account error. Try again in a few minutes.');
      return rejectWithValue('Reset account error');
    }
  }
);
