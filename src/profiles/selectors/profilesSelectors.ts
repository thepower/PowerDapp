import { createSelector } from '@reduxjs/toolkit';
import { profilesAdapter } from 'profiles/slice/profilesSlice';
import { RootState } from '../../application/store';

const getProfileState = (state: RootState) => state.profiles;

const { selectAll, selectById } = profilesAdapter.getSelectors(
  (state: RootState) => state.profiles.items
);

export const getProfiles = selectAll;

export const getProfilesCount = createSelector(
  getProfileState,
  (profiles) => profiles.profilesCount
);

export const getProfileById = selectById;

export const getProfile = createSelector(
  getProfileState,
  (state) => state.profile
);
export const getUserProfile = createSelector(
  getProfileState,
  (state) => state.userProfile
);
