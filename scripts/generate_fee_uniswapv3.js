const { ethers } = require("ethers");

// Uniswap V3 Factory address
const UNISWAP_V3_FACTORY = "0x1F98431c8aD98523631AE4a59f267346ea31F984";

// ABI for the Uniswap V3 Factory
const factoryAbi = [
  "function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address)"
];

// Example tokens
const tokenA = "0xc2132d05d31c914a87c6611c10748aeb04b58e8f"; // Replace with actual tokenA address
const tokenB = "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619"; // Replace with actual tokenB address

// Provider
const provider = new ethers.providers.JsonRpcProvider("https://polygon-mainnet.g.alchemy.com/v2/m-6zyANWoW15JGc3b-mGLePqeZWVp06O");

// Create contract instance
const factoryContract = new ethers.Contract(UNISWAP_V3_FACTORY, factoryAbi, provider);

async function getPoolFeeTier() {
  const feeTiers = [100, 500, 3000, 10000]; // Common fee tiers in Uniswap V3
  for (const fee of feeTiers) {
    const poolAddress = await factoryContract.getPool(tokenA, tokenB, fee);
    if (poolAddress !== ethers.constants.AddressZero) {
      console.log(`Pool found with fee tier: ${fee} bps`);
      return fee;
    }
  }
  console.log("No pool found for the given token pair.");
}

getPoolFeeTier();