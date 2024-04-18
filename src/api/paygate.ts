import appEnvs from 'appEnvs';
import axios, { AxiosResponse } from 'axios';

export type CreateBillResponse = {
  user: number,
  bill: number,
  level: number,
  outsum: number,
  duration: number,
  url: string
};

export function* createBill({ userId, tariffLevel }: { userId: number, tariffLevel: number }) {
  try {
    const res: AxiosResponse<CreateBillResponse> =
      yield axios.post(`${appEnvs.PAYGATE_API_URL}/rk`, { user: userId, level: tariffLevel });

    return res.data;
  } catch (error: any) {
    const jsonError = error?.toJSON();

    console.error(jsonError);
    return null;
  }
}
