"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const deployAdapters_1 = require("./utils/deploys/deployAdapters");
async function main() {
    // Replace with your Polygon RPC URL and private key
    const provider = new ethers_1.ethers.providers.JsonRpcProvider("https://polygon-rpc.com");
    const wallet = new ethers_1.ethers.Wallet("0x8d0f0b6f27dee8e115f860c20293e7f2fef567e584ad5cefa05ea14ab1365898", provider);
    const deployer = new deployAdapters_1.default(wallet);
    // Replace with the Uniswap V3 SwapRouter address on Polygon
    const swapRouterAddress = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
    console.log("Deploying UniswapV3ExchangeAdapterV2...");
    const adapter = await deployer.deployUniswapV3ExchangeAdapterV2(swapRouterAddress);
    console.log("UniswapV3ExchangeAdapterV2 deployed at:", adapter.address);
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error(error);
    process.exit(1);
});
