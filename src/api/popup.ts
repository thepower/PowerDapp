import appEnvs from 'appEnvs';
import { stringToObject } from 'sso/utils';
import { put } from 'typed-redux-saga';
import { setPopupData } from 'walletSign/slices/walletSign';

export function* sighTxWithPopup<T>({
  data,
  action,
  description,
}: {
  data: string;
  action: string;
  description?: string;
}) {
  yield put(setPopupData({ requestUrlData: data, description, action }));

  const handler = (
    ev: MessageEvent<any>,
    resolve?: (value: any) => void,
    reject?: (value: any) => void,
  ) => {
    if (ev.origin !== appEnvs.WALLET_THEPOWER_URL) return;
    const message = stringToObject(ev.data);
    if (
      message?.type === 'signAndSendMessageResponse' &&
      message?.data?.res === 'ok'
    ) {
      resolve?.(message?.data);
    }

    if (message?.type === 'signAndSendMessageError') {
      reject?.(message?.data);
    }
  };

  const promise = new Promise((resolve, reject) => {
    window.addEventListener('message', (ev) => handler(ev, resolve, reject));
  });

  const response: { txId: string } & T = yield promise;

  window.removeEventListener('message', handler);

  if (!response.txId) throw new Error('No tx id');

  return response;
}
