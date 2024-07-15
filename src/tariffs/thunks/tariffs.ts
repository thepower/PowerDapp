import { createAsyncThunk } from '@reduxjs/toolkit';
import { AddressApi } from '@thepowereco/tssdk';

import { encodeFunction } from '@thepowereco/tssdk/dist/helpers/abi.helper';
import { toast } from 'react-toastify';
import { createBill } from 'api/paygate';
import { signTxWithPopup } from 'api/popup';
import appEnvs from 'appEnvs';
import { getNetworkApi } from 'application/selectors';
import { RootState } from 'application/store';
import abis from 'contractAbis';
import i18n from 'locales/initLocales';
import { objectToString } from 'sso/utils';
import { setBillData, setUserTariffLevel } from 'tariffs/slice/tariffSlice';
import { UserLevelResponse } from 'tariffs/types';

export const loadTariffLevelThunk = createAsyncThunk(
  'tariffs/loadTariffLevel',
  async (walletAddress: string, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const networkApi = getNetworkApi(state);

      const { foundLevel, foundExpire, foundTokenId }: UserLevelResponse =
        await networkApi?.executeCall(
          AddressApi.textAddressToHex(abis.tariff.address),
          'user_level',
          [AddressApi.textAddressToEvmAddress(walletAddress)],
          abis.tariff.abi
        );

      return {
        foundLevel: Number(foundLevel),
        foundExpire: Number(foundExpire),
        foundTokenId: Number(foundTokenId)
      };
    } catch (error: any) {
      console.error(error);
      toast.error(i18n.t('errorLoadingTariffLevel'));
      return rejectWithValue(error.message);
    }
  }
);

export const loadUserTariffLevelThunk = createAsyncThunk(
  'tariffs/loadUserTariffLevel',
  async (walletAddress: string, { rejectWithValue, getState, dispatch }) => {
    try {
      const state = getState() as RootState;
      const networkApi = getNetworkApi(state);

      const { foundLevel, foundExpire, foundTokenId }: UserLevelResponse =
        await networkApi?.executeCall(
          AddressApi.textAddressToHex(abis.tariff.address),
          'user_level',
          [AddressApi.textAddressToEvmAddress(walletAddress)],
          abis.tariff.abi
        );

      dispatch(
        setUserTariffLevel({
          foundLevel: Number(foundLevel),
          foundExpire: Number(foundExpire),
          foundTokenId: Number(foundTokenId)
        })
      );
    } catch (error: any) {
      console.error(error);
      toast.error(i18n.t('errorLoadingUserTariffLevel'));
      return rejectWithValue(error.message);
    }
  }
);

export const activeFreeTariffThunk = createAsyncThunk(
  'tariffs/activeFreeTariff',
  async (walletAddress: string, { rejectWithValue, dispatch, getState }) => {
    try {
      const state = getState() as RootState;

      const networkApi = getNetworkApi(state);

      const userLevel: UserLevelResponse = await networkApi?.executeCall(
        AddressApi.textAddressToHex(abis.tariff.address),
        'user_level',
        [AddressApi.textAddressToEvmAddress(walletAddress)],
        abis.tariff.abi
      );

      if (userLevel?.foundTokenId !== 0n) return;

      const encodedFunction = encodeFunction(
        'mint',
        [AddressApi.textAddressToEvmAddress(walletAddress)],
        abis.tariff.abi
      );
      const encodedFunctionBuffer = Buffer.from(encodedFunction, 'hex');

      const body = {
        k: 16,
        to: Buffer.from(AddressApi.parseTextAddress(abis.tariff.address)),
        p: [],
        c: ['0x0', [encodedFunctionBuffer]]
      };

      const data = objectToString({
        sponsor: appEnvs.SPONSOR_CONTRACT_ADDRESS,
        returnUrl: window.location.href,
        body
      });

      const createProfileResponse = await signTxWithPopup({
        data,
        action: activeFreeTariffThunk.typePrefix,
        description: i18n.t('mintFreeTariffNFT')
      });

      if (!createProfileResponse.txId)
        throw new Error('!activeFreeTariff.txId');

      await dispatch(loadUserTariffLevelThunk(walletAddress));

      toast.info(i18n.t('tariffActivated'));
    } catch (error: any) {
      console.error(error);
      toast.error(i18n.t('errorActivatingFreeTariff'));
      return rejectWithValue(error.message);
    }
  }
);
export const payTariffThunk = createAsyncThunk(
  'tariffs/payTariff',
  async (
    { walletAddress, tariffId }: { walletAddress: string; tariffId: number },
    { rejectWithValue, dispatch, getState }
  ) => {
    const state = getState() as RootState;

    try {
      const networkApi = getNetworkApi(state);

      const userLevel: UserLevelResponse = await networkApi?.executeCall(
        AddressApi.textAddressToHex(abis.tariff.address),
        'user_level',
        [AddressApi.textAddressToEvmAddress(walletAddress)],
        abis.tariff.abi
      );

      if (userLevel?.foundLevel === BigInt(tariffId)) {
        toast.info(i18n.t('tariffAlreadyActivated'));
        return;
      }

      const tariffLevel =
        appEnvs.NODE_ENV !== 'production' && (tariffId === 1 || tariffId === 2)
          ? tariffId + 100
          : tariffId;

      const bill = await createBill({
        userId: Number(userLevel.foundTokenId),
        tariffLevel
      });

      dispatch(setBillData(bill));
    } catch (error: any) {
      console.error(error);
      toast.error(i18n.t('errorPayingTariff'));
      return rejectWithValue(error.message);
    }
  }
);
