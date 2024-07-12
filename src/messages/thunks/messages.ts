import { createAsyncThunk } from '@reduxjs/toolkit';
import * as msgPack from '@thepowereco/msgpack';
import { NetworkApi, LStoreApi, AddressApi } from '@thepowereco/tssdk';

import { encodeFunction } from '@thepowereco/tssdk/dist/helpers/abi.helper';
import { toBeHex } from 'ethers';
import { entries, omit } from 'lodash';
import { signTxWithPopup } from 'api/popup';
import appEnvs from 'appEnvs';
import { getNetworkApi } from 'application/selectors';
import { RootState } from 'application/store';
import abis from 'contractAbis';
import i18n from 'locales/initLocales';
import { setMessages } from 'messages/slice/messagesSlice';

import { objectToString, stringToObject } from 'sso/utils';
import { AddActionOnSuccessAndErrorType } from 'typings/common';

const { getLStore } = LStoreApi;

export const getUserMessagesAndCount = createAsyncThunk(
  'chat/getUserMessagesAndCount',
  async (NFTID: number, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const networkApi = getNetworkApi(state)! as NetworkApi; // Assuming you have a way to get networkApi from state

    try {
      const res: ArrayBuffer = await getLStore(
        abis.chat.address,
        toBeHex(NFTID),
        '.mp?bin=raw',
        networkApi
      );
      const resBuffer = Buffer.from(res);
      const decodedRes = msgPack.decode(resBuffer);
      const messagesWithoutCount = omit(decodedRes, 'count');
      const messages = entries(messagesWithoutCount).map(([key, value]) => {
        const walletAddress = AddressApi.encodeAddress(value.acc.slice(-8)).txt;
        const message = stringToObject(new TextDecoder().decode(value.msg));
        return {
          id: key === '' ? '\x00' : key,
          walletAddress,
          ...message
        };
      });
      return messages.length ? messages : [];
    } catch (error) {
      console.error('getUserMessagesAndCount', error);
      return rejectWithValue('getUserMessagesAndCountError');
    }
  }
);

export const postMessage = createAsyncThunk<
  void,
  AddActionOnSuccessAndErrorType<{ NFTID: number; message: string }>
>(
  'chat/postMessage',
  async (
    { NFTID, message, additionalActionOnSuccess },
    { rejectWithValue }
  ) => {
    try {
      const encodedFunction = encodeFunction(
        'registerMessage',
        [
          BigInt(NFTID),
          objectToString({
            v: message,
            t: Date.now()
          })
        ],
        abis.chat.abi
      );

      const encodedFunctionBuffer = Buffer.from(encodedFunction, 'hex');

      const body = {
        k: 16,
        to: Buffer.from(AddressApi.parseTextAddress(abis.chat.address)),
        p: [],
        c: ['0x0', [encodedFunctionBuffer]]
      };

      const data = objectToString({
        sponsor: appEnvs.SPONSOR_CONTRACT_ADDRESS,
        returnUrl: window.location.href,
        body
      });

      const registerMessageRes = await signTxWithPopup({
        data,
        action: postMessage.typePrefix,
        description: i18n.t('sendMessage')
      });

      if (!registerMessageRes.txId) {
        return rejectWithValue('Failed to post message');
      }

      additionalActionOnSuccess?.();
    } catch (error) {
      console.error('postMessage', error);
      return rejectWithValue('Failed to post message');
    }
  }
);

export const loadMessages = createAsyncThunk<void, number>(
  'chat/loadMessages',
  async (NFTID, { dispatch, rejectWithValue }) => {
    try {
      const messages = await dispatch(getUserMessagesAndCount(NFTID)).unwrap();
      if (messages) {
        dispatch(setMessages(messages));
      }
    } catch (error) {
      return rejectWithValue('loadMessagesError');
    }
  }
);
