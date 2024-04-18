import { takeLatest } from 'typed-redux-saga';
import { manageSagaState } from 'common';

import { loadMessagesTrigger, postMessageTrigger } from 'messages/slice/messagesSlice';
import { loadMessagesSaga, postMessageSaga } from './messages';

export default function* NFTsSaga() {
  yield* takeLatest(postMessageTrigger, manageSagaState(postMessageSaga));
  yield* takeLatest(loadMessagesTrigger, manageSagaState(loadMessagesSaga));
}
