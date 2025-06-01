const { ethers } = require("ethers");
const { Pool, Route, Trade } = require("@uniswap/v3-sdk");
const { Token, CurrencyAmount, Percent } = require("@uniswap/sdk-core");
const JSBI = require("jsbi");

const chainId = 137; // Polygon Mainnet
const tokenA = new Token(chainId, "0xc2132d05d31c914a87c6611c10748aeb04b58e8f", 6, "USDT", "Tether");
const tokenB = new Token(chainId, "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619", 18, "WETH", "Wrapped Etherium");

const TradeType = {
  EXACT_INPUT: 0,
  EXACT_OUTPUT: 1
};

const factoryAddress = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
const factoryAbi = [
  "function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address)"
];
const poolAbi = [
  "function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
  "function liquidity() external view returns (uint128)"
];
const feeTiers = [100, 500, 3000, 10000]; // 0.01%, 0.05%, 0.3%, 1%

async function initializeProviderAndFactory() {
  const provider = new ethers.providers.JsonRpcProvider("https://polygon-mainnet.g.alchemy.com/v2/m-6zyANWoW15JGc3b-mGLePqeZWVp06O");
  const factory = new ethers.Contract(factoryAddress, factoryAbi, provider);
  return { provider, factory };
}

async function selectBestPool(factory, provider) {
  let bestPool = null;
  let maxLiquidity = null;
  let bestFeeTier = null;
  let bestPoolAddress = null; // Added to store the best pool address

  for (const feeTier of feeTiers) {
    const poolAddress = await factory.getPool(tokenA.address, tokenB.address, feeTier);
    if (poolAddress === ethers.constants.AddressZero) continue;

    const poolContract = new ethers.Contract(poolAddress, poolAbi, provider);
    const [slot0, liquidity] = await Promise.all([
      poolContract.slot0(),
      poolContract.liquidity()
    ]);

    const pool = new Pool(
      tokenA,
      tokenB,
      feeTier,
      slot0.sqrtPriceX96.toString(),
      liquidity.toString(),
      slot0.tick
    );

    if (!maxLiquidity || BigInt(liquidity) > BigInt(maxLiquidity)) {
      bestPool = pool;
      maxLiquidity = liquidity;
      bestFeeTier = feeTier;
      bestPoolAddress = poolAddress; // Store the best pool address
    }
  }

  if (!bestPool) {
    throw new Error("No suitable pool found for the token pair.");
  }

  return { bestPool, bestFeeTier, maxLiquidity, bestPoolAddress }; // Include the pool address in the return value
}

function calculateTradeDetails(bestPool) {
  const route = new Route([bestPool], tokenA, tokenB);
  const inputTokenAmount = "4192686822"; // Example: 1 USDT
  const minOutputTokenAmount = ethers.utils.parseUnits("0.0001", tokenB.decimals); // Example: 0.0001 WBTC

  const inputTokenAmountJSBI = JSBI.BigInt(inputTokenAmount);
  const inputCurrencyAmount = CurrencyAmount.fromRawAmount(tokenA, inputTokenAmountJSBI);

  const trade = Trade.createUncheckedTrade({
    route,
    inputAmount: inputCurrencyAmount,
    outputAmount: CurrencyAmount.fromRawAmount(tokenB, minOutputTokenAmount.toString()),
    tradeType: TradeType.EXACT_INPUT
  });

  return { trade, inputTokenAmount, minOutputTokenAmount, route };
}

function generateCalldata(route, inputTokenAmount, minOutputTokenAmount) {
  const functionSelector = "0x6af479b2"; // sellTokenForTokenToUniswapV3 selector
  const encodedPath = ethers.utils.hexConcat([
    tokenA.address,
    ethers.utils.hexZeroPad(ethers.utils.hexlify(route.pools[0].fee), 3),
    tokenB.address
  ]);

  const recipient = "0xD14D1e501b2b52D6134dB1aD0857Aa91f9BFe2dd"; // Replace with actual recipient address
  const encodedParameters = ethers.utils.defaultAbiCoder.encode(
    ["bytes", "uint256", "uint256", "address"],
    [encodedPath, inputTokenAmount, minOutputTokenAmount, recipient]
  );

  return functionSelector + encodedParameters.slice(2);
}

async function determineSwapPath() {
  const { provider, factory } = await initializeProviderAndFactory();
  const { bestPool, bestFeeTier, maxLiquidity, bestPoolAddress } = await selectBestPool(factory, provider);

  console.log("Best fee tier:", bestFeeTier);
  console.log("Maximum liquidity:", maxLiquidity.toString());
  console.log("Pool address:", bestPoolAddress); // Log the pool address

  const { trade, inputTokenAmount, minOutputTokenAmount, route } = calculateTradeDetails(bestPool);

  console.log("Execution price:", trade.executionPrice.toSignificant(6));
  console.log("Price impact:", trade.priceImpact.toSignificant(6), "%");

  const calldata = generateCalldata(route, inputTokenAmount, minOutputTokenAmount);
  console.log("Generated calldata:", calldata);
}

determineSwapPath().catch(console.error);
