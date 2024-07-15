import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from 'application/store';
import { getWalletAddress } from '../../account/selectors/accountSelectors';
import { getWalletApi } from '../../application/selectors';
import { setWalletBalanceData } from '../slices/walletSlice';

export const loadBalanceThunk = createAsyncThunk(
  'wallet/loadBalance',
  async (_, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as RootState;
    const WalletAPI = getWalletApi(state);
    const walletAddress = getWalletAddress(state);

    if (!WalletAPI || !walletAddress) {
      return rejectWithValue('Wallet API or address not found');
    }

    try {
      const balance = await WalletAPI.loadBalance(walletAddress);
      dispatch(setWalletBalanceData(balance));
    } catch (error) {
      console.error('loadBalance', error);
      return rejectWithValue('Failed to load balance');
    }
  }
);
