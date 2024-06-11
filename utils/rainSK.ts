import { NetworkApi, WalletApi } from '@thepowereco/tssdk';
import { readFileSync, readdirSync, lstatSync } from 'fs';
import path from 'path';

async function main() {
  const importedWalletPath = process.argv.slice(2)?.[0];

  // load account data from file
  const importNetworkApi = new NetworkApi(1);
  await importNetworkApi.bootstrap();
  const importWalletApi = new WalletApi(importNetworkApi);
  const password = '111';
  const importedData = readFileSync(importedWalletPath || 'example.pem');
  const importedWallet = await importWalletApi.parseExportData(
    importedData.toString(),
    password,
  );
  console.log('import data', importedWallet);

  // load balance for account

  const accountData = await importWalletApi.loadBalance(importedWallet.address);
  console.log('accountData', accountData);

  const files = readdirSync('utils');
  for (const file of files) {
    const filePath = path.join('utils', file);
    if (lstatSync(filePath).isFile() && filePath.endsWith('.pem')) {
      const walletData = readFileSync(filePath);

      const wallet = await importWalletApi.parseExportData(
        walletData.toString(),
        password,
      );

      // send 10 tokens to another account
      const to = wallet.address;
      const amount = 10;

      if (to !== importedWallet.address) {
        const res = await importWalletApi.makeNewTx(
          importedWallet.wif,
          importedWallet.address,
          to,
          'SK',
          amount,
          '',
        );
        console.log(res);
      }
    }
  }
}

main();
