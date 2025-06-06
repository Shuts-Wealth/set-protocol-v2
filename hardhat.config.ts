require("dotenv").config();
require("hardhat-contract-sizer");

import chalk from "chalk";
import { HardhatUserConfig } from "hardhat/config";
import { privateKeys } from "./utils/wallets";

import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "solidity-coverage";
import "./tasks";
import "@nomicfoundation/hardhat-verify";

const forkingConfig = {
  url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_TOKEN}`,
  blockNumber: 14792479,
};

const mochaConfig = {
  grep: "@forked-mainnet",
  invert: (process.env.FORK) ? false : true,
  timeout: (process.env.FORK) ? 100000 : 40000,
} as Mocha.MochaOptions;

checkForkedProviderEnvironment();

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.6.10",
        settings: { optimizer: { enabled: true, runs: 200 } },
      },
      {
        version: "0.8.11",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: false,
      forking: (process.env.FORK) ? forkingConfig : undefined,
      accounts: getHardhatPrivateKeys(),
      // gas: 12000000,
      blockGasLimit: 12000000
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      forking: (process.env.FORK) ? forkingConfig : undefined,
      timeout: 200000,
      gas: 12000000,
      blockGasLimit: 12000000
    },
    polygon: {
      url: "https://polygon-rpc.com",
      accounts: ["b5d622d6d55a13dbe1937c3f66721db60529690a1a3489b075bd7e62756d3b61"],
    },
    // kovan: {
    //   url: "https://kovan.infura.io/v3/" + process.env.INFURA_TOKEN,
    //   // @ts-ignore
    //   accounts: [`0x${process.env.KOVAN_DEPLOY_PRIVATE_KEY}`],
    // },
    // staging_mainnet: {
    //   url: "https://mainnet.infura.io/v3/" + process.env.INFURA_TOKEN,
    //   // @ts-ignore
    //   accounts: [`0x${process.env.STAGING_MAINNET_DEPLOY_PRIVATE_KEY}`],
    // },
    // production: {
    //   url: "https://mainnet.infura.io/v3/" + process.env.INFURA_TOKEN,
    //   // @ts-ignore
    //   accounts: [`0x${process.env.PRODUCTION_MAINNET_DEPLOY_PRIVATE_KEY}`],
    // },
    // To update coverage network configuration got o .solcover.js and update param in providerOptions field
    coverage: {
      url: "http://127.0.0.1:8555", // Coverage launches its own ganache-cli client
      timeout: 200000,
    },
  },
  // @ts-ignore
  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
    externalArtifacts: ["external/**/*.json"],
  },
  // @ts-ignore
  contractSizer: {
    runOnCompile: false,
  },

  mocha: mochaConfig,

  // These are external artifacts we don't compile but would like to improve
  // test performance for by hardcoding the gas into the abi at runtime
  // @ts-ignore
  externalGasMods: [
    "external/abi/perp",
  ],
  etherscan: {
  apiKey: {
    polygon: "ZKYYS5KTEMQQADIF4NPV9M7Y8B548DDFZU"
  }
}
};

function getHardhatPrivateKeys() {
  return privateKeys.map(key => {
    const ONE_MILLION_ETH = "1000000000000000000000000";
    return {
      privateKey: key,
      balance: ONE_MILLION_ETH,
    };
  });
}

function checkForkedProviderEnvironment() {
  if (process.env.FORK &&
      (!process.env.ALCHEMY_TOKEN || process.env.ALCHEMY_TOKEN === "fake_alchemy_token")
     ) {
    console.log(chalk.red(
      "You are running forked provider tests with invalid Alchemy credentials.\n" +
      "Update your ALCHEMY_TOKEN settings in the `.env` file."
    ));
    process.exit(1);
  }
}

export default config;
