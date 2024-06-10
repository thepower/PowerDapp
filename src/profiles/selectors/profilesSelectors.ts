import { createSelector } from '@reduxjs/toolkit';
import { profilesAdapter } from 'profiles/slice/profilesSlice';
import { RootState } from '../../application/store';

const getProfileState = (state: RootState) => state.profiles;

const { selectAll, selectById } = profilesAdapter.getSelectors((state: RootState) => state.profiles.items);

export const getProfiles = createSelector(selectAll, (profiles) => profiles);

export const getProfilesCount = createSelector(
  getProfileState,
  (profiles) => profiles.profilesCount,
);

export const getProfileById = createSelector(selectById, (profile) => profile);

export const getProfile = createSelector(getProfileState, (state) => state.profile);
export const getUserProfile = createSelector(getProfileState, (state) => state.userProfile);
