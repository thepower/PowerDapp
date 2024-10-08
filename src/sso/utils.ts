import { msgPackEncoder } from '@thepowereco/tssdk';

export const objectToString = (data: object) =>
  Buffer.from(msgPackEncoder.encode(data)).toString('hex');
export const stringToObject = (data: string) =>
  msgPackEncoder.decode(Buffer.from(data, 'hex'));
