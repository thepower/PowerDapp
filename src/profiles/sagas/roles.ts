import { AddressApi } from '@thepowereco/tssdk';
import { encodeFunction } from '@thepowereco/tssdk/dist/helpers/abi.helper';
import { signTxWithPopup } from 'api/popup';
import appEnvs from 'appEnvs';
import { grantRoleTrigger, revokeRoleTrigger, setProfilesRoles } from 'profiles/slice/profilesSlice';
import { objectToString } from 'sso/utils';
import abis from 'contractAbis';
import { toast } from 'react-toastify';
import { UserRole } from 'profiles/constants';
import { put, select } from 'typed-redux-saga';
import { getNetworkApi } from 'application/selectors';
import i18n from 'locales/initLocales';
import {
  hexToBytes,
} from 'viem';
import { UserLevelResponse } from 'tariffs/types';
import { getWalletAddress } from 'account/selectors/accountSelectors';

export function* grantRoleSaga({
  payload: {
    role,
    walletAddress,
    additionalActionOnSuccess,
  },
}: ReturnType<typeof grantRoleTrigger>) {
  try {
    const networkApi = (yield* select(getNetworkApi))!;
    const myWalletAddress = yield* select(getWalletAddress);

    const userLevel : UserLevelResponse = yield networkApi.executeCall(
      AddressApi.textAddressToHex(abis.tariff.address),
      'user_level',
      [AddressApi.textAddressToEvmAddress(walletAddress)],
      abis.tariff.abi,
    );

    const mcalls = [];

    const encodedFunctionGrantRole = encodeFunction(
      'grantRole',
      [
        role,
        AddressApi.textAddressToEvmAddress(walletAddress),
      ],
      abis.profiles.abi,
      true,
    );

    mcalls.push(
      [
        AddressApi.textAddressToEvmAddress(abis.profiles.address),
        hexToBytes(encodedFunctionGrantRole as `0x${string}`),
      ],
    );

    if (userLevel?.foundTokenId === 0n && role === UserRole.VERIFIED_USER) {
      const encodedFunctionMint = encodeFunction(
        'mint',
        [AddressApi.textAddressToEvmAddress(walletAddress)],
        abis.tariff.abi,
        true,
      );
      mcalls.push([
        AddressApi.textAddressToEvmAddress(abis.tariff.address),
        hexToBytes(encodedFunctionMint as `0x${string}`),
      ]);
    }

    const encodedFunction = encodeFunction(
      'mcall',
      [
        mcalls,
      ],
      abis.multiSend.abi,
    );

    const encodedFunctionBuffer = Buffer.from(encodedFunction, 'hex');

    const body = {
      k: 16,
      to: Buffer.from(AddressApi.parseTextAddress(myWalletAddress)),
      p: [],
      c: ['0x0', [encodedFunctionBuffer]],
      e: {
        vm: 'evm',
        code: Buffer.from(hexToBytes(abis.multiSend.code)),
      },
    };

    const data = objectToString({
      sponsor: appEnvs.SPONSOR_CONTRACT_ADDRESS,
      returnUrl: window.location.href,
      body,
    });

    const grantRoleRes = yield* signTxWithPopup({ data, action: grantRoleTrigger.type, description: i18n.t('grantRole') });

    if (!grantRoleRes?.txId) throw new Error('!grantRoleRes?.txId');

    additionalActionOnSuccess?.();
  } catch (error: any) {
    console.error(`grantRoleSaga ${error}`);
    toast.error(error);
  }
}

export function* revokeRoleSaga({
  payload: {
    role,
    walletAddress,
    additionalActionOnSuccess,
  },
}: ReturnType<typeof revokeRoleTrigger>) {
  try {
    const encodedFunction = encodeFunction(
      'revokeRole',
      [
        role,
        AddressApi.textAddressToEvmAddress(walletAddress),
      ],
      abis.profiles.abi,
    );

    const encodedFunctionBuffer = Buffer.from(encodedFunction, 'hex');

    const body = {
      k: 16,
      to: Buffer.from(AddressApi.parseTextAddress(abis.profiles.address)),
      p: [],
      c: ['0x0', [encodedFunctionBuffer]],
    };

    const data = objectToString({
      sponsor: appEnvs.SPONSOR_CONTRACT_ADDRESS,
      returnUrl: window.location.href,
      body,
    });

    const revokeRoleRes = yield* signTxWithPopup({ data, action: revokeRoleTrigger.type });

    if (!revokeRoleRes?.txId) throw new Error('!revokeRoleRes?.txId');

    additionalActionOnSuccess?.();
  } catch (error: any) {
    console.error(`revokeRoleSaga ${error}`);
    toast.error(error);
  }
}

export function* loadProfileRoles(
  walletAddress: string,
) {
  try {
    const networkApi = (yield* select(getNetworkApi))!;

    const roles = [
      UserRole.ACC_ADMIN_ROLE,
      UserRole.ACC_ROLE,
      UserRole.EDITOR_ADMIN_ROLE,
      UserRole.EDITOR_ROLE,
      UserRole.GEDITOR_ADMIN_ROLE,
      UserRole.GEDITOR_ROLE,
      UserRole.REGISTERED,
      UserRole.ROOT_ADMIN_ROLE,
      UserRole.USEREDIT_ROLE,
      UserRole.VERIFIED_USER,
      UserRole.VERIFIER_ADMIN_ROLE,
      UserRole.VERIFIER_ROLE,
      UserRole.LOCKED_USER,
    ];

    const profileRoles: boolean[] = yield networkApi.executeCall(
      AddressApi.textAddressToHex(abis.profiles.address),
      'hasRoles',
      [
        roles,
        AddressApi.textAddressToEvmAddress(walletAddress),
      ],
      abis.profiles.abi,
    );

    const existedRoles = roles.filter((_, i) => profileRoles[i]);

    yield put(setProfilesRoles(existedRoles));
  } catch (error: any) {
    console.error(`loadProfileRoles ${error}`);
    toast.error(error);
  }
}
