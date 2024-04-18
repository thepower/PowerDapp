import { takeLatest } from 'typed-redux-saga';
import { manageSagaState } from 'common';

import {
  approveOrRejectNFTTrigger,
  editNFTTrigger,
  loadNFTTrigger,
  loadNFTsTrigger,
  mintNftTrigger,
  publishNFTTrigger,
  saveNFTDataTrigger,
} from '../slice/NFTsSlice';
import {
  approveOrRejectNFTSaga,
  editNFTSaga, loadNFTSaga, loadNFTsSaga, mintNftSaga, publishNFTSaga, saveNFTDataSaga,
} from './NFTs';

export default function* NFTsSaga() {
  yield* takeLatest(mintNftTrigger, manageSagaState(mintNftSaga));
  yield* takeLatest(saveNFTDataTrigger, manageSagaState(saveNFTDataSaga));

  yield* takeLatest(editNFTTrigger, manageSagaState(editNFTSaga));
  yield* takeLatest(approveOrRejectNFTTrigger, manageSagaState(approveOrRejectNFTSaga));
  yield* takeLatest(publishNFTTrigger, manageSagaState(publishNFTSaga));

  yield* takeLatest(loadNFTsTrigger, manageSagaState(loadNFTsSaga));
  yield* takeLatest(loadNFTTrigger, manageSagaState(loadNFTSaga));
}
