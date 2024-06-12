import { NetworkApi, WalletApi } from '@thepowereco/tssdk';
import axios from 'axios';
import { writeFileSync } from 'fs';

const requestFunds = async (walletAddress: string, amount = 10) => {
  const url = `https://faucet.thepower.io/api/faucet/${walletAddress}`;
  const data = {
    amount,
  };

  try {
    const response = await axios.post(url, data);
    console.log('Response data:', response.data);
  } catch (error) {
    console.error('Error:', error);
  }
};

const chain = 1;

async function main() {
  // register in chain number 1
  const acc = await WalletApi.registerCertainChain({ chain });

  await requestFunds(acc.address);
  console.log('register data', acc);

  // save account data to file
  const networkApi = new NetworkApi(chain);
  await networkApi.bootstrap();
  const walletApi = new WalletApi(networkApi);

  const balance = walletApi.loadBalance(acc.address);
  console.log('balance', balance);

  const password = '111';
  const hint = 'three one';
  const exportedData = walletApi.getExportData(acc.wif, acc.address, password, hint);
  writeFileSync(`utils/power_wallet_${acc.chain}_${acc.address}.pem`, exportedData);
}

main();
