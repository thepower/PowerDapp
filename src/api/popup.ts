import appEnvs from 'appEnvs';
import { store } from 'application/store';
import { stringToObject } from 'sso/utils';
import { setPopupData } from 'walletSign/slices/walletSign';

export async function signTxWithPopup<T>({
  data,
  action,
  description
}: {
  data: string;
  action: string;
  description?: string;
}) {
  store.dispatch(setPopupData({ requestUrlData: data, description, action }));

  const handler = (
    ev: MessageEvent<any>,
    resolve?: (value: any) => void,
    reject?: (value: any) => void
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

  const response = await promise;

  const typedResponse = response as { txId: string } & T;

  window.removeEventListener('message', handler);

  if (!typedResponse.txId) throw new Error('No tx id');

  return typedResponse;
}

export async function authenticateWithPopup<T = any>() {
  const handler = (
    ev: MessageEvent<any>,
    resolve?: (value: any) => void,
    reject?: (value: any) => void
  ) => {
    if (ev.origin !== appEnvs.WALLET_THEPOWER_URL) return;

    const message = stringToObject(ev.data);
    if (message?.type === 'authenticateResponse') {
      resolve?.(message?.data);
    }

    if (message?.type === 'authenticateError') {
      reject?.(message?.data);
    }
  };

  const promise = new Promise((resolve, reject) => {
    window.addEventListener('message', (ev) => handler(ev, resolve, reject));
  });

  const response = await promise;

  window.removeEventListener('message', handler);

  return response as T;
}
