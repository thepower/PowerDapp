import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'application/store';
import { UserRole } from 'profiles/constants';

const getProfileState = (state: RootState) => state.profiles;

export const getIsRegistered = createSelector(
  getProfileState,
  (profiles) => profiles.profileRoles.includes(UserRole.REGISTERED),
);

export const getIsModerator = createSelector(
  getProfileState,
  (profiles) => profiles.profileRoles.includes(UserRole.VERIFIER_ROLE) &&
                profiles.profileRoles.includes(UserRole.EDITOR_ROLE),
);

export const getIsGeneralEditor = createSelector(
  getProfileState,
  (profiles) => profiles.profileRoles.includes(UserRole.GEDITOR_ROLE),
);

export const getIsVerified = createSelector(
  getProfileState,
  (profiles) => profiles.profileRoles.includes(UserRole.VERIFIED_USER),
);

export const getIsCanEditProfile = createSelector(
  getProfileState,
  (profiles) => profiles.profileRoles.includes(UserRole.REGISTERED) &&
            !profiles.profileRoles.includes(UserRole.VERIFIED_USER),
);
