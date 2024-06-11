import { NetworkApi, WalletApi } from '@thepowereco/tssdk';
import { writeFileSync } from 'fs';

const chain = 1;

async function main() {
  // register in chain number 1
  const acc = await WalletApi.registerCertainChain({ chain });
  console.log('register data', acc);

  // save account data to file
  const networkApi = new NetworkApi(chain);
  const walletApi = new WalletApi(networkApi);

  const password = '111';
  const hint = 'three one';
  const exportedData = walletApi.getExportData(acc.wif, acc.address, password, hint);
  writeFileSync(`utils/power_wallet_${acc.chain}_${acc.address}.pem`, exportedData);
}

main();
