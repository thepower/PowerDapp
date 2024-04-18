import {
  approveOrRejectNFTTrigger,
  mintNftTrigger,
  editNFTTrigger,
  loadNFTTrigger,
  loadNFTsTrigger,
  publishNFTTrigger,
  setNFT,
  setNFTs,
  setNFTsCount,
  saveNFTDataTrigger,
} from 'NFTs/slice/NFTsSlice';
import appEnvs from 'appEnvs';
import { getNetworkApi } from 'application/selectors';
import {
  all, delay, put, select,
} from 'typed-redux-saga';
import { AddressApi } from '@thepowereco/tssdk';
import slugify from 'slugify';
import { MintTxResponse } from 'NFTs/types';
import { push } from 'connected-react-router';
import { objectToString } from 'sso/utils';
import abis from 'contractAbis';
import { toast } from 'react-toastify';
import { getWalletAddress } from 'account/selectors/accountSelectors';
import { NftField } from 'NFTs/constants';
import {
  hexToBytes,
  hexToString,
  numberToBytes,
  stringToBytes,
  toBytes,
} from 'viem';
import { sighTxWithPopup } from 'api/popup';
import { uploadFile } from 'api/openResty';
import { encodeFunction } from '@thepowereco/tssdk/dist/helpers/abi.helper';
import { loadProfile } from 'profiles/sagas/profiles';
import { compact } from 'lodash';
import i18n from 'locales/initLocales';
import { getIsModerator } from 'profiles/selectors/rolesSelectors';

export function* mintNftSaga({
  payload: {
    language,
    theme,
    nameOfDAOSlug,
    category,
    description,
    additionalActionOnSuccess,
  },
}: ReturnType<typeof mintNftTrigger>) {
  try {
    const walletAddress = yield* select(getWalletAddress);

    const encodedFunction = encodeFunction(
      'mint',
      [
        AddressApi.textAddressToEvmAddress(walletAddress),
        [
          [NftField.language, stringToBytes(language)],
          [NftField.theme, stringToBytes(theme)],
          [
            NftField.nameOfDAOSlug,
            stringToBytes(nameOfDAOSlug),
          ],
          [NftField.category, stringToBytes(category)],
          [NftField.description, stringToBytes(description)],
          [NftField.walletAddress, stringToBytes(walletAddress)],
          [NftField.createdAt, numberToBytes(Date.now())],
        ],
      ],
      abis.NFTs.abi,
    );

    const encodedFunctionBuffer = Buffer.from(encodedFunction, 'hex');

    const body = {
      k: 16,
      to: Buffer.from(AddressApi.parseTextAddress(abis.NFTs.address)),
      p: [],
      c: ['0x0', [encodedFunctionBuffer]],
    };

    const data = objectToString({
      sponsor: appEnvs.SPONSOR_CONTRACT_ADDRESS,
      returnUrl: window.location.href,
      body,
    });

    const mintRes = yield* sighTxWithPopup<MintTxResponse>({
      data,
      description: i18n.t('mintNft'),
      action: mintNftTrigger.type,
    });

    if (!mintRes?.txId && typeof mintRes?.retval !== 'number') throw new Error('!mintRes?.txId');

    additionalActionOnSuccess?.(mintRes.retval);
  } catch (error: any) {
    console.error(error);
    toast.error(error);
  }
}

function* loadNFT({ id, isDraft }: { id: string; isDraft?: boolean }) {
  const networkApi = (yield* select(getNetworkApi))!;
  const NFTsAbi = isDraft ? abis.NFTs.abi : abis.indexNFTs.abi;
  const NFTsAddress = isDraft
    ? abis.NFTs.address
    : abis.indexNFTs.address;

  const [
    languageHex,
    themeHex,
    nameOfDAOSlugHex,
    categoryHex,
    descriptionHex,
    walletAddressHex,
    createdAtHex,
    updatedAtHex,
    imageHashHex,
    isApprovedHex,
    isRejectedHex,
    publishedTokenIdHex,
    publishedAtHex,
    originTokenIdHex,
  ]: `0x${string}`[] = yield networkApi.executeCall(
    AddressApi.textAddressToHex(NFTsAddress),
    'getNftData',
    [
      id,
      [
        NftField.language,
        NftField.theme,
        NftField.nameOfDAOSlug,
        NftField.category,
        NftField.description,
        NftField.walletAddress,
        NftField.createdAt,
        NftField.updatedAt,
        NftField.imageHash,
        NftField.isApproved,
        NftField.isRejected,
        NftField.publishedTokenId,
        NftField.publishedAt,
        NftField.originTokenId,
      ],
    ],
    NFTsAbi,
  );
  const language = hexToString(languageHex);
  const theme = hexToString(themeHex);
  const nameOfDAOSlug = hexToString(nameOfDAOSlugHex);
  const category = hexToString(categoryHex);
  const description = hexToString(descriptionHex);
  const walletAddress = hexToString(walletAddressHex);

  const createdAt = createdAtHex ? parseInt(createdAtHex, 16) : 0;
  const updatedAt = updatedAtHex ? parseInt(updatedAtHex, 16) : 0;
  const publishedAt = publishedAtHex ? parseInt(publishedAtHex, 16) : 0;

  const isApproved = !!(isApprovedHex ? parseInt(isApprovedHex, 16) : 0);
  const isRejected = !!(isRejectedHex ? parseInt(isRejectedHex, 16) : 0);

  const publishedTokenId = publishedTokenIdHex ? parseInt(publishedTokenIdHex, 16) : 0;
  const originTokenId = originTokenIdHex ? parseInt(originTokenIdHex, 16) : 0;

  const imageHash = hexToString(imageHashHex);

  const profile = yield* loadProfile(walletAddress);

  return {
    id: +id,
    language,
    theme,
    nameOfDAOSlug,
    category,
    description,
    goalAmount: '0',
    walletAddress,
    createdAt,
    updatedAt,
    imageHash,
    firstName: profile?.firstName || 'No loaded',
    lastName: profile?.lastName || 'No loaded',
    isApproved,
    isRejected,
    publishedTokenId,
    originTokenId,
    publishedAt,
  };
}

export function* loadNFTSaga({
  payload: { id, isDraft },
}: ReturnType<typeof loadNFTTrigger>) {
  const NFT = yield* loadNFT({ id, isDraft });

  yield put(setNFT(NFT));
}

export function* saveNFTDataSaga({
  payload: {
    id, image, theme,
  },
}: ReturnType<typeof saveNFTDataTrigger>) {
  try {
    const walletAddress = yield* select(getWalletAddress);

    const imageHash = yield* uploadFile(image, id.toString());

    if (imageHash) {
      const dataFields = [
        [NftField.imageHash, stringToBytes(imageHash)],
      ];

      const encodedFunction = encodeFunction(
        'setData',
        [id, dataFields],
        abis.NFTs.abi,
      );

      const encodedFunctionBuffer = Buffer.from(encodedFunction, 'hex');

      const body = {
        k: 16,
        to: Buffer.from(AddressApi.parseTextAddress(abis.NFTs.address)),
        p: [],
        c: ['0x0', [encodedFunctionBuffer]],
      };

      const data = objectToString({
        sponsor: appEnvs.SPONSOR_CONTRACT_ADDRESS,
        returnUrl: window.location.href,
        body,
      });

      const setDataRes = yield* sighTxWithPopup({
        data,
        action: saveNFTDataTrigger.type,
        description: i18n.t('saveNFT'),
      });

      if (!setDataRes?.txId) throw new Error('!setDataRes?.txId');

      yield delay(1500);

      const sluggedTheme = slugify(theme);

      yield loadNFTSaga({
        payload: { id: id.toString(), isDraft: true },
        type: loadNFTTrigger.type,
      });

      yield put(push(`/${walletAddress}/draft/${id}_${sluggedTheme}`));
    }
  } catch (error: any) {
    console.error(error);
    toast.error(error);
  }
}

export function* editNFTSaga({
  payload: {
    id,
    language,
    theme,
    nameOfDAOSlug,
    category,
    description,
    image,
    walletAddress,
  },
}: ReturnType<typeof editNFTTrigger>) {
  try {
    const imageHash = yield* uploadFile(image, id.toString());

    if (imageHash) {
      const dataFields = [
        [NftField.language, stringToBytes(language)],
        [NftField.theme, stringToBytes(theme)],
        [
          NftField.nameOfDAOSlug,
          stringToBytes(nameOfDAOSlug),
        ],
        [NftField.category, stringToBytes(category)],
        [NftField.description, stringToBytes(description)],
        [NftField.updatedAt, numberToBytes(Date.now())],
        [NftField.imageHash, stringToBytes(imageHash)],
      ];

      const encodedFunction = encodeFunction(
        'setData',
        [id, dataFields],
        abis.NFTs.abi,
      );

      const encodedFunctionBuffer = Buffer.from(encodedFunction, 'hex');

      const body = {
        k: 16,
        to: Buffer.from(AddressApi.parseTextAddress(abis.NFTs.address)),
        p: [],
        c: ['0x0', [encodedFunctionBuffer]],
      };

      const data = objectToString({
        sponsor: appEnvs.SPONSOR_CONTRACT_ADDRESS,
        returnUrl: window.location.href,
        body,
      });

      const setDataRes = yield* sighTxWithPopup({
        data,
        action: editNFTTrigger.type,
        description: i18n.t('editNFT'),
      });

      if (!setDataRes?.txId) throw new Error('!setDataRes?.txId');
    }

    yield delay(1500);

    const sluggedTheme = slugify(theme);

    yield loadNFTSaga({
      payload: { id: id.toString(), isDraft: true },
      type: loadNFTTrigger.type,
    });

    yield put(push(`/${walletAddress}/draft/${id}_${sluggedTheme}`));
  } catch (error: any) {
    console.error(error);
    toast.error(error);
  }
}

export function* approveOrRejectNFTSaga({
  payload: { id, isApproved },
}: ReturnType<typeof approveOrRejectNFTTrigger>) {
  try {
    const encodedFunction = encodeFunction(
      'setData',
      [
        id,
        [
          isApproved
            ? [NftField.isApproved, stringToBytes('1')]
            : [NftField.isRejected, stringToBytes('1')],
        ],
      ],
      abis.NFTs.abi,
    );

    const encodedFunctionBuffer = Buffer.from(encodedFunction, 'hex');

    const body = {
      k: 16,
      to: Buffer.from(AddressApi.parseTextAddress(abis.NFTs.address)),
      p: [],
      c: ['0x0', [encodedFunctionBuffer]],
    };

    const data = objectToString({
      sponsor: appEnvs.SPONSOR_CONTRACT_ADDRESS,
      returnUrl: window.location.href,
      body,
    });

    const setDataRes = yield* sighTxWithPopup({
      data,
      action: approveOrRejectNFTTrigger.type,
      description: isApproved
        ? i18n.t('rejectNFT')
        : i18n.t('acceptNFT'),
    });

    if (!setDataRes?.txId) throw new Error('!setDataRes?.txId');

    toast.info(i18n.t(isApproved ? 'NFTApproved' : 'NFTRejected'));

    yield loadNFTSaga({
      payload: { id: id.toString(), isDraft: true },
      type: loadNFTTrigger.type,
    });
  } catch (error: any) {
    console.error(error);
    toast.error(error);
  }
}

export function* publishNFTSaga({
  payload: { id },
}: ReturnType<typeof publishNFTTrigger>) {
  try {
    const networkApi = (yield* select(getNetworkApi))!;
    const walletAddress = yield* select(getWalletAddress);

    const totalSupplyBigint: bigint = yield networkApi.executeCall(
      AddressApi.textAddressToHex(abis.indexNFTs.address),
      'totalSupply',
      [],
      abis.indexNFTs.abi,
    );

    const [newId]: bigint[] = yield networkApi.executeCall(
      AddressApi.textAddressToHex(abis.indexNFTs.address),
      'grep',
      [0, [[NftField.originTokenId, toBytes(id, { size: 32 })]], 1, false],
      abis.indexNFTs.abi,
    );

    const mcalls = [];

    const encodedFunctionMint = encodeFunction(
      'mint',
      [
        newId,
        AddressApi.textAddressToEvmAddress(abis.NFTs.address),
        id,
        [
          NftField.language,
          NftField.theme,
          NftField.nameOfDAOSlug,
          NftField.category,
          NftField.description,
          NftField.walletAddress,
          NftField.createdAt,
          NftField.updatedAt,
          NftField.imageHash,
          NftField.isApproved,
          NftField.isRejected,
        ],
      ],
      abis.indexNFTs.abi,
      true,
    );

    mcalls.push(
      [
        AddressApi.textAddressToEvmAddress(abis.indexNFTs.address),
        hexToBytes(encodedFunctionMint as `0x${string}`),
      ],
    );

    if (!newId) {
      const encodedFunctionSetData = encodeFunction(
        'setData',
        [
          id,
          [
            [
              NftField.publishedContractAddress,
              AddressApi.textAddressToEvmAddress(abis.NFTs.address),
            ],
            [
              NftField.publishedTokenId,
              numberToBytes(totalSupplyBigint + 1n, { size: 32 }),
            ],
          ],
        ],
        abis.NFTs.abi,
        true,
      );
      mcalls.push([
        AddressApi.textAddressToEvmAddress(abis.NFTs.address),
        hexToBytes(encodedFunctionSetData as `0x${string}`),
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
      to: Buffer.from(AddressApi.parseTextAddress(walletAddress)),
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

    const indexMintRes = yield* sighTxWithPopup({
      data,
      action: publishNFTTrigger.type,
      description: i18n.t('publishNFT'),
    });

    if (!indexMintRes?.txId) throw new Error('!indexMintRes?.txId');

    toast.info(i18n.t('NFTPublished'));
  } catch (error: any) {
    console.error(`publishNFTSaga ${error}`);
    toast.error(error);
  }
}

export function* loadNFTsSaga({
  payload: {
    page,
    pageSize,
    isReversed,
    category,
    nameOfDAOSlug,
    status,
    walletAddress,
    isDraft,
  },
}: ReturnType<typeof loadNFTsTrigger>) {
  yield put(setNFTs([]));
  yield put(setNFTsCount(0));
  const isModerator = yield* select(getIsModerator);
  const loggedWalletAddress = yield* select(getWalletAddress);
  const isLoadDraftNFTs =
    (isModerator || loggedWalletAddress === walletAddress) && isDraft;
  const NFTsAbi = isLoadDraftNFTs
    ? abis.NFTs.abi
    : abis.indexNFTs.abi;
  const NFTsAddress = isLoadDraftNFTs
    ? abis.NFTs.address
    : abis.indexNFTs.address;
  const networkApi = (yield* select(getNetworkApi))!;
  const filters = [];

  if (category !== 'all') filters.push([NftField.category, toBytes(category)]);
  if (nameOfDAOSlug !== 'all') {
    filters.push([
      NftField.nameOfDAOSlug,
      toBytes(nameOfDAOSlug),
    ]);
  }

  if (status === 'approved') filters.push([NftField.isApproved, toBytes('1')]);
  if (status === 'notApproved') filters.push([NftField.isApproved, toBytes('')]);

  if (status === 'rejected') filters.push([NftField.isRejected, toBytes('1')]);
  if (walletAddress) filters.push([NftField.walletAddress, toBytes(walletAddress)]);

  const estimateBigint: bigint = yield networkApi.executeCall(
    AddressApi.textAddressToHex(NFTsAddress),
    'grep_estimate',
    [filters],
    NFTsAbi,
  );

  const estimate = Number(estimateBigint);
  let maxIdOrEstimateOrTotalSupply = estimate;

  if (!isLoadDraftNFTs) {
    const maxIdBigint: bigint = yield networkApi.executeCall(
      AddressApi.textAddressToHex(NFTsAddress),
      'maxId',
      [],
      NFTsAbi,
    );
    const maxId = Number(maxIdBigint);
    maxIdOrEstimateOrTotalSupply = maxId;
  } else if (isReversed) {
    const totalSupplyBigint: bigint = yield networkApi.executeCall(
      AddressApi.textAddressToHex(NFTsAddress),
      'totalSupply',
      [],
      NFTsAbi,
    );
    const totalSupply = Number(totalSupplyBigint);
    maxIdOrEstimateOrTotalSupply = totalSupply;
  }

  const start = isReversed
    ? maxIdOrEstimateOrTotalSupply - page * pageSize
    : page * pageSize + 1;
  const amount = pageSize;

  yield put(setNFTsCount(estimate));

  const NFTsIds: bigint[] = yield networkApi.executeCall(
    AddressApi.textAddressToHex(NFTsAddress),
    'grep',
    [start, filters, amount, isReversed],
    NFTsAbi,
  );

  const ids = compact(NFTsIds);

  const NFTs = yield* all(
    ids.map((idBigInt) => loadNFT({ id: idBigInt.toString(), isDraft: isLoadDraftNFTs })),
  );

  yield put(setNFTs(NFTs));
}
