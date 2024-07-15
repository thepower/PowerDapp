import { NavigateFunction } from 'react-router-dom';
import { UserRole } from './constants';

export type CreateProfilePayload = {
  firstName: string;
  lastName: string;
  email: string;
  photo: File;
  editedWalletAddress?: string;
  navigate: NavigateFunction;
};

export type Profile = Omit<CreateProfilePayload, 'photo' | 'navigate'> & {
  walletAddress: string;
  photoHash: string;
  createdAt: number;
  updatedAt: number;
};
export type LoadProfilePayload = {
  walletAddressOrId: string | number;
  isSetProfile?: boolean;
};

export type LoadProfilesPayload = {
  page: number;
  pageSize: number;
  isReversed: boolean;
  status: ProfileFilterStatus;
};

export type GrantRolePayload = {
  role: UserRole;
  walletAddress: string;
};

export type RevokeRolePayload = {
  role: UserRole;
  walletAddress: string;
};

export type ProfileFilterStatus = 'all' | 'LOCKED' | 'VERIFIED' | 'REGISTERED';
