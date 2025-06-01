import { ethers } from "ethers";
import DeployAdapters from "./deployAdapters";
import { UniswapV3ExchangeAdapterV2__factory } from "../../typechain/factories/UniswapV3ExchangeAdapterV2__factory";

async function main() {
    // Replace with your Polygon RPC URL and private key
    const provider = new ethers.providers.JsonRpcProvider("https://polygon-rpc.com");
    const wallet = new ethers.Wallet("b5d622d6d55a13dbe1937c3f66721db60529690a1a3489b075bd7e62756d3b61", provider);

    const deployer = new DeployAdapters(wallet);

    // Replace with the Uniswap V3 SwapRouter address on Polygon
    const swapRouterAddress = "0xE592427A0AEce92De3Edee1F18E0157C05861564";

    const nonce = await wallet.getTransactionCount();
    const gasPrice = await provider.getGasPrice();
    const increasedGasPrice = gasPrice.mul(2); // Double the current gas price
    console.log("Wallet nonce:", nonce);
    console.log("Current gas price (wei):", gasPrice.toString());
    console.log("Increased gas price (wei):", increasedGasPrice.toString());

    console.log("Deploying UniswapV3ExchangeAdapterV2 with custom gas price...");
    try {
        const factory = new UniswapV3ExchangeAdapterV2__factory(wallet);
        const contract = await factory.deploy(swapRouterAddress, { gasPrice: increasedGasPrice });
        console.log("Deployment transaction sent. Hash:", contract.deployTransaction.hash);
        const receipt = await contract.deployTransaction.wait();
        console.log("Contract deployed at:", contract.address);
        console.log("Transaction confirmed in block:", receipt.blockNumber);
    } catch (err) {
        console.error("DEPLOYMENT ERROR:", err);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });