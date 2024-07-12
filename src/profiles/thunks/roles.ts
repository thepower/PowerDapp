import { createAsyncThunk } from '@reduxjs/toolkit';
import { AddressApi } from '@thepowereco/tssdk';
import { encodeFunction } from '@thepowereco/tssdk/dist/helpers/abi.helper';
import { hexToBytes } from 'viem';
import { getWalletAddress } from 'account/selectors/accountSelectors';
import { signTxWithPopup } from 'api/popup';
import appEnvs from 'appEnvs';
import { getNetworkApi } from 'application/selectors';
import { RootState } from 'application/store';
import abis from 'contractAbis';
import i18n from 'locales/initLocales';
import { UserRole } from 'profiles/constants';

import { setProfilesRoles } from 'profiles/slice/profilesSlice';
import { GrantRolePayload, RevokeRolePayload } from 'profiles/types';
import { objectToString } from 'sso/utils';
import { UserLevelResponse } from 'tariffs/types';
import { AddActionOnSuccessAndErrorType } from 'typings/common';

export const grantRole = createAsyncThunk<
  void,
  AddActionOnSuccessAndErrorType<GrantRolePayload>
>(
  'roles/grantRole',
  async ({ role, walletAddress, additionalActionOnSuccess }, { getState }) => {
    try {
      const state = getState() as RootState;
      const networkApi = getNetworkApi(state)!;
      const myWalletAddress = getWalletAddress(state);

      const userLevel: UserLevelResponse = await networkApi.executeCall(
        AddressApi.textAddressToHex(abis.tariff.address),
        'user_level',
        [AddressApi.textAddressToEvmAddress(walletAddress)],
        abis.tariff.abi
      );

      const mcalls = [];

      const encodedFunctionGrantRole = encodeFunction(
        'grantRole',
        [role, AddressApi.textAddressToEvmAddress(walletAddress)],
        abis.profiles.abi,
        true
      );

      mcalls.push([
        AddressApi.textAddressToEvmAddress(abis.profiles.address),
        hexToBytes(encodedFunctionGrantRole as `0x${string}`)
      ]);

      if (userLevel?.foundTokenId === 0n && role === UserRole.VERIFIED_USER) {
        const encodedFunctionMint = encodeFunction(
          'mint',
          [AddressApi.textAddressToEvmAddress(walletAddress)],
          abis.tariff.abi,
          true
        );
        mcalls.push([
          AddressApi.textAddressToEvmAddress(abis.tariff.address),
          hexToBytes(encodedFunctionMint as `0x${string}`)
        ]);
      }

      const encodedFunction = encodeFunction(
        'mcall',
        [mcalls],
        abis.multiSend.abi
      );

      const encodedFunctionBuffer = Buffer.from(encodedFunction, 'hex');

      const body = {
        k: 16,
        to: Buffer.from(AddressApi.parseTextAddress(myWalletAddress)),
        p: [],
        c: ['0x0', [encodedFunctionBuffer]],
        e: {
          vm: 'evm',
          code: Buffer.from(hexToBytes(abis.multiSend.code))
        }
      };

      const data = objectToString({
        sponsor: appEnvs.SPONSOR_CONTRACT_ADDRESS,
        returnUrl: window.location.href,
        body
      });

      const grantRoleRes = await signTxWithPopup({
        data,
        action: grantRole.typePrefix,
        description: i18n.t('grantRole')
      });

      if (!grantRoleRes?.txId) throw new Error('!grantRoleRes?.txId');

      additionalActionOnSuccess?.();
    } catch (error: any) {
      throw new Error(error.message || 'An error occurred while granting role');
    }
  }
);

export const revokeRole = createAsyncThunk<
  void,
  AddActionOnSuccessAndErrorType<RevokeRolePayload>
>(
  'roles/revokeRole',
  async ({ role, walletAddress, additionalActionOnSuccess }) => {
    try {
      const encodedFunction = encodeFunction(
        'revokeRole',
        [role, AddressApi.textAddressToEvmAddress(walletAddress)],
        abis.profiles.abi
      );

      const encodedFunctionBuffer = Buffer.from(encodedFunction, 'hex');

      const body = {
        k: 16,
        to: Buffer.from(AddressApi.parseTextAddress(abis.profiles.address)),
        p: [],
        c: ['0x0', [encodedFunctionBuffer]]
      };

      const data = objectToString({
        sponsor: appEnvs.SPONSOR_CONTRACT_ADDRESS,
        returnUrl: window.location.href,
        body
      });

      const revokeRoleRes = await signTxWithPopup({
        data,
        action: revokeRole.typePrefix
      });

      if (!revokeRoleRes?.txId) throw new Error('!revokeRoleRes?.txId');

      additionalActionOnSuccess?.();
    } catch (error: any) {
      throw new Error(error.message || 'An error occurred while revoking role');
    }
  }
);

export const loadProfileRoles = createAsyncThunk(
  'roles/loadProfileRoles',
  async (walletAddress: string, { getState, dispatch }) => {
    try {
      const state = getState() as RootState;
      const networkApi = getNetworkApi(state)!;

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
        UserRole.LOCKED_USER
      ];

      const profileRoles: boolean[] = await networkApi.executeCall(
        AddressApi.textAddressToHex(abis.profiles.address),
        'hasRoles',
        [roles, AddressApi.textAddressToEvmAddress(walletAddress)],
        abis.profiles.abi
      );

      dispatch(setProfilesRoles(roles.filter((_, i) => profileRoles[i])));
    } catch (error: any) {
      throw new Error(
        error.message || 'An error occurred while loading profile roles'
      );
    }
  }
);
