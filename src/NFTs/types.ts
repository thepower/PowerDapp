import { NavigateFunction } from 'react-router-dom';

export interface NFT {
  id: number;
  language: string;
  theme: string;
  nameOfDAOSlug: string;
  category: string;
  description: string;
  image: File;
}

export interface CreatedNFT extends Omit<NFT, 'image'> {
  firstName: string;
  lastName: string;

  imageHash: string;
  walletAddress: string;
  createdAt: number;
  updatedAt: number;
  publishedAt?: number;
  isApproved?: boolean;
  isRejected?: boolean;
  publishedTokenId?: number;
  originTokenId?: number;
}

export type MintNftPayload = Omit<NFT, 'id' | 'image'>;
export type SaveNFTDataPayload = Omit<
  NFT,
  'language' | 'category' | 'description' | 'goalAmount' | 'nameOfDAOSlug'
> & { navigate: NavigateFunction };

export type EditNFTPayload = NFT & {
  walletAddress?: string;
  navigate: NavigateFunction;
};

export type LoadNFTsPayload = {
  walletAddress?: string;
  page: number;
  pageSize: number;
  isReversed: boolean;
  status: string;
  category: string;
  nameOfDAOSlug?: string;
  isDraft?: boolean;
};

export type FilterModerationStatus =
  | 'all'
  | 'approved'
  | 'notApproved'
  | 'rejected';
export type FilterNFTStatus = 'draft' | 'published';
export type FilterCategory = 'all' | string;
export type FilterNameOfDAO = 'all' | string;

export type Message = {
  v: string;
  t: number;
};

export type MessageWithWalletAddress = Message & {
  walletAddress: string;
};

export type MessageWithIDAndWalletAddress = MessageWithWalletAddress & {
  id: string;
};

export type MintTxResponse = {
  txId: string;
  res: string;
  block: string;
  retval: number;
};
