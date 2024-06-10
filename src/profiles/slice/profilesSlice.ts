import {
  createSlice, createAction, createEntityAdapter, PayloadAction,
} from '@reduxjs/toolkit';
import {

  CreateProfilePayload, GrantRolePayload, LoadProfilesPayload, Profile, RevokeRolePayload,
} from 'profiles/types';
import { AddActionOnSuccessAndErrorType } from 'typings/common';

export const profilesAdapter = createEntityAdapter<Profile>({
  selectId: (profile) => profile.walletAddress,
});

interface ProfilesState {
  items: ReturnType<typeof profilesAdapter.getInitialState>;
  userProfile?: Profile
  profile?: Profile
  profilesCount?: number;
  profileRoles: string[]
}

const initialState: ProfilesState = {
  items: profilesAdapter.getInitialState(),
  userProfile: undefined,
  profile: undefined,
  profilesCount: undefined,
  profileRoles: [],
};

const profilesSlice = createSlice({
  name: 'profiles',
  initialState,
  reducers: {
    setProfiles: (state: ProfilesState, { payload }: PayloadAction<Profile[]>) => {
      profilesAdapter.setAll(
        state.items,
        payload,
      );
    },
    setProfile: (state: ProfilesState, { payload }: PayloadAction<Profile>) => {
      state.profile = payload;
    },
    setUserProfile: (state: ProfilesState, { payload }: PayloadAction<Profile>) => {
      state.userProfile = payload;
    },
    setProfilesCount: (state: ProfilesState, { payload }: PayloadAction<number>) => {
      state.profilesCount = payload;
    },
    setProfilesRoles: (state: ProfilesState, { payload }: PayloadAction<string[]>) => {
      state.profileRoles = payload;
    },
  },
});

export const createOrEditProfileTrigger = createAction<CreateProfilePayload>('createProfile');
export const loadProfilesTrigger = createAction<LoadProfilesPayload>('loadProfiles');
export const loadProfileTrigger = createAction<string>('loadProfile');
export const loadUserProfileTrigger = createAction<string>('loadUserProfile');

export const grantRoleTrigger = createAction<AddActionOnSuccessAndErrorType<GrantRolePayload>>('grantRole');
export const revokeRoleTrigger = createAction<AddActionOnSuccessAndErrorType<RevokeRolePayload>>('revokeRole');

export const {
  actions: {
    setProfiles,
    setUserProfile,
    setProfile,
    setProfilesCount,
    setProfilesRoles,
  },
  reducer: profilesReducer,
} = profilesSlice;
