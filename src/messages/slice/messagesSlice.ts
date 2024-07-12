import { createEntityAdapter, PayloadAction } from '@reduxjs/toolkit';
import { createAppSlice } from 'application/createAppSlice';
import { MessageWithIDAndWalletAddress } from 'NFTs/types';

export const messagesAdapter =
  createEntityAdapter<MessageWithIDAndWalletAddress>({
    sortComparer: (a, b) => b.t - a.t
  });

interface MessagesState {
  list: ReturnType<typeof messagesAdapter.getInitialState>;
}

const initialState: MessagesState = {
  list: messagesAdapter.getInitialState()
};

export const messagesSlice = createAppSlice({
  name: 'messages',
  initialState,
  reducers: {
    setMessages: (
      state: MessagesState,
      { payload }: PayloadAction<MessageWithIDAndWalletAddress[]>
    ) => {
      messagesAdapter.setAll(state.list, payload);
    }
  }
});

export const { setMessages } = messagesSlice.actions;
