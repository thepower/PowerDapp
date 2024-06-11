import { NetworkApi, WalletApi } from '@thepowereco/tssdk';
import {writeFileSync} from 'fs';

const chain = 1;

//register in chain number 1
let acc = await WalletApi.registerCertainChain(chain);
console.log('register data',acc);

//save account data to file
const networkApi = new NetworkApi(chain);
const walletApi = new WalletApi(networkApi);

let password='111';
let hint='three one';
const exportedData =  walletApi.getExportData(acc.wif, acc.address, password, hint);
writeFileSync(`power_wallet_${chain}_${acc.address}.pem`, exportedData);