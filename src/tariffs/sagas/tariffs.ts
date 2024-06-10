import appEnvs from 'appEnvs';
import {
  AddressApi,
} from '@thepowereco/tssdk';

import {
  objectToString,
} from 'sso/utils';
import abis from 'contractAbis';
import { toast } from 'react-toastify';

import { encodeFunction } from '@thepowereco/tssdk/dist/helpers/abi.helper';
import { signTxWithPopup } from 'api/popup';
import { getNetworkApi } from 'application/selectors';
import { put, select } from 'typed-redux-saga';
import i18n from 'locales/initLocales';
import { UserLevelResponse } from 'tariffs/types';
import { payTariffTrigger, setBillData, setUserTariffLevel } from 'tariffs/slice/tariffSlice';
import { createBill } from 'api/paygate';
import { grantRoleTrigger } from 'profiles/slice/profilesSlice';

export function* loadUserTariffLevel({ walletAddress }: { walletAddress: string }) {
  try {
    const networkApi = (yield* select(getNetworkApi))!;

    const { foundLevel, foundExpire, foundTokenId }: UserLevelResponse = yield networkApi.executeCall(
      AddressApi.textAddressToHex(abis.tariff.address),
      'user_level',
      [AddressApi.textAddressToEvmAddress(walletAddress)],
      abis.tariff.abi,
    );

    yield put(setUserTariffLevel({
      foundLevel: Number(foundLevel),
      foundExpire: Number(foundExpire),
      foundTokenId: Number(foundTokenId),
    }));
  } catch (error: any) {
    console.error(error);
    toast.error(error);
  }
}

export function* activeFreeTariff({ walletAddress }: { walletAddress: string }) {
  try {
    const networkApi = (yield* select(getNetworkApi))!;

    const userLevel : UserLevelResponse = yield networkApi.executeCall(
      AddressApi.textAddressToHex(abis.tariff.address),
      'user_level',
      [AddressApi.textAddressToEvmAddress(walletAddress)],
      abis.tariff.abi,
    );

    if (userLevel?.foundTokenId !== 0n) return;

    const encodedFunction = encodeFunction('mint', [AddressApi.textAddressToEvmAddress(walletAddress)], abis.tariff.abi);
    const encodedFunctionBuffer = Buffer.from(encodedFunction, 'hex');

    const body = {
      k: 16,
      to: Buffer.from(AddressApi.parseTextAddress(abis.tariff.address)),
      p: [],
      c: ['0x0', [encodedFunctionBuffer]],
    };

    const data = objectToString({
      sponsor: appEnvs.SPONSOR_CONTRACT_ADDRESS,
      returnUrl: window.location.href,
      body,
    });

    const createProfileResponse = yield* signTxWithPopup({ data, action: grantRoleTrigger.type, description: i18n.t('mintFreeTariffNFT') });

    if (!createProfileResponse.txId) throw new Error('!activeFreeTariff.txId');

    yield loadUserTariffLevel({ walletAddress });

    toast.info(i18n.t('tariffActivated'));
  } catch (error: any) {
    console.error(error);
    toast.error(error);
  }
}

export function* payTariffSaga({ payload: { walletAddress, tariffId } }: ReturnType<typeof payTariffTrigger>) {
  try {
    let tariffLevel;
    const networkApi = (yield* select(getNetworkApi))!;

    const userLevel : UserLevelResponse = yield networkApi.executeCall(
      AddressApi.textAddressToHex(abis.tariff.address),
      'user_level',
      [AddressApi.textAddressToEvmAddress(walletAddress)],
      abis.tariff.abi,
    );

    if (userLevel?.foundLevel === BigInt(tariffId)) {
      toast.info(i18n.t('tariffAlreadyActivated'));
      return;
    }

    if (appEnvs.NODE_ENV !== 'production') {
      if (tariffId === 1) {
        tariffLevel = 101;
      } else if (tariffId === 2) {
        tariffLevel = 102;
      } else {
        tariffLevel = tariffId;
      }
    } else {
      tariffLevel = tariffId;
    }

    const bill = yield* createBill({ userId: Number(userLevel.foundTokenId), tariffLevel });

    yield put(setBillData(bill));
  } catch (error: any) {
    console.error(error);
    toast.error(error);
  }
}
