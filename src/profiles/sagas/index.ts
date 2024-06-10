import { takeLatest } from 'typed-redux-saga';
import { manageSagaState } from 'common';

import {
  createOrEditProfileTrigger,
  grantRoleTrigger,
  loadProfileTrigger,
  loadProfilesTrigger,
  loadUserProfileTrigger,
  revokeRoleTrigger,
} from '../slice/profilesSlice';
import {
  createOrEditProfileSaga, loadProfileSaga, loadProfilesSaga, loadUserProfileSaga,
} from './profiles';
import { grantRoleSaga, revokeRoleSaga } from './roles';

export default function* profilesSaga() {
  yield* takeLatest(createOrEditProfileTrigger, manageSagaState(createOrEditProfileSaga));
  yield* takeLatest(loadProfilesTrigger, manageSagaState(loadProfilesSaga));
  yield* takeLatest(loadProfileTrigger, manageSagaState(loadProfileSaga));
  yield* takeLatest(loadUserProfileTrigger, manageSagaState(loadUserProfileSaga));

  yield* takeLatest(grantRoleTrigger, manageSagaState(grantRoleSaga));
  yield* takeLatest(revokeRoleTrigger, manageSagaState(revokeRoleSaga));
}
