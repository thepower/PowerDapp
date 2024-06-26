import { createSelector } from '@reduxjs/toolkit';
import { messagesAdapter } from 'messages/slice/messagesSlice';
import { RootState } from '../../application/store';

const { selectAll } = messagesAdapter.getSelectors((state: RootState) => state.messages.list);

export const getMessages = createSelector(selectAll, (list) => list);
