import {
  NetworkApi,
  WalletApi,
  TransactionsApi,
  AddressApi,
} from '@thepowereco/tssdk';
import { readFileSync } from 'fs';

async function deployFile(
  binPath: string,
  abiPath: string,
  keyFile: string,
  initParams: any[],
) {
  // load ABI and binary code of smart-contract
  const abi = JSON.parse(readFileSync(abiPath, 'utf-8'));
  const code = readFileSync(binPath, 'utf-8');

  // load account data from file
  const networkApi = new NetworkApi(1);
  await networkApi.bootstrap();
  const importWalletApi = new WalletApi(networkApi);
  const password = '111';

  const importedData = readFileSync(keyFile, 'utf-8');
  const importedWallet = await importWalletApi.parseExportData(
    importedData.toString(),
    password,
  );
  console.log('import data', importedWallet);

  // load balance for account
  const accountData = await importWalletApi.loadBalance(importedWallet.address);
  console.log('accountData', accountData);

  const newInitParms = initParams.map((param) => (AddressApi.isTextAddressValid(param)
    ? AddressApi.textAddressToEvmAddress(param)
    : param));

  // deploy smart-contract
  const deployTX = TransactionsApi.composeDeployTX({
    address: importedWallet.address,
    code,
    initParams: newInitParms,
    gasToken: 'SK',
    gasValue: 2000000000,
    wif: importedWallet.wif,
    abi,
    feeSettings: networkApi.feeSettings,
    gasSettings: networkApi.gasSettings,
  });
  const resDeploy = await networkApi.sendPreparedTX(deployTX);
  console.log(resDeploy);
}

async function main() {
  //  get path to binary code and ABI of smart-contract

  if (process.argv.length === 3) {
    const script = JSON.parse(readFileSync(process.argv[2], 'utf-8'));
    for (const item of script) {
      console.log(item);
      if (!item.bin || !item.abi || !item.account) {
        console.error('Missing required property in script object');
        return;
      }
      await deployFile(item.bin, item.abi, item.account, item.params || []);
    }
  } else {
    const [binPath, abiPath, keyFile, ...initParams] = process.argv.slice(2);
    await deployFile(binPath, abiPath, keyFile, initParams);
  }
}

main();
