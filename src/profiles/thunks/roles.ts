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
import { AddActionOnSuccessAndErrorType } from 'typings/common';

export const grantRoleThunk = createAsyncThunk<
  void,
  AddActionOnSuccessAndErrorType<GrantRolePayload>
>(
  'roles/grantRole',
  async ({ role, walletAddress, additionalActionOnSuccess }, { getState }) => {
    try {
      const state = getState() as RootState;
      const userWalletAddress = getWalletAddress(state);

      const mcalls = [];

      const encodedFunctionGrantRole = encodeFunction({
        abi: abis.profiles.abi,
        functionName: 'grantRole',
        args: [role, AddressApi.textAddressToEvmAddress(walletAddress)]
      });

      mcalls.push({
        data: encodedFunctionGrantRole,
        to: AddressApi.textAddressToEvmAddress(abis.profiles.address)
      });

      const encodedFunction = encodeFunction({
        abi: abis.multiSend.abi,
        functionName: 'mcall',
        args: [mcalls]
      });

      const encodedFunctionBuffer = hexToBytes(encodedFunction);

      const body = {
        k: 16,
        f: Buffer.from(AddressApi.parseTextAddress(userWalletAddress)),
        to: Buffer.from(AddressApi.parseTextAddress(userWalletAddress)),
        p: [],
        c: ['0x0', [Buffer.from(encodedFunctionBuffer)]],
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
        action: grantRoleThunk.typePrefix,
        description: i18n.t('grantRole')
      });

      if (!grantRoleRes?.txId) throw new Error('!grantRoleRes?.txId');

      additionalActionOnSuccess?.();
    } catch (error: any) {
      throw new Error(error.message || 'An error occurred while granting role');
    }
  }
);

export const revokeRoleThunk = createAsyncThunk<
  void,
  AddActionOnSuccessAndErrorType<RevokeRolePayload>
>(
  'roles/revokeRole',
  async ({ role, walletAddress, additionalActionOnSuccess }, { getState }) => {
    const state = getState() as RootState;
    const userWalletAddress = getWalletAddress(state);
    try {
      const encodedFunction = encodeFunction({
        abi: abis.profiles.abi,
        functionName: 'revokeRole',
        args: [role, AddressApi.textAddressToEvmAddress(walletAddress)]
      });

      const encodedFunctionBuffer = hexToBytes(encodedFunction);

      const body = {
        k: 16,
        f: Buffer.from(AddressApi.parseTextAddress(userWalletAddress)),
        to: Buffer.from(AddressApi.parseTextAddress(abis.profiles.address)),
        p: [],
        c: ['0x0', [Buffer.from(encodedFunctionBuffer)]]
      };

      const data = objectToString({
        sponsor: appEnvs.SPONSOR_CONTRACT_ADDRESS,
        returnUrl: window.location.href,
        body
      });

      const revokeRoleRes = await signTxWithPopup({
        data,
        action: revokeRoleThunk.typePrefix
      });

      if (!revokeRoleRes?.txId) throw new Error('!revokeRoleRes?.txId');

      additionalActionOnSuccess?.();
    } catch (error: any) {
      throw new Error(error.message || 'An error occurred while revoking role');
    }
  }
);

export const loadProfileRolesThunk = createAsyncThunk<UserRole[], string>(
  'roles/loadProfileRoles',
  async (walletAddress, { getState, dispatch }) => {
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

      const profileRoles = await networkApi.executeCall(
        {
          abi: abis.profiles.abi,
          functionName: 'hasRoles',
          args: [roles, AddressApi.textAddressToEvmAddress(walletAddress)]
        },
        { address: abis.profiles.address }
      );

      const rolesWithId = roles.filter((_, i) => profileRoles[i]);

      dispatch(setProfilesRoles(rolesWithId));

      return rolesWithId;
    } catch (error: any) {
      throw new Error(
        error.message || 'An error occurred while loading profile roles'
      );
    }
  }
);
