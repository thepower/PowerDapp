import { NetworkEnum } from '@thepowereco/tssdk';

export const CURRENT_NETWORK = NetworkEnum.testnet;

export const parseHash = () =>
  window.location.hash
    ?.substr(1)
    .split('&')
    .map((item) => item.split('='));

export const sliceString = (string: string, startEnd = 5) => {
  if (!string) return '';
  return `${string.slice(0, startEnd)}...${string.slice(-startEnd)}`;
};
