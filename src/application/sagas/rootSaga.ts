import { spawn, all, call } from 'typed-redux-saga';
import NFTsSaga from 'NFTs/sagas';
import assetsSaga from 'myAssets/sagas';
import profilesSaga from 'profiles/sagas';
import tariffsSaga from 'tariffs/sagas';
import accountSaga from '../../account/sagas';
import messagesSaga from '../../messages/sagas';

import applicationSaga from '.';

export default function* rootSaga() {
  const sagas = [
    applicationSaga,
    accountSaga,
    NFTsSaga,
    assetsSaga,
    profilesSaga,
    messagesSaga,
    tariffsSaga,
  ];

  yield* all(
    sagas.map((saga) => spawn(function* () {
      while (true) {
        try {
          yield* call(saga);
          break;
        } catch (err) {
          console.error(err);
        }
      }
    })),
  );
}
