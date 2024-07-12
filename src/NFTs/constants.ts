import { TFunction } from 'i18next';
import { sortBy } from 'lodash';

export enum NftField {
  language = 1,
  theme = 2,
  category = 3,
  description = 4,
  walletAddress = 5,
  createdAt = 6,
  updatedAt = 7,
  imageHash = 8,
  isApproved = 11,
  isRejected = 12,
  nameOfDAOSlug = 13,
  publishedTokenId = 14,
  publishedContractAddress = 15,

  publishedAt = 4097,
  originContract = 4098,
  originTokenId = 4099
}

export const nftLanguagesForSelect = [
  { label: 'Русский', value: 'ru' },
  { label: 'English', value: 'en' }
];

export const nftCategories = ['category_1', 'category_2'] as const;

export const nftCategoriesForSelect = (t: TFunction) =>
  sortBy(
    nftCategories.map((category) => ({ label: t(category), value: category })),
    'label'
  );

export const userTariffLevelMap: { [key: number]: string } = {
  0: 'tariff1Title',
  1: 'tariff2Title',
  2: 'tariff3Title'
};
