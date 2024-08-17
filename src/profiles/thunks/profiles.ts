import { createAsyncThunk } from '@reduxjs/toolkit';
import { AddressApi, NetworkApi } from '@thepowereco/tssdk';

import { encodeFunction } from '@thepowereco/tssdk/dist/helpers/abi.helper';
import { compact } from 'lodash';
import { toast } from 'react-toastify';
import { hexToString, numberToBytes, stringToBytes } from 'viem';
import { getWalletAddress } from 'account/selectors/accountSelectors';
import { uploadFile } from 'api/openResty';
import { signTxWithPopup } from 'api/popup';
import appEnvs from 'appEnvs';
import { getNetworkApi } from 'application/selectors';
import { RootState } from 'application/store';
import abis from 'contractAbis';
import i18n from 'locales/initLocales';
import { ProfileField, UserRole } from 'profiles/constants';
import {
  setProfile,
  setProfiles,
  setProfilesCount,
  setUserProfile
} from 'profiles/slice/profilesSlice';
import {
  CreateProfilePayload,
  LoadProfilePayload,
  Profile
} from 'profiles/types';
import { objectToString } from 'sso/utils';
import { loadProfileRolesThunk } from './roles';

export const createOrEditProfileThunk = createAsyncThunk<
  void,
  CreateProfilePayload
>(
  'profile/createOrEditProfile',
  async (
    { firstName, lastName, email, photo, editedWalletAddress, navigate },
    { dispatch, getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as RootState;
      const walletAddress = getWalletAddress(state);
      const networkApi = getNetworkApi(state)!;

      const isRegistered = await networkApi.executeCall(
        AddressApi.textAddressToHex(abis.profiles.address),
        'hasRole',
        [
          UserRole.REGISTERED,
          AddressApi.textAddressToEvmAddress(walletAddress)
        ],
        abis.profiles.abi
      );

      const hash = await uploadFile(photo, appEnvs.OPEN_RESTY_PROFILE_BUCKET);
      if (!hash) return rejectWithValue('File upload failed');

      const date = Date.now();
      const dateUint8Array = numberToBytes(date);

      let params = [];
      let method = '';

      if (editedWalletAddress && isRegistered) {
        method = 'setUserProfileFields';
        params = [
          AddressApi.textAddressToEvmAddress(editedWalletAddress),
          [
            [ProfileField.firstName, stringToBytes(firstName)],
            [ProfileField.lastName, stringToBytes(lastName)],
            [ProfileField.email, stringToBytes(email)],
            [ProfileField.updatedAt, dateUint8Array],
            [ProfileField.photoHash, stringToBytes(hash)]
          ]
        ];
      } else if (isRegistered) {
        method = 'setProfileFields';
        params = [
          [
            [ProfileField.firstName, stringToBytes(firstName)],
            [ProfileField.lastName, stringToBytes(lastName)],
            [ProfileField.email, stringToBytes(email)],
            [ProfileField.updatedAt, dateUint8Array],
            [ProfileField.photoHash, stringToBytes(hash)]
          ]
        ];
      } else {
        method = 'quickReg';
        params = [
          [
            [ProfileField.firstName, stringToBytes(firstName)],
            [ProfileField.lastName, stringToBytes(lastName)],
            [ProfileField.email, stringToBytes(email)],
            [ProfileField.createdAt, dateUint8Array],
            [ProfileField.updatedAt, dateUint8Array],
            [ProfileField.photoHash, stringToBytes(hash)]
          ]
        ];
      }

      const encodedFunction = encodeFunction(method, params, abis.profiles.abi);
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

      const createProfileResponse = await signTxWithPopup({
        data,
        action: createOrEditProfileThunk.typePrefix,
        description: isRegistered
          ? i18n.t('editProfile')
          : i18n.t('saveProfile')
      });

      if (!createProfileResponse.txId)
        throw new Error('!createOrEditProfileSaga.txId');

      toast.info(i18n.t(isRegistered ? 'profileEdited' : 'profileCreated'));

      await dispatch(
        loadProfileRolesThunk(editedWalletAddress || walletAddress)
      );

      navigate(`/${editedWalletAddress || walletAddress}`);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const loadProfile = async ({
  walletAddressOrId,
  networkApi
}: {
  walletAddressOrId: string | number;
  networkApi: NetworkApi;
}) => {
  try {
    const isById = typeof walletAddressOrId === 'number';

    let walletAddress: string;

    if (isById) {
      const walletAddressHex: string = await networkApi.executeCall(
        AddressApi.textAddressToHex(abis.profiles.address),
        'getRegisteredUser',
        [walletAddressOrId],
        abis.profiles.abi
      );
      if (walletAddressHex) {
        walletAddress = AddressApi.hexToTextAddress(
          AddressApi.evmAddressToHexAddress(walletAddressHex)
        );
      } else throw new Error('no getRegisteredUser');
    } else {
      walletAddress = walletAddressOrId;
    }

    const [
      firstNameHex,
      lastNameHex,
      emailHex,
      createdAtHex,
      updatedAtHex,
      photoHashHex
    ]: `0x${string}`[] = await networkApi.executeCall(
      AddressApi.textAddressToHex(abis.profiles.address),
      isById ? 'getProfileData' : 'getAddrProfileData',
      [
        isById
          ? walletAddressOrId
          : AddressApi.textAddressToEvmAddress(walletAddressOrId),
        [
          ProfileField.firstName,
          ProfileField.lastName,
          ProfileField.email,
          ProfileField.createdAt,
          ProfileField.updatedAt,
          ProfileField.photoHash
        ]
      ],
      abis.profiles.abi
    );

    const firstName = hexToString(firstNameHex);
    const lastName = hexToString(lastNameHex);
    const email = hexToString(emailHex);

    const photoHash = hexToString(photoHashHex);

    const createdAt = parseInt(createdAtHex, 16);
    const updatedAt = parseInt(updatedAtHex, 16);

    const profile = {
      walletAddress,
      firstName,
      lastName,
      email,
      createdAt,
      updatedAt,
      photoHash
    };

    return profile;
  } catch (error: any) {
    console.error(error);
  }
};

export const loadProfileThunk = createAsyncThunk<Profile, LoadProfilePayload>(
  'profile/loadProfile',
  async (
    { walletAddressOrId, isSetProfile },
    { getState, dispatch, rejectWithValue }
  ) => {
    try {
      const state = getState() as RootState;
      const networkApi = getNetworkApi(state)!;
      const isById = typeof walletAddressOrId === 'number';

      let walletAddress: string;

      if (isById) {
        const walletAddressHex: string = await networkApi.executeCall(
          AddressApi.textAddressToHex(abis.profiles.address),
          'getRegisteredUser',
          [walletAddressOrId],
          abis.profiles.abi
        );
        if (walletAddressHex) {
          walletAddress = AddressApi.hexToTextAddress(
            AddressApi.evmAddressToHexAddress(walletAddressHex)
          );
        } else throw new Error('no getRegisteredUser');
      } else {
        walletAddress = walletAddressOrId;
      }

      const [
        firstNameHex,
        lastNameHex,
        emailHex,
        createdAtHex,
        updatedAtHex,
        photoHashHex
      ]: `0x${string}`[] = await networkApi.executeCall(
        AddressApi.textAddressToHex(abis.profiles.address),
        isById ? 'getProfileData' : 'getAddrProfileData',
        [
          isById
            ? walletAddressOrId
            : AddressApi.textAddressToEvmAddress(walletAddressOrId),
          [
            ProfileField.firstName,
            ProfileField.lastName,
            ProfileField.email,
            ProfileField.createdAt,
            ProfileField.updatedAt,
            ProfileField.photoHash
          ]
        ],
        abis.profiles.abi
      );

      const firstName = hexToString(firstNameHex);
      const lastName = hexToString(lastNameHex);
      const email = hexToString(emailHex);

      const photoHash = hexToString(photoHashHex);

      const createdAt = parseInt(createdAtHex, 16);
      const updatedAt = parseInt(updatedAtHex, 16);

      const profile = {
        walletAddress,
        firstName,
        lastName,
        email,
        createdAt,
        updatedAt,
        photoHash
      };

      if (isSetProfile) {
        dispatch(setProfile(profile));
      }

      return profile;
    } catch (error: any) {
      console.error(error);
      return rejectWithValue(error.message);
    }
  }
);

export const loadUserProfileThunk = createAsyncThunk<void, string>(
  'profile/loadUserProfile',
  async (walletAddress, { dispatch, getState }) => {
    const state = getState() as RootState;
    const networkApi = getNetworkApi(state) as NetworkApi;
    const profile = await loadProfile({
      walletAddressOrId: walletAddress,
      networkApi
    });
    if (profile) {
      dispatch(setUserProfile(profile));
    } else {
      console.error('!profile');
    }
  }
);

export const loadProfilesThunk = createAsyncThunk(
  'profiles/loadProfiles',
  async (
    {
      page,
      pageSize,
      isReversed,
      status
    }: { page: number; pageSize: number; isReversed: boolean; status: string },
    { getState, dispatch, rejectWithValue }
  ) => {
    try {
      const state = getState() as RootState;
      const networkApi = getNetworkApi(state) as NetworkApi;

      const requiredRoles = [];
      const deniedRoles = [];

      if (status === 'LOCKED') {
        requiredRoles.push(UserRole.LOCKED_USER);
      }
      if (status === 'REGISTERED') {
        requiredRoles.push(UserRole.REGISTERED);
        deniedRoles.push(UserRole.VERIFIED_USER);
        deniedRoles.push(UserRole.LOCKED_USER);
      }
      if (status === 'VERIFIED') {
        requiredRoles.push(UserRole.VERIFIED_USER);
        deniedRoles.push(UserRole.LOCKED_USER);
      }

      const estimateBigint: bigint = await networkApi.executeCall(
        AddressApi.textAddressToHex(abis.profiles.address),
        'grep_estimate',
        [[], requiredRoles, deniedRoles],
        abis.profiles.abi
      );
      const estimate = Number(estimateBigint);
      let estimateOrTotalSupply = estimate;

      if (isReversed) {
        const totalSupplyBigint: bigint = await networkApi.executeCall(
          AddressApi.textAddressToHex(abis.profiles.address),
          'totalSupply',
          [],
          abis.profiles.abi
        );

        const totalSupply = Number(totalSupplyBigint);
        estimateOrTotalSupply = totalSupply;
      }

      const start = isReversed
        ? estimateOrTotalSupply - page * pageSize
        : page * pageSize + 1;
      const amount = pageSize;

      dispatch(setProfilesCount(estimate));

      const profilesIds: bigint[] = await networkApi.executeCall(
        AddressApi.textAddressToHex(abis.profiles.address),
        'grep',
        [start, [], requiredRoles, deniedRoles, amount, isReversed],
        abis.profiles.abi
      );
      const ids = compact(profilesIds);

      const profiles = await Promise.all(
        ids.map((idBigInt) =>
          loadProfile({ walletAddressOrId: Number(idBigInt), networkApi })
        )
      );

      const existedProfiles = compact(profiles);

      dispatch(setProfiles(existedProfiles));
    } catch (error: any) {
      console.error(error);
      return rejectWithValue(error.message);
    }
  }
);
