import { RootState } from '../../application/store';

export const getPopupData = (state: RootState) => state.walletSign.data;
