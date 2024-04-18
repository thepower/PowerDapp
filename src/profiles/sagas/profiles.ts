import appEnvs from 'appEnvs';
import {
  all,
  put,
  select,
} from 'typed-redux-saga';
import {
  AddressApi,
} from '@thepowereco/tssdk';

import {
  objectToString,
} from 'sso/utils';
import abis from 'contractAbis';
import { toast } from 'react-toastify';

import { getWalletAddress } from 'account/selectors/accountSelectors';
import {
  createOrEditProfileTrigger, loadProfileTrigger, loadProfilesTrigger, setProfile, setProfiles, setProfilesCount,
} from 'profiles/slice/profilesSlice';
import { getNetworkApi } from 'application/selectors';
import {
  ProfileField,
  UserRole,
} from 'profiles/constants';
import { encodeFunction } from '@thepowereco/tssdk/dist/helpers/abi.helper';
import { uploadFile } from 'api/openResty';
import {
  compact,
} from 'lodash';
import { sighTxWithPopup } from 'api/popup';
import i18n from 'locales/initLocales';
import { push } from 'connected-react-router';
import { hexToString, numberToBytes, stringToBytes } from 'viem';
import { loadProfileRoles } from './roles';

export function* createOrEditProfileSaga({
  payload: {
    firstName,
    lastName,
    email,
    photo,
    editedWalletAddress,
  },
}: ReturnType<typeof createOrEditProfileTrigger>) {
  try {
    const walletAddress = yield* select(getWalletAddress);

    const networkApi = (yield* select(getNetworkApi))!;

    const isRegistered: boolean = yield networkApi.executeCall(
      AddressApi.textAddressToHex(abis.profiles.address),
      'hasRole',
      [UserRole.REGISTERED, AddressApi.textAddressToEvmAddress(walletAddress)],
      abis.profiles.abi,
    );

    const hash = yield* uploadFile(photo, appEnvs.OPEN_RESTY_PROFILE_BUCKET);

    if (!hash) return;

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
          [ProfileField.photoHash, stringToBytes(hash)],
        ],
      ];
    } else if (isRegistered) {
      method = 'setProfileFields';
      params = [
        [
          [ProfileField.firstName, stringToBytes(firstName)],
          [ProfileField.lastName, stringToBytes(lastName)],
          [ProfileField.email, stringToBytes(email)],
          [ProfileField.updatedAt, dateUint8Array],
          [ProfileField.photoHash, stringToBytes(hash)],
        ],
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
          [ProfileField.photoHash, stringToBytes(hash)],
        ],
      ];
    }

    const encodedFunction = encodeFunction(method, params, abis.profiles.abi);
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

    const createProfileResponse = yield* sighTxWithPopup({
      data,
      action: createOrEditProfileTrigger.type,
      description: isRegistered ? i18n.t('editProfile') : i18n.t('saveProfile'),
    });

    if (!createProfileResponse.txId) throw new Error('!createOrEditProfileSaga.txId');

    toast.info(i18n.t(isRegistered ? 'profileEdited' : 'profileCreated'));

    yield loadProfileRoles(
      editedWalletAddress || walletAddress,
    );

    yield* put(push(`/${editedWalletAddress || walletAddress}`));
  } catch (error: any) {
    console.error(error);
    toast.error(error);
  }
}

export function* loadProfile(walletAddressOrId: string | number) {
  try {
    const networkApi = (yield* select(getNetworkApi))!;
    const isById = typeof walletAddressOrId === 'number';

    let walletAddress: string;

    if (isById) {
      const walletAddressHex: string = yield networkApi.executeCall(
        AddressApi.textAddressToHex(abis.profiles.address),
        'getRegisteredUser',
        [walletAddressOrId],
        abis.profiles.abi,
      );

      if (walletAddressHex) {
        walletAddress =
          AddressApi.hexToTextAddress(AddressApi.evmAddressToHexAddress(walletAddressHex));
      } else throw Error('no getRegisteredUser');
    } else {
      walletAddress = walletAddressOrId;
    }

    const [
      firstNameHex,
      lastNameHex,
      emailHex,
      createdAtHex,
      updatedAtHex,
      photoHashHex,
    ]: `0x${string}` [] = yield networkApi.executeCall(
      AddressApi.textAddressToHex(abis.profiles.address),
      isById ? 'getProfileData' : 'getAddrProfileData',
      [isById ?
        walletAddressOrId :
        AddressApi.textAddressToEvmAddress(walletAddressOrId),
      [
        ProfileField.firstName,
        ProfileField.lastName,
        ProfileField.email,
        ProfileField.createdAt,
        ProfileField.updatedAt,
        ProfileField.photoHash,
      ]],
      abis.profiles.abi,
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
      photoHash,
    };

    return profile;
  } catch (error: any) {
    console.error(error);
    toast.error(error);
    return null;
  }
}

export function* loadProfileSaga({
  payload: walletAddress,
}: ReturnType<typeof loadProfileTrigger>) {
  const profileWalletAddress = walletAddress || (yield* select(getWalletAddress));

  const profile = yield* loadProfile(profileWalletAddress);
  if (profile) {
    yield put(setProfile(profile));
  } else {
    console.error('!profile');
  }
}

export function* loadProfilesSaga({
  payload: {
    page, pageSize, isReversed, status,
  },
}: ReturnType<typeof loadProfilesTrigger>) {
  const networkApi = (yield* select(getNetworkApi))!;

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

  const estimateBigint: bigint = yield networkApi.executeCall(
    AddressApi.textAddressToHex(abis.profiles.address),
    'grep_estimate',
    [
      [],
      requiredRoles,
      deniedRoles,
    ],
    abis.profiles.abi,
  );
  const estimate = Number(estimateBigint);
  let estimateOrTotalSupply = estimate;

  if (isReversed) {
    const totalSupplyBigint: bigint = (yield networkApi.executeCall(AddressApi.textAddressToHex(abis.profiles.address), 'totalSupply', [], abis.profiles.abi));
    const totalSupply = Number(totalSupplyBigint);
    estimateOrTotalSupply = totalSupply;
  }

  const start = isReversed ? estimateOrTotalSupply - (page * pageSize) : (page * pageSize) + 1;
  const amount = pageSize;

  yield put(setProfilesCount(estimate));

  const profilesIds: bigint[] = yield networkApi.executeCall(
    AddressApi.textAddressToHex(abis.profiles.address),
    'grep',
    [
      start,
      [],
      requiredRoles,
      deniedRoles,
      amount,
      isReversed,
    ],
    abis.profiles.abi,
  );

  const ids = compact(profilesIds);

  const profiles = yield* all(ids.map((idBigInt) => loadProfile(Number(idBigInt))));

  const existedProfiles = compact(profiles);

  yield put(setProfiles(existedProfiles));
}
