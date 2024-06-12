
# Power Dapp - Boilerplate for Building Web3 Applications

Welcome to the repository of Power Dapp for building web3 application. This project is designed to provide developers with a robust framework for quickly scaffold and build decentralized applications (dApps) that interact with blockchain technologies, specifically focusing on features like managing NFTs, handling digital wallets, and integrating with DeInfra Network.

## Features

- **NFT Management**: Create and manage NFT posts seamlessly.
- **Account Management**: Register and manage user accounts with profile settings.
- **Blockchain Interaction**: Utilize built-in smart contract interactions through predefined ABIs.
- **Multi-Language Support**: Ready-to-use internationalization setup for global app deployment.
- **Authentication**: Support for traditional and Single Sign-On (SSO) authentication methods.
- **Dynamic Routing**: Efficient navigation setup across different components of the application.
- **Notification System**: Integrated user notification system.
- **Asset Management**: Manage and showcase digital assets owned by users.

## Getting Started

### Prerequisites

- Node.js (v18.x or later)
- Yarn or npm
- tpe cli

### Installation

1. Clone the repository:

```bash
git clone https://github.com/thepower/PowerDapp
cd PowerDapp
```

2. Install dependencies:

```bash
yarn install
# or
npm install
```

3. Set up environment variables:

   Copy `.env.example` to `.env` and adjust the settings to match your development environment.

4. Install the TPE CLI, run the following command:

```bash
yarn add @thepowereco/cli
## or
npm i -g @thepowereco/cli
```

5. Start the development server:

```bash
yarn start
# or
npm start
```

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### Faucet

To get some SK tokens for testing, you can use the faucet at

```bash
https://faucet.thepower.io/
```

Use 1 chain of devnet for testing with free tokens. 

### Frontend Build

```bash
yarn build
# or
npm run build
```

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

### Deploy Frontend

To deploy the frontend to the Power DCloud storage, run the following command:

Register an account with tpe:

```bash
tpe register
```

Select the devnet option and make a note of the provided information, as it will be needed later. Here is the example:

```bash
✔ Please, select the network: · devnet
Loading... done
Network: devnet
Chain number: 1
Account address: AA100000001677740890
Account seed phrase: peanut shadow approve put grain outdoor hand program angry tiger cry diary
Account wif: L2NzLJEtduehhwxT7cidd13tNDmsnZn9neoYa9wRg9W89gDcdeVu
To replenish the balance of your account please visit: https://faucet.thepower.io
```

Go to the folder one level above the folder you want to upload. For example, if you want to upload the `/home/app` folder, navigate to the `/home` folder.

```bash
tpe upload ./build
```

and specify the folder you want to upload, for example ./app.

Enter the address and wif from step 3. The files will be uploaded.

After the files are uploaded, the location where they will be stored will be indicated.

### Smart Contracts

The Power DCloud Web3 Application comes with a set of predefined smart contracts that can be used to interact with the blockchain. These contracts are located in the `contracts` directory and can be deployed to the blockchain using the provided scripts.

To deploy the smart contracts to the blockchain, follow these steps:

### Smart contracts compilation

Compile all contracts using the following command

   ```bash
   yarn buildsc
   ## or
   npm buildsc
   ```

Compile the single contract using the following command:

   ```bash
   yarn solcjs contracts/filename.sol -o build --bin --optimize --abi
   ## or
   npm solcjs contracts/filename.sol -o build --bin --optimize --abi
   ```

### Smart contracts deploy

Fill the `utils/test.json` file with the following information:

```json
   "account": "wallet.pem",
   "bin": "buildsc/contract_name.bin",
   "abi": "buildsc/contract_name.abi",
   "params": [
      "address_of_profiles_contract",
      "role_hash"
   ]
```

Deploy the contract using the following command:

```bash
yarn deploy ./utils/deploy-config.json
## or 
npm deploy ./utils/deploy-config.json
```

## Documentation

For detailed documentation on each module and its functionalities, refer to the individual README files within each directory (`src/*`). These documents provide insights into the specific responsibilities and usage of each component.

## Contributing

We welcome contributions from the community! If you'd like to contribute to the Power DCloud Web3 Application, please:

   1. Fork the repository.
   2. Create your feature branch (git checkout -b feature/AmazingFeature).
   3. Commit your changes (git commit -m 'Add some AmazingFeature').
   4. Push to the branch (git push origin feature/AmazingFeature).
   5. Open a pull request.

## Support

For support, contact [support@thepower.io](mailto:support@thepower.io) or open an issue in this repository.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.