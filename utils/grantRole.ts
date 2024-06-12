import {
  NetworkApi,
  WalletApi,
  EvmCore,
  EvmContract,
  AddressApi,
} from '@thepowereco/tssdk';
import { keccak256 } from 'ethereum-cryptography/keccak';
import contractAbis from 'contractAbis';
import { readFileSync } from 'fs';
import { UserRole } from 'profiles/constants';
import { bytesToHex, stringToBytes } from 'viem';

const getRoles = async (walletAddress: string, sc: EvmContract) => {
  const roles = [
    UserRole.ACC_ADMIN_ROLE,
    UserRole.ACC_ROLE,
    UserRole.EDITOR_ADMIN_ROLE,
    UserRole.EDITOR_ROLE,
    UserRole.GEDITOR_ADMIN_ROLE,
    UserRole.GEDITOR_ROLE,
    UserRole.REGISTERED,
    UserRole.ROOT_ADMIN_ROLE,
    UserRole.USEREDIT_ROLE,
    UserRole.VERIFIED_USER,
    UserRole.VERIFIER_ADMIN_ROLE,
    UserRole.VERIFIER_ROLE,
    UserRole.LOCKED_USER,
  ];

  const [
    ACC_ADMIN_ROLE,
    ACC_ROLE,
    EDITOR_ADMIN_ROLE,
    EDITOR_ROLE,
    GEDITOR_ADMIN_ROLE,
    GEDITOR_ROLE,
    REGISTERED,
    ROOT_ADMIN_ROLE,
    USEREDIT_ROLE,
    VERIFIED_USER,
    VERIFIER_ADMIN_ROLE,
    VERIFIER_ROLE,
    LOCKED_USER,
  ] = await sc.scGet('hasRoles', [
    roles,
    AddressApi.textAddressToEvmAddress(walletAddress),
  ]);

  console.log({
    ACC_ADMIN_ROLE,
    ACC_ROLE,
    EDITOR_ADMIN_ROLE,
    EDITOR_ROLE,
    GEDITOR_ADMIN_ROLE,
    GEDITOR_ROLE,
    REGISTERED,
    ROOT_ADMIN_ROLE,
    USEREDIT_ROLE,
    VERIFIED_USER,
    VERIFIER_ADMIN_ROLE,
    VERIFIER_ROLE,
    LOCKED_USER,
  });
};

async function main() {
  const args = process.argv.slice(2);
  const importedWalletPath = args?.[0];
  const walletAddress = args?.[1];
  const role = args?.[2];

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

  const accountData = await importWalletApi.loadBalance(importedWallet.address);
  console.log('accountData', accountData);

  // call function from smart-contract locale
  const EVM = await EvmCore.build(importNetworkApi);
  const sc = await EvmContract.build(
    EVM,
    importedWallet.address,
    contractAbis.profiles.abi,
  );

  await getRoles(walletAddress, sc);

  if (role) {
    const roleKeccakHex = bytesToHex(keccak256(stringToBytes(role)));
    // call function from smart-contract in blockchain
    const resSet = await sc.scSet(importedWallet, 'grantRole', [
      roleKeccakHex,
      AddressApi.textAddressToEvmAddress(walletAddress),
    ]);
    console.log(resSet);
    await getRoles(walletAddress, sc);
  }
}
main();
