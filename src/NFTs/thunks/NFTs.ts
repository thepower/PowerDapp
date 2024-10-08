import { createAsyncThunk } from '@reduxjs/toolkit';
import { AddressApi, NetworkApi } from '@thepowereco/tssdk';
import { encodeFunction } from '@thepowereco/tssdk/dist/helpers/abi.helper';
import { compact } from 'lodash';
import { toast } from 'react-toastify';
import slugify from 'slugify';
import { hexToBytes, hexToString, toHex } from 'viem';
import { getWalletAddress } from 'account/selectors/accountSelectors';
import { uploadFile } from 'api/openResty';
import { signTxWithPopup } from 'api/popup';
import appEnvs from 'appEnvs';
import { getNetworkApi } from 'application/selectors';
import { RootState } from 'application/store';
import abis from 'contractAbis';
import i18n from 'locales/initLocales';
import { NftField } from 'NFTs/constants';
import { setNFT, setNFTs, setNFTsCount } from 'NFTs/slice/NFTsSlice';
import {
  CreatedNFT,
  EditNFTPayload,
  LoadNFTsPayload,
  MintNftPayload,
  MintTxResponse,
  SaveNFTDataPayload
} from 'NFTs/types';
import { getIsModerator } from 'profiles/selectors/rolesSelectors';
import { loadProfile } from 'profiles/thunks/profiles';
import { objectToString } from 'sso/utils';
import { AddActionOnSuccessAndErrorType } from 'typings/common';

export const mintNftThunk = createAsyncThunk<
  void,
  AddActionOnSuccessAndErrorType<MintNftPayload>
>(
  'nfts/mintNft',
  async (
    {
      language,
      theme,
      nameOfDAOSlug,
      category,
      description,
      additionalActionOnSuccess
    },
    { getState }
  ) => {
    try {
      const state = getState() as RootState;
      const walletAddress = getWalletAddress(state);

      const encodedFunction = encodeFunction({
        abi: abis.NFTs.abi,
        functionName: 'mint',
        args: [
          AddressApi.textAddressToEvmAddress(walletAddress),
          [
            { k: BigInt(NftField.language), v: toHex(language) },
            { k: BigInt(NftField.theme), v: toHex(theme) },
            { k: BigInt(NftField.nameOfDAOSlug), v: toHex(nameOfDAOSlug) },
            { k: BigInt(NftField.category), v: toHex(category) },
            { k: BigInt(NftField.description), v: toHex(description) },
            { k: BigInt(NftField.walletAddress), v: toHex(walletAddress) },
            { k: BigInt(NftField.createdAt), v: toHex(Date.now()) }
          ]
        ]
      });

      const encodedFunctionBuffer = hexToBytes(encodedFunction);

      const body = {
        k: 16,
        f: Buffer.from(AddressApi.parseTextAddress(walletAddress)),
        to: Buffer.from(AddressApi.parseTextAddress(abis.NFTs.address)),
        p: [],
        c: ['0x0', [Buffer.from(encodedFunctionBuffer)]]
      };

      const data = objectToString({
        sponsor: appEnvs.SPONSOR_CONTRACT_ADDRESS,
        returnUrl: window.location.href,
        body
      });

      const mintRes = await signTxWithPopup<MintTxResponse>({
        data,
        description: i18n.t('mintNft'),
        action: mintNftThunk.typePrefix
      });

      if (!mintRes?.txId && typeof mintRes?.retval !== 'number')
        throw new Error('!mintRes?.txId');

      additionalActionOnSuccess?.(mintRes.retval);
    } catch (error: any) {
      console.error(error);
      toast.error(error);
      throw error;
    }
  }
);

export const loadNFT = async ({
  id,
  isDraft,
  networkApi
}: {
  id: string;
  isDraft?: boolean;
  networkApi: NetworkApi;
}) => {
  const NFTsAbi = isDraft ? abis.NFTs.abi : abis.indexNFTs.abi;
  const NFTsAddress = isDraft ? abis.NFTs.address : abis.indexNFTs.address;

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
    originTokenIdHex
  ] = await networkApi?.executeCall(
    {
      abi: NFTsAbi,
      functionName: 'getNftData',
      args: [
        BigInt(id),
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
          NftField.originTokenId
        ].map(BigInt)
      ]
    },
    { address: NFTsAddress }
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

  const publishedTokenId = publishedTokenIdHex
    ? parseInt(publishedTokenIdHex, 16)
    : 0;
  const originTokenId = originTokenIdHex ? parseInt(originTokenIdHex, 16) : 0;

  const imageHash = hexToString(imageHashHex);

  const profile = await loadProfile({
    walletAddressOrId: walletAddress,
    networkApi
  });

  const nft = {
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
    publishedAt
  };

  return nft;
};

export const loadNFTThunk = createAsyncThunk<
  CreatedNFT,
  { id: string; isDraft?: boolean }
>('nfts/loadNFT', async ({ id, isDraft }, { getState, dispatch }) => {
  const state = getState() as RootState;
  const networkApi = getNetworkApi(state) as NetworkApi;

  const nft = await loadNFT({ id, isDraft, networkApi });

  dispatch(setNFT(nft));

  return nft;
});

export const saveNFTDataThunk = createAsyncThunk<void, SaveNFTDataPayload>(
  'nfts/saveNFTData',
  async ({ id, image, theme, navigate }, { dispatch, getState }) => {
    try {
      const state = getState() as RootState;
      const walletAddress = getWalletAddress(state);

      const imageHash = await uploadFile(image, id.toString());

      if (imageHash) {
        const dataFields = [
          { k: BigInt(NftField.imageHash), v: toHex(imageHash) }
        ];

        const encodedFunction = encodeFunction({
          abi: abis.NFTs.abi,
          functionName: 'setData',
          args: [BigInt(id), dataFields]
        });

        const encodedFunctionBuffer = hexToBytes(encodedFunction);

        const body = {
          k: 16,
          f: Buffer.from(AddressApi.parseTextAddress(walletAddress)),
          to: Buffer.from(AddressApi.parseTextAddress(abis.NFTs.address)),
          p: [],
          c: ['0x0', [Buffer.from(encodedFunctionBuffer)]]
        };

        const data = objectToString({
          sponsor: appEnvs.SPONSOR_CONTRACT_ADDRESS,
          returnUrl: window.location.href,
          body
        });

        const setDataRes = await signTxWithPopup({
          data,
          action: saveNFTDataThunk.typePrefix,
          description: i18n.t('saveNFT')
        });

        if (!setDataRes?.txId) throw new Error('!setDataRes?.txId');

        await new Promise((resolve) => setTimeout(resolve, 1500));

        const sluggedTheme = slugify(theme);

        await dispatch(loadNFTThunk({ id: id.toString(), isDraft: true }));

        navigate(`/${walletAddress}/draft/${id}_${sluggedTheme}`);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error);
      throw error;
    }
  }
);

export const editNFTThunk = createAsyncThunk<void, EditNFTPayload>(
  'nfts/editNFT',
  async (
    {
      id,
      language,
      theme,
      nameOfDAOSlug,
      category,
      description,
      image,
      walletAddress,
      navigate
    },
    { dispatch, getState }
  ) => {
    const state = getState() as RootState;
    const userWalletAddress = getWalletAddress(state);
    try {
      const imageHash = await uploadFile(image, id.toString());

      if (imageHash) {
        const dataFields = [
          { k: BigInt(NftField.language), v: toHex(language) },
          { k: BigInt(NftField.theme), v: toHex(theme) },
          {
            k: BigInt(NftField.nameOfDAOSlug),
            v: toHex(nameOfDAOSlug)
          },
          { k: BigInt(NftField.category), v: toHex(category) },
          { k: BigInt(NftField.description), v: toHex(description) },
          { k: BigInt(NftField.updatedAt), v: toHex(Date.now()) },
          { k: BigInt(NftField.imageHash), v: toHex(imageHash) }
        ];

        const encodedFunction = encodeFunction({
          abi: abis.NFTs.abi,
          functionName: 'setData',
          args: [BigInt(id), dataFields]
        });
        const encodedFunctionBuffer = hexToBytes(encodedFunction);

        const body = {
          k: 16,
          f: Buffer.from(AddressApi.parseTextAddress(userWalletAddress)),
          to: Buffer.from(AddressApi.parseTextAddress(abis.NFTs.address)),
          p: [],
          c: ['0x0', [Buffer.from(encodedFunctionBuffer)]]
        };

        const data = objectToString({
          sponsor: appEnvs.SPONSOR_CONTRACT_ADDRESS,
          returnUrl: window.location.href,
          body
        });

        const setDataRes = await signTxWithPopup({
          data,
          action: editNFTThunk.typePrefix,
          description: i18n.t('editNFT')
        });

        if (!setDataRes?.txId) throw new Error('!setDataRes?.txId');

        await new Promise((resolve) => setTimeout(resolve, 1500));

        const sluggedTheme = slugify(theme);

        await dispatch(loadNFTThunk({ id: id.toString(), isDraft: true }));

        navigate(`/${walletAddress}/draft/${id}_${sluggedTheme}`);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error);
      throw error;
    }
  }
);

export const approveOrRejectNFTThunk = createAsyncThunk<
  void,
  {
    id: number;
    isApproved: boolean;
  }
>(
  'nfts/approveOrRejectNFT',
  async ({ id, isApproved }, { dispatch, rejectWithValue, getState }) => {
    const state = getState() as RootState;
    const userWalletAddress = getWalletAddress(state);
    try {
      const encodedFunction = encodeFunction({
        abi: abis.NFTs.abi,
        functionName: 'setData',
        args: [
          BigInt(id),
          [
            isApproved
              ? { k: BigInt(NftField.isApproved), v: toHex('1') }
              : { k: BigInt(NftField.isRejected), v: toHex('1') }
          ]
        ]
      });

      const encodedFunctionBuffer = hexToBytes(encodedFunction);

      const body = {
        k: 16,
        f: Buffer.from(AddressApi.parseTextAddress(userWalletAddress)),
        to: Buffer.from(AddressApi.parseTextAddress(abis.NFTs.address)),
        p: [],
        c: ['0x0', [Buffer.from(encodedFunctionBuffer)]]
      };

      const data = objectToString({
        sponsor: appEnvs.SPONSOR_CONTRACT_ADDRESS,
        returnUrl: window.location.href,
        body
      });

      const setDataRes = await signTxWithPopup({
        data,
        action: approveOrRejectNFTThunk.typePrefix,
        description: isApproved ? i18n.t('rejectNFT') : i18n.t('acceptNFT')
      });

      if (!setDataRes?.txId) throw new Error('!setDataRes?.txId');

      toast.info(i18n.t(isApproved ? 'NFTApproved' : 'NFTRejected'));

      await dispatch(loadNFTThunk({ id: id.toString(), isDraft: true }));
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const publishNFTThunk = createAsyncThunk<void, { id: string }>(
  'nfts/publishNFT',
  async ({ id }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const networkApi = getNetworkApi(state)!;
      const walletAddress = getWalletAddress(state);

      const totalSupplyBigint = await networkApi.executeCall(
        {
          abi: abis.indexNFTs.abi,
          functionName: 'totalSupply',
          args: []
        },
        { address: abis.indexNFTs.address }
      );

      const [newId] = await networkApi.executeCall(
        {
          abi: abis.indexNFTs.abi,
          functionName: 'grep',
          args: [
            0n,
            [{ k: BigInt(NftField.originTokenId), v: toHex(id, { size: 32 }) }],
            1n,
            false
          ]
        },
        { address: abis.indexNFTs.address }
      );

      const mcalls = [];

      const encodedFunctionMint = encodeFunction({
        abi: abis.indexNFTs.abi,
        functionName: 'mint',
        args: [
          newId,
          AddressApi.textAddressToEvmAddress(abis.NFTs.address),
          BigInt(id),
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
            NftField.isRejected
          ].map(BigInt)
        ]
      });
      mcalls.push({
        to: AddressApi.textAddressToEvmAddress(abis.indexNFTs.address),
        data: encodedFunctionMint
      });

      if (!newId) {
        const encodedFunctionSetData = encodeFunction({
          abi: abis.NFTs.abi,
          functionName: 'setData',
          args: [
            BigInt(id),
            [
              {
                k: BigInt(NftField.publishedContractAddress),
                v: AddressApi.textAddressToEvmAddress(abis.NFTs.address)
              },
              {
                k: BigInt(NftField.publishedTokenId),
                v: toHex(totalSupplyBigint + 1n, { size: 32 })
              }
            ]
          ]
        });
        mcalls.push({
          to: AddressApi.textAddressToEvmAddress(abis.NFTs.address),
          data: encodedFunctionSetData
        });
      }

      const encodedFunction = encodeFunction({
        abi: abis.multiSend.abi,
        functionName: 'mcall',
        args: [mcalls]
      });

      const encodedFunctionBuffer = hexToBytes(encodedFunction);

      const body = {
        k: 16,
        f: Buffer.from(AddressApi.parseTextAddress(walletAddress)),
        to: Buffer.from(AddressApi.parseTextAddress(walletAddress)),
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

      const indexMintRes = await signTxWithPopup({
        data,
        action: publishNFTThunk.typePrefix,
        description: i18n.t('publishNFT')
      });
      if (!indexMintRes?.txId) throw new Error('!indexMintRes?.txId');

      toast.info(i18n.t('NFTPublished'));
    } catch (error: any) {
      console.error(`publishNFTSaga ${error}`);
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const loadNFTsThunk = createAsyncThunk<void, LoadNFTsPayload>(
  'nfts/loadNFTs',
  async (
    {
      page,
      pageSize,
      isReversed,
      category,
      nameOfDAOSlug,
      status,
      walletAddress,
      isDraft
    },
    { getState, dispatch }
  ) => {
    const state = getState() as RootState;
    const isModerator = getIsModerator(state);
    const loggedWalletAddress = getWalletAddress(state);
    const isLoadDraftNFTs =
      (isModerator || loggedWalletAddress === walletAddress) && isDraft;
    const NFTsAbi = isLoadDraftNFTs ? abis.NFTs.abi : abis.indexNFTs.abi;
    const NFTsAddress = isLoadDraftNFTs
      ? abis.NFTs.address
      : abis.indexNFTs.address;
    const networkApi = getNetworkApi(state) as NetworkApi;
    const filters = [];

    if (category !== 'all')
      filters.push({ k: BigInt(NftField.category), v: toHex(category) });

    if (nameOfDAOSlug && nameOfDAOSlug !== 'all') {
      filters.push({
        k: BigInt(NftField.nameOfDAOSlug),
        v: toHex(nameOfDAOSlug)
      });
    }

    if (status === 'approved')
      filters.push({ k: BigInt(NftField.isApproved), v: toHex('1') });

    if (status === 'notApproved')
      filters.push({ k: BigInt(NftField.isApproved), v: toHex('') });

    if (status === 'rejected')
      filters.push({ k: BigInt(NftField.isRejected), v: toHex('1') });
    if (walletAddress)
      filters.push({
        k: BigInt(NftField.walletAddress),
        v: toHex(walletAddress)
      });

    const estimateBigint = await networkApi?.executeCall(
      {
        abi: NFTsAbi,
        functionName: 'grep_estimate',
        args: [filters]
      },
      { address: NFTsAddress }
    );

    const estimate = Number(estimateBigint);
    let maxIdOrEstimateOrTotalSupply = estimate;

    if (!isLoadDraftNFTs) {
      const maxIdBigint = await networkApi?.executeCall(
        {
          abi: NFTsAbi,
          functionName: 'maxId',
          args: []
        },
        { address: NFTsAddress }
      );
      const maxId = Number(maxIdBigint);
      maxIdOrEstimateOrTotalSupply = maxId;
    } else if (isReversed) {
      const totalSupplyBigint = await networkApi?.executeCall(
        {
          abi: NFTsAbi,
          functionName: 'totalSupply',
          args: []
        },
        { address: NFTsAddress }
      );
      const totalSupply = Number(totalSupplyBigint);
      maxIdOrEstimateOrTotalSupply = totalSupply;
    }

    const start = isReversed
      ? maxIdOrEstimateOrTotalSupply - page * pageSize
      : page * pageSize + 1;
    const amount = pageSize;

    dispatch(setNFTsCount(estimate));

    const NFTsIds = await networkApi?.executeCall(
      {
        abi: NFTsAbi,
        functionName: 'grep',
        args: [BigInt(start), filters, BigInt(amount), isReversed]
      },
      { address: NFTsAddress }
    );

    const ids = compact(NFTsIds);

    const NFTs = await Promise.all(
      ids.map((idBigInt) =>
        loadNFT({
          id: idBigInt.toString(),
          isDraft: isLoadDraftNFTs,
          networkApi
        })
      )
    );

    dispatch(setNFTs(NFTs));
  }
);
