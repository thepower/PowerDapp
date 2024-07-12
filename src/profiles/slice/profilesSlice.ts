import { createEntityAdapter, PayloadAction } from '@reduxjs/toolkit';
import { createAppSlice } from 'application/createAppSlice';
import { Profile } from 'profiles/types';

export const profilesAdapter = createEntityAdapter<Profile, string>({
  selectId: (profile) => profile.walletAddress
});

interface ProfilesState {
  items: ReturnType<typeof profilesAdapter.getInitialState>;
  userProfile?: Profile;
  profile?: Profile;
  profilesCount?: number;
  profileRoles: string[];
}

const initialState: ProfilesState = {
  items: profilesAdapter.getInitialState(),
  userProfile: undefined,
  profile: undefined,
  profilesCount: undefined,
  profileRoles: []
};

export const profilesSlice = createAppSlice({
  name: 'profiles',
  initialState,
  reducers: {
    setProfiles: (
      state: ProfilesState,
      { payload }: PayloadAction<Profile[]>
    ) => {
      profilesAdapter.setAll(state.items, payload);
    },
    setProfile: (state: ProfilesState, { payload }: PayloadAction<Profile>) => {
      state.profile = payload;
    },
    setUserProfile: (
      state: ProfilesState,
      { payload }: PayloadAction<Profile>
    ) => {
      state.userProfile = payload;
    },
    setProfilesCount: (
      state: ProfilesState,
      { payload }: PayloadAction<number>
    ) => {
      state.profilesCount = payload;
    },
    setProfilesRoles: (
      state: ProfilesState,
      { payload }: PayloadAction<string[]>
    ) => {
      state.profileRoles = payload;
    }
  }
});

export const {
  actions: {
    setProfiles,
    setUserProfile,
    setProfile,
    setProfilesCount,
    setProfilesRoles
  }
} = profilesSlice;
