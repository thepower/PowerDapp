import { CreateBillResponse } from 'api/paygate';

export type UserLevel = {
  foundExpire: number;
  foundLevel: number;
  foundTokenId: number;
};

export type UserLevelResponse = {
  foundExpire: bigint;
  foundLevel: bigint;
  foundTokenId: bigint;
};

export type BillData = CreateBillResponse;

export type PayTariffPayload = {
  walletAddress: string;
  tariffId: number;
};
