import {
  NetworkApi, LStoreApi, AddressApi,
} from '@thepowereco/tssdk';

// import appEnvs from 'appEnvs';
import { getNetworkApi } from 'application/selectors';
import { loadMessagesTrigger, postMessageTrigger, setMessages } from 'messages/slice/messagesSlice';
import {
  entries,
  omit,
} from 'lodash';
import { put, select } from 'typed-redux-saga';

import { toast } from 'react-toastify';
import i18n from 'locales/initLocales';
import { Message, MessageWithIDAndWalletAddress } from 'NFTs/types';
import abis from 'contractAbis';
import * as msgPack from '@thepowereco/msgpack';

import {
  objectToString,
  stringToObject,
} from 'sso/utils';
import { signTxWithPopup } from 'api/popup';
import appEnvs from 'appEnvs';
import { encodeFunction } from '@thepowereco/tssdk/dist/helpers/abi.helper';
import { toBeHex } from 'ethers';

const {
  getLStore,
} = LStoreApi;

function* getUserMessagesAndCount(NFTID: number) {
  const networkApi = (yield* select(getNetworkApi))!;
  try {
    const res: ArrayBuffer = yield getLStore(abis.chat.address, toBeHex(NFTID), '.mp?bin=raw', networkApi as NetworkApi);
    const resBuffer = Buffer.from(res);
    const decodedRes = msgPack.decode(resBuffer);
    const messagesWithoutCount = omit(decodedRes, 'count');
    const messages: MessageWithIDAndWalletAddress[] =
        entries(messagesWithoutCount).map(([key, value]) => {
          const walletAddress = AddressApi.encodeAddress(value.acc.slice(-8)).txt;
          const message: Message = stringToObject(new TextDecoder().decode(value.msg));
          return ({
            id: key === '' ? '\x00' : key,
            walletAddress,
            ...message,
          });
        });
    if (messages.length) return messages;
    return [];
  } catch (error) {
    console.error('getUserMessagesAndCount', error);
    toast.error(i18n.t('getUserMessagesAndCountError'));
    return null;
  }
}

export function* postMessageSaga({
  payload: {
    NFTID,
    message,
    additionalActionOnSuccess,
    additionalActionOnError,
  },
}: ReturnType<typeof postMessageTrigger>) {
  try {
    const encodedFunction = encodeFunction(
      'registerMessage',
      [
        BigInt(NFTID),
        objectToString({
          v: message,
          t: Date.now(),
        }),
      ],
      abis.chat.abi,
    );

    const encodedFunctionBuffer = Buffer.from(encodedFunction, 'hex');

    const body = {
      k: 16,
      to: Buffer.from(AddressApi.parseTextAddress(abis.chat.address)),
      p: [],
      c: ['0x0', [encodedFunctionBuffer]],
    };

    const data = objectToString({
      sponsor: appEnvs.SPONSOR_CONTRACT_ADDRESS,
      returnUrl: window.location.href,
      body,
    });

    const registerMessageRes = yield* signTxWithPopup({ data, action: postMessageTrigger.type, description: i18n.t('sendMessage') });

    if (!registerMessageRes.txId) {
      additionalActionOnError?.();
      return;
    }

    additionalActionOnSuccess?.();
  } catch (error: any) {
    console.error(error);
    toast.error(error);
    additionalActionOnError?.();
  }
}

export function* loadMessagesSaga({
  payload: {
    NFTID,
  },
}: ReturnType<typeof loadMessagesTrigger>) {
  try {
    const messages = yield* getUserMessagesAndCount(NFTID);
    if (messages) { yield put(setMessages(messages)); }
  } catch (error) {
    console.error('loadMessagesSaga', error);
  }
}
