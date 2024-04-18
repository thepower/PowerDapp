import {
  createEntityAdapter, createSlice, createAction, PayloadAction,
} from '@reduxjs/toolkit';
import { MessageWithIDAndWalletAddress } from 'NFTs/types';
import { AddActionOnSuccessAndErrorType } from 'typings/common';

export const messagesAdapter = createEntityAdapter<MessageWithIDAndWalletAddress>({
  selectId: (NFT) => NFT.t,
  sortComparer: (a, b) => b.t - a.t,
});

interface MessagesState {
  list: ReturnType<typeof messagesAdapter.getInitialState>;
}

const initialState: MessagesState = {
  list: messagesAdapter.getInitialState(),
};

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setMessages: (state: MessagesState, { payload }: PayloadAction<MessageWithIDAndWalletAddress[]>) => {
      messagesAdapter.setAll(
        state.list,
        payload,
      );
    },
  },
});

export const postMessageTrigger = createAction<AddActionOnSuccessAndErrorType<{ NFTID: number; message: string }>>('postMessage');
export const loadMessagesTrigger = createAction<{ NFTID: number; }>('loadMessages');

export const {
  actions: { setMessages },
  reducer: messagesReducer,
} = messagesSlice;
