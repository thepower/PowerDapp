import { NetworkApi, WalletApi, TransactionsApi, AddressApi } from '@thepowereco/tssdk';
import {readFileSync} from 'fs';

async function main() {
  //  get path to binary code and ABI of smart-contract

  if(process.argv.length == 3 ) {
    const script = JSON.parse(readFileSync(process.argv[2], 'utf-8'));
    for (let i=0;i<script.length;i++) {
      console.log(script[i]);
        if (!script[i].bin || !script[i].abi || !script[i].account) {
          console.error('Missing required property in script object');
          return;
      }
      await deployFile(script[i].bin, script[i].abi, script[i].account, script[i]?.params||[]);
    }
  } else {
      const [binPath, abiPath, keyFile, ...initParams] = process.argv.slice(2);
      await deployFile(binPath, abiPath, keyFile, initParams);
  }
}

main();

async function deployFile(binPath, abiPath, keyFile, initParams) {
  // load ABI and binary code of smart-contract
  const abi = JSON.parse(readFileSync(abiPath, 'utf-8'));
  const code = readFileSync(binPath, 'utf-8');

  //load account data from file
  const networkApi = new NetworkApi(1);
  await networkApi.bootstrap();
  const importWalletApi = new WalletApi(networkApi);
  let password = "111";
  
  const importedData = readFileSync(keyFile, "utf-8");
  const importedWallet = await importWalletApi.parseExportData(
    importedData.toString(),
    password
  );
  console.log("import data", importedWallet);

  //load balance for account
  const walletApi = new WalletApi(networkApi);
  const accountData = await walletApi.loadBalance(importedWallet.address);
  console.log("accountData", accountData);


  const newInitParms = initParams.map(param => AddressApi.isTextAddressValid(param) ? AddressApi.textAddressToEvmAddress(param) : param)

  // deploy smart-contract
  let deployTX = TransactionsApi.composeDeployTX({
    address: importedWallet.address,
    code: code,
    initParams: newInitParms,
    gasToken: "SK",
    gasValue: 2000000000,
    wif: importedWallet.wif,
    vm: "evm",
    abi: abi,
    feeSettings: networkApi.feeSettings,
    gasSettings: networkApi.gasSettings,
  });
  let resDeploy = await networkApi.sendPreparedTX(deployTX);
  console.log(resDeploy);

}